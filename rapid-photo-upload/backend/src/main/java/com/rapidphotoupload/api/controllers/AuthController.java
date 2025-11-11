package com.rapidphotoupload.api.controllers;

import com.rapidphotoupload.api.dto.*;
import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.RefreshTokenCommand;
import com.rapidphotoupload.domain.aggregates.User;
import com.rapidphotoupload.domain.repositories.UserRepository;
import com.rapidphotoupload.domain.valueobjects.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for authentication endpoints.
 * Note: Login and registration are handled by AWS Cognito on the frontend.
 * This controller provides endpoints for token refresh and getting current user info.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    private final UserRepository userRepository;
    
    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        // Registration is now handled by AWS Cognito on the frontend
        return ResponseEntity.status(HttpStatus.GONE)
            .body(new ErrorResponse(
                "DEPRECATED",
                "Registration is now handled by AWS Cognito. Please use the frontend registration flow.",
                httpRequest.getRequestURI()
            ));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        // Login is now handled by AWS Cognito on the frontend
        return ResponseEntity.status(HttpStatus.GONE)
            .body(new ErrorResponse(
                "DEPRECATED",
                "Login is now handled by AWS Cognito. Please use the frontend login flow.",
                httpRequest.getRequestURI()
            ));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request, HttpServletRequest httpRequest) {
        // Token refresh is now handled by AWS Cognito on the frontend
        return ResponseEntity.status(HttpStatus.GONE)
            .body(new ErrorResponse(
                "DEPRECATED",
                "Token refresh is now handled by AWS Cognito. Please use the frontend refresh flow.",
                httpRequest.getRequestURI()
            ));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest) {
        // Logout is now handled by AWS Cognito on the frontend
        // This endpoint can remain for backward compatibility but does nothing
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest httpRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(
                        "UNAUTHORIZED",
                        "Not authenticated",
                        httpRequest.getRequestURI()
                    ));
            }
            
            // Extract user info from authentication
            String userId = authentication.getName();
            String email = authentication.getDetails() != null ? authentication.getDetails().toString() : "";
            
            // Try to find user in database by Cognito user ID or email
            User user = null;
            try {
                // First try by email if available
                if (!email.isEmpty()) {
                    user = userRepository.findByEmail(Email.from(email)).orElse(null);
                }
                
                // If not found by email, try by ID (convert Cognito UUID to our UserId)
                if (user == null) {
                    try {
                        UserId userIdObj = UserId.from(UUID.fromString(userId));
                        user = userRepository.findById(userIdObj).orElse(null);
                    } catch (IllegalArgumentException e) {
                        // userId is not a valid UUID, skip
                    }
                }
            } catch (Exception e) {
                logger.warn("Failed to lookup user in database: {}", e.getMessage());
            }
            
            // Return user info (from database if found, otherwise from token)
            if (user != null) {
                AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                    user.getId().getValue(),
                    user.getUsername().getValue(),
                    user.getEmail().getValue()
                );
                return ResponseEntity.ok(userInfo);
            } else {
                // User not in database yet, return info from token
                // Generate a UUID from the Cognito sub (userId) if possible, otherwise create a new one
                UUID userUuid;
                try {
                    userUuid = UUID.fromString(userId);
                } catch (IllegalArgumentException e) {
                    // If userId is not a valid UUID, generate a deterministic one from the userId string
                    userUuid = UUID.nameUUIDFromBytes(userId.getBytes());
                }
                
                AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                    userUuid,
                    email.split("@")[0], // Use email prefix as username
                    email.isEmpty() ? userId : email
                );
                return ResponseEntity.ok(userInfo);
            }
        } catch (Exception e) {
            logger.error("Failed to get current user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                    "INTERNAL_SERVER_ERROR",
                    "An unexpected error occurred",
                    httpRequest.getRequestURI()
                ));
        }
    }
}

