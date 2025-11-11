package com.invoiceme.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration for the application.
 * Allows requests from localhost (development) and production frontend origins.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            // Allow localhost origins for development
            .allowedOriginPatterns(
                "http://localhost:*",
                "http://127.0.0.1:*",
                // Allow S3 website origins
                "http://teamfront-invoice-me-frontend.s3-website-us-west-1.amazonaws.com",
                "https://teamfront-invoice-me-frontend.s3-website-us-west-1.amazonaws.com",
                // Allow CloudFront distributions (any *.cloudfront.net)
                "https://*.cloudfront.net"
            )
            // Allow all HTTP methods
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            // Allow all headers
            .allowedHeaders("*")
            // Allow credentials (cookies, authorization headers)
            .allowCredentials(true)
            // Cache preflight requests for 1 hour
            .maxAge(3600);
    }
}

