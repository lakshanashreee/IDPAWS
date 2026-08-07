package com.ecommerce.order.service;

import com.ecommerce.order.dto.OrderItemRequest;
import com.ecommerce.order.dto.OrderRequest;
import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.exception.OrderNotFoundException;
import com.ecommerce.order.model.Order;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.util.SnsPublisher;
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
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private SnsPublisher snsPublisher;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, snsPublisher);
    }

    @Test
    void testCreateOrder_Success_SnsNotConfigured() {
        OrderRequest request = new OrderRequest();
        request.setUserId("user-123");
        request.setPaymentMode("CARD");

        OrderItemRequest item = new OrderItemRequest();
        item.setProductId("prod-1");
        item.setProductName("Silk Top");
        item.setPrice(150.0);
        item.setQuantity(2);
        request.setItems(Collections.singletonList(item));

        when(snsPublisher.isConfigured()).thenReturn(false);

        OrderService.CreateOrderResult result = orderService.createOrder(request);

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals("user-123", result.getOrder().getUserId());
        assertEquals(300.0, result.getOrder().getTotalAmount());
        assertEquals("PLACED", result.getOrder().getStatus());
        assertEquals("CARD", result.getOrder().getPaymentMode());

        verify(orderRepository, times(1)).saveOrder(any(Order.class));
    }

    @Test
    void testCreateOrder_EmptyItems_ThrowsException() {
        OrderRequest request = new OrderRequest();
        request.setUserId("user-123");
        request.setItems(Collections.emptyList());

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(request));
    }

    @Test
    void testGetOrderById_Found() {
        Order order = new Order();
        order.setOrderId("order-99");
        order.setUserId("user-1");
        order.setTotalAmount(450.0);
        order.setStatus("PLACED");

        when(orderRepository.getOrderById("order-99")).thenReturn(order);

        OrderResponse response = orderService.getOrderById("order-99");

        assertNotNull(response);
        assertEquals("order-99", response.getOrderId());
        assertEquals(450.0, response.getTotalAmount());
    }

    @Test
    void testGetOrderById_NotFound_ThrowsException() {
        when(orderRepository.getOrderById("invalid")).thenReturn(null);

        assertThrows(OrderNotFoundException.class, () -> orderService.getOrderById("invalid"));
    }

    @Test
    void testGetOrdersByUserId() {
        Order o1 = new Order();
        o1.setOrderId("ord-1");
        o1.setUserId("user-1");
        o1.setTotalAmount(100.0);

        when(orderRepository.getOrdersByUserId("user-1")).thenReturn(Collections.singletonList(o1));

        List<OrderResponse> orders = orderService.getOrdersByUserId("user-1");

        assertEquals(1, orders.size());
        assertEquals("ord-1", orders.get(0).getOrderId());
    }

    @Test
    void testUpdateStatus_Success() {
        Order order = new Order();
        order.setOrderId("ord-1");
        order.setStatus("PLACED");

        when(orderRepository.getOrderById("ord-1")).thenReturn(order);

        OrderResponse updated = orderService.updateStatus("ord-1", "CONFIRMED");

        assertEquals("CONFIRMED", updated.getStatus());
        verify(orderRepository, times(1)).updateOrder(any(Order.class));
    }

    @Test
    void testUpdateStatus_InvalidStatus_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> orderService.updateStatus("ord-1", "INVALID_STATUS"));
    }

    @Test
    void testDeleteOrder_Success() {
        Order order = new Order();
        order.setOrderId("ord-1");
        when(orderRepository.getOrderById("ord-1")).thenReturn(order);

        orderService.deleteOrder("ord-1");

        verify(orderRepository, times(1)).deleteOrder("ord-1");
    }
}
