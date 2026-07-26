package com.ecommerce.order.service;

import com.ecommerce.order.dto.OrderItemRequest;
import com.ecommerce.order.dto.OrderRequest;
import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.exception.OrderNotFoundException;
import com.ecommerce.order.model.Order;
import com.ecommerce.order.model.OrderItem;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.util.IdGenerator;
import com.ecommerce.order.util.SnsPublisher;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Business logic for the Order Service. All validation and orchestration
 * of persistence + event publishing happens here; the handler only deals
 * with HTTP concerns.
 */
public class OrderService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"
    );

    private final OrderRepository orderRepository;
    private final SnsPublisher snsPublisher;

    public OrderService() {
        this.orderRepository = new OrderRepository();
        this.snsPublisher = new SnsPublisher();
    }

    public OrderService(OrderRepository orderRepository, SnsPublisher snsPublisher) {
        this.orderRepository = orderRepository;
        this.snsPublisher = snsPublisher;
    }

    /**
     * Creates a new order, saves it, and attempts to publish an
     * OrderPlaced event to SNS. The order is never rolled back if the SNS
     * publish fails or is skipped — the caller (handler) uses the returned
     * CreateOrderResult to decide how to respond over HTTP.
     */
    public CreateOrderResult createOrder(OrderRequest request) {
        validateOrderRequest(request);

        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (OrderItemRequest itemRequest : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(itemRequest.getProductId());
            orderItem.setProductName(itemRequest.getProductName());
            orderItem.setPrice(itemRequest.getPrice());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItems.add(orderItem);

            totalAmount += itemRequest.getPrice() * itemRequest.getQuantity();
        }

        String now = Instant.now().toString();

        Order order = new Order();
        order.setOrderId(IdGenerator.generateOrderId());
        order.setUserId(request.getUserId());
        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        order.setStatus("PLACED");
        order.setPaymentMode(request.getPaymentMode() != null ? request.getPaymentMode().toUpperCase() : "COD");
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        // If this throws, it propagates up to the handler, which returns 500.
        orderRepository.saveOrder(order);

        OrderResponse response = OrderResponse.fromOrder(order);

        if (!snsPublisher.isConfigured()) {
            return new CreateOrderResult(response, true,
                    "Order created successfully, SNS publish skipped because ORDER_TOPIC_ARN is not configured");
        }

        SnsPublisher.PublishOutcome outcome = snsPublisher.publishOrderPlacedEvent(order);
        if (outcome.isPublished()) {
            return new CreateOrderResult(response, true, "Order created successfully and event published");
        }

        return new CreateOrderResult(response, false,
                "Order saved but event publish failed: " + outcome.getErrorMessage());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.getAllOrders().stream()
                .map(OrderResponse::fromOrder)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String orderId) {
        Order order = orderRepository.getOrderById(orderId);
        if (order == null) {
            throw new OrderNotFoundException(orderId);
        }
        return OrderResponse.fromOrder(order);
    }

    public List<OrderResponse> getOrdersByUserId(String userId) {
        return orderRepository.getOrdersByUserId(userId).stream()
                .map(OrderResponse::fromOrder)
                .collect(Collectors.toList());
    }

    public OrderResponse updateStatus(String orderId, String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("status is required");
        }
        String normalizedStatus = status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new IllegalArgumentException(
                    "status must be one of: PLACED, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED");
        }

        Order order = orderRepository.getOrderById(orderId);
        if (order == null) {
            throw new OrderNotFoundException(orderId);
        }

        order.setStatus(normalizedStatus);
        order.setUpdatedAt(Instant.now().toString());

        orderRepository.updateOrder(order);
        return OrderResponse.fromOrder(order);
    }

    public void deleteOrder(String orderId) {
        Order existing = orderRepository.getOrderById(orderId);
        if (existing == null) {
            throw new OrderNotFoundException(orderId);
        }
        orderRepository.deleteOrder(orderId);
    }

    public String healthCheck() {
        return "order-service is healthy";
    }

    private void validateOrderRequest(OrderRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("items list must not be empty");
        }
        for (OrderItemRequest item : request.getItems()) {
            if (item.getProductId() == null || item.getProductId().isBlank()) {
                throw new IllegalArgumentException("productId is required for every item");
            }
            if (item.getProductName() == null || item.getProductName().isBlank()) {
                throw new IllegalArgumentException("productName is required for every item");
            }
            if (item.getPrice() == null || item.getPrice() < 0) {
                throw new IllegalArgumentException("price must be >= 0 for every item");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("quantity must be > 0 for every item");
            }
        }
    }

    /**
     * Result of creating an order: the saved order plus whether the whole
     * operation (including SNS publish) should be reported as success or
     * partial success over HTTP.
     */
    public static final class CreateOrderResult {
        private final OrderResponse order;
        private final boolean success;
        private final String message;

        public CreateOrderResult(OrderResponse order, boolean success, String message) {
            this.order = order;
            this.success = success;
            this.message = message;
        }

        public OrderResponse getOrder() {
            return order;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }
    }
}
