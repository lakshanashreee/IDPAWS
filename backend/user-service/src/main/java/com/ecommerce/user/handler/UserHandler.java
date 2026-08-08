package com.ecommerce.user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.ecommerce.common.security.AuthorizationUtil;
import com.ecommerce.user.dto.UpdateProfileRequest;
import com.ecommerce.user.model.UserDetails;
import com.ecommerce.user.service.UserService;
import com.ecommerce.user.util.JsonUtil;
import com.ecommerce.user.util.ResponseUtil;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UserHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {
    private final UserService userService;
    private static final Pattern USER_ID_PATH = Pattern.compile("^/users/([^/]+)$");

    public UserHandler() {
        this.userService = new UserService();
    }

    @Override
    public APIGatewayV2HTTPResponse handleRequest(APIGatewayV2HTTPEvent request, Context context) {
        LambdaLogger logger = context.getLogger();
        try {
            String httpMethod = extractHttpMethod(request);
            String path = normalizePath(request.getRawPath());
            Map<String, String> pathParameters = request.getPathParameters();

            logger.log("Incoming request: " + httpMethod + " " + path);

            if ("OPTIONS".equalsIgnoreCase(httpMethod)) {
                return ResponseUtil.preflight();
            }

            Matcher userIdMatcher = USER_ID_PATH.matcher(path);
            if (userIdMatcher.matches()) {
                String userId = resolvePathParam(pathParameters, "userId", userIdMatcher.group(1));

                // Restrict access to the user themselves (or an admin)
                AuthorizationUtil.requireOwnerOrAdmin(request, userId);

                if ("GET".equalsIgnoreCase(httpMethod)) {
                    UserDetails profile = userService.getUserProfile(userId);
                    if (profile == null) {
                        return ResponseUtil.notFound("Profile not found");
                    }
                    return ResponseUtil.ok("Profile fetched successfully", profile);
                }

                if ("PUT".equalsIgnoreCase(httpMethod)) {
                    String body = request.getBody();
                    if (body != null && request.getIsBase64Encoded()) {
                        body = new String(java.util.Base64.getDecoder().decode(body));
                    }
                    UpdateProfileRequest updateRequest = JsonUtil.fromJson(body, UpdateProfileRequest.class);
                    if (updateRequest == null) {
                        return ResponseUtil.badRequest("Invalid request body");
                    }

                    UserDetails updated = userService.updateUserProfile(
                            userId, updateRequest.getName(), updateRequest.getPhotoUrl(), updateRequest.getAddresses()
                    );
                    return ResponseUtil.ok("Profile updated successfully", updated);
                }
            }

            return ResponseUtil.badRequest("Unsupported route: " + httpMethod + " " + path);
        } catch (Exception e) {
            logger.log("Unexpected error: " + e.getMessage());
            return ResponseUtil.serverError("Internal server error");
        }
    }

    private String extractHttpMethod(APIGatewayV2HTTPEvent request) {
        if (request.getRequestContext() == null || request.getRequestContext().getHttp() == null) {
            return null;
        }
        return request.getRequestContext().getHttp().getMethod();
    }

    private String resolvePathParam(Map<String, String> pathParameters, String key, String fallback) {
        if (pathParameters != null && pathParameters.get(key) != null) {
            return pathParameters.get(key);
        }
        return fallback;
    }

    private String normalizePath(String path) {
        if (path == null || path.isBlank()) return "/";
        String normalized = path;
        boolean stripped;
        do {
            stripped = false;
            if (normalized.startsWith("/default/")) { normalized = normalized.substring("/default".length()); stripped = true; }
            if (normalized.startsWith("/prod/")) { normalized = normalized.substring("/prod".length()); stripped = true; }
            if (normalized.startsWith("/api/v1/")) { normalized = normalized.substring("/api/v1".length()); stripped = true; }
            if (normalized.equals("/default") || normalized.equals("/prod") || normalized.equals("/api/v1")) { normalized = "/"; stripped = true; }
        } while (stripped);
        if (normalized.isEmpty()) normalized = "/";
        if (normalized.length() > 1 && normalized.endsWith("/")) normalized = normalized.substring(0, normalized.length() - 1);
        return normalized;
    }
}
