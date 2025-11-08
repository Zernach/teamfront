package com.rapidphotoupload.infrastructure.events;

import java.util.List;

/**
 * Domain event publisher interface.
 * Implementation will publish domain events to event bus or message queue.
 * Implementation will be completed in Epic 1, Story 1-6.
 */
public interface DomainEventPublisher {
    /**
     * Publish a single domain event.
     */
    void publish(Object event);

    /**
     * Publish multiple domain events.
     */
    void publishAll(List<Object> events);
}

