package com.rapidphotoupload.application.commands;

import com.rapidphotoupload.domain.valueobjects.Email;

/**
 * Command to authenticate a user and generate tokens.
 */
public class LoginUserCommand implements Command {
    private final Email email;
    private final String password;
    
    public LoginUserCommand(Email email, String password) {
        this.email = email;
        this.password = password;
    }
    
    public Email getEmail() {
        return email;
    }
    
    public String getPassword() {
        return password;
    }
}

