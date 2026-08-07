package com.ecommerce.inventory.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Central Jackson ObjectMapper wrapper used across the service for
 * serialization/deserialization of DTOs, the ApiResponse envelope, and
 * incoming SQS event bodies (OrderPlacedEvent).
 */
public final class JsonUtil {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private JsonUtil() {
    }

    public static String toJson(Object value) {
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize object to JSON", e);
        }
    }

    public static <T> T fromJson(String json, Class<T> clazz) {
        try {
            if (json == null || json.isBlank()) {
                return null;
            }
            return OBJECT_MAPPER.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize JSON to " + clazz.getSimpleName(), e);
        }
    }

    /**
     * Unwraps an SNS notification envelope when raw message delivery is not
     * enabled on the SNS → SQS subscription. Returns the inner Message payload
     * when present; otherwise returns the original body unchanged.
     */
    public static String unwrapSqsBody(String sqsBody) {
        if (sqsBody == null || sqsBody.isBlank()) {
            return sqsBody;
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(sqsBody);
            if (root.has("Type")
                    && "Notification".equals(root.get("Type").asText())
                    && root.has("Message")) {
                return root.get("Message").asText();
            }
        } catch (JsonProcessingException ignored) {
            // Not an SNS wrapper — treat the body as the event payload itself.
        }
        return sqsBody;
    }
}
