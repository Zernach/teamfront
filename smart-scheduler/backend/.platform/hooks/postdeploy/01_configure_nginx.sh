#!/bin/bash
# Configure nginx to handle backend startup gracefully with rate limiting
# This hook runs after deployment to modify nginx configuration

# Don't use set -e as we want to handle errors gracefully
# set -x  # Uncomment for debug mode - shows all commands

NGINX_CONF="/etc/nginx/conf.d/elasticbeanstalk/00_application.conf"
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

# Function to check if .NET process is running
check_dotnet_process() {
    if pgrep -f "SmartScheduler" > /dev/null 2>&1; then
        local pid=$(pgrep -f "SmartScheduler" | head -1)
        log ".NET process found - PID: $pid"
        return 0
    else
        log ".NET process NOT found"
        return 1
    fi
}

# Function to check if port is listening (check both 5000 and 5001)
check_port_listening() {
    local port_to_check="${1:-5000}"
    if command -v ss >/dev/null 2>&1; then
        if ss -tln | grep -q ":${port_to_check} " 2>/dev/null; then
            return 0
        else
            return 1
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tln | grep -q ":${port_to_check} " 2>/dev/null; then
            return 0
        else
            return 1
        fi
    else
        if nc -z 127.0.0.1 ${port_to_check} > /dev/null 2>&1; then
            return 0
        else
            return 1
        fi
    fi
}

# Function to detect which port the app is listening on
detect_app_port() {
    # Check PORT environment variable first
    local env_port="${PORT:-}"
    if [ -n "$env_port" ]; then
        log "Detected PORT environment variable: $env_port"
        echo "$env_port"
        return 0
    fi
    
    # Check if port 5000 is listening
    if check_port_listening 5000; then
        log "Detected app listening on port 5000"
        echo "5000"
        return 0
    fi
    
    # Check if port 5001 is listening
    if check_port_listening 5001; then
        log "Detected app listening on port 5001"
        echo "5001"
        return 0
    fi
    
    # Default to 5000
    log "Could not detect app port, defaulting to 5000"
    echo "5000"
    return 1
}

# Function to wait for backend to be ready
wait_for_backend() {
    local port="${1:-5000}"
    local elapsed=0
    log "Waiting for backend to be ready on port ${port}..."
    
    while [ $elapsed -lt $MAX_WAIT ]; do
        if check_port_listening "$port"; then
            log "✅ Backend is ready on port ${port} after ${elapsed}s"
            return 0
        fi
        sleep $WAIT_INTERVAL
        elapsed=$((elapsed + WAIT_INTERVAL))
    done
    
    log "⚠️  WARNING: Backend did not become ready on port ${port} within ${MAX_WAIT}s"
    # Try to detect the actual port
    local detected_port=$(detect_app_port)
    if [ "$detected_port" != "$port" ] && check_port_listening "$detected_port"; then
        log "⚠️  WARNING: Backend is listening on port ${detected_port}, but nginx is configured for port ${port}"
    fi
    return 1
}

if [ ! -f "$NGINX_CONF" ]; then
    log "❌ ERROR: Nginx config file not found at $NGINX_CONF"
    exit 0
fi

log "Found nginx config file: $NGINX_CONF"
log "Backing up original config..."
cp "$NGINX_CONF" "$NGINX_CONF.bak"

# Check and fix rate limiting zones in main nginx.conf
if [ -f "$NGINX_MAIN_CONF" ]; then
    # Check if zones exist and are properly formatted (check for complete zone definition)
    if grep -qE "limit_req_zone\s+\$binary_remote_addr\s+zone=api_limit:10m\s+rate=10r/s;" "$NGINX_MAIN_CONF" 2>/dev/null; then
        log "✅ Rate limiting zones already configured correctly in main nginx.conf"
    else
        log "Configuring rate limiting zones in main nginx.conf..."
        
        # Backup main config
        cp "$NGINX_MAIN_CONF" "$NGINX_MAIN_CONF.bak"
        
        # Remove any existing malformed or duplicate zone definitions (more comprehensive cleanup)
        sed -i '/limit_req_zone.*api_limit/d' "$NGINX_MAIN_CONF"
        sed -i '/limit_req_zone.*strict_limit/d' "$NGINX_MAIN_CONF"
        
        # Find the http block and add zones properly
        if grep -q "^http {" "$NGINX_MAIN_CONF"; then
            # Use sed to insert zones right after "http {" line (simpler and more reliable)
            TEMP_NGINX=$(mktemp)
            sed '/^http {/a\    # Rate limiting zones\n    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;\n    limit_req_zone $binary_remote_addr zone=strict_limit:10m rate=2r/s;' "$NGINX_MAIN_CONF" > "$TEMP_NGINX"
            
            # Validate the temporary config before replacing
            if nginx -t -c "$TEMP_NGINX" 2>&1 | grep -q "successful"; then
                mv "$TEMP_NGINX" "$NGINX_MAIN_CONF"
                log "✅ Rate limiting zones added to main nginx.conf"
                # Show the updated config for verification
                log "Verifying zone configuration:"
                grep -A 3 "^http {" "$NGINX_MAIN_CONF" | head -5
            else
                log "⚠️  WARNING: Nginx config test failed after adding zones"
                # Show detailed error
                nginx -t -c "$TEMP_NGINX" 2>&1 | head -10 | while read line; do
                    log "   Error: $line"
                done
                rm -f "$TEMP_NGINX"
                # Restore backup
                cp "$NGINX_MAIN_CONF.bak" "$NGINX_MAIN_CONF"
                log "⚠️  Restored backup config"
            fi
        else
            log "⚠️  WARNING: Could not find 'http {' block in main nginx.conf"
        fi
    fi
else
    log "⚠️  WARNING: Main nginx.conf not found at $NGINX_MAIN_CONF"
fi

# Detect which port the app is actually listening on
DETECTED_PORT=$(detect_app_port)
if [ -n "$DETECTED_PORT" ] && [ "$DETECTED_PORT" != "5000" ]; then
    log "⚠️  WARNING: App is listening on port ${DETECTED_PORT}, but nginx is configured for port 5000"
    log "⚠️  WARNING: Consider setting PORT=5000 environment variable or updating nginx configuration"
fi

# Check if rate limiting zones are properly configured before using them
RATE_LIMIT_ENABLED=false
if [ -f "$NGINX_MAIN_CONF" ] && grep -q "limit_req_zone.*api_limit.*10m.*rate=10r/s" "$NGINX_MAIN_CONF" 2>/dev/null; then
    RATE_LIMIT_ENABLED=true
    log "✅ Rate limiting zones are available"
else
    log "⚠️  WARNING: Rate limiting zones not properly configured, skipping rate limiting in location block"
fi

# Check if rate limiting is already configured in application config
if grep -q "limit_req zone=api_limit" "$NGINX_CONF"; then
    if [ "$RATE_LIMIT_ENABLED" = "false" ]; then
        log "⚠️  WARNING: Rate limiting is configured but zones are missing, removing rate limiting directives"
        # Remove rate limiting directives if zones aren't available
        sed -i '/limit_req zone=api_limit/d' "$NGINX_CONF"
        sed -i '/limit_req_status 429/d' "$NGINX_CONF"
    else
        log "✅ Rate limiting already configured in application config"
        wait_for_backend 5000
        systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || true
        exit 0
    fi
fi

# Remove existing rate limiting directives from location block
awk '
    /location \/ {/ {
        in_location = 1
    }
    in_location && /limit_req zone/ {
        next
    }
    in_location && /proxy_http_version/ {
        next
    }
    in_location && /^[[:space:]]*}/ {
        in_location = 0
    }
    { print }
' "$NGINX_CONF" > "$NGINX_CONF.tmp" && mv "$NGINX_CONF.tmp" "$NGINX_CONF"

# Get indentation from proxy_pass line
PROXY_PASS_LINE=$(grep "proxy_pass" "$NGINX_CONF" | head -1)
INDENT=$(echo "$PROXY_PASS_LINE" | sed 's/proxy_pass.*//')

# Create proxy settings (with optional rate limiting)
if [ "$RATE_LIMIT_ENABLED" = "true" ]; then
    PROXY_SETTINGS="${INDENT}limit_req zone=api_limit burst=20 nodelay;
${INDENT}limit_req_status 429;
${INDENT}proxy_connect_timeout 10s;
${INDENT}proxy_send_timeout 60s;
${INDENT}proxy_read_timeout 60s;
${INDENT}proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
${INDENT}proxy_next_upstream_tries 3;
${INDENT}proxy_next_upstream_timeout 30s;
${INDENT}proxy_buffering off;
${INDENT}proxy_http_version 1.1;
${INDENT}proxy_set_header Connection \"keep-alive\";
${INDENT}proxy_set_header Keep-Alive \"timeout=60\";"
else
    PROXY_SETTINGS="${INDENT}proxy_connect_timeout 10s;
${INDENT}proxy_send_timeout 60s;
${INDENT}proxy_read_timeout 60s;
${INDENT}proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
${INDENT}proxy_next_upstream_tries 3;
${INDENT}proxy_next_upstream_timeout 30s;
${INDENT}proxy_buffering off;
${INDENT}proxy_http_version 1.1;
${INDENT}proxy_set_header Connection \"keep-alive\";
${INDENT}proxy_set_header Keep-Alive \"timeout=60\";"
fi

# Insert settings after proxy_pass
TEMP_FILE=$(mktemp)
echo "$PROXY_SETTINGS" > "$TEMP_FILE"
sed -i "0,/proxy_pass/{
    /proxy_pass/r $TEMP_FILE
}" "$NGINX_CONF"
rm -f "$TEMP_FILE"

# Test and reload nginx
log "Testing nginx configuration..."
if nginx -t 2>&1; then
    log "✅ Nginx configuration test passed"
    wait_for_backend 5000
    
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
    log "Restoring backup configuration..."
    cp "$NGINX_CONF.bak" "$NGINX_CONF"
    log "Testing restored configuration..."
    if nginx -t 2>&1; then
        log "✅ Restored configuration is valid"
    else
        log "⚠️  WARNING: Restored config also failed validation, but continuing anyway"
    fi
    # Don't exit with error - allow deployment to succeed even if nginx config fails
    log "⚠️  WARNING: Continuing deployment despite nginx configuration issue"
    exit 0
fi

log "Post-deploy hook completed successfully"

