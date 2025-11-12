using System.Diagnostics;
using System.Text;
using System.Linq;

namespace SmartScheduler.Middleware;

/// <summary>
/// Middleware that logs every HTTP request with method, path, headers, and response status.
/// This helps debug production issues by providing visibility into all incoming requests.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip logging for health checks and static resources to reduce noise
        var path = context.Request.Path.Value ?? "";
        if (path == "/health" || path.StartsWith("/swagger") || 
            path.StartsWith("/static") || path == "/favicon.ico")
        {
            await _next(context);
            return;
        }

        // Generate request ID for correlation
        var requestId = Guid.NewGuid().ToString("N")[..8];
        context.Items["RequestId"] = requestId;
        
        var stopwatch = Stopwatch.StartNew();
        
        // Enable buffering to read request/response body multiple times
        context.Request.EnableBuffering();
        
        try
        {
            // Log incoming request
            await LogRequest(context, requestId);
            
            // Capture original response body stream
            var originalBodyStream = context.Response.Body;
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;
            
            // Process request
            await _next(context);
            
            // Log response
            stopwatch.Stop();
            await LogResponse(context, stopwatch.ElapsedMilliseconds, requestId);
            
            // Copy response back to original stream
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, 
                "[RequestId: {RequestId}] Unhandled exception processing {Method} {Path} after {Duration}ms",
                requestId, context.Request.Method, context.Request.Path, stopwatch.ElapsedMilliseconds);
            throw;
        }
        finally
        {
            context.Request.Body.Position = 0;
        }
    }

    private async Task LogRequest(HttpContext context, string requestId)
    {
        var request = context.Request;
        var log = new StringBuilder();
        
        log.AppendLine("\n=== INCOMING REQUEST ===");
        log.AppendLine($"RequestId: {requestId}");
        log.AppendLine($"Method: {request.Method}");
        log.AppendLine($"Path: {request.Path}");
        log.AppendLine($"Full URL: {request.Scheme}://{request.Host}{request.PathBase}{request.Path}{request.QueryString}");
        
        if (request.QueryString.HasValue)
        {
            log.AppendLine($"Query: {request.QueryString}");
        }
        
        log.AppendLine($"Remote Address: {context.Connection.RemoteIpAddress}");
        log.AppendLine($"Remote Port: {context.Connection.RemotePort}");
        log.AppendLine($"Local Address: {context.Connection.LocalIpAddress}");
        log.AppendLine($"Local Port: {context.Connection.LocalPort}");
        
        // Log authentication status
        log.AppendLine($"Authenticated: {context.User?.Identity?.IsAuthenticated ?? false}");
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            log.AppendLine($"User: {context.User.Identity.Name ?? "Unknown"}");
            log.AppendLine($"Claims: {string.Join(", ", context.User.Claims.Select(c => $"{c.Type}={c.Value}"))}");
        }
        
        // Log CORS-related headers
        var origin = request.Headers["Origin"].ToString();
        var referer = request.Headers["Referer"].ToString();
        if (!string.IsNullOrEmpty(origin))
        {
            log.AppendLine($"Origin: {origin}");
        }
        if (!string.IsNullOrEmpty(referer))
        {
            log.AppendLine($"Referer: {referer}");
        }
        
        // Log headers (excluding sensitive ones)
        log.AppendLine("Headers:");
        foreach (var header in request.Headers)
        {
            var headerValue = header.Value.ToString();
            
            // Mask sensitive headers
            if (header.Key.Contains("Authorization", StringComparison.OrdinalIgnoreCase) ||
                header.Key.Contains("Cookie", StringComparison.OrdinalIgnoreCase))
            {
                headerValue = "***REDACTED***";
            }
            
            log.AppendLine($"  {header.Key}: {headerValue}");
        }
        
        // Log request body if present (for POST/PUT/PATCH)
        if (request.Method is "POST" or "PUT" or "PATCH" or "OPTIONS")
        {
            request.Body.Position = 0;
            using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            
            if (!string.IsNullOrEmpty(body))
            {
                // Limit body size to prevent log spam
                var bodyPreview = body.Length > 1000 
                    ? body.Substring(0, 1000) + "... [truncated]" 
                    : body;
                log.AppendLine($"Body: {bodyPreview}");
            }
            
            request.Body.Position = 0;
        }
        
        // Log route information if available
        var routeData = context.GetRouteData();
        if (routeData != null && routeData.Values.Any())
        {
            log.AppendLine("Route Data:");
            foreach (var route in routeData.Values)
            {
                log.AppendLine($"  {route.Key}: {route.Value}");
            }
        }
        
        log.AppendLine("========================");
        
        // Log OPTIONS requests (CORS preflight) at Debug level to reduce noise
        if (request.Method == "OPTIONS")
        {
            _logger.LogDebug("[RequestId: {RequestId}] {Log}", requestId, log.ToString());
        }
        else
        {
            _logger.LogInformation("[RequestId: {RequestId}] {Log}", requestId, log.ToString());
        }
    }

    private async Task LogResponse(HttpContext context, long durationMs, string requestId)
    {
        var request = context.Request;
        var response = context.Response;
        var log = new StringBuilder();
        
        log.AppendLine("\n=== OUTGOING RESPONSE ===");
        log.AppendLine($"RequestId: {requestId}");
        log.AppendLine($"Method: {request.Method}");
        log.AppendLine($"Path: {request.Path}");
        log.AppendLine($"Status: {response.StatusCode} {(System.Net.HttpStatusCode)response.StatusCode}");
        log.AppendLine($"Duration: {durationMs}ms");
        
        // Log response headers (especially CORS headers)
        log.AppendLine("Response Headers:");
        foreach (var header in response.Headers)
        {
            log.AppendLine($"  {header.Key}: {header.Value}");
        }
        
        // Log response body if present
        if (response.Body.CanSeek && response.Body.Length > 0)
        {
            response.Body.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(response.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            
            if (!string.IsNullOrEmpty(body))
            {
                // Limit body size to prevent log spam
                var bodyPreview = body.Length > 1000 
                    ? body.Substring(0, 1000) + "... [truncated]" 
                    : body;
                log.AppendLine($"Body: {bodyPreview}");
            }
            
            response.Body.Seek(0, SeekOrigin.Begin);
        }
        
        // Log route information if available
        var routeData = context.GetRouteData();
        if (routeData != null && routeData.Values.Any())
        {
            log.AppendLine("Route Data:");
            foreach (var route in routeData.Values)
            {
                log.AppendLine($"  {route.Key}: {route.Value}");
            }
        }
        
        // Log if route was not matched (404)
        if (response.StatusCode == 404)
        {
            log.AppendLine($"WARNING: Route not matched for {request.Method} {request.Path}");
        }
        
        log.AppendLine("==========================");
        
        // Log at different levels based on status code
        if (response.StatusCode >= 500)
        {
            _logger.LogError("[RequestId: {RequestId}] {Log}", requestId, log.ToString());
        }
        else if (response.StatusCode >= 400)
        {
            _logger.LogWarning("[RequestId: {RequestId}] {Log}", requestId, log.ToString());
        }
        else if (request.Method == "OPTIONS")
        {
            // CORS preflight - log at Debug level
            _logger.LogDebug("[RequestId: {RequestId}] {Log}", requestId, log.ToString());
        }
        else
        {
            _logger.LogInformation("[RequestId: {RequestId}] {Log}", requestId, log.ToString());
        }
    }
}

