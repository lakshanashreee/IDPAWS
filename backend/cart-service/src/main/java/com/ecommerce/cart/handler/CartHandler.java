package com.ecommerce.cart.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.ecommerce.common.security.AuthorizationUtil;
import com.ecommerce.common.security.UnauthorizedException;
import com.ecommerce.common.security.ForbiddenException;
import com.ecommerce.cart.dto.AddCartItemRequest;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.dto.CartSummaryResponse;
import com.ecommerce.cart.dto.UpdateCartItemRequest;
import com.ecommerce.cart.exception.CartItemNotFoundException;
import com.ecommerce.cart.exception.CartNotFoundException;
import com.ecommerce.cart.service.CartService;
import com.ecommerce.cart.util.JsonUtil;
import com.ecommerce.cart.util.ResponseUtil;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lambda entry point for the Cart Service.
 *
 * Lambda name: L_CartService
 * Handler: com.ecommerce.cart.handler.CartHandler::handleRequest
 *
 * Built for API Gateway HTTP API using Lambda payload format version 2.0
 * (APIGatewayV2HTTPEvent / APIGatewayV2HTTPResponse).
 *
 * Routes:
 *   POST   /cart/{userId}/items
 *   GET    /cart/{userId}
 *   GET    /cart/{userId}/summary
 *   PUT    /cart/{userId}/items/{productId}
 *   DELETE /cart/{userId}/items/{productId}
 *   DELETE /cart/{userId}/clear
 *   GET    /cart/health
 *
 * This service is completely independent. It does not call the Product
 * Service, Inventory Service, or any other service directly. Cross-service
 * communication will be added later using SNS/SQS.
 */
public class CartHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private final CartService cartService;

    private static final String HEALTH_PATH = "/cart/health";
    private static final Pattern SUMMARY_PATH = Pattern.compile("^/cart/([^/]+)/summary$");
    private static final Pattern ITEMS_PATH = Pattern.compile("^/cart/([^/]+)/items$");
    private static final Pattern ITEM_ID_PATH = Pattern.compile("^/cart/([^/]+)/items/([^/]+)$");
    private static final Pattern CLEAR_PATH = Pattern.compile("^/cart/([^/]+)/clear$");
    private static final Pattern CART_PATH = Pattern.compile("^/cart/([^/]+)$");

    public CartHandler() {
        this.cartService = new CartService();
    }

    public CartHandler(CartService cartService) {
        this.cartService = cartService;
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

            // GET /cart/health
            if (path.equals(HEALTH_PATH) && "GET".equalsIgnoreCase(httpMethod)) {
                return ResponseUtil.ok("Health check passed", cartService.healthCheck());
            }

            // GET /cart/{userId}/summary
            Matcher summaryMatcher = SUMMARY_PATH.matcher(path);
            if (summaryMatcher.matches() && "GET".equalsIgnoreCase(httpMethod)) {
                String userId = resolvePathParam(pathParameters, "userId", summaryMatcher.group(1));
                AuthorizationUtil.requireOwnerOrAdmin(request, userId);
                CartSummaryResponse summary = cartService.getCartSummary(userId);
                return ResponseUtil.ok("Cart summary fetched successfully", summary);
            }

            // DELETE /cart/{userId}/clear
            Matcher clearMatcher = CLEAR_PATH.matcher(path);
            if (clearMatcher.matches() && "DELETE".equalsIgnoreCase(httpMethod)) {
                String userId = resolvePathParam(pathParameters, "userId", clearMatcher.group(1));
                AuthorizationUtil.requireOwnerOrAdmin(request, userId);
                cartService.clearCart(userId);
                return ResponseUtil.ok("Cart cleared successfully", null);
            }

            // PUT /cart/{userId}/items/{productId}, DELETE /cart/{userId}/items/{productId}
            Matcher itemIdMatcher = ITEM_ID_PATH.matcher(path);
            if (itemIdMatcher.matches()) {
                String userId = resolvePathParam(pathParameters, "userId", itemIdMatcher.group(1));
                String productId = resolvePathParam(pathParameters, "productId", itemIdMatcher.group(2));
                AuthorizationUtil.requireOwnerOrAdmin(request, userId);

                if ("PUT".equalsIgnoreCase(httpMethod)) {
                    UpdateCartItemRequest updateRequest = JsonUtil.fromJson(request.getBody(), UpdateCartItemRequest.class);
                    Integer quantity = updateRequest != null ? updateRequest.getQuantity() : null;
                    CartResponse updated = cartService.updateItemQuantity(userId, productId, quantity);
                    return ResponseUtil.ok("Cart item updated successfully", updated);
                }

                if ("DELETE".equalsIgnoreCase(httpMethod)) {
                    CartResponse updated = cartService.removeItem(userId, productId);
                    return ResponseUtil.ok("Cart item removed successfully", updated);
                }
            }

            // POST /cart/{userId}/items
            Matcher itemsMatcher = ITEMS_PATH.matcher(path);
            if (itemsMatcher.matches() && "POST".equalsIgnoreCase(httpMethod)) {
                String userId = resolvePathParam(pathParameters, "userId", itemsMatcher.group(1));
                AuthorizationUtil.requireOwnerOrAdmin(request, userId);
                AddCartItemRequest addRequest = JsonUtil.fromJson(request.getBody(), AddCartItemRequest.class);
                CartResponse updated = cartService.addItem(userId, addRequest);
                return ResponseUtil.created("Product added to cart successfully", updated);
            }

            // GET /cart/{userId}
            Matcher cartMatcher = CART_PATH.matcher(path);
            if (cartMatcher.matches() && "GET".equalsIgnoreCase(httpMethod)) {
                String userId = resolvePathParam(pathParameters, "userId", cartMatcher.group(1));
                AuthorizationUtil.requireOwnerOrAdmin(request, userId);
                CartResponse cart = cartService.getCart(userId);
                return ResponseUtil.ok("Cart fetched successfully", cart);
            }

            return ResponseUtil.badRequest("Unsupported route: " + httpMethod + " " + path);

        } catch (CartNotFoundException | CartItemNotFoundException e) {
            return ResponseUtil.notFound(e.getMessage());
        } catch (UnauthorizedException e) {
            return ResponseUtil.unauthorized(e.getMessage());
        } catch (ForbiddenException e) {
            return ResponseUtil.forbidden(e.getMessage());
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

        boolean stripped;
        do {
            stripped = false;
            // Use exact or slash-boundary checks to avoid "/default" matching "/defaultFoo",
            // "/prod" matching "/products", etc.
            if (normalized.equals("/default") || normalized.startsWith("/default/")) {
                normalized = normalized.substring("/default".length());
                if (normalized.isEmpty()) normalized = "/";
                stripped = true;
            }
            if (normalized.equals("/prod") || normalized.startsWith("/prod/")) {
                normalized = normalized.substring("/prod".length());
                if (normalized.isEmpty()) normalized = "/";
                stripped = true;
            }
            if (normalized.equals("/api/v1") || normalized.startsWith("/api/v1/")) {
                normalized = normalized.substring("/api/v1".length());
                if (normalized.isEmpty()) normalized = "/";
                stripped = true;
            }
        } while (stripped);

        if (normalized.isEmpty()) {
            normalized = "/";
        }

        if (normalized.length() > 1 && normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        return normalized;
    }
}
