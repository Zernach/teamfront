#!/bin/bash
# Configure nginx to handle backend startup gracefully with proper proxy settings
# This hook runs after deployment to modify nginx configuration

# Don't use set -e as we want to handle errors gracefully
# set -x  # Uncomment for debug mode - shows all commands

NGINX_APP_CONF="/etc/nginx/conf.d/elasticbeanstalk/00_application.conf"
NGINX_MAIN_CONF="/etc/nginx/nginx.conf"
BACKEND_URL="http://127.0.0.1:5000"
MAX_WAIT=60  # Maximum seconds to wait for backend
WAIT_INTERVAL=2  # Seconds between checks

# Logging function with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "========================================"
log "🔧 NGINX POST-DEPLOY CONFIGURATION HOOK"
log "========================================"
log "Starting nginx configuration..."
log "Backend URL: $BACKEND_URL"
log "Max Wait Time: ${MAX_WAIT}s"
log "Wait Interval: ${WAIT_INTERVAL}s"
log "========================================"

# Function to check if port is listening
check_port_listening() {
    if command -v ss >/dev/null 2>&1; then
        if ss -tln | grep -q ":5000 " 2>/dev/null; then
            return 0
        else
            return 1
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tln | grep -q ":5000 " 2>/dev/null; then
            return 0
        else
            return 1
        fi
    else
        if nc -z 127.0.0.1 5000 > /dev/null 2>&1; then
            return 0
        else
            return 1
        fi
    fi
}

# Function to wait for backend to be ready
wait_for_backend() {
    local elapsed=0
    log "Waiting for backend to be ready..."
    
    while [ $elapsed -lt $MAX_WAIT ]; do
        if check_port_listening; then
            log "✅ Backend is ready after ${elapsed}s"
            return 0
        fi
        sleep $WAIT_INTERVAL
        elapsed=$((elapsed + WAIT_INTERVAL))
    done
    
    log "⚠️  WARNING: Backend did not become ready within ${MAX_WAIT}s"
    return 1
}

# Check if application config exists
if [ ! -f "$NGINX_APP_CONF" ]; then
    log "❌ ERROR: Nginx application config file not found at $NGINX_APP_CONF"
    exit 0
fi

log "Found nginx application config file: $NGINX_APP_CONF"
log "Backing up original config..."
cp "$NGINX_APP_CONF" "$NGINX_APP_CONF.bak"

# Check if our custom configuration marker already exists
if grep -q "# CUSTOM SMART-SCHEDULER CONFIG" "$NGINX_APP_CONF"; then
    log "✅ Custom nginx configuration already applied"
    wait_for_backend
    systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || true
    exit 0
fi

# Add custom proxy settings to the application config
log "Adding custom proxy configuration..."

# Get indentation from proxy_pass line
PROXY_PASS_LINE=$(grep "proxy_pass" "$NGINX_APP_CONF" | head -1)
INDENT=$(echo "$PROXY_PASS_LINE" | sed 's/proxy_pass.*//')

# Create proxy settings optimized for .NET backend
PROXY_SETTINGS="
${INDENT}# CUSTOM SMART-SCHEDULER CONFIG
${INDENT}proxy_connect_timeout 10s;
${INDENT}proxy_send_timeout 60s;
${INDENT}proxy_read_timeout 60s;
${INDENT}proxy_buffering off;
${INDENT}proxy_http_version 1.1;
${INDENT}proxy_set_header Host \$host;
${INDENT}proxy_set_header X-Real-IP \$remote_addr;
${INDENT}proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
${INDENT}proxy_set_header X-Forwarded-Proto \$scheme;
${INDENT}proxy_next_upstream error timeout invalid_header http_502 http_503 http_504;
${INDENT}proxy_next_upstream_tries 3;
${INDENT}proxy_next_upstream_timeout 30s;"

# Insert settings after proxy_pass using a temp file
TEMP_FILE=$(mktemp)
echo "$PROXY_SETTINGS" > "$TEMP_FILE"

# Use sed to insert after the first proxy_pass line
sed -i "0,/proxy_pass.*/{
    /proxy_pass.*/r $TEMP_FILE
}" "$NGINX_APP_CONF"

rm -f "$TEMP_FILE"

# Test and reload nginx
log "Testing nginx configuration..."
TEST_OUTPUT=$(nginx -t 2>&1)
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    log "✅ Nginx configuration test passed"
    log "$TEST_OUTPUT"
    
    wait_for_backend
    
    log "Reloading nginx..."
    if systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null; then
        log "✅ NGINX CONFIGURATION COMPLETE"
    else
        log "⚠️  WARNING: Nginx reload failed, but configuration is valid"
        log "You may need to manually reload nginx: systemctl reload nginx"
    fi
else
    # Restore backup if config test fails
    log "❌ ERROR: Nginx configuration test failed"
    log "Test output: $TEST_OUTPUT"
    log "Restoring backup configuration..."
    cp "$NGINX_APP_CONF.bak" "$NGINX_APP_CONF"
    
    log "Testing restored configuration..."
    RESTORE_TEST_OUTPUT=$(nginx -t 2>&1)
    RESTORE_EXIT_CODE=$?
    
    if [ $RESTORE_EXIT_CODE -eq 0 ]; then
        log "✅ Restored configuration is valid"
        log "$RESTORE_TEST_OUTPUT"
    else
        log "⚠️  WARNING: Restored config also failed validation"
        log "Restore test output: $RESTORE_TEST_OUTPUT"
    fi
    
    # Don't exit with error - allow deployment to succeed even if nginx config fails
    log "⚠️  WARNING: Continuing deployment despite nginx configuration issue"
    exit 0
fi

log "Post-deploy hook completed successfully"
