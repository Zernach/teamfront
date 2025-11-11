package com.rapidphotoupload.features.photoquery.controller;

import com.rapidphotoupload.domain.aggregates.Photo;
import com.rapidphotoupload.domain.repositories.PhotoRepository;
import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.UploadStatus;
import com.rapidphotoupload.domain.valueobjects.UserId;
import com.rapidphotoupload.infrastructure.storage.CloudStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller for photo query feature slice.
 * Provides endpoints for retrieving photos and generating download URLs.
 */
@RestController
@RequestMapping("/api/v1/photos")
public class PhotoQueryController {
    
    private static final Logger logger = LoggerFactory.getLogger(PhotoQueryController.class);
    
    private final PhotoRepository photoRepository;
    private final CloudStorageService cloudStorageService;
    
    public PhotoQueryController(PhotoRepository photoRepository, CloudStorageService cloudStorageService) {
        this.photoRepository = photoRepository;
        this.cloudStorageService = cloudStorageService;
    }
    
    /**
     * Get all photos for the authenticated user.
     * Returns photos with presigned URLs for viewing.
     * 
     * @param status Optional filter by upload status
     * @param page Page number (0-indexed, default: 0)
     * @param pageSize Page size (default: 20, max: 100)
     */
    @GetMapping
    public ResponseEntity<?> getUserPhotos(
            @AuthenticationPrincipal String userIdStr,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        
        try {
            // Get user ID from authentication principal or security context
            if (userIdStr == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || authentication.getPrincipal() == null) {
                    logger.warn("Unauthorized request to get photos");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new com.rapidphotoupload.api.dto.ErrorResponse(
                            "UNAUTHORIZED",
                            "Authentication required",
                            "/api/v1/photos"
                        ));
                }
                userIdStr = authentication.getPrincipal().toString();
            }
            
            logger.info("Fetching photos for user: {} (page: {}, pageSize: {})", userIdStr, page, pageSize);
            
            // Validate pagination parameters
            if (page < 0) {
                logger.warn("Invalid page number: {}", page);
                return ResponseEntity.badRequest().build();
            }
            if (pageSize <= 0 || pageSize > 100) {
                logger.warn("Invalid page size: {}", pageSize);
                return ResponseEntity.badRequest().build();
            }
            
            UserId userId;
            try {
                userId = UserId.from(UUID.fromString(userIdStr));
            } catch (IllegalArgumentException e) {
                logger.error("Invalid user ID format: {}", userIdStr, e);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new com.rapidphotoupload.api.dto.ErrorResponse(
                        "UNAUTHORIZED",
                        "Invalid user ID",
                        "/api/v1/photos"
                    ));
            }
            List<Photo> allPhotos;
            
            if (status != null && !status.isBlank()) {
                try {
                    UploadStatus uploadStatus = UploadStatus.valueOf(status.toUpperCase());
                    allPhotos = photoRepository.findByUserIdAndStatus(userId, uploadStatus);
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid status filter: {}", status);
                    return ResponseEntity.badRequest().build();
                }
            } else {
                allPhotos = photoRepository.findByUserId(userId);
            }
            
            // Apply pagination
            int totalCount = allPhotos.size();
            int totalPages = (int) Math.ceil((double) totalCount / pageSize);
            int startIndex = page * pageSize;
            int endIndex = Math.min(startIndex + pageSize, totalCount);
            
            List<Photo> paginatedPhotos = startIndex < totalCount 
                ? allPhotos.subList(startIndex, endIndex)
                : List.of();
            
            List<PhotoResponse> photoResponses = paginatedPhotos.stream()
                    .map(this::toPhotoResponse)
                    .collect(Collectors.toList());
            
            logger.info("Found {} photos for user: {} (showing {} of {})", 
                    photoResponses.size(), userIdStr, photoResponses.size(), totalCount);
            
            PhotoListResponse response = new PhotoListResponse(
                    photoResponses,
                    page,
                    pageSize,
                    totalPages,
                    totalCount,
                    page < totalPages - 1,
                    page > 0
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching photos for user: {}", userIdStr != null ? userIdStr : "unknown", e);
            throw e; // Let GlobalExceptionHandler handle it
        }
    }
    
    /**
     * Get a specific photo by ID.
     */
    @GetMapping("/{photoId}")
    public ResponseEntity<?> getPhotoById(
            @AuthenticationPrincipal String userIdStr,
            @PathVariable String photoId) {
        
        // Get user ID from authentication principal or security context
        if (userIdStr == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getPrincipal() == null) {
                logger.warn("Unauthorized request to get photo: {}", photoId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new com.rapidphotoupload.api.dto.ErrorResponse(
                        "UNAUTHORIZED",
                        "Authentication required",
                        "/api/v1/photos/" + photoId
                    ));
            }
            userIdStr = authentication.getPrincipal().toString();
        }
        
        // Create final variable for use in lambda
        final String finalUserIdStr = userIdStr;
        
        logger.info("Fetching photo {} for user: {}", photoId, finalUserIdStr);
        
        try {
            PhotoId id = PhotoId.from(UUID.fromString(photoId));
            return photoRepository.findById(id)
                    .filter(photo -> photo.getUploadedBy().getUserId().toString().equals(finalUserIdStr))
                    .map(this::toPhotoResponse)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> {
                        logger.warn("Photo not found or unauthorized: {}", photoId);
                        return ResponseEntity.notFound().build();
                    });
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid photo ID format: {}", photoId);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get presigned download URL for a photo.
     * This endpoint generates a fresh presigned URL with longer expiration for downloads.
     */
    @GetMapping("/{photoId}/download-url")
    public ResponseEntity<?> getDownloadUrl(
            @AuthenticationPrincipal String userIdStr,
            @PathVariable String photoId,
            @RequestParam(defaultValue = "60") int expirationMinutes) {
        
        // Get user ID from authentication principal or security context
        if (userIdStr == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getPrincipal() == null) {
                logger.warn("Unauthorized request to get download URL for photo: {}", photoId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new com.rapidphotoupload.api.dto.ErrorResponse(
                        "UNAUTHORIZED",
                        "Authentication required",
                        "/api/v1/photos/" + photoId + "/download-url"
                    ));
            }
            userIdStr = authentication.getPrincipal().toString();
        }
        
        // Create final variable for use in lambda
        final String finalUserIdStr = userIdStr;
        
        logger.info("Generating download URL for photo {} (expires in {} minutes)", photoId, expirationMinutes);
        
        try {
            PhotoId id = PhotoId.from(UUID.fromString(photoId));
            return photoRepository.findById(id)
                    .filter(photo -> photo.getUploadedBy().getUserId().toString().equals(finalUserIdStr))
                    .filter(photo -> photo.getStatus() == UploadStatus.COMPLETED)
                    .filter(photo -> photo.getStorageKey() != null)
                    .map(photo -> {
                        String url = cloudStorageService.generatePresignedUrl(
                                photo.getStorageKey().getValue(), 
                                expirationMinutes);
                        return ResponseEntity.ok(new DownloadUrlResponse(url, expirationMinutes));
                    })
                    .orElseGet(() -> {
                        logger.warn("Photo not found, unauthorized, or not ready for download: {}", photoId);
                        return ResponseEntity.notFound().build();
                    });
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid photo ID format: {}", photoId);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Convert Photo domain aggregate to PhotoResponse DTO.
     */
    private PhotoResponse toPhotoResponse(Photo photo) {
        try {
            String presignedUrl = null;
            String thumbnailPresignedUrl = null;
            String storageKeyValue = null;
            String thumbnailStorageKeyValue = null;
            
            if (photo.getStorageKey() != null) {
                storageKeyValue = photo.getStorageKey().getValue();
                if (photo.getStatus() == UploadStatus.COMPLETED) {
                    try {
                        presignedUrl = cloudStorageService.generatePresignedUrl(
                                storageKeyValue, 
                                60); // 60-minute expiration for gallery viewing
                    } catch (Exception e) {
                        logger.error("Failed to generate presigned URL for photo: {}", photo.getId().getValue(), e);
                    }
                }
            }
            
            if (photo.getThumbnailStorageKey() != null) {
                thumbnailStorageKeyValue = photo.getThumbnailStorageKey().getValue();
                if (photo.getStatus() == UploadStatus.COMPLETED) {
                    try {
                        thumbnailPresignedUrl = cloudStorageService.generatePresignedUrl(
                                thumbnailStorageKeyValue, 
                                60); // 60-minute expiration for gallery viewing
                    } catch (Exception e) {
                        logger.error("Failed to generate presigned URL for thumbnail: {}", photo.getId().getValue(), e);
                    }
                }
            }
            
            // Safely get metadata fields
            Integer width = null;
            Integer height = null;
            String fileHash = null;
            if (photo.getMetadata() != null) {
                width = photo.getMetadata().getWidth();
                height = photo.getMetadata().getHeight();
                fileHash = photo.getMetadata().getFileHash();
            }
            
            // Get tags from metadata
            List<String> tags = List.of();
            if (photo.getMetadata() != null && photo.getMetadata().getTags() != null) {
                tags = photo.getMetadata().getTags().stream().collect(Collectors.toList());
            }
            
            return new PhotoResponse(
                    photo.getId().getValue().toString(),
                    photo.getFilename().getValue(),
                    photo.getFileSize().getBytes(),
                    photo.getContentType().getValue(),
                    photo.getStatus().name(),
                    presignedUrl,
                    storageKeyValue,
                    thumbnailStorageKeyValue,
                    thumbnailPresignedUrl,
                    photo.getUploadedAt().getValue().toString(),
                    photo.getUploadedBy().getUserId().toString(),
                    tags,
                    width,
                    height,
                    fileHash
            );
        } catch (Exception e) {
            logger.error("Error converting photo to response: {}", photo.getId() != null ? photo.getId().getValue() : "unknown", e);
            throw new RuntimeException("Failed to convert photo to response", e);
        }
    }
    
    /**
     * DTO for photo list response with pagination.
     */
    public record PhotoListResponse(
            List<PhotoResponse> photos,
            int page,
            int pageSize,
            int totalPages,
            int totalCount,
            boolean hasNext,
            boolean hasPrevious
    ) {}
    
    /**
     * DTO for individual photo response.
     */
    public record PhotoResponse(
            String id,
            String filename,
            long fileSize,
            String contentType,
            String status,
            String url, // Presigned URL for viewing (null if not yet uploaded)
            String storageKey, // Storage key for the photo (null if not yet uploaded)
            String thumbnailStorageKey, // Storage key for thumbnail (optional)
            String thumbnailUrl, // Presigned URL for thumbnail (optional)
            String uploadedAt,
            String uploadedByUserId,
            List<String> tags,
            Integer width,
            Integer height,
            String fileHash
    ) {}
    
    /**
     * DTO for download URL response.
     */
    public record DownloadUrlResponse(String url, int expirationMinutes) {}
}

