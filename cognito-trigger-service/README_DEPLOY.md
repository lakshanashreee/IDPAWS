# AWS Cognito Post Confirmation Trigger Deployment Guide

This document describes how to deploy and configure the `cognito-trigger-service` Lambda function to automate Cognito group assignment for newly registered users.

---

## 1. IAM Permissions Required

The Lambda execution role requires permissions to write logs to CloudWatch and to add users to Cognito groups.

Create or update the IAM execution role for your Lambda with the following inline policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CognitoGroupAssignment",
            "Effect": "Allow",
            "Action": [
                "cognito-idp:AdminAddUserToGroup"
            ],
            "Resource": "arn:aws:cognito-idp:ap-southeast-1:*:userpool/ap-southeast-1_jA2Em5Bbm"
        },
        {
            "Sid": "CloudWatchLogging",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
```

*Note: Replace `ap-southeast-1:*` with your AWS account ID if you wish to lock down the Cognito User Pool ARN resource fully (e.g. `arn:aws:cognito-idp:ap-southeast-1:123456789012:userpool/ap-southeast-1_jA2Em5Bbm`).*

---

## 2. Compilation and Packaging Steps

From your local machine, open your terminal, navigate to the `cognito-trigger-service` directory, and package the service:

```bash
cd cognito-trigger-service
mvn clean package
```

This generates a shaded fat JAR containing the handler and its dependencies:
- **Target Location**: `cognito-trigger-service/target/cognito-trigger-service-1.0.0.jar`

---

## 3. Deployment Steps to AWS Lambda

### Option A: Via the AWS Management Console (Recommended)
1. Open the **AWS Lambda Console**.
2. Click **Create function**.
3. Choose **Author from scratch** and set the following configuration:
   - **Function name**: `L_CognitoPostConfirmationTrigger`
   - **Runtime**: **Java 21**
   - **Architecture**: `x86_64` (or `arm64` if preferred)
   - **Execution role**: Choose or create a role containing the IAM policy specified in Section 1.
4. Click **Create function**.
5. In the **Code** tab, scroll to **Code source**, click **Upload from**, select **.zip or .jar file**, and upload:
   - `cognito-trigger-service-1.0.0.jar` (from the target directory).
6. Under **Runtime settings**, click **Edit** and set:
   - **Handler**: `com.ecommerce.cognito.handler.PostConfirmationHandler::handleRequest`
7. Click **Save**.

### Option B: Via the AWS CLI
If you have the AWS CLI configured, run:
```bash
aws lambda create-function \
    --function-name L_CognitoPostConfirmationTrigger \
    --runtime java21 \
    --handler com.ecommerce.cognito.handler.PostConfirmationHandler::handleRequest \
    --role arn:aws:iam::<your-account-id>:role/<your-lambda-role> \
    --zip-file fileb://target/cognito-trigger-service-1.0.0.jar \
    --timeout 15 \
    --memory-size 512
```

---

## 4. Attaching the Lambda to the Cognito Trigger

To associate the Lambda with your User Pool's Post Confirmation hook:

1. Open the **Amazon Cognito Console** and select your User Pool `ap-southeast-1_jA2Em5Bbm`.
2. Select the **User Pool Properties** tab.
3. Scroll down to the **Lambda triggers** section and click **Add Lambda trigger**.
4. Configure the trigger parameters:
   - **Trigger type**: Select **Sign-up** -> **Post confirmation trigger**.
   - **Lambda function**: Choose the Lambda function you created (`L_CognitoPostConfirmationTrigger`).
5. Click **Add Lambda trigger** at the bottom.

*Cognito will automatically add the resource-based policy to your Lambda allowing Cognito User Pool `ap-southeast-1_jA2Em5Bbm` to invoke your Lambda function.*
