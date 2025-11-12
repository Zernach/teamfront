package com.invoiceme.features.auth.api;

import com.invoiceme.features.auth.dto.LoginResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for authentication endpoints.
 * Note: All endpoints are publicly accessible. No authentication required.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    @GetMapping("/me")
    public ResponseEntity<LoginResponse.UserInfo> getCurrentUser() {
        // Return a default public/guest user since all endpoints are publicly accessible
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
        userInfo.setId(UUID.randomUUID().toString());
        userInfo.setEmail("public@guest.com");
        userInfo.setFullName("Public User");
        userInfo.setRole("USER");
        
        return ResponseEntity.ok(userInfo);
    }
}

