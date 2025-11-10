package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.Command;
import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.CreateUploadJobCommand;
import com.rapidphotoupload.domain.aggregates.UploadJob;
import com.rapidphotoupload.domain.repositories.UploadJobRepository;
import com.rapidphotoupload.domain.valueobjects.JobId;
import org.springframework.stereotype.Component;

/**
 * Handler for CreateUploadJobCommand.
 */
@Component
public class CreateUploadJobCommandHandler implements CommandHandler<CreateUploadJobCommand, JobId> {
    
    private final UploadJobRepository uploadJobRepository;
    
    public CreateUploadJobCommandHandler(UploadJobRepository uploadJobRepository) {
        this.uploadJobRepository = uploadJobRepository;
    }
    
    @Override
    public CommandResult<JobId> handle(CreateUploadJobCommand command) {
        // Create job aggregate
        JobId jobId = JobId.generate();
        UploadJob job = UploadJob.create(jobId, command.userId(), command.totalPhotos());
        
        // Save job
        uploadJobRepository.save(job);
        
        // Domain events are published by infrastructure when getDomainEvents() is called
        job.getDomainEvents();
        
        return CommandResult.success(jobId);
    }

    @Override
    public Class<CreateUploadJobCommand> getCommandType() {
        return CreateUploadJobCommand.class;
    }
}

