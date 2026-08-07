package com.ecommerce.payment.model;

import java.util.Objects;

/**
 * Core Payment domain model. One record per paymentId in L_PaymentTable.
 *
 * Payments are created almost exclusively by PaymentEventHandler in
 * response to an OrderPlaced SQS message — there is no public "create
 * payment" API route.
 */
public class Payment {

    private String paymentId;
    private String orderId;
    private String userId;
    private double amount;
    private String paymentMode;
    private String paymentStatus;
    private String transactionTime;

    public Payment() {
    }

    public Payment(String paymentId, String orderId, String userId, double amount,
                    String paymentMode, String paymentStatus, String transactionTime) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.userId = userId;
        this.amount = amount;
        this.paymentMode = paymentMode;
        this.paymentStatus = paymentStatus;
        this.transactionTime = transactionTime;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Payment)) return false;
        Payment payment = (Payment) o;
        return Objects.equals(paymentId, payment.paymentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(paymentId);
    }

    @Override
    public String toString() {
        return "Payment{" +
                "paymentId='" + paymentId + '\'' +
                ", orderId='" + orderId + '\'' +
                ", userId='" + userId + '\'' +
                ", amount=" + amount +
                ", paymentMode='" + paymentMode + '\'' +
                ", paymentStatus='" + paymentStatus + '\'' +
                ", transactionTime='" + transactionTime + '\'' +
                '}';
    }
}
