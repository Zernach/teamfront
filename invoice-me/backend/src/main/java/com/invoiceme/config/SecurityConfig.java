package com.invoiceme.config;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.text.ParseException;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Security configuration for Cognito JWT token validation.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${aws.cognito.user-pool-id}")
    private String userPoolId;

    @Value("${aws.cognito.region:us-west-1}")
    private String region;

    @Autowired
    private CognitoJwtValidator jwtValidator;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(cognitoJwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CognitoJwtAuthenticationFilter cognitoJwtAuthenticationFilter() {
        return new CognitoJwtAuthenticationFilter(jwtValidator);
    }

    /**
     * Filter to validate Cognito JWT tokens.
     */
    public static class CognitoJwtAuthenticationFilter extends OncePerRequestFilter {
        private static final Logger logger = LoggerFactory.getLogger(CognitoJwtAuthenticationFilter.class);
        private final CognitoJwtValidator jwtValidator;

        public CognitoJwtAuthenticationFilter(CognitoJwtValidator jwtValidator) {
            this.jwtValidator = jwtValidator;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {
            String path = request.getRequestURI();
            
            // Skip authentication for public endpoints
            if (path.startsWith("/api/v1/auth/")) {
                filterChain.doFilter(request, response);
                return;
            }

            String authHeader = request.getHeader("Authorization");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7);

            try {
                JWTClaimsSet claimsSet = jwtValidator.validateToken(token);
                
                // Extract user information from token
                String username = claimsSet.getSubject();
                String email = claimsSet.getStringClaim("email");
                
                // Create authentication object
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                    new SimpleGrantedAuthority("ROLE_USER")
                );
                
                Authentication authentication = new CognitoAuthenticationToken(username, email, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
            } catch (Exception e) {
                logger.warn("Invalid Cognito token: " + e.getMessage());
            }

            filterChain.doFilter(request, response);
        }
    }

    /**
     * Simple authentication token for Cognito.
     */
    public static class CognitoAuthenticationToken implements Authentication {
        private final String principal;
        private final String email;
        private final List<SimpleGrantedAuthority> authorities;
        private boolean authenticated = true;

        public CognitoAuthenticationToken(String principal, String email, List<SimpleGrantedAuthority> authorities) {
            this.principal = principal;
            this.email = email;
            this.authorities = authorities;
        }

        @Override
        public String getName() {
            return principal;
        }

        @Override
        public java.util.Collection<SimpleGrantedAuthority> getAuthorities() {
            return authorities;
        }

        @Override
        public Object getCredentials() {
            return null;
        }

        @Override
        public Object getDetails() {
            return email;
        }

        @Override
        public Object getPrincipal() {
            return principal;
        }

        @Override
        public boolean isAuthenticated() {
            return authenticated;
        }

        @Override
        public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
            this.authenticated = isAuthenticated;
        }
    }
}

