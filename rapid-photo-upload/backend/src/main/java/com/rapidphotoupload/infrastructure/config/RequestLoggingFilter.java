package com.rapidphotoupload.infrastructure.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Enumeration;

/**
 * Request logging filter that logs every HTTP request with method, path, headers, and response status.
 * This helps debug production issues by providing visibility into all incoming requests.
 */
@Component
@Order(1)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Skip logging for health checks and static resources to reduce noise
        String path = request.getRequestURI();
        if (path.equals("/health") || path.equals("/actuator/health") || 
            path.startsWith("/actuator") || path.startsWith("/static") ||
            path.startsWith("/favicon.ico")) {
            filterChain.doFilter(request, response);
            return;
        }

        long startTime = System.currentTimeMillis();
        
        // Wrap request/response to enable reading body multiple times
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        try {
            // Log incoming request
            logRequest(wrappedRequest);
            
            // Process request
            filterChain.doFilter(wrappedRequest, wrappedResponse);
            
        } finally {
            // Log response
            long duration = System.currentTimeMillis() - startTime;
            logResponse(wrappedRequest, wrappedResponse, duration);
            
            // Copy response body back to original response
            wrappedResponse.copyBodyToResponse();
        }
    }

    private void logRequest(ContentCachingRequestWrapper request) {
        StringBuilder log = new StringBuilder();
        log.append("\n=== INCOMING REQUEST ===\n");
        log.append("Method: ").append(request.getMethod()).append("\n");
        log.append("Path: ").append(request.getRequestURI()).append("\n");
        
        String queryString = request.getQueryString();
        if (queryString != null) {
            log.append("Query: ").append(queryString).append("\n");
        }
        
        log.append("Remote Address: ").append(request.getRemoteAddr()).append("\n");
        log.append("Remote Host: ").append(request.getRemoteHost()).append("\n");
        
        // Log headers (excluding sensitive ones)
        log.append("Headers:\n");
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            
            // Mask sensitive headers
            if (headerName.toLowerCase().contains("authorization") || 
                headerName.toLowerCase().contains("cookie")) {
                headerValue = "***REDACTED***";
            }
            
            log.append("  ").append(headerName).append(": ").append(headerValue).append("\n");
        }
        
        // Log request body if present (for POST/PUT/PATCH)
        String method = request.getMethod();
        if ("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method)) {
            byte[] content = request.getContentAsByteArray();
            if (content.length > 0) {
                try {
                    String body = new String(content, request.getCharacterEncoding());
                    // Limit body size to prevent log spam
                    if (body.length() > 1000) {
                        body = body.substring(0, 1000) + "... [truncated]";
                    }
                    log.append("Body: ").append(body).append("\n");
                } catch (UnsupportedEncodingException e) {
                    log.append("Body: [unable to decode]").append("\n");
                }
            }
        }
        
        log.append("========================\n");
        logger.info(log.toString());
    }

    private void logResponse(
            ContentCachingRequestWrapper request,
            ContentCachingResponseWrapper response,
            long duration) {
        
        StringBuilder log = new StringBuilder();
        log.append("\n=== OUTGOING RESPONSE ===\n");
        log.append("Method: ").append(request.getMethod()).append("\n");
        log.append("Path: ").append(request.getRequestURI()).append("\n");
        log.append("Status: ").append(response.getStatus()).append("\n");
        log.append("Duration: ").append(duration).append("ms\n");
        
        // Log response headers
        log.append("Response Headers:\n");
        response.getHeaderNames().forEach(headerName -> {
            String headerValue = response.getHeader(headerName);
            log.append("  ").append(headerName).append(": ").append(headerValue).append("\n");
        });
        
        // Log response body if present
        byte[] content = response.getContentAsByteArray();
        if (content.length > 0) {
            try {
                String body = new String(content, response.getCharacterEncoding());
                // Limit body size to prevent log spam
                if (body.length() > 1000) {
                    body = body.substring(0, 1000) + "... [truncated]";
                }
                log.append("Body: ").append(body).append("\n");
            } catch (UnsupportedEncodingException e) {
                log.append("Body: [unable to decode]").append("\n");
            }
        }
        
        log.append("==========================\n");
        
        // Log at different levels based on status code
        int status = response.getStatus();
        if (status >= 500) {
            logger.error(log.toString());
        } else if (status >= 400) {
            logger.warn(log.toString());
        } else {
            logger.info(log.toString());
        }
    }
}

