package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.RefreshTokenCommand;
import com.rapidphotoupload.application.commands.handlers.CommandHandler;
import com.rapidphotoupload.application.dtos.AuthTokensDTO;
import com.rapidphotoupload.domain.valueobjects.UserId;
import com.rapidphotoupload.infrastructure.exceptions.ValidationException;
import com.rapidphotoupload.infrastructure.security.JwtService;
import com.rapidphotoupload.infrastructure.security.RefreshTokenService;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

/**
 * Handler for RefreshTokenCommand.
 */
@Component
public class RefreshTokenCommandHandler implements CommandHandler<RefreshTokenCommand, AuthTokensDTO> {
    
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    
    public RefreshTokenCommandHandler(JwtService jwtService, RefreshTokenService refreshTokenService) {
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }
    
    @Override
    public CommandResult<AuthTokensDTO> handle(RefreshTokenCommand command) {
        // Validate refresh token
        if (jwtService.isTokenExpired(command.getRefreshToken())) {
            throw new ValidationException("Refresh token expired");
        }
        
        if (!jwtService.isRefreshToken(command.getRefreshToken())) {
            throw new ValidationException("Invalid token type");
        }
        
        // Extract user info
        String userIdStr = jwtService.extractUserId(command.getRefreshToken());
        String username = jwtService.extractUsername(command.getRefreshToken());
        UserId userId = UserId.from(UUID.fromString(userIdStr));
        
        // Verify token is stored (not revoked)
        if (!refreshTokenService.isValidRefreshToken(userId, command.getRefreshToken())) {
            throw new ValidationException("Refresh token invalid or revoked");
        }
        
        // Generate new tokens
        String newAccessToken = jwtService.generateAccessToken(userIdStr, username);
        String newRefreshToken = jwtService.generateRefreshToken(userIdStr, username);
        
        // Store new refresh token and revoke old one
        refreshTokenService.revokeRefreshToken(userId, command.getRefreshToken());
        refreshTokenService.storeRefreshToken(userId, newRefreshToken);
        
        AuthTokensDTO tokens = new AuthTokensDTO(
            newAccessToken,
            newRefreshToken,
            Instant.now().plusSeconds(3600), // 1 hour
            Instant.now().plusSeconds(604800) // 7 days
        );
        
        return CommandResult.success(tokens);
    }
    
    @Override
    public Class<RefreshTokenCommand> getCommandType() {
        return RefreshTokenCommand.class;
    }
}

