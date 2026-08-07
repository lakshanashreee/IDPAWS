package com.ecommerce.cart.exception;

/**
 * Thrown when a requested productId does not exist inside a user's cart.
 */
public class CartItemNotFoundException extends RuntimeException {

    public CartItemNotFoundException(String userId, String productId) {
        super("Product " + productId + " not found in cart for userId: " + userId);
    }
}
