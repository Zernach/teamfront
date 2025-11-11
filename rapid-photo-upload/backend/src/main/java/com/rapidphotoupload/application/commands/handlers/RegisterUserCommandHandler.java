package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.RegisterUserCommand;
import com.rapidphotoupload.application.commands.handlers.CommandHandler;
import com.rapidphotoupload.domain.aggregates.User;
import com.rapidphotoupload.domain.repositories.UserRepository;
import com.rapidphotoupload.domain.valueobjects.*;
import com.rapidphotoupload.infrastructure.exceptions.ValidationException;
import com.rapidphotoupload.infrastructure.security.PasswordEncoderService;
import org.springframework.stereotype.Component;

/**
 * Handler for RegisterUserCommand.
 */
@Component
public class RegisterUserCommandHandler implements CommandHandler<RegisterUserCommand, UserId> {
    
    private final UserRepository userRepository;
    private final PasswordEncoderService passwordEncoder;
    
    public RegisterUserCommandHandler(UserRepository userRepository, PasswordEncoderService passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public CommandResult<UserId> handle(RegisterUserCommand command) {
        // Validate email uniqueness (only unique identifier)
        if (userRepository.existsByEmail(command.getEmail())) {
            throw new ValidationException("Email already exists");
        }
        
        // Validate password (basic check only)
        validatePassword(command.getPassword());
        
        // Hash password
        PasswordHash passwordHash = passwordEncoder.encode(command.getPassword());
        
        // Create user aggregate
        UserId userId = UserId.generate();
        StorageQuota defaultQuota = StorageQuota.fromGigabytes(10); // Default 10GB quota
        
        User user = User.create(
            userId,
            command.getUsername(),
            command.getEmail(),
            passwordHash,
            defaultQuota
        );
        
        // Save user
        userRepository.save(user);
        
        // Domain events are published by infrastructure when getDomainEvents() is called
        user.getDomainEvents();
        
        return CommandResult.success(userId);
    }
    
    private void validatePassword(String password) {
        if (password == null || password.isEmpty()) {
            throw new ValidationException("Password cannot be empty");
        }
    }
    
    @Override
    public Class<RegisterUserCommand> getCommandType() {
        return RegisterUserCommand.class;
    }
}

