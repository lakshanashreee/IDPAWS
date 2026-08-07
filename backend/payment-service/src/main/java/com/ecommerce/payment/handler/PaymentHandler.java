package com.ecommerce.payment.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.ecommerce.common.security.AuthorizationUtil;
import com.ecommerce.common.security.UnauthorizedException;
import com.ecommerce.common.security.ForbiddenException;
import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.dto.PaymentRequest;
import com.ecommerce.payment.dto.PaymentStatusUpdateRequest;
import com.ecommerce.payment.exception.PaymentNotFoundException;
import com.ecommerce.payment.service.PaymentService;
import com.ecommerce.payment.util.JsonUtil;
import com.ecommerce.payment.util.ResponseUtil;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lambda entry point for the Payment Service's PUBLIC API.
 *
 * Lambda name: L_PaymentService
 * Handler: com.ecommerce.payment.handler.PaymentHandler::handleRequest
 *
 * Built for API Gateway HTTP API using Lambda payload format version 2.0
 * (APIGatewayV2HTTPEvent / APIGatewayV2HTTPResponse).
 *
 * Routes:
 *   GET    /payments
 *   GET    /payments/{paymentId}
 *   GET    /payments/order/{orderId}
 *   PUT    /payments/{paymentId}/status
 *   GET    /payments/health
 *
 * There is intentionally NO "create payment" route here — payments are
 * created by PaymentEventHandler, in response to OrderPlaced SQS events.
 *
 * This service is completely independent. It does not call the Product,
 * Cart, Inventory, or Order services directly.
 */
public class PaymentHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private final PaymentService paymentService;

    private static final String HEALTH_PATH = "/payments/health";
    private static final Pattern ORDER_PAYMENTS_PATH = Pattern.compile("^/payments/order/([^/]+)$");
    private static final Pattern STATUS_PATH = Pattern.compile("^/payments/([^/]+)/status$");
    private static final Pattern PAYMENT_ID_PATH = Pattern.compile("^/payments/([^/]+)$");

    public PaymentHandler() {
        this.paymentService = new PaymentService();
    }

    public PaymentHandler(PaymentService paymentService) {
        this.paymentService = paymentService;
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

            // GET /payments/health
            if (path.equals(HEALTH_PATH) && "GET".equalsIgnoreCase(httpMethod)) {
                return ResponseUtil.ok("Health check passed", paymentService.healthCheck());
            }

            // GET /payments/order/{orderId}
            Matcher orderPaymentsMatcher = ORDER_PAYMENTS_PATH.matcher(path);
            if (orderPaymentsMatcher.matches() && "GET".equalsIgnoreCase(httpMethod)) {
                String orderId = resolvePathParam(pathParameters, "orderId", orderPaymentsMatcher.group(1));
                List<PaymentResponse> payments = paymentService.getPaymentsByOrderId(orderId);
                if (!payments.isEmpty()) {
                    AuthorizationUtil.requireOwnerOrAdmin(request, payments.get(0).getUserId());
                } else {
                    AuthorizationUtil.extractUser(request);
                }
                return ResponseUtil.ok("Payments fetched successfully for order", payments);
            }

            // PUT /payments/{paymentId}/status
            Matcher statusMatcher = STATUS_PATH.matcher(path);
            if (statusMatcher.matches() && "PUT".equalsIgnoreCase(httpMethod)) {
                AuthorizationUtil.requireAdmin(request);
                String paymentId = resolvePathParam(pathParameters, "paymentId", statusMatcher.group(1));
                PaymentStatusUpdateRequest statusRequest =
                        JsonUtil.fromJson(request.getBody(), PaymentStatusUpdateRequest.class);
                String status = statusRequest != null ? statusRequest.getStatus() : null;
                PaymentResponse updated = paymentService.updateStatus(paymentId, status);
                return ResponseUtil.ok("Payment status updated successfully", updated);
            }

            // GET /payments
            if (path.equals("/payments") && "GET".equalsIgnoreCase(httpMethod)) {
                AuthorizationUtil.requireAdmin(request);
                List<PaymentResponse> payments = paymentService.getAllPayments();
                return ResponseUtil.ok("Payments fetched successfully", payments);
            }

            // POST /payments
            if (path.equals("/payments") && "POST".equalsIgnoreCase(httpMethod)) {
                AuthorizationUtil.extractUser(request); // any logged-in user can submit a payment
                PaymentRequest paymentRequest = JsonUtil.fromJson(request.getBody(), PaymentRequest.class);
                PaymentResponse created = paymentService.createPayment(paymentRequest);
                return ResponseUtil.created("Payment registered successfully", created);
            }

            // GET /payments/{paymentId}
            Matcher paymentIdMatcher = PAYMENT_ID_PATH.matcher(path);
            if (paymentIdMatcher.matches() && "GET".equalsIgnoreCase(httpMethod)) {
                String paymentId = resolvePathParam(pathParameters, "paymentId", paymentIdMatcher.group(1));
                PaymentResponse payment = paymentService.getPaymentById(paymentId);
                AuthorizationUtil.requireOwnerOrAdmin(request, payment.getUserId());
                return ResponseUtil.ok("Payment fetched successfully", payment);
            }

            return ResponseUtil.badRequest("Unsupported route: " + httpMethod + " " + path);

        } catch (PaymentNotFoundException e) {
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
     * naming or API prefix:
     *  - Strips a leading "/default" stage segment if present.
     *  - Strips a leading "/prod" stage segment if present.
     *  - Strips a leading "/api/v1" prefix if present.
     *  - Strips a trailing slash (except for the root path).
     *
     * Runs in a loop so combinations like "/prod/api/v1/payments" are fully
     * stripped to "/payments".
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
