package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.RetryFailedUploadCommand;
import com.rapidphotoupload.domain.valueobjects.PhotoId;

/**
 * Handler for RetryFailedUploadCommand.
 * Implementation will be completed in Epic 3.
 */
public class RetryFailedUploadCommandHandler implements CommandHandler<RetryFailedUploadCommand, PhotoId> {
    @Override
    public CommandResult<PhotoId> handle(RetryFailedUploadCommand command) {
        // TODO: Implement in Epic 3 - Upload API
        // This will find the failed photo and retry the upload
        throw new UnsupportedOperationException("RetryFailedUploadCommandHandler not yet implemented");
    }

    @Override
    public Class<RetryFailedUploadCommand> getCommandType() {
        return RetryFailedUploadCommand.class;
    }
}

