package com.ecommerce.inventory.exception;

/**
 * Thrown when a reduce-stock request would make availableQuantity negative.
 * Mapped to HTTP 400 by the handler.
 */
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }
}
