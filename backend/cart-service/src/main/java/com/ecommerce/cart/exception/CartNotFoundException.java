package com.ecommerce.cart.exception;

/**
 * Thrown when a requested userId has no cart record in L_CartTable.
 */
public class CartNotFoundException extends RuntimeException {

    public CartNotFoundException(String userId) {
        super("Cart not found for userId: " + userId);
    }
}
