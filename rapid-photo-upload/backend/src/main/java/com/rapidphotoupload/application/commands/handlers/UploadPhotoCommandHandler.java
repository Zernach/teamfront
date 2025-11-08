package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.CommandResult;
import com.rapidphotoupload.application.commands.UploadPhotoCommand;
import com.rapidphotoupload.domain.valueobjects.PhotoId;

/**
 * Handler for UploadPhotoCommand.
 * Implementation will be completed in Epic 3.
 */
public class UploadPhotoCommandHandler implements CommandHandler<UploadPhotoCommand, PhotoId> {
    @Override
    public CommandResult<PhotoId> handle(UploadPhotoCommand command) {
        // TODO: Implement in Epic 3 - Upload API
        // This will create a Photo aggregate, validate storage quota, and initiate upload
        throw new UnsupportedOperationException("UploadPhotoCommandHandler not yet implemented");
    }

    @Override
    public Class<UploadPhotoCommand> getCommandType() {
        return UploadPhotoCommand.class;
    }
}

