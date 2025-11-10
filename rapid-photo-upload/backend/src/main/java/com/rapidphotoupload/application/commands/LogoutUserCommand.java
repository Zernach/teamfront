package com.rapidphotoupload.application.commands;

import com.rapidphotoupload.domain.valueobjects.UserId;

/**
 * Command to logout a user (invalidate refresh token).
 */
public class LogoutUserCommand implements Command {
    private final UserId userId;
    private final String refreshToken;
    
    public LogoutUserCommand(UserId userId, String refreshToken) {
        this.userId = userId;
        this.refreshToken = refreshToken;
    }
    
    public UserId getUserId() {
        return userId;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
}

