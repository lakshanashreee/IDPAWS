package com.ecommerce.order.util;

import com.ecommerce.order.model.Order;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Publishes the "OrderPlaced" event to SNS whenever a new order is created.
 *
 * This is the ONLY way this service communicates with other services
 * (Inventory, Payment, Notification, etc.) — no direct service-to-service
 * calls are made. Downstream services subscribe to the SNS topic
 * (ORDER_TOPIC_ARN) independently, typically via SQS.
 */
public final class SnsPublisher {

    private final SnsClient snsClient;
    private final String topicArn;

    public SnsPublisher() {
        this.snsClient = SnsClient.builder().build();
        this.topicArn = System.getenv("ORDER_TOPIC_ARN");
    }

    public SnsPublisher(SnsClient snsClient) {
        this.snsClient = snsClient;
        this.topicArn = System.getenv("ORDER_TOPIC_ARN");
    }

    /**
     * True if ORDER_TOPIC_ARN is set to a non-blank value.
     */
    public boolean isConfigured() {
        return topicArn != null && !topicArn.isBlank();
    }

    /**
     * Publishes the OrderPlaced event for the given order.
     *
     * Required JSON shape:
     * {
     *   "eventType": "ORDER_PLACED",
     *   "orderId": "...",
     *   "userId": "...",
     *   "items": [...],
     *   "totalAmount": 0,
     *   "status": "PLACED",
     *   "createdAt": "..."
     * }
     *
     * Callers are expected to check isConfigured() first. This method
     * never throws — it reports success/failure via PublishOutcome so the
     * caller (OrderService) can decide how to respond to the HTTP client
     * without ever rolling back the already-saved order.
     */
    public PublishOutcome publishOrderPlacedEvent(Order order) {
        try {
            Map<String, Object> event = new LinkedHashMap<>();
            event.put("eventType", "ORDER_PLACED");
            event.put("orderId", order.getOrderId());
            event.put("userId", order.getUserId());
            event.put("items", order.getItems());
            event.put("totalAmount", order.getTotalAmount());
            event.put("status", order.getStatus());
            event.put("createdAt", order.getCreatedAt());

            String message = JsonUtil.toJson(event);

            PublishRequest request = PublishRequest.builder()
                    .topicArn(topicArn)
                    .message(message)
                    .build();

            snsClient.publish(request);
            return PublishOutcome.success();
        } catch (Exception e) {
            return PublishOutcome.failure(e.getMessage());
        }
    }

    /**
     * Result of an SNS publish attempt.
     */
    public static final class PublishOutcome {
        private final boolean published;
        private final String errorMessage;

        private PublishOutcome(boolean published, String errorMessage) {
            this.published = published;
            this.errorMessage = errorMessage;
        }

        public static PublishOutcome success() {
            return new PublishOutcome(true, null);
        }

        public static PublishOutcome failure(String errorMessage) {
            return new PublishOutcome(false, errorMessage);
        }

        public boolean isPublished() {
            return published;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }
}
