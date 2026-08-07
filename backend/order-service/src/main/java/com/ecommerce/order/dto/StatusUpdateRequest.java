package com.ecommerce.order.dto;

/**
 * Request payload for PUT /orders/{orderId}/status
 * Example: { "status": "CONFIRMED" }
 */
public class StatusUpdateRequest {

    private String status;

    public StatusUpdateRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
