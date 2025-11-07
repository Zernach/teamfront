package com.photoupload.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    
    @GetMapping("/")
    public String hello() {
        return "Hello World from Rapid Photo Upload Backend!";
    }
    
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}

