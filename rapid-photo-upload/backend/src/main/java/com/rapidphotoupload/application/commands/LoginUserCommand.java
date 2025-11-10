package com.rapidphotoupload.application.commands;

import com.rapidphotoupload.domain.valueobjects.Username;

/**
 * Command to authenticate a user and generate tokens.
 */
public class LoginUserCommand implements Command {
    private final Username username;
    private final String password;
    
    public LoginUserCommand(Username username, String password) {
        this.username = username;
        this.password = password;
    }
    
    public Username getUsername() {
        return username;
    }
    
    public String getPassword() {
        return password;
    }
}

