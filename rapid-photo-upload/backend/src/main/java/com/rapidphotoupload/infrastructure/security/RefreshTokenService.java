package com.rapidphotoupload.infrastructure.security;

import com.rapidphotoupload.domain.valueobjects.UserId;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing refresh tokens in memory.
 * In production, this should use Redis or database for distributed systems.
 */
@Service
public class RefreshTokenService {
    
    // Map of userId -> Set of valid refresh tokens
    private final ConcurrentHashMap<UserId, Set<String>> refreshTokens = new ConcurrentHashMap<>();
    
    public void storeRefreshToken(UserId userId, String refreshToken) {
        refreshTokens.computeIfAbsent(userId, k -> new HashSet<>()).add(refreshToken);
    }
    
    public boolean isValidRefreshToken(UserId userId, String refreshToken) {
        Set<String> tokens = refreshTokens.get(userId);
        return tokens != null && tokens.contains(refreshToken);
    }
    
    public void revokeRefreshToken(UserId userId, String refreshToken) {
        Set<String> tokens = refreshTokens.get(userId);
        if (tokens != null) {
            tokens.remove(refreshToken);
            if (tokens.isEmpty()) {
                refreshTokens.remove(userId);
            }
        }
    }
    
    public void revokeAllRefreshTokens(UserId userId) {
        refreshTokens.remove(userId);
    }
}

