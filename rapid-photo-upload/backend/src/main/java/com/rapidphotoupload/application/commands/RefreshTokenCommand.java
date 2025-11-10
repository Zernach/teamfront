package com.rapidphotoupload.application.commands;

/**
 * Command to refresh access token using refresh token.
 */
public class RefreshTokenCommand implements Command {
    private final String refreshToken;
    
    public RefreshTokenCommand(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
}

