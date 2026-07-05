package com.ecommerce.payment.util;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.ecommerce.payment.dto.ApiResponse;

import java.util.HashMap;
import java.util.Map;

/**
 * Builds APIGatewayV2HTTPResponse objects (HTTP API / payload format 2.0)
 * with the standard ApiResponse envelope and required CORS headers.
 *
 * Only used by PaymentHandler (the API-facing Lambda). PaymentEventHandler
 * (the SQS-facing Lambda) does not return HTTP responses.
 */
public final class ResponseUtil {

    private ResponseUtil() {
    }

    private static Map<String, String> corsHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Headers", "Content-Type,Authorization");
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

    public static APIGatewayV2HTTPResponse badRequest(String message) {
        return build(400, ApiResponse.error(message));
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
