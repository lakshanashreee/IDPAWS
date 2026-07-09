package com.ecommerce.common.security;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import java.util.*;

public class AuthorizationUtil {

    public static UserContext extractUser(APIGatewayV2HTTPEvent event) {
        if (event == null || event.getRequestContext() == null || 
            event.getRequestContext().getAuthorizer() == null ||
            event.getRequestContext().getAuthorizer().getJwt() == null) {
            throw new UnauthorizedException("Missing authentication token");
        }

        Map<String, String> claims = event.getRequestContext().getAuthorizer().getJwt().getClaims();
        if (claims == null || claims.isEmpty()) {
            throw new UnauthorizedException("No claims found in authentication token");
        }

        String userId = claims.get("sub");
        String email = claims.get("email");
        
        String username = claims.get("cognito:username");
        if (username == null) {
            username = claims.get("username");
        }

        Set<String> groups = new HashSet<>();
        String groupsClaim = claims.get("cognito:groups");
        if (groupsClaim != null) {
            String str = groupsClaim.replace("[", "").replace("]", "").replace("\"", "");
            for (String g : str.split("[,\\s]+")) {
                if (!g.isBlank()) {
                    groups.add(g.trim().toUpperCase());
                }
            }
        }

        if (userId == null) {
            throw new UnauthorizedException("Subject (sub) claim is missing");
        }

        return new UserContext(userId, email, username, groups);
    }

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

    public static UserContext requireAdminOrCustomer(APIGatewayV2HTTPEvent event) {
        UserContext user = extractUser(event);
        if (!user.isAdmin() && !user.isCustomer()) {
            throw new ForbiddenException("Access denied: ADMIN or CUSTOMER role required");
        }
        return user;
    }

    public static UserContext requireOwnerOrAdmin(APIGatewayV2HTTPEvent event, String resourceUserId) {
        UserContext user = extractUser(event);
        if (user.isAdmin()) {
            return user;
        }
        if (user.isCustomer() && user.getUserId().equals(resourceUserId)) {
            return user;
        }
        throw new ForbiddenException("Access denied: You can only access your own resources");
    }
}
