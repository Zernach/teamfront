package com.rapidphotoupload.infrastructure.exceptions;

/**
 * Exception thrown when storage quota is exceeded.
 */
public class StorageQuotaExceededException extends DomainException {
    public StorageQuotaExceededException(long quota, long used, long attempted) {
        super("STORAGE_QUOTA_EXCEEDED", 
            String.format("Storage quota exceeded. Quota: %d bytes, Used: %d bytes, Attempted: %d bytes", 
                quota, used, attempted));
    }
}

