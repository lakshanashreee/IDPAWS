package com.ecommerce.inventory.dto;

/**
 * Request payload for add-stock / reduce-stock endpoints.
 * Example body: { "quantity": 20 }
 */
public class StockUpdateRequest {

    private Integer quantity;

    public StockUpdateRequest() {
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
