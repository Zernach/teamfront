package com.rapidphotoupload.infrastructure.events;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Spring Events-based implementation of DomainEventPublisher.
 * Publishes domain events to Spring's ApplicationEventPublisher.
 */
@Component
public class SpringDomainEventPublisher implements DomainEventPublisher {
    private final ApplicationEventPublisher eventPublisher;

    public SpringDomainEventPublisher(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @Override
    public void publish(Object event) {
        eventPublisher.publishEvent(event);
    }

    @Override
    public void publishAll(List<Object> events) {
        events.forEach(eventPublisher::publishEvent);
    }
}

