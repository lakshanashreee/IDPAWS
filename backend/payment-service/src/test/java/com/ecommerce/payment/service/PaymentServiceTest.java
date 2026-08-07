package com.ecommerce.payment.service;

import com.ecommerce.payment.dto.PaymentRequest;
import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.exception.PaymentNotFoundException;
import com.ecommerce.payment.model.OrderPlacedEvent;
import com.ecommerce.payment.model.Payment;
import com.ecommerce.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(paymentRepository);
    }

    @Test
    void testCreatePaymentFromOrderEvent_Success() {
        OrderPlacedEvent event = new OrderPlacedEvent();
        event.setEventType("ORDER_PLACED");
        event.setOrderId("ord-123");
        event.setUserId("user-456");
        event.setTotalAmount(500.0);
        event.setPaymentMode("CARD");

        PaymentResponse response = paymentService.createPaymentFromOrderEvent(event);

        assertNotNull(response);
        assertEquals("ord-123", response.getOrderId());
        assertEquals("user-456", response.getUserId());
        assertEquals(500.0, response.getAmount());
        assertEquals("CARD", response.getPaymentMode());
        assertEquals("SUCCESS", response.getPaymentStatus());

        verify(paymentRepository, times(1)).savePayment(any(Payment.class));
    }

    @Test
    void testCreatePayment_DirectRequest() {
        PaymentRequest request = new PaymentRequest();
        request.setOrderId("ord-123");
        request.setUserId("user-456");
        request.setAmount(250.0);
        request.setPaymentMode("COD");

        PaymentResponse response = paymentService.createPayment(request);

        assertNotNull(response);
        assertEquals("ord-123", response.getOrderId());
        assertEquals(250.0, response.getAmount());
        assertEquals("COD", response.getPaymentMode());
    }

    @Test
    void testGetPaymentById_Found() {
        Payment p = new Payment();
        p.setPaymentId("pay-99");
        p.setOrderId("ord-1");
        p.setAmount(100.0);
        p.setPaymentStatus("SUCCESS");

        when(paymentRepository.getPaymentById("pay-99")).thenReturn(p);

        PaymentResponse response = paymentService.getPaymentById("pay-99");

        assertNotNull(response);
        assertEquals("pay-99", response.getPaymentId());
        assertEquals(100.0, response.getAmount());
    }

    @Test
    void testGetPaymentById_NotFound_ThrowsException() {
        when(paymentRepository.getPaymentById("unknown")).thenReturn(null);

        assertThrows(PaymentNotFoundException.class, () -> paymentService.getPaymentById("unknown"));
    }

    @Test
    void testGetPaymentsByOrderId() {
        Payment p = new Payment();
        p.setPaymentId("pay-1");
        p.setOrderId("ord-100");

        when(paymentRepository.getPaymentsByOrderId("ord-100")).thenReturn(Collections.singletonList(p));

        List<PaymentResponse> payments = paymentService.getPaymentsByOrderId("ord-100");

        assertEquals(1, payments.size());
        assertEquals("pay-1", payments.get(0).getPaymentId());
    }

    @Test
    void testUpdateStatus_Success() {
        Payment p = new Payment();
        p.setPaymentId("pay-1");
        p.setPaymentStatus("PENDING");

        when(paymentRepository.getPaymentById("pay-1")).thenReturn(p);

        PaymentResponse updated = paymentService.updateStatus("pay-1", "REFUNDED");

        assertEquals("REFUNDED", updated.getPaymentStatus());
        verify(paymentRepository, times(1)).updatePayment(any(Payment.class));
    }
}
