package com.rapidphotoupload.infrastructure.security;

import com.rapidphotoupload.domain.valueobjects.PasswordHash;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service for password encoding and verification using BCrypt.
 */
@Service
public class PasswordEncoderService {
    
    private final PasswordEncoder passwordEncoder;
    
    public PasswordEncoderService() {
        // BCrypt cost factor of 12 (2^12 rounds)
        this.passwordEncoder = new BCryptPasswordEncoder(12);
    }
    
    public PasswordHash encode(String rawPassword) {
        String hash = passwordEncoder.encode(rawPassword);
        return PasswordHash.from(hash);
    }
    
    public boolean matches(String rawPassword, PasswordHash passwordHash) {
        return passwordEncoder.matches(rawPassword, passwordHash.getValue());
    }
}

