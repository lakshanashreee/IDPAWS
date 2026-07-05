package com.ecommerce.cart.dto;

/**
 * Request payload for PUT /cart/{userId}/items/{productId}
 * Example: { "quantity": 3 }
 */
public class UpdateCartItemRequest {

    private Integer quantity;

    public UpdateCartItemRequest() {
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
