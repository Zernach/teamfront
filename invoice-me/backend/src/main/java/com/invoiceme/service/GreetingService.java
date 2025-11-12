package com.invoiceme.service;

import org.springframework.stereotype.Service;

@Service
public class GreetingService {

    public String greeting() {
        return "Invoice Me Backend is running!";
    }

    public String healthStatus() {
        return "OK";
    }
}

