package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.Command;
import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.CreateUploadJobCommand;
import com.rapidphotoupload.domain.valueobjects.JobId;

/**
 * Handler for CreateUploadJobCommand.
 * Implementation will be completed in Epic 3.
 */
public class CreateUploadJobCommandHandler implements CommandHandler<CreateUploadJobCommand, JobId> {
    @Override
    public CommandResult<JobId> handle(CreateUploadJobCommand command) {
        // TODO: Implement in Epic 3 - Upload API
        // This will create an UploadJob aggregate and persist it
        throw new UnsupportedOperationException("CreateUploadJobCommandHandler not yet implemented");
    }

    @Override
    public Class<CreateUploadJobCommand> getCommandType() {
        return CreateUploadJobCommand.class;
    }
}

