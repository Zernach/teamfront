package com.invoiceme.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    
    @GetMapping("/")
    public String hello() {
        return "Hello World from Invoice Me Backend!";
    }
    
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}

