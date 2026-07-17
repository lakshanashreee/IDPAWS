package com.ecommerce.inventory.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.ecommerce.common.security.AuthorizationUtil;
import com.ecommerce.common.security.UnauthorizedException;
import com.ecommerce.common.security.ForbiddenException;
import com.ecommerce.inventory.dto.InventoryRequest;
import com.ecommerce.inventory.dto.InventoryResponse;
import com.ecommerce.inventory.dto.StockUpdateRequest;
import com.ecommerce.inventory.exception.InsufficientStockException;
import com.ecommerce.inventory.exception.InventoryNotFoundException;
import com.ecommerce.inventory.service.InventoryService;
import com.ecommerce.inventory.util.JsonUtil;
import com.ecommerce.inventory.util.ResponseUtil;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lambda entry point for the Inventory Service.
 *
 * Lambda name: L_InventoryService
 * Handler: com.ecommerce.inventory.handler.InventoryHandler::handleRequest
 *
 * Built for API Gateway HTTP API using Lambda payload format version 2.0
 * (APIGatewayV2HTTPEvent / APIGatewayV2HTTPResponse).
 *
 * Routes:
 *   POST   /inventory
 *   GET    /inventory
 *   GET    /inventory/{productId}
 *   PUT    /inventory/{productId}/add-stock
 *   PUT    /inventory/{productId}/reduce-stock
 *   GET    /inventory/low-stock
 *   DELETE /inventory/{productId}
 *   GET    /inventory/health
 *
 * This service is completely independent. It does not call the Product
 * Service or any other service directly. Cross-service communication will
 * Stock reduction on order placement is handled asynchronously by
 * InventoryEventHandler via SQS — no direct HTTP calls to other services.
 */
public class InventoryHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private final InventoryService inventoryService;

    private static final String HEALTH_PATH = "/inventory/health";
    private static final String LOW_STOCK_PATH = "/inventory/low-stock";
    private static final Pattern ADD_STOCK_PATH = Pattern.compile("^/inventory/([^/]+)/add-stock$");
    private static final Pattern REDUCE_STOCK_PATH = Pattern.compile("^/inventory/([^/]+)/reduce-stock$");
    private static final Pattern PRODUCT_ID_PATH = Pattern.compile("^/inventory/([^/]+)$");

    public InventoryHandler() {
        this.inventoryService = new InventoryService();
    }

    public InventoryHandler(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
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

            // GET /inventory/health
            if (path.equals(HEALTH_PATH) && "GET".equalsIgnoreCase(httpMethod)) {
                return ResponseUtil.ok("Health check passed", inventoryService.healthCheck());
            }

            // Enforce ADMIN role for all remaining inventory routes
            AuthorizationUtil.requireAdmin(request);

            // GET /inventory/low-stock
            if (path.equals(LOW_STOCK_PATH) && "GET".equalsIgnoreCase(httpMethod)) {
                List<InventoryResponse> lowStock = inventoryService.getLowStockInventory();
                return ResponseUtil.ok("Low stock inventory fetched successfully", lowStock);
            }

            // PUT /inventory/{productId}/add-stock
            Matcher addStockMatcher = ADD_STOCK_PATH.matcher(path);
            if (addStockMatcher.matches() && "PUT".equalsIgnoreCase(httpMethod)) {
                String productId = resolvePathParam(pathParameters, "productId", addStockMatcher.group(1));
                StockUpdateRequest stockRequest = JsonUtil.fromJson(request.getBody(), StockUpdateRequest.class);
                Integer quantity = stockRequest != null ? stockRequest.getQuantity() : null;
                InventoryResponse updated = inventoryService.addStock(productId, quantity);
                return ResponseUtil.ok("Stock added successfully", updated);
            }

            // PUT /inventory/{productId}/reduce-stock
            Matcher reduceStockMatcher = REDUCE_STOCK_PATH.matcher(path);
            if (reduceStockMatcher.matches() && "PUT".equalsIgnoreCase(httpMethod)) {
                String productId = resolvePathParam(pathParameters, "productId", reduceStockMatcher.group(1));
                StockUpdateRequest stockRequest = JsonUtil.fromJson(request.getBody(), StockUpdateRequest.class);
                Integer quantity = stockRequest != null ? stockRequest.getQuantity() : null;
                InventoryResponse updated = inventoryService.reduceStock(productId, quantity);
                return ResponseUtil.ok("Stock reduced successfully", updated);
            }

            // POST /inventory
            if (path.equals("/inventory") && "POST".equalsIgnoreCase(httpMethod)) {
                InventoryRequest inventoryRequest = JsonUtil.fromJson(request.getBody(), InventoryRequest.class);
                InventoryResponse created = inventoryService.createInventory(inventoryRequest);
                return ResponseUtil.created("Inventory created successfully", created);
            }

            // GET /inventory
            if (path.equals("/inventory") && "GET".equalsIgnoreCase(httpMethod)) {
                List<InventoryResponse> inventoryList = inventoryService.getAllInventory();
                return ResponseUtil.ok("Inventory fetched successfully", inventoryList);
            }

            // GET /inventory/{productId}, DELETE /inventory/{productId}
            Matcher productIdMatcher = PRODUCT_ID_PATH.matcher(path);
            if (productIdMatcher.matches()) {
                String productId = resolvePathParam(pathParameters, "productId", productIdMatcher.group(1));

                if ("GET".equalsIgnoreCase(httpMethod)) {
                    InventoryResponse inventory = inventoryService.getInventoryById(productId);
                    return ResponseUtil.ok("Inventory fetched successfully", inventory);
                }

                if ("DELETE".equalsIgnoreCase(httpMethod)) {
                    inventoryService.deleteInventory(productId);
                    return ResponseUtil.ok("Inventory deleted successfully", null);
                }
            }

            return ResponseUtil.badRequest("Unsupported route: " + httpMethod + " " + path);

        } catch (InventoryNotFoundException e) {
            return ResponseUtil.notFound(e.getMessage());
        } catch (InsufficientStockException e) {
            return ResponseUtil.badRequest(e.getMessage());
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
     * naming or API prefix:
     *  - Strips a leading "/default" stage segment if present.
     *  - Strips a leading "/prod" stage segment if present.
     *  - Strips a leading "/api/v1" prefix if present.
     *  - Strips a trailing slash (except for the root path).
     *
     * Runs in a loop so combinations like "/prod/api/v1/inventory" are fully
     * stripped to "/inventory".
     */
    private String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            return "/";
        }

        String normalized = path;

        boolean stripped;
        do {
            stripped = false;
            // Use exact or slash-boundary checks to avoid "/prod" matching "/products", etc.
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
