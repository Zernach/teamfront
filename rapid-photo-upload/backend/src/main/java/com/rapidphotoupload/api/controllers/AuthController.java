package com.rapidphotoupload.api.controllers;

import com.rapidphotoupload.api.dto.*;
import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.LoginUserCommand;
import com.rapidphotoupload.application.commands.RefreshTokenCommand;
import com.rapidphotoupload.application.commands.RegisterUserCommand;
import com.rapidphotoupload.application.commands.handlers.CommandDispatcher;
import com.rapidphotoupload.application.dtos.AuthTokensDTO;
import com.rapidphotoupload.domain.aggregates.User;
import com.rapidphotoupload.domain.repositories.UserRepository;
import com.rapidphotoupload.domain.valueobjects.*;
import com.rapidphotoupload.infrastructure.security.JwtAuthenticationFilter;
import com.rapidphotoupload.infrastructure.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    private final CommandDispatcher commandDispatcher;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    
    public AuthController(CommandDispatcher commandDispatcher, UserRepository userRepository, JwtService jwtService) {
        this.commandDispatcher = commandDispatcher;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        logger.info("=== REGISTRATION REQUEST RECEIVED ===");
        logger.info("Request URI: {}", httpRequest.getRequestURI());
        logger.info("Request URL: {}", httpRequest.getRequestURL());
        logger.info("Method: {}", httpRequest.getMethod());
        logger.info("Content-Type: {}", httpRequest.getContentType());
        logger.info("Registration request received for email: {}", request.getEmail());
        try {
            // Create command
            RegisterUserCommand command = new RegisterUserCommand(
                Username.from(request.getUsername()),
                Email.from(request.getEmail()),
                request.getPassword()
            );
            
            logger.debug("Dispatching RegisterUserCommand");
            // Execute command
            var result = commandDispatcher.dispatch(command);
            logger.debug("Command dispatched, result type: {}", result.getClass().getSimpleName());
            
            if (result instanceof CommandResult.Success<?> success) {
                // Get created user for response
                UserId userId = (UserId) success.data();
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found after creation"));
                
                RegisterResponse response = new RegisterResponse(
                    userId.getValue(),
                    user.getUsername().getValue(),
                    user.getEmail().getValue(),
                    user.getCreatedAt().getValue()
                );
                
                logger.info("Registration successful for user: {}", user.getEmail().getValue());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else if (result instanceof CommandResult.Failure<?> failure) {
                return ResponseEntity.badRequest().body(new ErrorResponse(
                    failure.errorCode(),
                    failure.errorMessage(),
                    httpRequest.getRequestURI()
                ));
            }
            
            logger.error("Unexpected result type from command dispatcher");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            logger.error("Registration failed", e);
            return ResponseEntity.badRequest().body(new ErrorResponse(
                "VALIDATION_ERROR",
                e.getMessage(),
                httpRequest.getRequestURI()
            ));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        logger.info("Login request received for email: {}", request.getEmail());
        try {
            // Create command
            LoginUserCommand command = new LoginUserCommand(
                Email.from(request.getEmail()),
                request.getPassword()
            );
            
            // Execute command
            var result = commandDispatcher.dispatch(command);
            
            if (result instanceof CommandResult.Success<?> success) {
                AuthTokensDTO tokens = (AuthTokensDTO) success.data();
                
                // Get user info for response
                User user = userRepository.findByEmail(command.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found after login"));
                
                AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                    user.getId().getValue(),
                    user.getUsername().getValue(),
                    user.getEmail().getValue()
                );
                
                AuthResponse response = new AuthResponse(
                    tokens.getAccessToken(),
                    tokens.getRefreshToken(),
                    tokens.getAccessTokenExpiresAt(),
                    tokens.getRefreshTokenExpiresAt(),
                    userInfo
                );
                
                logger.info("Login successful for user: {}", user.getEmail().getValue());
                return ResponseEntity.ok(response);
            } else if (result instanceof CommandResult.Failure<?> failure) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(
                        failure.errorCode(),
                        failure.errorMessage(),
                        httpRequest.getRequestURI()
                    ));
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            logger.error("Login failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                    "AUTH_ERROR",
                    e.getMessage(),
                    httpRequest.getRequestURI()
                ));
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request, HttpServletRequest httpRequest) {
        try {
            // Create command
            RefreshTokenCommand command = new RefreshTokenCommand(request.getRefreshToken());
            
            // Execute command
            var result = commandDispatcher.dispatch(command);
            
            if (result instanceof CommandResult.Success<?> success) {
                AuthTokensDTO tokens = (AuthTokensDTO) success.data();
                AuthResponse response = new AuthResponse(
                    tokens.getAccessToken(),
                    tokens.getRefreshToken(),
                    tokens.getAccessTokenExpiresAt(),
                    tokens.getRefreshTokenExpiresAt()
                );
                
                return ResponseEntity.ok(response);
            } else if (result instanceof CommandResult.Failure<?> failure) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(
                        failure.errorCode(),
                        failure.errorMessage(),
                        httpRequest.getRequestURI()
                    ));
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                    "AUTH_ERROR",
                    e.getMessage(),
                    httpRequest.getRequestURI()
                ));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {
        try {
            // Extract user ID from token
            String token = authorizationHeader.replace("Bearer ", "");
            // For now, we'll extract from token - in production, use security context
            // This is a simplified version - should use JwtAuthenticationFilter
            
            // Get user ID from token (simplified - should use proper security context)
            // For now, return success
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(
                "LOGOUT_ERROR",
                e.getMessage(),
                httpRequest.getRequestURI()
            ));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest httpRequest) {
        try {
            // Extract Authorization header
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(
                        "UNAUTHORIZED",
                        "Missing or invalid Authorization header",
                        httpRequest.getRequestURI()
                    ));
            }
            
            // Extract token
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            // Validate token
            if (jwtService.isTokenExpired(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(
                        "UNAUTHORIZED",
                        "Token has expired",
                        httpRequest.getRequestURI()
                    ));
            }
            
            // Extract user ID from token
            String userIdStr;
            try {
                userIdStr = jwtService.extractUserId(token);
            } catch (Exception e) {
                logger.error("Failed to extract user ID from token", e);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(
                        "UNAUTHORIZED",
                        "Invalid token",
                        httpRequest.getRequestURI()
                    ));
            }
            
            if (userIdStr == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(
                        "UNAUTHORIZED",
                        "Token does not contain user ID",
                        httpRequest.getRequestURI()
                    ));
            }
            
            // Look up user
            UserId userId = UserId.from(UUID.fromString(userIdStr));
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Return user info
            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId().getValue(),
                user.getUsername().getValue(),
                user.getEmail().getValue()
            );
            
            return ResponseEntity.ok(userInfo);
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

