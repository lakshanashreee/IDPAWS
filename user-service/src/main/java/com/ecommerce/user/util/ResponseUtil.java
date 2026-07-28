package com.ecommerce.user.util;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.ecommerce.user.dto.ApiResponse;

import java.util.HashMap;
import java.util.Map;

public final class ResponseUtil {
    private ResponseUtil() {}

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
    
    public static APIGatewayV2HTTPResponse ok(Object data) {
        return build(200, ApiResponse.success(data));
    }

    public static APIGatewayV2HTTPResponse error(int statusCode, String message) {
        return build(statusCode, ApiResponse.error(message));
    }
}
