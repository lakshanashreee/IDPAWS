package com.ecommerce.product.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.ecommerce.common.security.AuthorizationUtil;
import com.ecommerce.common.security.UnauthorizedException;
import com.ecommerce.common.security.ForbiddenException;
import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.exception.ProductNotFoundException;
import com.ecommerce.product.service.ProductService;
import com.ecommerce.product.util.JsonUtil;
import com.ecommerce.product.util.ResponseUtil;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lambda entry point for the Product Service.
 *
 * Handler: com.ecommerce.product.handler.ProductHandler::handleRequest
 *
 * Built for API Gateway HTTP API using Lambda payload format version 2.0
 * (APIGatewayV2HTTPEvent / APIGatewayV2HTTPResponse).
 *
 * Routes:
 *   POST   /products
 *   GET    /products
 *   GET    /products/{productId}
 *   PUT    /products/{productId}
 *   DELETE /products/{productId}
 *   GET    /products/category/{category}
 *   GET    /products/health
 */
public class ProductHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private final ProductService productService;

    private static final Pattern PRODUCT_ID_PATH = Pattern.compile("^/products/([^/]+)$");
    private static final Pattern CATEGORY_PATH = Pattern.compile("^/products/category/([^/]+)$");

    public ProductHandler() {
        this.productService = new ProductService();
    }

    public ProductHandler(ProductService productService) {
        this.productService = productService;
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

            // GET /products/health
            if (path.equals("/products/health") && "GET".equalsIgnoreCase(httpMethod)) {
                return ResponseUtil.ok("Health check passed", productService.healthCheck());
            }

            // GET /products/category/{category}
            Matcher categoryMatcher = CATEGORY_PATH.matcher(path);
            if (categoryMatcher.matches() && "GET".equalsIgnoreCase(httpMethod)) {
                AuthorizationUtil.requireAdminOrCustomer(request);
                String category = resolvePathParam(pathParameters, "category", categoryMatcher.group(1));
                List<ProductResponse> products = productService.getProductsByCategory(category);
                return ResponseUtil.ok("Products fetched by category", products);
            }

            // POST /products
            if (path.equals("/products") && "POST".equalsIgnoreCase(httpMethod)) {
                AuthorizationUtil.requireAdmin(request);
                ProductRequest productRequest = JsonUtil.fromJson(request.getBody(), ProductRequest.class);
                ProductResponse created = productService.createProduct(productRequest);
                return ResponseUtil.created("Product created successfully", created);
            }

            // GET /products
            if (path.equals("/products") && "GET".equalsIgnoreCase(httpMethod)) {
                AuthorizationUtil.requireAdminOrCustomer(request);
                List<ProductResponse> products = productService.getAllProducts();
                return ResponseUtil.ok("Products fetched successfully", products);
            }

            // GET /products/{productId}, PUT /products/{productId}, DELETE /products/{productId}
            Matcher productIdMatcher = PRODUCT_ID_PATH.matcher(path);
            if (productIdMatcher.matches()) {
                String productId = resolvePathParam(pathParameters, "productId", productIdMatcher.group(1));

                if ("GET".equalsIgnoreCase(httpMethod)) {
                    AuthorizationUtil.requireAdminOrCustomer(request);
                    ProductResponse product = productService.getProductById(productId);
                    return ResponseUtil.ok("Product fetched successfully", product);
                }

                if ("PUT".equalsIgnoreCase(httpMethod)) {
                    AuthorizationUtil.requireAdmin(request);
                    ProductRequest productRequest = JsonUtil.fromJson(request.getBody(), ProductRequest.class);
                    ProductResponse updated = productService.updateProduct(productId, productRequest);
                    return ResponseUtil.ok("Product updated successfully", updated);
                }

                if ("DELETE".equalsIgnoreCase(httpMethod)) {
                    AuthorizationUtil.requireAdmin(request);
                    productService.deleteProduct(productId);
                    return ResponseUtil.ok("Product deleted successfully (soft delete)", null);
                }
            }

            return ResponseUtil.badRequest("Unsupported route: " + httpMethod + " " + path);

        } catch (ProductNotFoundException e) {
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
     * requestContext.http.method instead of the top-level httpMethod field
     * used by the REST API (payload format 1.0) proxy event.
     */
    private String extractHttpMethod(APIGatewayV2HTTPEvent request) {
        if (request.getRequestContext() == null || request.getRequestContext().getHttp() == null) {
            return null;
        }
        return request.getRequestContext().getHttp().getMethod();
    }

    /**
     * Prefer the value supplied by API Gateway's pathParameters map (set up
     * via {proxy} or explicit resource path params). Fall back to the value
     * captured by the handler's own regex match if pathParameters is absent,
     * which keeps this handler resilient to different API Gateway setups.
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
     * Runs in a loop so combinations like "/prod/api/v1/products" are fully
     * stripped to "/products".
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
