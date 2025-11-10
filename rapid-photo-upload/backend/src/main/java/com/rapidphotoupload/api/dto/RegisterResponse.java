package com.rapidphotoupload.api.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for user registration.
 */
public class RegisterResponse {
    private UUID userId;
    private String username;
    private String email;
    private Instant createdAt;
    
    public RegisterResponse() {
    }
    
    public RegisterResponse(UUID userId, String username, String email, Instant createdAt) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.createdAt = createdAt;
    }
    
    public UUID getUserId() {
        return userId;
    }
    
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

