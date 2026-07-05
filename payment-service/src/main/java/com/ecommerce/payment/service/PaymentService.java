package com.ecommerce.payment.service;

import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.exception.PaymentNotFoundException;
import com.ecommerce.payment.model.OrderPlacedEvent;
import com.ecommerce.payment.model.Payment;
import com.ecommerce.payment.repository.PaymentRepository;
import com.ecommerce.payment.util.IdGenerator;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Business logic for the Payment Service. All validation and orchestration
 * of persistence happens here; the handlers only deal with HTTP / SQS
 * concerns.
 */
public class PaymentService {

    private static final Set<String> VALID_STATUSES = Set.of("PENDING", "SUCCESS", "FAILED", "REFUNDED");

    private static final String DEFAULT_PAYMENT_MODE = "COD";
    private static final String DEFAULT_PAYMENT_STATUS = "SUCCESS";

    private final PaymentRepository paymentRepository;

    public PaymentService() {
        this.paymentRepository = new PaymentRepository();
    }

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Creates a Payment record from an incoming OrderPlaced event.
     * This is the ONLY normal path for payment creation — there is no
     * public "create payment" HTTP route.
     *
     * Per spec: paymentMode defaults to COD and paymentStatus defaults to
     * SUCCESS for simplicity (no real payment gateway integration yet).
     */
    public PaymentResponse createPaymentFromOrderEvent(OrderPlacedEvent event) {
        validateOrderPlacedEvent(event);

        Payment payment = new Payment();
        payment.setPaymentId(IdGenerator.generatePaymentId());
        payment.setOrderId(event.getOrderId());
        payment.setUserId(event.getUserId());
        payment.setAmount(event.getTotalAmount());
        payment.setPaymentMode(DEFAULT_PAYMENT_MODE);
        payment.setPaymentStatus(DEFAULT_PAYMENT_STATUS);
        payment.setTransactionTime(Instant.now().toString());

        paymentRepository.savePayment(payment);
        return PaymentResponse.fromPayment(payment);
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.getAllPayments().stream()
                .map(PaymentResponse::fromPayment)
                .collect(Collectors.toList());
    }

    public PaymentResponse getPaymentById(String paymentId) {
        Payment payment = paymentRepository.getPaymentById(paymentId);
        if (payment == null) {
            throw new PaymentNotFoundException(paymentId);
        }
        return PaymentResponse.fromPayment(payment);
    }

    public List<PaymentResponse> getPaymentsByOrderId(String orderId) {
        return paymentRepository.getPaymentsByOrderId(orderId).stream()
                .map(PaymentResponse::fromPayment)
                .collect(Collectors.toList());
    }

    public PaymentResponse updateStatus(String paymentId, String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("status is required");
        }
        String normalizedStatus = status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new IllegalArgumentException("status must be one of: PENDING, SUCCESS, FAILED, REFUNDED");
        }

        Payment payment = paymentRepository.getPaymentById(paymentId);
        if (payment == null) {
            throw new PaymentNotFoundException(paymentId);
        }

        payment.setPaymentStatus(normalizedStatus);
        paymentRepository.updatePayment(payment);
        return PaymentResponse.fromPayment(payment);
    }

    public String healthCheck() {
        return "payment-service is healthy";
    }

    private void validateOrderPlacedEvent(OrderPlacedEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("OrderPlaced event body is required");
        }
        if (!"ORDER_PLACED".equalsIgnoreCase(event.getEventType())) {
            throw new IllegalArgumentException("Unsupported eventType: " + event.getEventType());
        }
        if (event.getOrderId() == null || event.getOrderId().isBlank()) {
            throw new IllegalArgumentException("orderId is required in OrderPlaced event");
        }
    }
}
