package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.LogoutUserCommand;
import com.rapidphotoupload.application.commands.handlers.CommandHandler;
import com.rapidphotoupload.infrastructure.security.RefreshTokenService;
import org.springframework.stereotype.Component;

/**
 * Handler for LogoutUserCommand.
 */
@Component
public class LogoutUserCommandHandler implements CommandHandler<LogoutUserCommand, Void> {
    
    private final RefreshTokenService refreshTokenService;
    
    public LogoutUserCommandHandler(RefreshTokenService refreshTokenService) {
        this.refreshTokenService = refreshTokenService;
    }
    
    @Override
    public CommandResult<Void> handle(LogoutUserCommand command) {
        // Revoke refresh token
        refreshTokenService.revokeRefreshToken(command.getUserId(), command.getRefreshToken());
        
        return CommandResult.success(null);
    }
    
    @Override
    public Class<LogoutUserCommand> getCommandType() {
        return LogoutUserCommand.class;
    }
}

