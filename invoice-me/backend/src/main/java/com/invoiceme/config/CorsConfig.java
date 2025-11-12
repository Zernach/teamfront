package com.invoiceme.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration for the application.
 * Allows ALL origins - completely open CORS for public access.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            // Allow ALL origins including CloudFront - completely open CORS
            .allowedOriginPatterns("*")
            // Allow all HTTP methods
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD")
            // Allow all headers including CloudFront-specific headers
            .allowedHeaders("*")
            // Expose all headers including CloudFront headers
            .exposedHeaders("*")
            // Disable credentials to allow "*" origin pattern (CORS requirement)
            .allowCredentials(false)
            // Cache preflight requests for 1 hour
            .maxAge(3600);
    }
}

