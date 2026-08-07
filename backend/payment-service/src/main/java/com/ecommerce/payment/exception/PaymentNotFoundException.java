package com.ecommerce.payment.exception;

/**
 * Thrown when a requested paymentId does not exist in L_PaymentTable.
 */
public class PaymentNotFoundException extends RuntimeException {

    public PaymentNotFoundException(String paymentId) {
        super("Payment not found with id: " + paymentId);
    }
}
