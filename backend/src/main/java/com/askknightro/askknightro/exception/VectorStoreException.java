package com.askknightro.askknightro.exception;


// Exception handling for Vector Service logic
public class VectorStoreException extends RuntimeException {
    public VectorStoreException(String message, Throwable cause) {
        super(message, cause);
    }
}
