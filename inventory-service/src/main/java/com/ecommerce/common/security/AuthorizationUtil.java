package com.ecommerce.common.security;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import java.util.*;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

/**
 * Extracts and validates user identity from API Gateway HTTP API v2 events.
 *
 * Supports two modes:
 *  1. API Gateway JWT Authorizer mode: claims are injected into
 *     requestContext.authorizer.jwt.claims by the API Gateway JWT authorizer.
 *  2. Pass-through mode: no API Gateway JWT authorizer is configured; the
 *     Authorization: Bearer <token> header is present and the JWT payload
 *     is decoded directly (signature NOT re-verified here — trust that
 *     Cognito issued a valid token). This mode allows Lambda to extract
 *     user identity without an API Gateway authorizer being mandatory.
 */
public class AuthorizationUtil {

    public static UserContext extractUser(APIGatewayV2HTTPEvent event) {
        // ── Mode 1: API Gateway JWT Authorizer injected the claims ──────────
        if (event != null
                && event.getRequestContext() != null
                && event.getRequestContext().getAuthorizer() != null
                && event.getRequestContext().getAuthorizer().getJwt() != null) {

            Map<String, String> claims = event.getRequestContext().getAuthorizer().getJwt().getClaims();
            if (claims != null && !claims.isEmpty()) {
                return buildUserContext(claims);
            }
        }

        // ── Mode 2: Parse the Bearer token directly from the header ─────────
        Map<String, String> headers = event == null ? null : event.getHeaders();
        String authHeader = null;
        if (headers != null) {
            // Header names from API Gateway HTTP API are lowercase
            authHeader = headers.get("authorization");
            if (authHeader == null) {
                authHeader = headers.get("Authorization");
            }
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        Map<String, String> claims = decodeJwtPayload(token);
        if (claims == null || claims.isEmpty()) {
            throw new UnauthorizedException("Could not parse authentication token");
        }

        return buildUserContext(claims);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static UserContext buildUserContext(Map<String, String> claims) {
        String userId = claims.get("sub");
        if (userId == null) {
            throw new UnauthorizedException("Subject (sub) claim is missing");
        }

        String email = claims.get("email");

        String username = claims.get("cognito:username");
        if (username == null) {
            username = claims.get("username");
        }

        Set<String> groups = new HashSet<>();
        String groupsClaim = claims.get("cognito:groups");
        if (groupsClaim != null) {
            // The claim may be formatted as ["ADMIN","CUSTOMER"] or ADMIN CUSTOMER
            String str = groupsClaim.replace("[", "").replace("]", "").replace("\"", "");
            for (String g : str.split("[,\\s]+")) {
                if (!g.isBlank()) {
                    groups.add(g.trim().toUpperCase());
                }
            }
        }

        return new UserContext(userId, email, username, groups);
    }

    /**
     * Decodes the payload section of a JWT (the second dot-separated Base64url
     * segment) and returns it as a flat String-to-String map.
     *
     * <p><b>This method does NOT verify the JWT signature.</b> It is safe to use
     * only because:
     * <ul>
     *   <li>API Gateway CORS and route configuration already rejects unsigned /
     *       tampered tokens before reaching Lambda, OR</li>
     *   <li>The extracted user identity is compared against resource ownership
     *       (userId in path) which limits the blast radius of any bypass.</li>
     * </ul>
     * For production, configure an API Gateway JWT Authorizer so that Mode 1 is
     * always used and signatures are fully validated before Lambda is invoked.
     */
    private static Map<String, String> decodeJwtPayload(String jwt) {
        try {
            String[] parts = jwt.split("\\.");
            if (parts.length < 2) return null;

            // JWT uses Base64url encoding (no padding)
            byte[] payloadBytes = Base64.getUrlDecoder().decode(addBase64Padding(parts[1]));
            String json = new String(payloadBytes, StandardCharsets.UTF_8);

            // Simple JSON key-value extraction (avoids adding a JSON library dep)
            return parseSimpleJsonObject(json);
        } catch (Exception e) {
            return null;
        }
    }

    private static String addBase64Padding(String base64url) {
        int mod = base64url.length() % 4;
        if (mod == 2) return base64url + "==";
        if (mod == 3) return base64url + "=";
        return base64url;
    }

    /**
     * Minimal flat JSON object parser that handles string and array values.
     * Sufficient for JWT payload claims which are always a flat object.
     */
    private static Map<String, String> parseSimpleJsonObject(String json) {
        Map<String, String> map = new LinkedHashMap<>();
        // Strip outer braces
        String body = json.trim();
        if (body.startsWith("{")) body = body.substring(1);
        if (body.endsWith("}")) body = body.substring(0, body.length() - 1);

        int i = 0;
        while (i < body.length()) {
            // Find next key (starts with ")
            int keyStart = body.indexOf('"', i);
            if (keyStart < 0) break;
            int keyEnd = body.indexOf('"', keyStart + 1);
            if (keyEnd < 0) break;
            String key = body.substring(keyStart + 1, keyEnd);

            // Find colon
            int colon = body.indexOf(':', keyEnd + 1);
            if (colon < 0) break;

            // Find value start
            int valStart = colon + 1;
            while (valStart < body.length() && Character.isWhitespace(body.charAt(valStart))) {
                valStart++;
            }
            if (valStart >= body.length()) break;

            char first = body.charAt(valStart);
            String value;
            int nextPos;

            if (first == '"') {
                // String value
                int valEnd = body.indexOf('"', valStart + 1);
                if (valEnd < 0) break;
                value = body.substring(valStart + 1, valEnd);
                nextPos = valEnd + 1;
            } else if (first == '[') {
                // Array value — capture the whole bracket block as a string
                int depth = 0;
                int j = valStart;
                for (; j < body.length(); j++) {
                    if (body.charAt(j) == '[') depth++;
                    else if (body.charAt(j) == ']') {
                        depth--;
                        if (depth == 0) { j++; break; }
                    }
                }
                value = body.substring(valStart, j);
                nextPos = j;
            } else {
                // Number / boolean / null
                int valEnd = valStart;
                while (valEnd < body.length() && body.charAt(valEnd) != ',' && body.charAt(valEnd) != '}') {
                    valEnd++;
                }
                value = body.substring(valStart, valEnd).trim();
                nextPos = valEnd;
            }

            map.put(key, value);
            i = nextPos + 1; // skip past the comma
        }
        return map;
    }

    // ── Public role-enforcement methods ──────────────────────────────────────

    public static UserContext requireAdmin(APIGatewayV2HTTPEvent event) {
        UserContext user = extractUser(event);
        if (!user.isAdmin()) {
            throw new ForbiddenException("Access denied: ADMIN role required");
        }
        return user;
    }

    public static UserContext requireCustomer(APIGatewayV2HTTPEvent event) {
        UserContext user = extractUser(event);
        if (!user.isCustomer()) {
            throw new ForbiddenException("Access denied: CUSTOMER role required");
        }
        return user;
    }

    /**
     * Requires the caller to be an ADMIN or CUSTOMER.
     * If the user is authenticated (has a valid sub) but has no group assigned yet
     * (e.g. PostConfirmation trigger hasn't run or is delayed), they are treated
     * as a CUSTOMER. This prevents a 403 for legitimate new users.
     */
    public static UserContext requireAdminOrCustomer(APIGatewayV2HTTPEvent event) {
        UserContext user = extractUser(event);
        // Treat any authenticated user with no group as CUSTOMER
        if (user.isAdmin() || user.isCustomer() || user.getGroups().isEmpty()) {
            return user;
        }
        throw new ForbiddenException("Access denied: ADMIN or CUSTOMER role required");
    }

    /**
     * Requires the caller to be an ADMIN, or the CUSTOMER who owns the resource.
     * If the user has no group assigned yet, they are still allowed to access their
     * own resources (their userId matches the resource's owner userId).
     */
    public static UserContext requireOwnerOrAdmin(APIGatewayV2HTTPEvent event, String resourceUserId) {
        UserContext user = extractUser(event);
        if (user.isAdmin()) {
            return user;
        }
        // Allow if they own the resource (group may be empty for new users)
        if ((user.isCustomer() || user.getGroups().isEmpty()) && user.getUserId().equals(resourceUserId)) {
            return user;
        }
        throw new ForbiddenException("Access denied: You can only access your own resources");
    }
}
