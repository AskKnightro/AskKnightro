package com.askknightro.askknightro.api;

import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ApiExceptionHandler {

    record ApiError(String code, String message) {}

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(EntityExistsException.class)
    public ResponseEntity<ApiError> handleExists(EntityExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError("ALREADY_ENROLLED", ex.getMessage()));
    }

    // If DB unique constraint fires, translate to 409 as well
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleConstraint(DataIntegrityViolationException ex) {
        String msg = "You are already enrolled in this course.";
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError("ALREADY_ENROLLED", msg));
    }
}