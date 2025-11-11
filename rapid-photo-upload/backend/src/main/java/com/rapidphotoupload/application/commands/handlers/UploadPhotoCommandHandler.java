package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.UploadPhotoCommand;
import com.rapidphotoupload.application.commands.handlers.CommandHandler;
import com.rapidphotoupload.domain.aggregates.Photo;
import com.rapidphotoupload.domain.aggregates.UploadJob;
import com.rapidphotoupload.domain.aggregates.User;
import com.rapidphotoupload.domain.repositories.PhotoRepository;
import com.rapidphotoupload.domain.repositories.UploadJobRepository;
import com.rapidphotoupload.domain.repositories.UserRepository;
import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.UploadedBy;
import com.rapidphotoupload.infrastructure.exceptions.ValidationException;
import com.rapidphotoupload.infrastructure.events.DomainEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Handler for UploadPhotoCommand.
 * Creates Photo aggregate and validates storage quota.
 * Actual file upload to cloud storage is handled asynchronously.
 */
@Component
public class UploadPhotoCommandHandler implements CommandHandler<UploadPhotoCommand, PhotoId> {
    
    private final PhotoRepository photoRepository;
    private final UserRepository userRepository;
    private final UploadJobRepository uploadJobRepository;
    private final DomainEventPublisher eventPublisher;
    
    public UploadPhotoCommandHandler(
            PhotoRepository photoRepository,
            UserRepository userRepository,
            UploadJobRepository uploadJobRepository,
            DomainEventPublisher eventPublisher) {
        this.photoRepository = photoRepository;
        this.userRepository = userRepository;
        this.uploadJobRepository = uploadJobRepository;
        this.eventPublisher = eventPublisher;
    }
    
    @Override
    public CommandResult<PhotoId> handle(UploadPhotoCommand command) {
        // Get user and validate quota
        User user = userRepository.findById(command.userId())
                .orElseThrow(() -> new ValidationException("User not found"));
        
        if (!user.canUpload(command.fileSize().getValue())) {
            throw new ValidationException("Storage quota exceeded");
        }
        
        // Use provided PhotoId or generate new one
        PhotoId photoId = command.photoId() != null ? command.photoId() : PhotoId.generate();
        
        if (command.jobId() != null) {
            UploadJob job = uploadJobRepository.findById(command.jobId())
                    .orElseThrow(() -> new ValidationException("Upload job not found"));
            
            // Verify job belongs to user
            if (!job.getUserId().equals(command.userId())) {
                throw new ValidationException("Upload job does not belong to user");
            }
            
            // Add photo to job
            job.addPhoto(photoId);
            uploadJobRepository.save(job);
            // Publish domain events
            eventPublisher.publishAll(job.getDomainEvents());
        }
        
        // Create photo aggregate
        UploadedBy uploadedBy = UploadedBy.from(command.userId().getValue());
        
        Photo photo = Photo.create(
            photoId,
            command.filename(),
            command.fileSize(),
            command.contentType(),
            uploadedBy,
            command.jobId() // Pass the jobId to the photo creation
        );
        
        // Add tags if provided (would need TagRepository)
        // For now, tags are handled separately
        
        // Save photo
        photoRepository.save(photo);
        
        // Publish domain events (including PhotoUploadStarted with jobId)
        eventPublisher.publishAll(photo.getDomainEvents());
        
        return CommandResult.success(photoId);
    }
    
    @Override
    public Class<UploadPhotoCommand> getCommandType() {
        return UploadPhotoCommand.class;
    }
}

