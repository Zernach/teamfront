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
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Controller for authentication endpoints.
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final CommandDispatcher commandDispatcher;
    private final UserRepository userRepository;
    
    public AuthController(CommandDispatcher commandDispatcher, UserRepository userRepository) {
        this.commandDispatcher = commandDispatcher;
        this.userRepository = userRepository;
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        try {
            // Create command
            RegisterUserCommand command = new RegisterUserCommand(
                Username.from(request.getUsername()),
                Email.from(request.getEmail()),
                request.getPassword()
            );
            
            // Execute command
            var result = commandDispatcher.dispatch(command);
            
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
                
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else if (result instanceof CommandResult.Failure<?> failure) {
                return ResponseEntity.badRequest().body(new ErrorResponse(
                    failure.errorCode(),
                    failure.errorMessage(),
                    httpRequest.getRequestURI()
                ));
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(
                "VALIDATION_ERROR",
                e.getMessage(),
                httpRequest.getRequestURI()
            ));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            // Create command
            LoginUserCommand command = new LoginUserCommand(
                Username.from(request.getUsername()),
                request.getPassword()
            );
            
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
}

