package com.rapidphotoupload.application.commands;

import com.rapidphotoupload.domain.valueobjects.Email;
import com.rapidphotoupload.domain.valueobjects.Username;

/**
 * Command to register a new user.
 */
public class RegisterUserCommand implements Command {
    private final Username username;
    private final Email email;
    private final String password;
    
    public RegisterUserCommand(Username username, Email email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
    
    public Username getUsername() {
        return username;
    }
    
    public Email getEmail() {
        return email;
    }
    
    public String getPassword() {
        return password;
    }
}

