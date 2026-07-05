package com.ecommerce.inventory.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.ecommerce.inventory.dto.InventoryResponse;
import com.ecommerce.inventory.model.OrderItem;
import com.ecommerce.inventory.model.OrderPlacedEvent;
import com.ecommerce.inventory.service.InventoryService;
import com.ecommerce.inventory.util.JsonUtil;

/**
 * Lambda entry point for the Inventory Service's SQS-driven event consumer.
 *
 * Lambda name: L_InventoryEventService
 * Handler: com.ecommerce.inventory.handler.InventoryEventHandler::handleRequest
 *
 * Triggered by SQS queue L_InventoryQueue, subscribed to L_OrderPlacedTopic.
 * Reduces available stock for each line item in an ORDER_PLACED event.
 */
public class InventoryEventHandler implements RequestHandler<SQSEvent, Void> {

    private final InventoryService inventoryService;

    public InventoryEventHandler() {
        this.inventoryService = new InventoryService();
    }

    public InventoryEventHandler(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @Override
    public Void handleRequest(SQSEvent event, Context context) {
        LambdaLogger logger = context.getLogger();

        if (event == null || event.getRecords() == null) {
            logger.log("Received empty SQS event, nothing to process");
            return null;
        }

        for (SQSEvent.SQSMessage message : event.getRecords()) {
            String messageId = message.getMessageId();
            try {
                OrderPlacedEvent orderPlacedEvent = JsonUtil.fromJson(message.getBody(), OrderPlacedEvent.class);
                validateOrderPlacedEvent(orderPlacedEvent);

                logger.log("Processing ORDER_PLACED for orderId=" + orderPlacedEvent.getOrderId()
                        + " (sqsMessageId=" + messageId + ")");

                if (orderPlacedEvent.getItems() == null || orderPlacedEvent.getItems().isEmpty()) {
                    logger.log("No items in ORDER_PLACED event for orderId="
                            + orderPlacedEvent.getOrderId() + ", skipping");
                    continue;
                }

                for (OrderItem item : orderPlacedEvent.getItems()) {
                    processOrderItem(orderPlacedEvent.getOrderId(), item, messageId, logger);
                }

            } catch (Exception e) {
                logger.log("Failed to process SQS message (messageId=" + messageId + "): " + e.getMessage());
            }
        }

        return null;
    }

    private void processOrderItem(String orderId, OrderItem item, String messageId, LambdaLogger logger) {
        String productId = item != null ? item.getProductId() : null;
        try {
            if (productId == null || productId.isBlank()) {
                throw new IllegalArgumentException("productId is required for every order item");
            }
            if (item.getQuantity() <= 0) {
                throw new IllegalArgumentException("quantity must be > 0 for productId=" + productId);
            }

            InventoryResponse response = inventoryService.reduceStock(productId, item.getQuantity());

            logger.log("Reduced stock for orderId=" + orderId + ", productId=" + productId
                    + ", quantity=" + item.getQuantity() + ", remainingAvailable="
                    + response.getAvailableQuantity() + " (sqsMessageId=" + messageId + ")");

        } catch (Exception e) {
            logger.log("Failed to reduce stock for orderId=" + orderId + ", productId="
                    + productId + " (sqsMessageId=" + messageId + "): " + e.getMessage());
        }
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
