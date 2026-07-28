package com.ecommerce.user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.ecommerce.common.security.AuthorizationUtil;
import com.ecommerce.common.security.UserContext;
import com.ecommerce.user.model.UserProfile;
import com.ecommerce.user.util.ResponseUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.util.Map;

public class UserProfileHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private static final String TABLE_NAME = System.getenv().getOrDefault("USER_TABLE_NAME", "L_UserProfileTable");
    private final DynamoDbTable<UserProfile> userTable;
    private final ObjectMapper objectMapper;

    public UserProfileHandler() {
        DynamoDbClient ddb = DynamoDbClient.builder()
                .region(Region.AP_SOUTHEAST_1)
                .build();
        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(ddb)
                .build();
        this.userTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(UserProfile.class));
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public APIGatewayV2HTTPResponse handleRequest(APIGatewayV2HTTPEvent request, Context context) {
        try {
            String httpMethod = request.getRequestContext().getHttp().getMethod();
            String path = request.getRequestContext().getHttp().getPath();
            
            if ("/users/health".equals(path) && "GET".equals(httpMethod)) {
                return ResponseUtil.ok("User Service is healthy", null);
            }
            
            Map<String, String> pathParams = request.getPathParameters();
            String userId = pathParams != null ? pathParams.get("userId") : null;
            
            if (userId == null) {
                return ResponseUtil.error(400, "Missing userId in path");
            }
            
            UserContext userContext = AuthorizationUtil.extractUser(request);
            AuthorizationUtil.requireOwnerOrAdmin(request, userId);

            if ("GET".equals(httpMethod)) {
                return getUserProfile(userId);
            } else if ("PUT".equals(httpMethod)) {
                return updateUserProfile(userId, request.getBody());
            } else {
                return ResponseUtil.error(405, "Method Not Allowed");
            }

        } catch (IllegalArgumentException e) {
            return ResponseUtil.error(400, e.getMessage());
        } catch (SecurityException e) {
            return ResponseUtil.error(403, e.getMessage());
        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseUtil.error(500, "Internal Server Error");
        }
    }

    private APIGatewayV2HTTPResponse getUserProfile(String userId) {
        UserProfile profile = userTable.getItem(r -> r.key(k -> k.partitionValue(userId)));
        if (profile == null) {
            // Return empty profile for new users instead of 404
            profile = new UserProfile();
            profile.setUserId(userId);
        }
        return ResponseUtil.ok("Success", profile);
    }

    private APIGatewayV2HTTPResponse updateUserProfile(String userId, String body) throws Exception {
        if (body == null || body.isEmpty()) {
            throw new IllegalArgumentException("Request body cannot be empty");
        }
        UserProfile updatedProfile = objectMapper.readValue(body, UserProfile.class);
        
        // Ensure userId in body matches path parameter
        if (!updatedProfile.getUserId().equals(userId)) {
            throw new IllegalArgumentException("User ID in path must match User ID in body");
        }
        
        userTable.putItem(updatedProfile);
        return ResponseUtil.ok("Profile updated", updatedProfile);
    }
}
