package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.LoginUserCommand;
import com.rapidphotoupload.application.commands.handlers.CommandHandler;
import com.rapidphotoupload.application.dtos.AuthTokensDTO;
import com.rapidphotoupload.domain.aggregates.User;
import com.rapidphotoupload.domain.repositories.UserRepository;
import com.rapidphotoupload.domain.valueobjects.UserId;
import com.rapidphotoupload.infrastructure.exceptions.ValidationException;
import com.rapidphotoupload.infrastructure.security.JwtService;
import com.rapidphotoupload.infrastructure.security.PasswordEncoderService;
import com.rapidphotoupload.infrastructure.security.RefreshTokenService;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Handler for LoginUserCommand.
 */
@Component
public class LoginUserCommandHandler implements CommandHandler<LoginUserCommand, AuthTokensDTO> {
    
    private final UserRepository userRepository;
    private final PasswordEncoderService passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    
    public LoginUserCommandHandler(
            UserRepository userRepository,
            PasswordEncoderService passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }
    
    @Override
    public CommandResult<AuthTokensDTO> handle(LoginUserCommand command) {
        // Find user by username
        User user = userRepository.findByUsername(command.getUsername())
                .orElseThrow(() -> new ValidationException("Invalid credentials"));
        
        // Verify password
        if (!passwordEncoder.matches(command.getPassword(), user.getPasswordHash())) {
            throw new ValidationException("Invalid credentials");
        }
        
        // Update last login
        user.recordLogin();
        userRepository.save(user);
        // Domain events are published by infrastructure when getDomainEvents() is called
        user.getDomainEvents();
        
        // Generate tokens
        String userId = user.getId().getValue().toString();
        String username = user.getUsername().getValue();
        
        String accessToken = jwtService.generateAccessToken(userId, username);
        String refreshToken = jwtService.generateRefreshToken(userId, username);
        
        // Store refresh token
        refreshTokenService.storeRefreshToken(user.getId(), refreshToken);
        
        AuthTokensDTO tokens = new AuthTokensDTO(
            accessToken,
            refreshToken,
            Instant.now().plusSeconds(3600), // 1 hour
            Instant.now().plusSeconds(604800) // 7 days
        );
        
        return CommandResult.success(tokens);
    }
    
    @Override
    public Class<LoginUserCommand> getCommandType() {
        return LoginUserCommand.class;
    }
}

