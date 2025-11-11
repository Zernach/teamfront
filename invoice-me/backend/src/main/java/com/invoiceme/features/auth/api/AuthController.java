package com.invoiceme.features.auth.api;

import com.invoiceme.features.auth.dto.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

/**
 * Controller for authentication endpoints.
 * Note: Login and registration are handled by AWS Cognito on the frontend.
 * This controller only provides endpoints to get current user info.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(
                        "UNAUTHORIZED",
                        "Not authenticated",
                        "/api/v1/auth/me"
                    ));
            }
            
            // Extract user info from authentication
            String principal = authentication.getName();
            String email = authentication.getDetails() != null ? authentication.getDetails().toString() : principal;
            
            // Create user info response
            LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
            userInfo.setId(UUID.nameUUIDFromBytes(email.getBytes()).toString()); // Generate consistent ID from email
            userInfo.setEmail(email);
            userInfo.setFullName("User"); // TODO: Get from database or token claims
            userInfo.setRole("USER"); // TODO: Get from token claims or database
            
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                    "INTERNAL_SERVER_ERROR",
                    "An unexpected error occurred",
                    "/api/v1/auth/me"
                ));
        }
    }
    
    // Inner classes for request/response DTOs
    public static class ErrorResponse {
        private String errorCode;
        private String message;
        private String path;
        
        public ErrorResponse(String errorCode, String message, String path) {
            this.errorCode = errorCode;
            this.message = message;
            this.path = path;
        }
        
        public String getErrorCode() { return errorCode; }
        public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }
    }
}

