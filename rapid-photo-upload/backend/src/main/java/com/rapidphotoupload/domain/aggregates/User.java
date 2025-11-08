package com.rapidphotoupload.domain.aggregates;

import com.rapidphotoupload.domain.events.StorageQuotaExceeded;
import com.rapidphotoupload.domain.events.UserLoggedIn;
import com.rapidphotoupload.domain.events.UserRegistered;
import com.rapidphotoupload.domain.valueobjects.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

/**
 * User aggregate root.
 * Maintains user authentication, authorization, and storage quota information.
 */
public class User {
    private UserId id;
    private Username username;
    private Email email;
    private PasswordHash passwordHash;
    private Set<Role> roles;
    private StorageQuota storageQuota;
    private UsedStorage usedStorage;
    private CreatedAt createdAt;
    private LastLoginAt lastLoginAt;
    private List<Object> domainEvents;

    // Private constructor for aggregate creation
    private User() {
        this.domainEvents = new ArrayList<>();
        this.roles = Set.of(Role.USER);
    }

    /**
     * Factory method to create a new User aggregate (registration).
     */
    public static User create(
        UserId id,
        Username username,
        Email email,
        PasswordHash passwordHash,
        StorageQuota storageQuota
    ) {
        User user = new User();
        user.id = id;
        user.username = username;
        user.email = email;
        user.passwordHash = passwordHash;
        user.roles = Set.of(Role.USER);
        user.storageQuota = storageQuota;
        user.usedStorage = UsedStorage.zero();
        user.createdAt = CreatedAt.now();
        user.lastLoginAt = LastLoginAt.never();

        // Raise domain event
        user.raiseEvent(UserRegistered.create(id, username, email));

        return user;
    }

    /**
     * Record user login.
     */
    public void recordLogin() {
        this.lastLoginAt = LastLoginAt.now();
        raiseEvent(UserLoggedIn.create(this.id));
    }

    /**
     * Check if user can upload a file of the given size.
     * Raises StorageQuotaExceeded event if quota would be exceeded.
     */
    public boolean canUpload(long fileSize) {
        long newUsedStorage = this.usedStorage.getValue() + fileSize;
        if (newUsedStorage > this.storageQuota.getValue()) {
            raiseEvent(StorageQuotaExceeded.create(this.id, this.storageQuota, this.usedStorage, fileSize));
            return false;
        }
        return true;
    }

    /**
     * Record storage usage increase.
     */
    public void recordStorageUsage(long bytes) {
        if (bytes < 0) {
            throw new IllegalArgumentException("Bytes cannot be negative");
        }
        long newUsedStorage = this.usedStorage.getValue() + bytes;
        if (newUsedStorage > this.storageQuota.getValue()) {
            throw new IllegalStateException("Storage quota would be exceeded");
        }
        this.usedStorage = this.usedStorage.add(bytes);
    }

    /**
     * Record storage usage decrease (e.g., when photo is deleted).
     */
    public void releaseStorage(long bytes) {
        if (bytes < 0) {
            throw new IllegalArgumentException("Bytes cannot be negative");
        }
        this.usedStorage = this.usedStorage.subtract(bytes);
    }

    /**
     * Update password hash.
     */
    public void updatePassword(PasswordHash newPasswordHash) {
        if (newPasswordHash == null) {
            throw new IllegalArgumentException("PasswordHash cannot be null");
        }
        this.passwordHash = newPasswordHash;
    }

    /**
     * Add a role to the user.
     */
    public void addRole(Role role) {
        if (role == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }
        var newRoles = new java.util.HashSet<>(this.roles);
        newRoles.add(role);
        this.roles = Set.copyOf(newRoles);
    }

    /**
     * Remove a role from the user.
     */
    public void removeRole(Role role) {
        if (role == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }
        var newRoles = new java.util.HashSet<>(this.roles);
        newRoles.remove(role);
        if (newRoles.isEmpty()) {
            throw new IllegalStateException("User must have at least one role");
        }
        this.roles = Set.copyOf(newRoles);
    }

    /**
     * Check if user has a specific role.
     */
    public boolean hasRole(Role role) {
        return this.roles.contains(role);
    }

    // Getters
    public UserId getId() {
        return id;
    }

    public Username getUsername() {
        return username;
    }

    public Email getEmail() {
        return email;
    }

    public PasswordHash getPasswordHash() {
        return passwordHash;
    }

    public Set<Role> getRoles() {
        return Collections.unmodifiableSet(roles);
    }

    public StorageQuota getStorageQuota() {
        return storageQuota;
    }

    public UsedStorage getUsedStorage() {
        return usedStorage;
    }

    public CreatedAt getCreatedAt() {
        return createdAt;
    }

    public LastLoginAt getLastLoginAt() {
        return lastLoginAt;
    }

    /**
     * Get and clear domain events (for event publishing).
     */
    public List<Object> getDomainEvents() {
        List<Object> events = new ArrayList<>(this.domainEvents);
        this.domainEvents.clear();
        return events;
    }

    private void raiseEvent(Object event) {
        this.domainEvents.add(event);
    }
}

