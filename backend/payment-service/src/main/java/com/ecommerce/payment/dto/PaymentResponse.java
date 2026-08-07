package com.ecommerce.payment.dto;

import com.ecommerce.payment.model.Payment;

/**
 * Outbound representation of a Payment.
 */
public class PaymentResponse {

    private String paymentId;
    private String orderId;
    private String userId;
    private double amount;
    private String paymentMode;
    private String paymentStatus;
    private String transactionTime;

    public PaymentResponse() {
    }

    public static PaymentResponse fromPayment(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getPaymentId());
        response.setOrderId(payment.getOrderId());
        response.setUserId(payment.getUserId());
        response.setAmount(payment.getAmount());
        response.setPaymentMode(payment.getPaymentMode());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setTransactionTime(payment.getTransactionTime());
        return response;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
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

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getTransactionTime() {
        return transactionTime;
    }

    public void setTransactionTime(String transactionTime) {
        this.transactionTime = transactionTime;
    }
}
