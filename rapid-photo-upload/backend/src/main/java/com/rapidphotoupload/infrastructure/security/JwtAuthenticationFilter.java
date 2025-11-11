package com.rapidphotoupload.infrastructure.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.BadJWTException;
import com.rapidphotoupload.infrastructure.config.CognitoJwtValidator;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.text.ParseException;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * JWT authentication filter that validates Cognito JWT tokens in requests.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private final CognitoJwtValidator cognitoJwtValidator;
    
    public JwtAuthenticationFilter(CognitoJwtValidator cognitoJwtValidator) {
        this.cognitoJwtValidator = cognitoJwtValidator;
    }
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        // Skip JWT authentication for public endpoints
        String path = request.getRequestURI();
        logger.debug("JwtAuthenticationFilter processing request: {} {}", request.getMethod(), path);
        
        if (path.startsWith("/api/v1/auth/") || path.startsWith("/auth/") || path.startsWith("/ws/")) {
            logger.debug("Skipping JWT authentication for public endpoint: {}", path);
            filterChain.doFilter(request, response);
            return;
        }
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            final String jwt = authHeader.substring(7);
            
            // Validate Cognito token
            JWTClaimsSet claimsSet = cognitoJwtValidator.validateToken(jwt);
            
            // Extract user info from token
            String userId = claimsSet.getSubject();
            String email = claimsSet.getStringClaim("email");
            
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Create authentication token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );
                // Store email in details for easy access
                authToken.setDetails(email);
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.debug("Authenticated user: {} ({})", userId, email);
            }
        } catch (ParseException | JOSEException | BadJWTException e) {
            // Log error but continue filter chain (will result in 401 if endpoint requires auth)
            logger.warn("Cognito JWT validation failed: {}", e.getMessage());
        } catch (Exception e) {
            // Log error but continue filter chain
            logger.error("JWT authentication failed", e);
        }
        
        filterChain.doFilter(request, response);
    }
}

