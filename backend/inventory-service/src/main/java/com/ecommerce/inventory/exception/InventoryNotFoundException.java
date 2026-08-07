package com.ecommerce.inventory.exception;

/**
 * Thrown when a requested productId does not exist in L_InventoryTable.
 */
public class InventoryNotFoundException extends RuntimeException {

    public InventoryNotFoundException(String productId) {
        super("Inventory not found for productId: " + productId);
    }
}
