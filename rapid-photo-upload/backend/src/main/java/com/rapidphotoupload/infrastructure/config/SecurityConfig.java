package com.rapidphotoupload.infrastructure.config;

import com.rapidphotoupload.infrastructure.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Security configuration for the application.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring Spring Security filter chain");
        
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(formLogin -> formLogin.disable())
            .httpBasic(httpBasic -> httpBasic.disable())
            .logout(logout -> logout.disable())
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers("/api/v1/auth/**").permitAll();
                auth.requestMatchers("/auth/**").permitAll(); // Legacy path support
                auth.requestMatchers("/ws/**").permitAll(); // WebSocket connections handled separately
                auth.requestMatchers("/error").permitAll(); // Error endpoint for JSON error responses
                auth.requestMatchers("/health").permitAll(); // Health check endpoint
                auth.requestMatchers("/").permitAll(); // Root endpoint
                auth.anyRequest().authenticated();
                logger.info("Authorization rules configured: /api/v1/auth/** and /auth/** are public");
            })
            .exceptionHandling(exceptions -> {
                exceptions.authenticationEntryPoint(new JsonAuthenticationEntryPoint());
                exceptions.accessDeniedHandler((request, response, accessDeniedException) -> {
                    logger.warn("Access denied for request: {}", request.getRequestURI());
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write(
                        "{\"errorCode\":\"FORBIDDEN\",\"message\":\"Access denied\",\"path\":\"" +
                        request.getRequestURI() + "\"}"
                    );
                });
                logger.debug("Exception handling configured with JSON responses");
            })
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        logger.info("Spring Security filter chain configured successfully");
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow localhost origins for development and production origins
        // Using origin patterns to support dynamic ports (e.g., Expo dev server)
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "http://192.168.*:*",  // Allow local network IPs (for mobile device testing)
            "http://10.0.*:*",     // Allow local network IPs
            "http://172.*:*",      // Allow local network IPs
            // Allow S3 website origins
            "http://teamfront-rapid-photo-upload-frontend.s3-website-us-west-1.amazonaws.com",
            "https://teamfront-rapid-photo-upload-frontend.s3-website-us-west-1.amazonaws.com",
            // Allow CloudFront distributions (any *.cloudfront.net)
            "https://*.cloudfront.net",
            // Explicit CloudFront distribution for rapid-photo-upload
            "https://d2ujb1lb2gj847.cloudfront.net"
        ));
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Allow all headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        logger.info("CORS configuration set up for production and development origins");
        return source;
    }
    
    /**
     * Custom authentication entry point that returns JSON instead of redirecting to login page.
     */
    private static class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {
        private static final Logger logger = LoggerFactory.getLogger(JsonAuthenticationEntryPoint.class);
        
        @Override
        public void commence(HttpServletRequest request, HttpServletResponse response,
                            AuthenticationException authException) throws IOException {
            logger.warn("Authentication entry point triggered for: {} - {}", 
                request.getRequestURI(), authException.getMessage());
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write(
                "{\"errorCode\":\"UNAUTHORIZED\",\"message\":\"Authentication required\",\"path\":\"" +
                request.getRequestURI() + "\"}"
            );
        }
    }
}

