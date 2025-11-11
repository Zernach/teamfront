package com.rapidphotoupload.api.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Basic root and health check endpoints for the API.
 */
@RestController
public class RootController {

    @GetMapping("/")
    public String hello() {
        return "Hello World from Rapid Photo Upload Backend!";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}


