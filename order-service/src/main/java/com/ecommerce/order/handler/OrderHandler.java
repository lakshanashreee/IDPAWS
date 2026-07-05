package com.ecommerce.order.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.ecommerce.order.dto.OrderRequest;
import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.dto.StatusUpdateRequest;
import com.ecommerce.order.exception.OrderNotFoundException;
import com.ecommerce.order.service.OrderService;
import com.ecommerce.order.util.JsonUtil;
import com.ecommerce.order.util.ResponseUtil;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lambda entry point for the Order Service.
 *
 * Lambda name: L_OrderService
 * Handler: com.ecommerce.order.handler.OrderHandler::handleRequest
 *
 * Built for API Gateway HTTP API using Lambda payload format version 2.0
 * (APIGatewayV2HTTPEvent / APIGatewayV2HTTPResponse).
 *
 * Routes:
 *   POST   /orders
 *   GET    /orders
 *   GET    /orders/{orderId}
 *   GET    /orders/user/{userId}
 *   PUT    /orders/{orderId}/status
 *   DELETE /orders/{orderId}
 *   GET    /orders/health
 *
 * This service is completely independent. It does not call the Product,
 * Cart, Inventory, or Payment services directly. All event-driven
 * communication happens through SNS (see util.SnsPublisher).
 */
public class OrderHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private final OrderService orderService;

    private static final String HEALTH_PATH = "/orders/health";
    private static final Pattern USER_ORDERS_PATH = Pattern.compile("^/orders/user/([^/]+)$");
    private static final Pattern STATUS_PATH = Pattern.compile("^/orders/([^/]+)/status$");
    private static final Pattern ORDER_ID_PATH = Pattern.compile("^/orders/([^/]+)$");

    public OrderHandler() {
        this.orderService = new OrderService();
    }

    public OrderHandler(OrderService orderService) {
        this.orderService = orderService;
    }

    @Override
    public APIGatewayV2HTTPResponse handleRequest(APIGatewayV2HTTPEvent request, Context context) {
        LambdaLogger logger = context.getLogger();

        try {
            String httpMethod = extractHttpMethod(request);
            String path = normalizePath(request.getRawPath());
            Map<String, String> pathParameters = request.getPathParameters();

            logger.log("Incoming request: " + httpMethod + " " + path);

            if (httpMethod == null) {
                return ResponseUtil.badRequest("Missing HTTP method");
            }

            if ("OPTIONS".equalsIgnoreCase(httpMethod)) {
                return ResponseUtil.preflight();
            }

            // GET /orders/health
            if (path.equals(HEALTH_PATH) && "GET".equalsIgnoreCase(httpMethod)) {
                return ResponseUtil.ok("Health check passed", orderService.healthCheck());
            }

            // GET /orders/user/{userId}
            Matcher userOrdersMatcher = USER_ORDERS_PATH.matcher(path);
            if (userOrdersMatcher.matches() && "GET".equalsIgnoreCase(httpMethod)) {
                String userId = resolvePathParam(pathParameters, "userId", userOrdersMatcher.group(1));
                List<OrderResponse> orders = orderService.getOrdersByUserId(userId);
                return ResponseUtil.ok("Orders fetched successfully for user", orders);
            }

            // PUT /orders/{orderId}/status
            Matcher statusMatcher = STATUS_PATH.matcher(path);
            if (statusMatcher.matches() && "PUT".equalsIgnoreCase(httpMethod)) {
                String orderId = resolvePathParam(pathParameters, "orderId", statusMatcher.group(1));
                StatusUpdateRequest statusRequest = JsonUtil.fromJson(request.getBody(), StatusUpdateRequest.class);
                String status = statusRequest != null ? statusRequest.getStatus() : null;
                OrderResponse updated = orderService.updateStatus(orderId, status);
                return ResponseUtil.ok("Order status updated successfully", updated);
            }

            // POST /orders
            if (path.equals("/orders") && "POST".equalsIgnoreCase(httpMethod)) {
                OrderRequest orderRequest = JsonUtil.fromJson(request.getBody(), OrderRequest.class);
                OrderService.CreateOrderResult result = orderService.createOrder(orderRequest);

                if (result.isSuccess()) {
                    return ResponseUtil.created(result.getMessage(), result.getOrder());
                }
                // Order was saved, but the SNS publish failed — report as a
                // partial success (HTTP 200, success=false) without rolling
                // back the order.
                return ResponseUtil.partialSuccess(result.getMessage(), result.getOrder());
            }

            // GET /orders
            if (path.equals("/orders") && "GET".equalsIgnoreCase(httpMethod)) {
                List<OrderResponse> orders = orderService.getAllOrders();
                return ResponseUtil.ok("Orders fetched successfully", orders);
            }

            // GET /orders/{orderId}, DELETE /orders/{orderId}
            Matcher orderIdMatcher = ORDER_ID_PATH.matcher(path);
            if (orderIdMatcher.matches()) {
                String orderId = resolvePathParam(pathParameters, "orderId", orderIdMatcher.group(1));

                if ("GET".equalsIgnoreCase(httpMethod)) {
                    OrderResponse order = orderService.getOrderById(orderId);
                    return ResponseUtil.ok("Order fetched successfully", order);
                }

                if ("DELETE".equalsIgnoreCase(httpMethod)) {
                    orderService.deleteOrder(orderId);
                    return ResponseUtil.ok("Order deleted successfully", null);
                }
            }

            return ResponseUtil.badRequest("Unsupported route: " + httpMethod + " " + path);

        } catch (OrderNotFoundException e) {
            return ResponseUtil.notFound(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseUtil.badRequest(e.getMessage());
        } catch (Exception e) {
            context.getLogger().log("Unexpected error: " + e.getMessage());
            return ResponseUtil.serverError("Internal server error: " + e.getMessage());
        }
    }

    /**
     * HTTP API (payload format 2.0) carries the method under
     * requestContext.http.method.
     */
    private String extractHttpMethod(APIGatewayV2HTTPEvent request) {
        if (request.getRequestContext() == null || request.getRequestContext().getHttp() == null) {
            return null;
        }
        return request.getRequestContext().getHttp().getMethod();
    }

    /**
     * Prefer the value supplied by API Gateway's pathParameters map. Fall
     * back to the value captured by the handler's own regex match if
     * pathParameters is absent (e.g. when using a {proxy+} catch-all route).
     */
    private String resolvePathParam(Map<String, String> pathParameters, String key, String fallback) {
        if (pathParameters != null && pathParameters.get(key) != null) {
            return pathParameters.get(key);
        }
        return fallback;
    }

    /**
     * Normalizes the raw path so routing works the same regardless of stage
     * naming:
     *  - Strips a leading "/default" stage segment if present (HTTP APIs
     *    deployed to a stage literally named "default" include it in
     *    rawPath; the auto-created $default stage does not).
     *  - Strips a trailing slash (except for the root path).
     */
    private String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            return "/";
        }

        String normalized = path;

        if (normalized.equals("/default")) {
            normalized = "/";
        } else if (normalized.startsWith("/default/")) {
            normalized = normalized.substring("/default".length());
        }

        if (normalized.length() > 1 && normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        return normalized;
    }
}
