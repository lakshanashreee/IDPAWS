# AWS Cognito Setup & Checklist (Manual Configuration)

To connect the React frontend to your Cognito User Pool, make sure you configure the following settings in your AWS Console:

### 1. App Client Credentials Check
- **User Pool ID**: `ap-southeast-1_jA2Em5Bbm`
- **Client ID**: `3eq2ua6do9comfb41mk41lb634`

### 2. Client Secret Configuration
- Navigate to **Amazon Cognito** -> **User Pools** -> select `ap-southeast-1_jA2Em5Bbm`.
- Under the **App integration** tab, scroll to the bottom to find **App clients**.
- Open the settings for app client `3eq2ua6do9comfb41mk41lb634`.
- **CRITICAL**: Verify that **Generate client secret** is **not** checked (disabled). 
  *If a client secret was generated for this App Client, you must create a new App Client in this user pool without a client secret, as browser-based JavaScript applications cannot store client secrets securely and the Cognito SDK will fail to authenticate.*

### 3. Authentication Flows
- In the same App Client settings, verify that **Authentication flows** has:
  - `ALLOW_USER_PASSWORD_AUTH` enabled (allows standard username/email + password sign-in).
  - `ALLOW_REFRESH_TOKEN_AUTH` enabled (allows token refresh).

### 4. User Attributes
- Ensure that the User Pool accepts **Email** as a sign-in alias or username (since our forms sign up and log in via email).

### 5. Role-Based Access Control (Cognito Groups)
- When a customer signs up on the frontend, Cognito registers them. However, they are not automatically assigned to a group unless configured otherwise.
- To allow them to authenticate with the backend, you must:
  - Create the Cognito Groups `ADMIN` and `CUSTOMER` under the **User Pools** -> **Groups** tab (if not already created).
  - Add the registered user to the `CUSTOMER` group (or the `ADMIN` group if they are an administrator).
  - Alternatively, you can write a simple AWS Lambda function and attach it to the **Post Confirmation trigger** in Cognito to auto-assign all new registrants to the `CUSTOMER` group:
    ```javascript
    const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } = require("@aws-sdk/client-cognito-identity-provider");

    const client = new CognitoIdentityProviderClient({});

    exports.handler = async (event) => {
        const username = event.userName;
        const userPoolId = event.userPoolId;
        const groupName = "CUSTOMER";

        const command = new AdminAddUserToGroupCommand({
            GroupName: groupName,
            Username: username,
            UserPoolId: userPoolId,
        });

        try {
            await client.send(command);
            console.log(`Successfully added user ${username} to group ${groupName}`);
        } catch (err) {
            console.error(`Error adding user ${username} to group ${groupName}:`, err);
        }

        return event;
    };
    ```
