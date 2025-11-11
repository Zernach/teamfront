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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
     */
    @GetMapping
    public ResponseEntity<PhotoListResponse> getUserPhotos(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String status) {
        
        logger.info("Fetching photos for user: {}", userDetails.getUsername());
        
        UserId userId = UserId.from(UUID.fromString(userDetails.getUsername()));
        List<Photo> photos;
        
        if (status != null && !status.isBlank()) {
            try {
                UploadStatus uploadStatus = UploadStatus.valueOf(status.toUpperCase());
                photos = photoRepository.findByUserIdAndStatus(userId, uploadStatus);
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid status filter: {}", status);
                return ResponseEntity.badRequest().build();
            }
        } else {
            photos = photoRepository.findByUserId(userId);
        }
        
        List<PhotoResponse> photoResponses = photos.stream()
                .map(this::toPhotoResponse)
                .collect(Collectors.toList());
        
        logger.info("Found {} photos for user: {}", photoResponses.size(), userDetails.getUsername());
        
        return ResponseEntity.ok(new PhotoListResponse(photoResponses));
    }
    
    /**
     * Get a specific photo by ID.
     */
    @GetMapping("/{photoId}")
    public ResponseEntity<PhotoResponse> getPhotoById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String photoId) {
        
        logger.info("Fetching photo {} for user: {}", photoId, userDetails.getUsername());
        
        try {
            PhotoId id = PhotoId.from(UUID.fromString(photoId));
            return photoRepository.findById(id)
                    .filter(photo -> photo.getUploadedBy().getUserId().toString().equals(userDetails.getUsername()))
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
    public ResponseEntity<DownloadUrlResponse> getDownloadUrl(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String photoId,
            @RequestParam(defaultValue = "60") int expirationMinutes) {
        
        logger.info("Generating download URL for photo {} (expires in {} minutes)", photoId, expirationMinutes);
        
        try {
            PhotoId id = PhotoId.from(UUID.fromString(photoId));
            return photoRepository.findById(id)
                    .filter(photo -> photo.getUploadedBy().getUserId().toString().equals(userDetails.getUsername()))
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
        String presignedUrl = null;
        if (photo.getStatus() == UploadStatus.COMPLETED && photo.getStorageKey() != null) {
            try {
                presignedUrl = cloudStorageService.generatePresignedUrl(
                        photo.getStorageKey().getValue(), 
                        60); // 60-minute expiration for gallery viewing
            } catch (Exception e) {
                logger.error("Failed to generate presigned URL for photo: {}", photo.getId().getValue(), e);
            }
        }
        
        return new PhotoResponse(
                photo.getId().getValue().toString(),
                photo.getFilename().getValue(),
                photo.getFileSize().getBytes(),
                photo.getContentType().getValue(),
                photo.getStatus().name(),
                presignedUrl,
                photo.getUploadedAt().getValue().toString(),
                photo.getMetadata().getWidth(),
                photo.getMetadata().getHeight()
        );
    }
    
    /**
     * DTO for photo list response.
     */
    public record PhotoListResponse(List<PhotoResponse> photos) {}
    
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
            String uploadedAt,
            Integer width,
            Integer height
    ) {}
    
    /**
     * DTO for download URL response.
     */
    public record DownloadUrlResponse(String url, int expirationMinutes) {}
}

