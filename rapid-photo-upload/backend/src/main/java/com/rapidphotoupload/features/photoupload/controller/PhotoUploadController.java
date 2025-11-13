package com.rapidphotoupload.features.photoupload.controller;

import com.rapidphotoupload.api.dto.BatchUploadResponse;
import com.rapidphotoupload.api.dto.ErrorResponse;
import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.CreateUploadJobCommand;
import com.rapidphotoupload.application.commands.UploadPhotoCommand;
import com.rapidphotoupload.application.commands.handlers.CommandDispatcher;
import com.rapidphotoupload.domain.repositories.UserRepository;
import com.rapidphotoupload.domain.valueobjects.*;
import com.rapidphotoupload.infrastructure.exceptions.ValidationException;
import com.rapidphotoupload.infrastructure.storage.TemporaryFileStorage;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.io.IOException;

/**
 * Controller for photo upload feature slice.
 */
@RestController
@RequestMapping("/api/v1/photos")
@CrossOrigin(origins = "*")
public class PhotoUploadController {
    
    private static final Logger logger = LoggerFactory.getLogger(PhotoUploadController.class);
    private static final UUID ANONYMOUS_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");
    
    private final CommandDispatcher commandDispatcher;
    private final TemporaryFileStorage temporaryFileStorage;
    private final UserRepository userRepository;
    
    public PhotoUploadController(
            CommandDispatcher commandDispatcher,
            TemporaryFileStorage temporaryFileStorage,
            UserRepository userRepository) {
        this.commandDispatcher = commandDispatcher;
        this.temporaryFileStorage = temporaryFileStorage;
        this.userRepository = userRepository;
    }
    
    /**
     * Batch upload endpoint for uploading multiple photos at once.
     * 
     * @param files Array of multipart files to upload
     * @param request HTTP request for error handling
     * @return BatchUploadResponse with job ID and photo IDs
     */
    @PostMapping("/upload/batch")
    public ResponseEntity<?> uploadBatch(
            @RequestParam("files") MultipartFile[] files,
            HttpServletRequest request) {
        
        logger.info("Batch upload request received with {} files", files.length);
        
        try {
            // Get authenticated user ID from security context, or use anonymous user for public access
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userIdStr;
            UserId userId;
            
            if (authentication == null || authentication.getPrincipal() == null || 
                authentication.getPrincipal().equals("anonymousUser")) {
                // Public access: Use a default anonymous user ID for unauthenticated requests
                logger.info("Public access request - using anonymous user ID");
                userIdStr = ANONYMOUS_USER_ID.toString();
            } else {
                userIdStr = authentication.getPrincipal().toString();
            }
            
            try {
                userId = UserId.from(UUID.fromString(userIdStr));
            } catch (IllegalArgumentException e) {
                logger.error("Invalid user ID format: {}", userIdStr);
                // Fallback to anonymous user for public access
                userId = UserId.from(ANONYMOUS_USER_ID);
                logger.info("Using anonymous user ID due to invalid format");
            }
            
            // Log the user ID being used
            logger.info("Upload request using userId: {} ({})", userId.getValue(),
                userId.getValue().equals(ANONYMOUS_USER_ID) ? "ANONYMOUS" : "AUTHENTICATED");

            // Ensure user exists (especially important for anonymous user)
            if (!userRepository.findById(userId).isPresent()) {
                logger.error("User not found: {}. Database migrations may not have been run.", userId.getValue());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                        "USER_NOT_FOUND",
                        "User account not found. Please ensure database migrations have been run (migration V7 creates the anonymous user).",
                        request.getRequestURI()
                    ));
            }
            logger.info("User exists in database: {}", userId.getValue());
            
            // Validate files
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(
                        "VALIDATION_ERROR",
                        "At least one file is required",
                        request.getRequestURI()
                    ));
            }
            
            if (files.length > 100) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(
                        "VALIDATION_ERROR",
                        "Maximum 100 files allowed per batch",
                        request.getRequestURI()
                    ));
            }
            
            // Create upload job
            CreateUploadJobCommand createJobCommand = new CreateUploadJobCommand(userId, files.length);
            CommandResult<?> jobResult = commandDispatcher.dispatch(createJobCommand);
            
            if (jobResult instanceof CommandResult.Failure<?> failure) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(
                        failure.errorCode(),
                        failure.errorMessage(),
                        request.getRequestURI()
                    ));
            }
            
            JobId jobId = (JobId) ((CommandResult.Success<?>) jobResult).data();
            logger.info("Created upload job: {}", jobId.getValue());
            
            // Process each file
            List<String> photoIds = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            
            for (int i = 0; i < files.length; i++) {
                MultipartFile file = files[i];
                
                try {
                    // Validate file
                    if (file.isEmpty()) {
                        errors.add(String.format("File %d is empty", i + 1));
                        continue;
                    }
                    
                    // Extract file metadata
                    String filename = file.getOriginalFilename();
                    if (filename == null || filename.trim().isEmpty()) {
                        filename = "photo_" + (i + 1);
                    }
                    
                    long fileSize = file.getSize();
                    String contentType = file.getContentType();
                    if (contentType == null || contentType.trim().isEmpty()) {
                        contentType = "image/jpeg"; // Default
                    }
                    
                    // Generate PhotoId first so we can store the file
                    PhotoId photoId = PhotoId.generate();
                    
                    // Store file in temporary storage before creating Photo entity
                    try {
                        temporaryFileStorage.store(photoId, file);
                        logger.debug("Stored file temporarily for photo: {}", photoId.getValue());
                    } catch (IOException e) {
                        logger.error("Failed to store file temporarily: {}", e.getMessage(), e);
                        errors.add(String.format("File %d (%s): Failed to store file", i + 1, filename));
                        continue;
                    }
                    
                    // Create value objects
                    Filename filenameVO = Filename.from(filename);
                    FileSize fileSizeVO = FileSize.from(fileSize);
                    ContentType contentTypeVO = ContentType.from(contentType);
                    
                    // Create upload photo command with PhotoId
                    UploadPhotoCommand uploadCommand = new UploadPhotoCommand(
                        photoId, // Pass PhotoId so file can be retrieved later
                        filenameVO,
                        fileSizeVO,
                        contentTypeVO,
                        userId,
                        jobId, // Associate with job
                        Set.of() // No tags for now
                    );
                    
                    // Dispatch command
                    CommandResult<?> uploadResult = commandDispatcher.dispatch(uploadCommand);
                    
                    if (uploadResult instanceof CommandResult.Success<?> success) {
                        PhotoId resultPhotoId = (PhotoId) success.data();
                        photoIds.add(resultPhotoId.getValue().toString());
                        logger.debug("Created photo {} for job {}", resultPhotoId.getValue(), jobId.getValue());
                    } else if (uploadResult instanceof CommandResult.Failure<?> failure) {
                        // Clean up temporary storage on failure
                        temporaryFileStorage.remove(photoId);
                        errors.add(String.format("File %d (%s): %s", i + 1, filename, failure.errorMessage()));
                        logger.warn("Failed to upload file {}: {}", filename, failure.errorMessage());
                    }
                    
                } catch (Exception e) {
                    String errorMsg = String.format("File %d (%s): %s", i + 1, 
                        file.getOriginalFilename(), e.getMessage());
                    errors.add(errorMsg);
                    logger.error("Error processing file {}: {}", i + 1, e.getMessage(), e);
                    // Clean up temporary storage on error (if PhotoId was generated)
                    // Note: PhotoId might not exist if error occurred before generation
                }
            }
            
            // Build response
            BatchUploadResponse response = new BatchUploadResponse(
                jobId.getValue().toString(),
                files.length,
                photoIds
            );
            
            if (!errors.isEmpty()) {
                logger.warn("Batch upload completed with {} errors: {}", errors.size(), errors);
                // Still return success but with partial results
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).body(response);
            }
            
            logger.info("Batch upload completed successfully. Job: {}, Photos: {}", 
                jobId.getValue(), photoIds.size());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (ValidationException e) {
            logger.error("Validation error in batch upload: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse(
                    "VALIDATION_ERROR",
                    e.getMessage(),
                    request.getRequestURI()
                ));
        } catch (Exception e) {
            logger.error("Unexpected error in batch upload", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                    "INTERNAL_SERVER_ERROR",
                    "An unexpected error occurred: " + e.getMessage(),
                    request.getRequestURI()
                ));
        }
    }
}

