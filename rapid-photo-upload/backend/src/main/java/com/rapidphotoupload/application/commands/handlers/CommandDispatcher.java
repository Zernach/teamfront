package com.rapidphotoupload.application.commands.handlers;

import com.rapidphotoupload.application.commands.Command;
import com.rapidphotoupload.application.commands.CommandResult;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Dispatcher for commands to their handlers.
 * Uses Spring's ApplicationContext to find registered command handlers.
 */
@Component
public class CommandDispatcher {
    
    private final ApplicationContext applicationContext;
    private Map<Class<? extends Command>, CommandHandler<?, ?>> handlerCache;
    
    public CommandDispatcher(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }
    
    @SuppressWarnings("unchecked")
    public <C extends Command, R> CommandResult<R> dispatch(C command) {
        CommandHandler<C, R> handler = findHandler(command);
        if (handler == null) {
            return CommandResult.failure("HANDLER_NOT_FOUND", "No handler found for command: " + command.getClass().getName());
        }
        return handler.handle(command);
    }
    
    @SuppressWarnings("unchecked")
    private <C extends Command, R> CommandHandler<C, R> findHandler(C command) {
        // Get all command handlers from Spring context
        Map<String, CommandHandler> handlers = applicationContext.getBeansOfType(CommandHandler.class);
        
        // Find handler for this command type
        for (CommandHandler handler : handlers.values()) {
            if (handler.getCommandType().equals(command.getClass())) {
                return (CommandHandler<C, R>) handler;
            }
        }
        
        return null;
    }
}

