package com.rapidphotoupload.infrastructure.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;

/**
 * Security configuration that COMPLETELY DISABLES all security - allows everything through.
 * This is for proof of concept only - NO security restrictions whatsoever.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring Spring Security filter chain");
        
        http
            // Disable ALL security features
            .csrf(csrf -> csrf.disable())
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(formLogin -> formLogin.disable())
            .logout(logout -> logout.disable())
            .headers(headers -> headers.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Allow ALL endpoints - NO restrictions whatsoever
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            // Configure exception handling to allow everything (no 403s)
            // Even if something goes wrong, just let it through
            .exceptionHandling(exceptions -> {
                exceptions.authenticationEntryPoint((request, response, authException) -> {
                    // Don't block - just continue (this shouldn't be called with permitAll)
                    // But if it is, just return 200 OK
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.setContentType("text/plain");
                    response.getWriter().write("OK");
                });
                exceptions.accessDeniedHandler((request, response, accessDeniedException) -> {
                    // Don't block - just continue (this shouldn't be called with permitAll)
                    // But if it is, just return 200 OK
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.setContentType("text/plain");
                    response.getWriter().write("OK");
                });
            });
        
        logger.info("Spring Security filter chain configured successfully");
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow ALL origins including CloudFront - completely open CORS
        configuration.setAllowedOriginPatterns(List.of("*"));
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        
        // Allow all headers including CloudFront-specific headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // Expose all headers including CloudFront headers
        configuration.setExposedHeaders(List.of("*"));
        
        // Disable credentials to allow "*" origin pattern (CORS requirement)
        // This makes the API completely public
        configuration.setAllowCredentials(false);
        
        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        logger.info("CORS configuration set up to allow ALL origins including CloudFront");
        return source;
    }
}

