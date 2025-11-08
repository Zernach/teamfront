package com.rapidphotoupload.domain.aggregates;

import com.rapidphotoupload.domain.valueobjects.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void shouldCreateUser() {
        var userId = UserId.generate();
        var username = Username.from("john_doe");
        var email = Email.from("john@example.com");
        var passwordHash = PasswordHash.from("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy");
        var storageQuota = StorageQuota.fromGigabytes(10);
        
        var user = User.create(userId, username, email, passwordHash, storageQuota);
        
        assertNotNull(user);
        assertEquals(userId, user.getId());
        assertEquals(username, user.getUsername());
        assertEquals(email, user.getEmail());
        assertEquals(passwordHash, user.getPasswordHash());
        assertEquals(1, user.getRoles().size());
        assertTrue(user.hasRole(Role.USER));
        assertEquals(storageQuota, user.getStorageQuota());
        assertEquals(0, user.getUsedStorage().getValue());
        assertNotNull(user.getCreatedAt());
        assertFalse(user.getLastLoginAt().hasLoggedIn());
        
        // Check domain event was raised
        var events = user.getDomainEvents();
        assertEquals(1, events.size());
        assertTrue(events.get(0) instanceof com.rapidphotoupload.domain.events.UserRegistered);
    }

    @Test
    void shouldRecordLogin() {
        var user = createTestUser();
        user.getDomainEvents().clear();
        
        user.recordLogin();
        
        assertTrue(user.getLastLoginAt().hasLoggedIn());
        var events = user.getDomainEvents();
        assertEquals(1, events.size());
        assertTrue(events.get(0) instanceof com.rapidphotoupload.domain.events.UserLoggedIn);
    }

    @Test
    void shouldCheckIfCanUpload() {
        var user = createTestUser();
        var quota = StorageQuota.fromGigabytes(10);
        var user2 = User.create(
            UserId.generate(),
            Username.from("test"),
            Email.from("test@example.com"),
            PasswordHash.from("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"),
            quota
        );
        
        assertTrue(user2.canUpload(1024 * 1024)); // 1MB
        assertFalse(user2.canUpload(quota.getValue() + 1));
    }

    @Test
    void shouldRecordStorageUsage() {
        var user = createTestUser();
        
        user.recordStorageUsage(1024 * 1024); // 1MB
        
        assertEquals(1024 * 1024, user.getUsedStorage().getValue());
    }

    @Test
    void shouldThrowExceptionWhenStorageQuotaExceeded() {
        var user = createTestUser();
        var quota = StorageQuota.fromGigabytes(1);
        var user2 = User.create(
            UserId.generate(),
            Username.from("test"),
            Email.from("test@example.com"),
            PasswordHash.from("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"),
            quota
        );
        user2.recordStorageUsage(quota.getValue());
        
        assertThrows(IllegalStateException.class, () -> {
            user2.recordStorageUsage(1);
        });
    }

    @Test
    void shouldAddRole() {
        var user = createTestUser();
        
        user.addRole(Role.ADMIN);
        
        assertTrue(user.hasRole(Role.ADMIN));
        assertTrue(user.hasRole(Role.USER));
    }

    private User createTestUser() {
        var userId = UserId.generate();
        var username = Username.from("john_doe");
        var email = Email.from("john@example.com");
        var passwordHash = PasswordHash.from("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy");
        var storageQuota = StorageQuota.fromGigabytes(10);
        return User.create(userId, username, email, passwordHash, storageQuota);
    }
}

