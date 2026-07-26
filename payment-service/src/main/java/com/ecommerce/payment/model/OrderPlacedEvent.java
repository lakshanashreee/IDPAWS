package com.ecommerce.payment.model;

import java.util.List;

/**
 * Represents the incoming OrderPlaced event, as published by the Order
 * Service to SNS and delivered to this service via SQS.
 *
 * Expected JSON shape:
 * {
 *   "eventType": "ORDER_PLACED",
 *   "orderId": "ORD-123",
 *   "userId": "user123",
 *   "items": [ { "productId": ..., "productName": ..., "price": ..., "quantity": ... } ],
 *   "totalAmount": 79999,
 *   "status": "PLACED",
 *   "createdAt": "..."
 * }
 */
public class OrderPlacedEvent {

    private String eventType;
    private String orderId;
    private String userId;
    private List<OrderItem> items;
    private double totalAmount;
    private String status;
    private String createdAt;
    private String paymentMode;

    public OrderPlacedEvent() {
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    @Override
    public String toString() {
        return "OrderPlacedEvent{" +
                "eventType='" + eventType + '\'' +
                ", orderId='" + orderId + '\'' +
                ", userId='" + userId + '\'' +
                ", items=" + items +
                ", totalAmount=" + totalAmount +
                ", status='" + status + '\'' +
                ", createdAt='" + createdAt + '\'' +
                '}';
    }
}
