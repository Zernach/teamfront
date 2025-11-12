package com.invoiceme.controller;

import com.invoiceme.service.GreetingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final GreetingService greetingService;

    public HealthController(GreetingService greetingService) {
        this.greetingService = greetingService;
    }

    @GetMapping("/")
    public String home() {
        return greetingService.greeting();
    }

    @GetMapping("/health")
    public String health() {
        return greetingService.healthStatus();
    }
}

