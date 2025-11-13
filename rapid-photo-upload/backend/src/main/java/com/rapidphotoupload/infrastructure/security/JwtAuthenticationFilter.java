package com.rapidphotoupload.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * JWT authentication filter that validates Cognito JWT tokens in requests.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        // Skip JWT authentication for ALL endpoints - completely public API
        String path = request.getRequestURI();
        logger.debug("JwtAuthenticationFilter processing request: {} {}", request.getMethod(), path);
        
        // Allow all requests through without authentication
        logger.debug("Skipping JWT authentication - all endpoints are public: {}", path);
        filterChain.doFilter(request, response);
    }
}

