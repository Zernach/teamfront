package com.rapidphotoupload.api.middleware;

import com.rapidphotoupload.api.dto.ErrorResponse;
import com.rapidphotoupload.infrastructure.exceptions.DomainException;
import com.rapidphotoupload.infrastructure.exceptions.ResourceNotFoundException;
import com.rapidphotoupload.infrastructure.exceptions.StorageQuotaExceededException;
import com.rapidphotoupload.infrastructure.exceptions.ValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * Global exception handler for REST API.
 * Maps domain exceptions to HTTP status codes and error responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
        ResourceNotFoundException ex,
        WebRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            ex.getErrorCode(),
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        ValidationException ex,
        WebRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            ex.getErrorCode(),
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(StorageQuotaExceededException.class)
    public ResponseEntity<ErrorResponse> handleStorageQuotaExceeded(
        StorageQuotaExceededException ex,
        WebRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            ex.getErrorCode(),
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponse> handleDomainException(
        DomainException ex,
        WebRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            ex.getErrorCode(),
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
        MethodArgumentNotValidException ex,
        WebRequest request
    ) {
        StringBuilder errorMessage = new StringBuilder();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            if (errorMessage.length() > 0) {
                errorMessage.append("; ");
            }
            errorMessage.append(fieldName).append(": ").append(message);
        });
        
        ErrorResponse error = new ErrorResponse(
            "VALIDATION_ERROR",
            errorMessage.toString(),
            request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(
        MaxUploadSizeExceededException ex,
        WebRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            "FILE_TOO_LARGE",
            "File size exceeds maximum allowed size. Maximum file size: 50MB, Maximum request size: 500MB",
            request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
        Exception ex,
        WebRequest request
    ) {
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);
        String requestPath = request.getDescription(false).replace("uri=", "");
        
        // Detect bot scanning patterns and return 404 instead of 500
        if (isBotScanningPattern(requestPath, ex)) {
            logger.warn("Bot scanning attempt detected: {} - returning 404", requestPath);
            ErrorResponse error = new ErrorResponse(
                "NOT_FOUND",
                "Resource not found",
                requestPath
            );
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
        
        // Log the full exception for debugging legitimate errors
        logger.error("Unhandled exception occurred", ex);
        
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred",
            requestPath
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    /**
     * Detects common bot scanning patterns in request paths.
     * Returns true if the request appears to be a bot scanning attempt.
     */
    private boolean isBotScanningPattern(String path, Exception ex) {
        if (path == null) {
            return false;
        }
        
        String lowerPath = path.toLowerCase();
        
        // Common bot scanning patterns
        String[] botPatterns = {
            "/.git/",
            "/.env",
            "/.aws/",
            "/phpinfo",
            "/shell.php",
            "/wp-",
            "/admin/",
            "/config/",
            "/.config",
            "/cicd/",
            "/pipeline/",
            "/server/",
            "/operations/",
            "/k8s/",
            "/docker/",
            "/jenkins/",
            "/vendor/phpunit/",
            "/cgi-bin/",
            "/eval-stdin.php",
            "/wp-config.php",
            "/settings.php",
            "/configuration.php",
            "/.circleci/",
            "/debug/default/view"
        };
        
        for (String pattern : botPatterns) {
            if (lowerPath.contains(pattern)) {
                return true;
            }
        }
        
        // Check for path traversal attempts
        if (lowerPath.contains("..") || lowerPath.contains("%2e%2e") || lowerPath.contains("%252e")) {
            return true;
        }
        
        // Check for suspicious file extensions in unexpected paths
        if (lowerPath.matches(".*\\.(php|jsp|asp|aspx|sh|bat|cmd|exe)$") && 
            !lowerPath.startsWith("/api/")) {
            return true;
        }
        
        return false;
    }
}

