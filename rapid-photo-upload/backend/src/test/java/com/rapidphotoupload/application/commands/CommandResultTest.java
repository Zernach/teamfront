package com.rapidphotoupload.application.commands;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CommandResultTest {

    @Test
    void shouldCreateSuccessResult() {
        var result = CommandResult.success("test data");

        assertTrue(result.isSuccess());
        assertFalse(result.isFailure());
        assertEquals("test data", ((CommandResult.Success<String>) result).data());
    }

    @Test
    void shouldCreateFailureResult() {
        CommandResult<String> result = CommandResult.failure("ERROR_CODE", "Error message");

        assertFalse(result.isSuccess());
        assertTrue(result.isFailure());
        if (result instanceof CommandResult.Failure<String> failure) {
            assertEquals("ERROR_CODE", failure.errorCode());
            assertEquals("Error message", failure.errorMessage());
        } else {
            fail("Expected Failure result");
        }
    }

    @Test
    void shouldCreateFailureResultWithCause() {
        var cause = new RuntimeException("Test exception");
        CommandResult<String> result = CommandResult.failure("ERROR_CODE", "Error message", cause);

        if (result instanceof CommandResult.Failure<String> failure) {
            assertTrue(failure.cause().isPresent());
            assertEquals(cause, failure.cause().get());
        } else {
            fail("Expected Failure result");
        }
    }
}

