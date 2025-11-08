package com.invoiceme.features.customers.domain.valueobjects;

import java.time.LocalDateTime;
import java.util.Objects;

public final class AuditInfo {
    private final LocalDateTime createdAt;
    private final LocalDateTime lastModifiedAt;
    private final String createdBy;
    private final String lastModifiedBy;
    
    private AuditInfo(LocalDateTime createdAt, LocalDateTime lastModifiedAt, String createdBy, String lastModifiedBy) {
        this.createdAt = createdAt;
        this.lastModifiedAt = lastModifiedAt;
        this.createdBy = createdBy;
        this.lastModifiedBy = lastModifiedBy;
    }
    
    public static AuditInfo create(String createdBy) {
        LocalDateTime now = LocalDateTime.now();
        return new AuditInfo(now, now, createdBy, createdBy);
    }
    
    public static AuditInfo reconstruct(LocalDateTime createdAt, LocalDateTime lastModifiedAt, String createdBy, String lastModifiedBy) {
        return new AuditInfo(createdAt, lastModifiedAt, createdBy, lastModifiedBy);
    }
    
    public static AuditInfo update(AuditInfo existing, String modifiedBy) {
        return new AuditInfo(
            existing.createdAt,
            LocalDateTime.now(),
            existing.createdBy,
            modifiedBy
        );
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getLastModifiedAt() {
        return lastModifiedAt;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public String getLastModifiedBy() {
        return lastModifiedBy;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AuditInfo auditInfo = (AuditInfo) o;
        return Objects.equals(createdAt, auditInfo.createdAt) &&
               Objects.equals(lastModifiedAt, auditInfo.lastModifiedAt) &&
               Objects.equals(createdBy, auditInfo.createdBy) &&
               Objects.equals(lastModifiedBy, auditInfo.lastModifiedBy);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(createdAt, lastModifiedAt, createdBy, lastModifiedBy);
    }
}

