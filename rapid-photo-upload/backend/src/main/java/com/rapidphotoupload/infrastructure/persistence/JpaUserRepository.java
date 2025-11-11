package com.rapidphotoupload.infrastructure.persistence;

import com.rapidphotoupload.domain.aggregates.User;
import com.rapidphotoupload.domain.repositories.UserRepository;
import com.rapidphotoupload.domain.valueobjects.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Infrastructure implementation of UserRepository using JPA.
 */
@Component
public class JpaUserRepository implements UserRepository {
    
    private static final Logger logger = LoggerFactory.getLogger(JpaUserRepository.class);
    
    private final UserJpaRepository jpaRepository;
    
    public JpaUserRepository(UserJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }
    
    @Override
    public void save(User user) {
        logger.debug("Saving user: {}", user.getId().getValue());
        UserEntity entity = toEntity(user);
        jpaRepository.save(entity);
        logger.debug("User saved successfully: {}", user.getId().getValue());
    }
    
    @Override
    public Optional<User> findById(UserId userId) {
        logger.debug("Finding user by ID: {}", userId.getValue());
        return jpaRepository.findById(userId.getValue())
            .map(this::toDomain);
    }
    
    @Override
    public Optional<User> findByUsername(Username username) {
        logger.debug("Finding user by username: {}", username.getValue());
        return jpaRepository.findByUsername(username.getValue())
            .map(this::toDomain);
    }
    
    @Override
    public Optional<User> findByEmail(Email email) {
        logger.debug("Finding user by email: {}", email.getValue());
        return jpaRepository.findByEmail(email.getValue())
            .map(this::toDomain);
    }
    
    @Override
    public boolean existsByUsername(Username username) {
        logger.debug("Checking if username exists: {}", username.getValue());
        return jpaRepository.existsByUsername(username.getValue());
    }
    
    @Override
    public boolean existsByEmail(Email email) {
        logger.debug("Checking if email exists: {}", email.getValue());
        return jpaRepository.existsByEmail(email.getValue());
    }
    
    private UserEntity toEntity(User user) {
        UserEntity entity = new UserEntity();
        entity.setId(user.getId().getValue());
        entity.setUsername(user.getUsername().getValue());
        entity.setEmail(user.getEmail().getValue());
        entity.setPasswordHash(user.getPasswordHash().getValue());
        entity.setRoles(user.getRoles().stream()
            .map(Role::name)
            .toArray(String[]::new));
        entity.setStorageQuota(user.getStorageQuota().getValue());
        entity.setUsedStorage(user.getUsedStorage().getValue());
        entity.setCreatedAt(user.getCreatedAt().getValue());
        if (user.getLastLoginAt().hasLoggedIn()) {
            entity.setLastLoginAt(user.getLastLoginAt().getValue());
        }
        return entity;
    }
    
    private User toDomain(UserEntity entity) {
        // Reconstruct User aggregate from entity
        UserId userId = UserId.from(entity.getId());
        Username username = Username.from(entity.getUsername());
        Email email = Email.from(entity.getEmail());
        PasswordHash passwordHash = PasswordHash.from(entity.getPasswordHash());
        StorageQuota storageQuota = StorageQuota.from(entity.getStorageQuota());
        UsedStorage usedStorage = UsedStorage.from(entity.getUsedStorage());
        CreatedAt createdAt = CreatedAt.from(entity.getCreatedAt());
        LastLoginAt lastLoginAt = entity.getLastLoginAt() != null 
            ? LastLoginAt.from(entity.getLastLoginAt()) 
            : LastLoginAt.never();
        
        Set<Role> roles = java.util.Arrays.stream(entity.getRoles())
            .map(Role::valueOf)
            .collect(Collectors.toSet());
        
        return User.reconstruct(
            userId,
            username,
            email,
            passwordHash,
            storageQuota,
            usedStorage,
            createdAt,
            lastLoginAt,
            roles
        );
    }
}

