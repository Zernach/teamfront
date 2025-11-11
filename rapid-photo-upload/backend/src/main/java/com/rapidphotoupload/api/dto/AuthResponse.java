package com.rapidphotoupload.api.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for authentication (login/refresh).
 */
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private Instant accessTokenExpiresAt;
    private Instant refreshTokenExpiresAt;
    private UserInfo user;
    
    public AuthResponse() {
    }
    
    public AuthResponse(String accessToken, String refreshToken, Instant accessTokenExpiresAt, Instant refreshTokenExpiresAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.accessTokenExpiresAt = accessTokenExpiresAt;
        this.refreshTokenExpiresAt = refreshTokenExpiresAt;
    }
    
    public AuthResponse(String accessToken, String refreshToken, Instant accessTokenExpiresAt, Instant refreshTokenExpiresAt, UserInfo user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.accessTokenExpiresAt = accessTokenExpiresAt;
        this.refreshTokenExpiresAt = refreshTokenExpiresAt;
        this.user = user;
    }
    
    public String getAccessToken() {
        return accessToken;
    }
    
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public Instant getAccessTokenExpiresAt() {
        return accessTokenExpiresAt;
    }
    
    public void setAccessTokenExpiresAt(Instant accessTokenExpiresAt) {
        this.accessTokenExpiresAt = accessTokenExpiresAt;
    }
    
    public Instant getRefreshTokenExpiresAt() {
        return refreshTokenExpiresAt;
    }
    
    public void setRefreshTokenExpiresAt(Instant refreshTokenExpiresAt) {
        this.refreshTokenExpiresAt = refreshTokenExpiresAt;
    }
    
    public UserInfo getUser() {
        return user;
    }
    
    public void setUser(UserInfo user) {
        this.user = user;
    }
    
    /**
     * Nested DTO for user information in auth response.
     */
    public static class UserInfo {
        private UUID id;
        private String username;
        private String email;
        
        public UserInfo() {
        }
        
        public UserInfo(UUID id, String username, String email) {
            this.id = id;
            this.username = username;
            this.email = email;
        }
        
        public UUID getId() {
            return id;
        }
        
        public void setId(UUID id) {
            this.id = id;
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
    }
}

