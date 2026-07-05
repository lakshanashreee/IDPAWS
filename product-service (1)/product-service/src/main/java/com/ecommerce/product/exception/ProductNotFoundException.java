package com.ecommerce.product.exception;

/**
 * Thrown when a requested productId does not exist in ProductsTable.
 */
public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(String productId) {
        super("Product not found with id: " + productId);
    }
}
