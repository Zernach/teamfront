#!/bin/bash
# Configure nginx to handle backend startup gracefully
# This hook runs after deployment to modify nginx configuration

# Don't use set -e as we want to handle errors gracefully
# set -x  # Uncomment for debug mode - shows all commands

NGINX_CONF="/etc/nginx/conf.d/elasticbeanstalk/00_application.conf"
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

# Function to check if Java process is running
check_java_process() {
    # Check if there's a Java process running the invoice-me-backend jar
    if pgrep -f "invoice-me-backend.*jar" > /dev/null 2>&1; then
        local pid=$(pgrep -f "invoice-me-backend.*jar" | head -1)
        log "Java process found - PID: $pid"
        # Log process details
        if command -v ps >/dev/null 2>&1; then
            log "Process details:"
            ps -p "$pid" -o pid,ppid,cmd,etime,stat 2>/dev/null | tail -1 | while read line; do
                log "  $line"
            done || true
        fi
        return 0
    else
        log "Java process NOT found"
        return 1
    fi
}

# Function to check if port is listening
check_port_listening() {
    # Use ss or netstat to check if port 5000 is listening
    if command -v ss >/dev/null 2>&1; then
        if ss -tln | grep -q ":5000 " 2>/dev/null; then
            log "Port 5000 is LISTENING (checked via ss)"
            ss -tln | grep ":5000 " | while read line; do
                log "  $line"
            done
            return 0
        else
            log "Port 5000 is NOT listening (checked via ss)"
            return 1
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tln | grep -q ":5000 " 2>/dev/null; then
            log "Port 5000 is LISTENING (checked via netstat)"
            netstat -tln | grep ":5000 " | while read line; do
                log "  $line"
            done
            return 0
        else
            log "Port 5000 is NOT listening (checked via netstat)"
            return 1
        fi
    else
        # Fallback to nc
        if nc -z 127.0.0.1 5000 > /dev/null 2>&1; then
            log "Port 5000 is LISTENING (checked via nc)"
            return 0
        else
            log "Port 5000 is NOT listening (checked via nc)"
            return 1
        fi
    fi
}

# Function to wait for backend to be ready
wait_for_backend() {
    local elapsed=0
    log "========================================"
    log "⏳ WAITING FOR BACKEND TO BE READY"
    log "========================================"
    log "Backend URL: $BACKEND_URL"
    
    # First, wait for Java process to start
    log "Step 1: Checking if Java process is running..."
    local process_wait=0
    while [ $process_wait -lt 30 ]; do
        if check_java_process; then
            log "✅ Java process found after ${process_wait}s"
            break
        fi
        log "⏳ Java process not found yet, waiting... (${process_wait}s/30s)"
        sleep 2
        process_wait=$((process_wait + 2))
    done
    
    if [ $process_wait -ge 30 ]; then
        log "⚠️  WARNING: Java process not found after 30s"
        log "Checking all Java processes:"
        ps aux | grep java | grep -v grep || log "  No Java processes found"
    fi
    
    # Then wait for port to be listening
    log "Step 2: Checking if port 5000 is listening..."
    local port_wait=0
    while [ $port_wait -lt 30 ]; do
        if check_port_listening; then
            log "✅ Port 5000 is listening after ${port_wait}s"
            break
        fi
        log "⏳ Port 5000 not listening yet, waiting... (${port_wait}s/30s)"
        sleep 2
        port_wait=$((port_wait + 2))
    done
    
    if [ $port_wait -ge 30 ]; then
        log "⚠️  WARNING: Port 5000 not listening after 30s"
        log "Checking all listening ports:"
        if command -v ss >/dev/null 2>&1; then
            ss -tln | grep -E ":(5000|8080|8081)" || log "  No relevant ports found"
        elif command -v netstat >/dev/null 2>&1; then
            netstat -tln | grep -E ":(5000|8080|8081)" || log "  No relevant ports found"
        fi
    fi
    
    # Finally, check HTTP endpoint
    local check_cmd=""
    if command -v curl >/dev/null 2>&1; then
        check_cmd="curl -sf --connect-timeout 2 --max-time 5 $BACKEND_URL/health > /dev/null 2>&1"
    elif command -v wget >/dev/null 2>&1; then
        check_cmd="wget -q --timeout=5 --spider $BACKEND_URL/health > /dev/null 2>&1"
    elif command -v nc >/dev/null 2>&1; then
        # Fallback to checking if port is open
        check_cmd="nc -z 127.0.0.1 5000 > /dev/null 2>&1"
    else
        echo "Warning: No suitable command found to check backend health"
        # If port is listening, assume it's ready
        if check_port_listening; then
            echo "Port is listening, assuming backend is ready"
            return 0
        fi
        return 1
    fi
    
    # Finally, check HTTP endpoint
    log "Step 3: Checking HTTP endpoint availability..."
    while [ $elapsed -lt $MAX_WAIT ]; do
        if eval "$check_cmd"; then
            log "========================================"
            log "✅ BACKEND IS READY!"
            log "========================================"
            log "Backend responded successfully after ${elapsed}s"
            log "Health check endpoint: $BACKEND_URL/health"
            return 0
        fi
        
        # Diagnostic information every 10 seconds
        if [ $((elapsed % 10)) -eq 0 ] && [ $elapsed -gt 0 ]; then
            log "========================================"
            log "📊 DIAGNOSTICS at ${elapsed}s"
            log "========================================"
            if check_java_process; then
                log "  ✅ Java process: RUNNING"
            else
                log "  ❌ Java process: NOT RUNNING"
            fi
            if check_port_listening; then
                log "  ✅ Port 5000: LISTENING"
            else
                log "  ❌ Port 5000: NOT LISTENING"
            fi
            
            # Try to get more info about the connection attempt
            if command -v curl >/dev/null 2>&1; then
                log "  Testing connection with curl..."
                curl -v --connect-timeout 2 --max-time 5 "$BACKEND_URL/health" 2>&1 | head -20 || true
            fi
            log "========================================"
        fi
        
        log "⏳ Backend not ready yet, waiting... (${elapsed}s/${MAX_WAIT}s)"
        sleep $WAIT_INTERVAL
        elapsed=$((elapsed + WAIT_INTERVAL))
    done
    
    log "========================================"
    log "⚠️  WARNING: Backend did not become ready within ${MAX_WAIT}s"
    log "========================================"
    log "Final diagnostics:"
    if check_java_process; then
        log "  ✅ Java process: RUNNING"
    else
        log "  ❌ Java process: NOT RUNNING"
    fi
    if check_port_listening; then
        log "  ✅ Port 5000: LISTENING"
    else
        log "  ❌ Port 5000: NOT LISTENING"
    fi
    
    # Additional diagnostics
    log "Checking application logs (last 20 lines):"
    tail -20 /var/log/web.stdout.log 2>/dev/null || log "  Could not read web.stdout.log"
    
    log "Checking systemd service status:"
    systemctl status web.service --no-pager -l 2>/dev/null | tail -10 || log "  Could not check service status"
    
    log "Proceeding with nginx configuration anyway..."
    log "========================================"
    return 1
}

if [ ! -f "$NGINX_CONF" ]; then
    log "❌ ERROR: Nginx config file not found at $NGINX_CONF"
    log "Available nginx config files:"
    find /etc/nginx -name "*.conf" -type f 2>/dev/null | head -10 || log "  Could not list nginx configs"
    exit 0
fi

log "Found nginx config file: $NGINX_CONF"
log "Backing up original config..."
cp "$NGINX_CONF" "$NGINX_CONF.bak"
log "Backup created: $NGINX_CONF.bak"

# Check if our custom proxy settings are already added
if grep -q "proxy_next_upstream" "$NGINX_CONF"; then
    log "✅ Nginx proxy settings already configured"
    log "Current proxy_pass configuration:"
    grep -A 5 "proxy_pass" "$NGINX_CONF" | head -10 || log "  Could not find proxy_pass"
    # Still wait for backend and reload to ensure it's ready
    wait_for_backend
    log "Reloading nginx..."
    if systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null; then
        log "✅ Nginx reloaded successfully"
    else
        log "⚠️  WARNING: Nginx reload failed, but configuration is valid"
    fi
    exit 0
fi

# Find the proxy_pass line to insert after
if ! grep -q "proxy_pass" "$NGINX_CONF"; then
    log "⚠️  WARNING: proxy_pass directive not found in nginx config"
    log "Restoring backup config..."
    cp "$NGINX_CONF.bak" "$NGINX_CONF"
    log "Current nginx config content:"
    cat "$NGINX_CONF" | head -50
    exit 0
fi

log "Found proxy_pass directive, proceeding with configuration..."

# Skip rate limiting for now - causes deployment issues
log "Skipping rate limiting configuration (disabled for debugging)"

# Remove any existing proxy_http_version from the location block to avoid duplicates
# Process the location / block and remove all proxy_http_version directives
awk '
    /location \/ {/ {
        in_location = 1
    }
    in_location && /proxy_http_version/ {
        next  # Skip all proxy_http_version lines in location block
    }
    in_location && /limit_req zone/ {
        next  # Skip existing rate limiting directives
    }
    in_location && /^[[:space:]]*}/ {
        in_location = 0
    }
    { print }
' "$NGINX_CONF" > "$NGINX_CONF.tmp" && mv "$NGINX_CONF.tmp" "$NGINX_CONF"

# Get indentation from proxy_pass line
PROXY_PASS_LINE=$(grep "proxy_pass" "$NGINX_CONF" | head -1)
INDENT=$(echo "$PROXY_PASS_LINE" | sed 's/proxy_pass.*//')

# Create proxy settings with proper indentation (rate limiting disabled)
PROXY_SETTINGS="${INDENT}proxy_connect_timeout 10s;
${INDENT}proxy_send_timeout 60s;
${INDENT}proxy_read_timeout 60s;
${INDENT}proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
${INDENT}proxy_next_upstream_tries 3;
${INDENT}proxy_next_upstream_timeout 30s;
${INDENT}proxy_buffering off;
${INDENT}proxy_http_version 1.1;
${INDENT}proxy_set_header Connection \"\";"

# Create temporary file with proxy settings
TEMP_FILE=$(mktemp)
echo "$PROXY_SETTINGS" > "$TEMP_FILE"

# Insert settings after the first proxy_pass line
sed -i "0,/proxy_pass/{
    /proxy_pass/r $TEMP_FILE
}" "$NGINX_CONF"

rm -f "$TEMP_FILE"

# Test nginx configuration
log "Testing nginx configuration..."
if nginx -t 2>&1; then
    log "✅ Nginx configuration test passed"
    # Wait for backend to be ready before reloading nginx
    wait_for_backend
    
    # Reload nginx to apply changes
    log "Reloading nginx to apply changes..."
    if systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null; then
        log "========================================"
        log "✅ NGINX CONFIGURATION COMPLETE"
        log "========================================"
        log "Nginx configuration updated and reloaded successfully"
        log "Backend URL: $BACKEND_URL"
        log "Configuration file: $NGINX_CONF"
        log "========================================"
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
    nginx -t 2>&1 || log "  Restored config also failed validation"
    exit 1
fi

log "Post-deploy hook completed successfully"

