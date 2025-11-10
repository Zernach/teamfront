package com.rapidphotoupload.application.dtos;

import java.time.Instant;

/**
 * DTO for authentication tokens.
 */
public class AuthTokensDTO {
    private final String accessToken;
    private final String refreshToken;
    private final Instant accessTokenExpiresAt;
    private final Instant refreshTokenExpiresAt;
    
    public AuthTokensDTO(String accessToken, String refreshToken, Instant accessTokenExpiresAt, Instant refreshTokenExpiresAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.accessTokenExpiresAt = accessTokenExpiresAt;
        this.refreshTokenExpiresAt = refreshTokenExpiresAt;
    }
    
    public String getAccessToken() {
        return accessToken;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public Instant getAccessTokenExpiresAt() {
        return accessTokenExpiresAt;
    }
    
    public Instant getRefreshTokenExpiresAt() {
        return refreshTokenExpiresAt;
    }
}

