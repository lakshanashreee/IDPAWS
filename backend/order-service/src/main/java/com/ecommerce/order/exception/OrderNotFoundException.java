package com.ecommerce.order.exception;

/**
 * Thrown when a requested orderId does not exist in L_OrderTable.
 */
public class OrderNotFoundException extends RuntimeException {

    public OrderNotFoundException(String orderId) {
        super("Order not found with id: " + orderId);
    }
}
