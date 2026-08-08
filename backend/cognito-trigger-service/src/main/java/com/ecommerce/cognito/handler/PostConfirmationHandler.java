package com.ecommerce.cognito.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.CognitoUserPoolPostConfirmationEvent;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminAddUserToGroupRequest;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * AWS Lambda Post Confirmation trigger for Cognito User Pool.
 * Automatically adds newly confirmed users to the "CUSTOMER" group.
 *
 * Handler: com.ecommerce.cognito.handler.PostConfirmationHandler::handleRequest
 */
public class PostConfirmationHandler implements RequestHandler<CognitoUserPoolPostConfirmationEvent, CognitoUserPoolPostConfirmationEvent> {

    private static final String TARGET_GROUP = "CUSTOMER";
    private static final String SIGN_UP_TRIGGER = "PostConfirmation_ConfirmSignUp";

    private final CognitoIdentityProviderClient cognitoClient;
    private final DynamoDbClient dynamoDbClient;
    private static final String TABLE_NAME = "L_UserDetails";

    public PostConfirmationHandler() {
        // Build the SDK clients. It dynamically resolves AWS region and credentials from the Lambda environment.
        this.cognitoClient = CognitoIdentityProviderClient.builder().build();
        this.dynamoDbClient = DynamoDbClient.builder().build();
    }

    // Constructor for testing / mocking
    public PostConfirmationHandler(CognitoIdentityProviderClient cognitoClient, DynamoDbClient dynamoDbClient) {
        this.cognitoClient = cognitoClient;
        this.dynamoDbClient = dynamoDbClient;
    }

    @Override
    public CognitoUserPoolPostConfirmationEvent handleRequest(CognitoUserPoolPostConfirmationEvent event, Context context) {
        LambdaLogger logger = context.getLogger();

        if (event == null) {
            logger.log("Received null Cognito Post Confirmation event. Skipping.");
            return null;
        }

        String userPoolId = event.getUserPoolId();
        String username = event.getUserName();
        String triggerSource = event.getTriggerSource();

        logger.log("Triggered Cognito Post Confirmation: UserPoolId=" + userPoolId 
                + ", Username=" + username 
                + ", TriggerSource=" + triggerSource);

        // Execute only for newly confirmed user registrations
        if (SIGN_UP_TRIGGER.equalsIgnoreCase(triggerSource)) {
            if (userPoolId == null || userPoolId.isBlank() || username == null || username.isBlank()) {
                logger.log("UserPoolId or Username is missing in event. Cannot add user to group.");
                return event;
            }

            try {
                logger.log("Adding user " + username + " to group " + TARGET_GROUP + " in UserPool " + userPoolId);

                AdminAddUserToGroupRequest request = AdminAddUserToGroupRequest.builder()
                        .userPoolId(userPoolId)
                        .username(username)
                        .groupName(TARGET_GROUP)
                        .build();

                cognitoClient.adminAddUserToGroup(request);
                logger.log("Successfully added user " + username + " to group " + TARGET_GROUP);

                // Insert into L_UserDetails DynamoDB table
                String email = null;
                String name = null;
                if (event.getRequest() != null && event.getRequest().getUserAttributes() != null) {
                    email = event.getRequest().getUserAttributes().get("email");
                    name = event.getRequest().getUserAttributes().get("name");
                }

                if (email == null) email = "";
                if (name == null) name = username;

                Map<String, AttributeValue> item = new HashMap<>();
                item.put("userId", AttributeValue.builder().s(username).build());
                item.put("email", AttributeValue.builder().s(email).build());
                item.put("name", AttributeValue.builder().s(name).build());

                PutItemRequest putItemRequest = PutItemRequest.builder()
                        .tableName(TABLE_NAME)
                        .item(item)
                        .build();

                dynamoDbClient.putItem(putItemRequest);
                logger.log("Successfully created user profile in " + TABLE_NAME + " for user " + username);

            } catch (Exception e) {
                // Log the exception to CloudWatch but return the event to avoid blocking Cognito sign-up process
                logger.log("ERROR: Failed to add user " + username + " to group " + TARGET_GROUP + ": " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            logger.log("Skipping group assignment. Trigger source is " + triggerSource + " (Expected: " + SIGN_UP_TRIGGER + ")");
        }

        // Return the original event back to Cognito to complete the flow successfully
        return event;
    }
}
