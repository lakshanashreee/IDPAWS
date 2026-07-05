package com.ecommerce.payment.dto;

/**
 * Request payload for PUT /payments/{paymentId}/status
 * Example: { "status": "REFUNDED" }
 */
public class PaymentStatusUpdateRequest {

    private String status;

    public PaymentStatusUpdateRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
