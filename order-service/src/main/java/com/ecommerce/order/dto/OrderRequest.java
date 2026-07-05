package com.ecommerce.order.dto;

import java.util.List;

/**
 * Request payload for POST /orders
 * Example:
 * {
 *   "userId": "user123",
 *   "items": [
 *     { "productId": "PROD-123", "productName": "Samsung Galaxy S24", "price": 79999, "quantity": 1 }
 *   ]
 * }
 */
public class OrderRequest {

    private String userId;
    private List<OrderItemRequest> items;

    public OrderRequest() {
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
