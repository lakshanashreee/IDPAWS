package com.ecommerce.order.util;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.ecommerce.order.dto.ApiResponse;

import java.util.HashMap;
import java.util.Map;

/**
 * Builds APIGatewayV2HTTPResponse objects (HTTP API / payload format 2.0)
 * with the standard ApiResponse envelope and required CORS headers.
 */
public final class ResponseUtil {

    private ResponseUtil() {
    }

    private static Map<String, String> corsHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Headers", "Content-Type");
        headers.put("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        return headers;
    }

    private static APIGatewayV2HTTPResponse build(int statusCode, ApiResponse<?> body) {
        return APIGatewayV2HTTPResponse.builder()
                .withStatusCode(statusCode)
                .withHeaders(corsHeaders())
                .withBody(JsonUtil.toJson(body))
                .withIsBase64Encoded(false)
                .build();
    }

    public static APIGatewayV2HTTPResponse ok(String message, Object data) {
        return build(200, ApiResponse.success(message, data));
    }

    public static APIGatewayV2HTTPResponse created(String message, Object data) {
        return build(201, ApiResponse.success(message, data));
    }

    /**
     * 200 response with success=false. Used when the order was saved
     * successfully but the follow-up SNS publish failed — the HTTP call
     * itself did not fail, so this intentionally is not a 4xx/5xx status.
     */
    public static APIGatewayV2HTTPResponse partialSuccess(String message, Object data) {
        return build(200, ApiResponse.error(message, data));
    }

    public static APIGatewayV2HTTPResponse badRequest(String message) {
        return build(400, ApiResponse.error(message));
    }

    public static APIGatewayV2HTTPResponse unauthorized(String message) {
        return build(401, ApiResponse.error(message));
    }

    public static APIGatewayV2HTTPResponse forbidden(String message) {
        return build(403, ApiResponse.error(message));
    }

    public static APIGatewayV2HTTPResponse notFound(String message) {
        return build(404, ApiResponse.error(message));
    }

    public static APIGatewayV2HTTPResponse serverError(String message) {
        return build(500, ApiResponse.error(message));
    }

    public static APIGatewayV2HTTPResponse preflight() {
        return APIGatewayV2HTTPResponse.builder()
                .withStatusCode(200)
                .withHeaders(corsHeaders())
                .withBody("")
                .withIsBase64Encoded(false)
                .build();
    }
}
