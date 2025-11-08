package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.Command;
import com.rapidphotoupload.application.commands.CommandResult;

/**
 * Base interface for command handlers.
 * Each command handler processes a specific command type.
 */
public interface CommandHandler<C extends Command, R> {
    /**
     * Handle the command and return a result.
     */
    CommandResult<R> handle(C command);

    /**
     * Get the command type this handler processes.
     */
    Class<C> getCommandType();
}

