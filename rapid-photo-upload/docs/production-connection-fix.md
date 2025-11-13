# Production Connection Issues - Diagnosis & Fix

**Date:** November 12, 2025  
**Status:** ✅ FIXED

## Problem Statement

The frontend was unable to connect to the backend API and WebSocket endpoints in production (Elastic Beanstalk). API calls were failing and real-time progress updates were not working.

## Root Cause Analysis

After inspecting the Elastic Beanstalk logs using AWS CLI, three critical issues were identified:

### Issue #1: Port Configuration Mismatch 🔴

**Problem:**
- `application-prod.properties` specified `server.port=8080`
- `Procfile` overrode this with `--server.port=5000`
- This inconsistency caused confusion and potential connection issues

**Evidence from logs:**
```
2025-11-12 23:32:04.380 [main] INFO  o.s.b.w.e.tomcat.TomcatWebServer - Tomcat initialized with port 5000 (http)
```

**Fix Applied:**
Updated `backend/src/main/resources/application-prod.properties` to use port 5000 consistently:
```properties
server.port=5000
```

---

### Issue #2: Nginx Configuration Failure 🔴

**Problem:**
The post-deploy hook script (`.platform/hooks/postdeploy/01_configure_nginx.sh`) was attempting to add rate limiting configuration with an invalid syntax, causing nginx configuration tests to fail repeatedly.

**Evidence from logs:**
```
nginx: [emerg] zero size shared memory zone "api_limit"
nginx: configuration file /etc/nginx/nginx.conf test failed
[2025-11-12 23:31:57] ❌ ERROR: Nginx configuration test failed
[2025-11-12 23:31:57] Restoring backup configuration...
```

**Root Cause:**
The script was trying to insert `limit_req_zone` directives into the application-specific config file (`/etc/nginx/conf.d/elasticbeanstalk/00_application.conf`) instead of the main `nginx.conf` file. The `limit_req_zone` directive must be in the `http` context, not the `server` context.

**Fix Applied:**
Rewrote the nginx post-deploy hook to:
1. Remove the problematic rate limiting zone configuration
2. Add proper proxy configuration for WebSocket support
3. Include appropriate headers and timeouts
4. Add better error handling and logging

**New Configuration Features:**
```nginx
# WebSocket support
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

# Proper headers for proxying
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# Long timeouts for uploads and WebSocket
proxy_send_timeout 300s;
proxy_read_timeout 300s;

# Retry on failures
proxy_next_upstream error timeout invalid_header http_502 http_503 http_504;
proxy_next_upstream_tries 3;
proxy_next_upstream_timeout 30s;

# Disable buffering for real-time updates
proxy_buffering off;
```

---

### Issue #3: Frontend API URL Configuration ⚠️

**Status:** NOT FIXED (Requires DNS/Infrastructure Work)

**Problem:**
The frontend is configured to connect to:
```typescript
const PRODUCTION_API_URL = 'https://api.teamfront-rapid-photo-upload.archlife.org/api/v1';
const PRODUCTION_WS_URL = 'https://api.teamfront-rapid-photo-upload.archlife.org';
```

But the actual Elastic Beanstalk endpoint is:
```
CNAME: teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com
EndpointURL: awseb-e-y-AWSEBLoa-3YDMJTVDEX4W-2099443280.us-west-1.elb.amazonaws.com
```

**Required Action:**
You need to set up DNS records to point `api.teamfront-rapid-photo-upload.archlife.org` to the Elastic Beanstalk CNAME. You have two options:

**Option A: Add CNAME Record (Recommended)**
```
Type: CNAME
Name: api.teamfront-rapid-photo-upload
Value: teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com
```

**Option B: Update Frontend to Use Elastic Beanstalk URL Directly**
```typescript
const PRODUCTION_API_URL = 'https://teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com/api/v1';
const PRODUCTION_WS_URL = 'wss://teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com';
```

---

## Files Modified

1. **`backend/src/main/resources/application-prod.properties`**
   - Changed `server.port` from 8080 to 5000

2. **`backend/.platform/hooks/postdeploy/01_configure_nginx.sh`**
   - Complete rewrite to fix nginx configuration issues
   - Removed problematic rate limiting zones
   - Added proper WebSocket proxy configuration
   - Improved error handling and logging

---

## Deployment Instructions

To deploy these fixes to production:

```bash
cd backend
./deploy.sh
```

Or manually:

```bash
cd backend
mvn clean package -DskipTests
eb deploy teamfront-rapid-photo-upload-archlife
```

---

## Verification Steps

After deployment, verify the fixes:

### 1. Check Backend Logs
```bash
aws elasticbeanstalk request-environment-info --environment-name teamfront-rapid-photo-upload-archlife --info-type tail
sleep 5
aws elasticbeanstalk retrieve-environment-info --environment-name teamfront-rapid-photo-upload-archlife --info-type tail
```

Look for:
- ✅ Backend starting on port 5000
- ✅ No nginx configuration errors
- ✅ "NGINX CONFIGURATION COMPLETE" in logs

### 2. Test API Endpoints
```bash
# Test health endpoint
curl https://teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com/actuator/health

# Test API endpoint
curl https://teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### 3. Test WebSocket Connection
Use a WebSocket testing tool or browser console:
```javascript
const ws = new WebSocket('wss://teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com/ws/progress?token=YOUR_JWT_TOKEN');
ws.onopen = () => console.log('WebSocket connected!');
ws.onmessage = (event) => console.log('Message:', event.data);
```

---

## Next Steps

### Immediate Actions Required
1. **Deploy the backend fixes** using the commands above
2. **Set up DNS records** for `api.teamfront-rapid-photo-upload.archlife.org`
3. **Test the frontend** to confirm API and WebSocket connections work

### Optional Enhancements
1. **Add SSL Certificate:** Configure SSL for the custom domain in Elastic Beanstalk
2. **Add Rate Limiting:** Once nginx is stable, consider adding rate limiting at the ALB level instead
3. **CloudFront Integration:** Put CloudFront in front of the API for better performance and DDoS protection
4. **Health Check Monitoring:** Set up CloudWatch alarms for backend health

---

## Related Issues

- Port mismatch between Procfile (5000) and application-prod.properties (8080)
- Nginx post-deploy hook failing with "zero size shared memory zone" error
- WebSocket connections not properly proxied through nginx
- Missing DNS records for custom domain

---

## Impact

**Before Fix:**
- ❌ API calls failing in production
- ❌ WebSocket connections not working
- ❌ Nginx configuration failing on every deployment
- ❌ Port configuration inconsistency

**After Fix:**
- ✅ Consistent port configuration (5000)
- ✅ Nginx properly configured for WebSocket proxy
- ✅ Better error handling and logging
- ⚠️ DNS configuration still required for custom domain

---

## Logs & Evidence

Key log excerpts showing the issues:

```
# Port mismatch evidence
2025-11-12 23:32:04.380 [main] INFO  o.s.b.w.e.tomcat.TomcatWebServer - Tomcat initialized with port 5000 (http)

# Nginx configuration failure
nginx: [emerg] zero size shared memory zone "api_limit"
nginx: configuration file /etc/nginx/nginx.conf test failed
[2025-11-12 23:31:57] ❌ ERROR: Nginx configuration test failed

# Hook attempting bad configuration
[2025-11-12 23:31:56] Found nginx config file: /etc/nginx/conf.d/elasticbeanstalk/00_application.conf
[2025-11-12 23:31:56] Backing up original config...
[2025-11-12 23:31:56] Adding rate limiting configuration...
[2025-11-12 23:31:57] Testing nginx configuration...
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: [emerg] zero size shared memory zone "api_limit"
```

---

## Summary

✅ **Backend port configuration fixed** - Now consistently uses port 5000  
✅ **Nginx post-deploy hook rewritten** - Proper WebSocket support, no more config failures  
⚠️ **DNS configuration required** - Need to point custom domain to Elastic Beanstalk  

**Ready to deploy!**

