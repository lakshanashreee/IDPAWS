package com.ecommerce.cognito.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.events.CognitoUserPoolPostConfirmationEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminAddUserToGroupRequest;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostConfirmationHandlerTest {

    @Mock
    private CognitoIdentityProviderClient cognitoClient;

    @Mock
    private DynamoDbClient dynamoDbClient;

    @Mock
    private Context context;

    @Mock
    private LambdaLogger logger;

    private PostConfirmationHandler handler;

    @BeforeEach
    void setUp() {
        when(context.getLogger()).thenReturn(logger);
        handler = new PostConfirmationHandler(cognitoClient, dynamoDbClient);
    }

    @Test
    void testHandleRequest_Success_AddsUserToGroup() {
        CognitoUserPoolPostConfirmationEvent event = new CognitoUserPoolPostConfirmationEvent();
        event.setUserPoolId("us-east-1_TestPool");
        event.setUserName("test-user-id-123");
        event.setTriggerSource("PostConfirmation_ConfirmSignUp");

        CognitoUserPoolPostConfirmationEvent result = handler.handleRequest(event, context);

        assertNotNull(result);
        assertEquals("test-user-id-123", result.getUserName());

        verify(cognitoClient, times(1)).adminAddUserToGroup(any(AdminAddUserToGroupRequest.class));
    }

    @Test
    void testHandleRequest_DifferentTriggerSource_SkipsGroupAssignment() {
        CognitoUserPoolPostConfirmationEvent event = new CognitoUserPoolPostConfirmationEvent();
        event.setUserPoolId("us-east-1_TestPool");
        event.setUserName("test-user-id-123");
        event.setTriggerSource("PostConfirmation_ForgotPassword");

        CognitoUserPoolPostConfirmationEvent result = handler.handleRequest(event, context);

        assertNotNull(result);
        verify(cognitoClient, never()).adminAddUserToGroup(any(AdminAddUserToGroupRequest.class));
    }

    @Test
    void testHandleRequest_NullEvent_ReturnsNull() {
        CognitoUserPoolPostConfirmationEvent result = handler.handleRequest(null, context);
        assertNull(result);
    }
}
