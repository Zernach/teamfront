package com.rapidphotoupload.api.controllers;

import com.rapidphotoupload.api.dto.ErrorResponse;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Custom error controller that returns JSON error responses instead of HTML.
 * This replaces Spring Boot's default whitelabel error page.
 */
@RestController
public class CustomErrorController implements ErrorController {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomErrorController.class);
    
    @RequestMapping("/error")
    public ResponseEntity<ErrorResponse> handleError(HttpServletRequest request) {
        logger.warn("=== ERROR CONTROLLER INVOKED ===");
        logger.warn("Request URI: {}", request.getRequestURI());
        logger.warn("Request URL: {}", request.getRequestURL());
        
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        String path = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        
        logger.warn("Error status: {}, message: {}, path: {}", status, message, path);
        
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR.value();
        }
        
        HttpStatus httpStatus;
        try {
            httpStatus = HttpStatus.valueOf(Integer.parseInt(status.toString()));
        } catch (IllegalArgumentException e) {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        
        String errorMessage = message != null ? message.toString() : httpStatus.getReasonPhrase();
        
        if (path == null) {
            path = request.getRequestURI();
        }
        
        ErrorResponse error = new ErrorResponse(
            httpStatus.name(),
            errorMessage,
            path
        );
        
        logger.warn("Returning error response: {}", error);
        return new ResponseEntity<>(error, httpStatus);
    }
}

