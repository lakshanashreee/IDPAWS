# payment-service

AWS Serverless **Payment Service** — Java 21, AWS Lambda (two functions), API Gateway HTTP API (payload format 2.0), SQS, DynamoDB (AWS SDK v2), Jackson.

No Spring Boot, no Spring Framework, no JPA/Hibernate, no Spring Data, no Tomcat/embedded server, no MongoDB, no caching layer, no frontend. No SAM, CDK, Terraform, or Docker used to build or deploy this project.

This service is **completely independent**. It does not call the Product, Cart, Inventory, or Order services directly. Payments are created only in reaction to an `OrderPlaced` event arriving over SQS — there is no public "create payment" API route.

This project ships **two Lambda functions from one shaded JAR** — pick a different handler string per function when you deploy:

| Lambda                  | Purpose                              | Handler                                                         |
|---------------------------|-----------------------------------------|--------------------------------------------------------------------|
| `L_PaymentService`       | Public HTTP API (read + status update)   | `com.ecommerce.payment.handler.PaymentHandler::handleRequest`      |
| `L_PaymentEventService`  | SQS consumer that creates payments        | `com.ecommerce.payment.handler.PaymentEventHandler::handleRequest` |

---

## 1. Build

```bash
mvn clean package -DskipTests
```

Produces a fat JAR (via `maven-shade-plugin`) at:

```
target/payment-service-1.0.0.jar
```

Upload this **same JAR** to both Lambda functions — only the configured handler string differs between them.

---

## 2. Lambda Configuration

### API Lambda — `L_PaymentService`

| Setting            | Value                                                         |
|---------------------|-------------------------------------------------------------------|
| Runtime            | Java 21                                                             |
| Handler            | `com.ecommerce.payment.handler.PaymentHandler::handleRequest`      |
| Deployment package | `target/payment-service-1.0.0.jar`                                  |
| Memory             | 1024 MB                                                             |
| Timeout            | 30 seconds                                                          |
| Payload format     | **2.0** (HTTP API) — implements `RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>` |

Environment variable:

```
PAYMENT_TABLE=L_PaymentTable
```

### SQS Lambda — `L_PaymentEventService`

| Setting            | Value                                                              |
|---------------------|--------------------------------------------------------------------------|
| Runtime            | Java 21                                                                    |
| Handler            | `com.ecommerce.payment.handler.PaymentEventHandler::handleRequest`        |
| Deployment package | `target/payment-service-1.0.0.jar`                                         |
| Memory             | 1024 MB                                                                    |
| Timeout            | 30 seconds                                                                 |
| Trigger            | Implements `RequestHandler<SQSEvent, Void>`, triggered by SQS queue **`L_PaymentQueue`** |

Environment variable:

```
PAYMENT_TABLE=L_PaymentTable
```

If `PAYMENT_TABLE` is unset on either function, the code falls back to the default table name `L_PaymentTable`.

### Required managed IAM policies (both Lambda execution roles)

- `AWSLambdaBasicExecutionRole`
- `AmazonDynamoDBFullAccess`
- `AmazonSQSFullAccess`

(No IAM role creation or AWS resource provisioning code is included in this repo — attach these policies manually or via your own tooling.)

---

## 3. SQS Trigger

Attach a queue named **`L_PaymentQueue`** as the event source trigger for `L_PaymentEventService`. This queue must be subscribed to the Order Service SNS topic **`L_OrderPlacedTopic`**, so that every `ORDER_PLACED` event published by Order Service eventually lands here.

**Enable raw message delivery** on the SNS → SQS subscription so the message body is the plain event JSON.

This service does not create the queue or the SNS subscription — provision that separately. See `DEPLOYMENT_NOTES.md` at the project root.

---

## 4. DynamoDB Table

| Setting        | Value            |
|-----------------|------------------|
| Table name     | `L_PaymentTable` |
| Partition key  | `paymentId` (String) |
| Capacity mode  | On-demand        |

This service does not create the table — provision it separately (console, CLI, or your own IaC).

---

## 5. API Gateway Route Mappings (HTTP API, Payload v2.0)

All routes integrate with `L_PaymentService` (`PaymentHandler`) via Lambda proxy integration.

| Method | Route                          | Description                          |
|--------|-----------------------------------|------------------------------------------|
| GET    | `/payments`                      | List all payments                        |
| GET    | `/payments/{paymentId}`          | Get a single payment                     |
| GET    | `/payments/order/{orderId}`      | List payments for a given order          |
| PUT    | `/payments/{paymentId}/status`   | Update payment status                    |
| GET    | `/payments/health`               | Health check                             |

There is intentionally no `POST /payments` route — payment creation happens only through the SQS event flow below.

CORS is handled inside every Lambda response:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
```

`OPTIONS` preflight requests are answered directly by `PaymentHandler`.

> **Path normalization**: the handler strips a leading `/default` segment from `rawPath` (relevant if you deploy the HTTP API to a stage literally named `default`), and strips trailing slashes, before routing.

---

## 6. SQS Event Flow (Payment Creation)

`PaymentEventHandler` consumes `ORDER_PLACED` events from SQS. Expected message body:

```json
{
  "eventType": "ORDER_PLACED",
  "orderId": "ORD-123",
  "userId": "user123",
  "items": [
    { "productId": "PROD-123", "productName": "Samsung Galaxy S24", "price": 79999, "quantity": 1 }
  ],
  "totalAmount": 79999,
  "status": "PLACED",
  "createdAt": "..."
}
```

For each SQS record:

1. Parse the message body into an `OrderPlacedEvent`.
2. Validate `eventType` is `ORDER_PLACED` (and that `orderId` is present).
3. Generate `paymentId` as `PAY-<epochMillis>-<shortUuid>`.
4. Create a `Payment` record: `paymentMode = COD`, `paymentStatus = SUCCESS` (both hard-coded defaults, for simplicity — no real payment gateway integration yet).
5. Save it to `L_PaymentTable`.
6. Log the processed `orderId` / new `paymentId`.

**If one message fails** (bad JSON, validation error, DynamoDB error, etc.), the handler logs the error for that message and **continues processing the rest of the batch** — a single bad message does not fail the whole invocation.

No S3 usage, no SNS publishing from this service — kept intentionally simple.

---

## 7. Payment Fields

```json
{
  "paymentId": "PAY-1719830000000-a1b2c3d4",
  "orderId": "ORD-123",
  "userId": "user123",
  "amount": 79999,
  "paymentMode": "COD",
  "paymentStatus": "SUCCESS",
  "transactionTime": "2026-07-01T10:15:30Z"
}
```

Valid `paymentMode` values: `UPI`, `CARD`, `NET_BANKING`, `COD` (only `COD` is ever set automatically today).
Valid `paymentStatus` values: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`.

---

## 8. Response Envelope (API Lambda only)

Every `L_PaymentService` response follows this shape:

```json
{
  "success": true,
  "message": "Payment fetched successfully",
  "data": { ... }
}
```

| Status | Meaning                                  |
|--------|------------------------------------------|
| 200    | OK                                        |
| 400    | Bad Request (validation failure)          |
| 404    | Not Found (unknown `paymentId`)           |
| 500    | Internal Server Error                     |

(`L_PaymentEventService` does not return HTTP responses — it returns `Void` and communicates outcomes only via CloudWatch logs.)

---

## 9. Business Rules

- Payments are created **only** by `PaymentEventHandler` reacting to `ORDER_PLACED` SQS messages — there is no public create endpoint.
- `PUT /payments/{paymentId}/status` only accepts one of the four defined statuses (case-insensitive input is normalized to uppercase).
- `GET /payments/order/{orderId}` uses a DynamoDB `Scan` with an in-application filter on `orderId` — no GSI is required for this.
- No authentication/authorization is implemented in this service.

---

## 10. Postman Sample Requests

Replace `{{baseUrl}}` with your deployed API Gateway invoke URL, e.g.
`https://abc123.execute-api.us-east-1.amazonaws.com`.

### List All Payments — `GET {{baseUrl}}/payments`

No body required.

### Get Payment By Id — `GET {{baseUrl}}/payments/PAY-1719830000000-a1b2c3d4`

No body required.

### Get Payments By Order — `GET {{baseUrl}}/payments/order/ORD-123`

No body required.

### Update Payment Status — `PUT {{baseUrl}}/payments/PAY-1719830000000-a1b2c3d4/status`

```json
{
  "status": "REFUNDED"
}
```

### Health Check — `GET {{baseUrl}}/payments/health`

No body required.

### (For manual testing) Sample SQS message body to send to L_PaymentQueue

```json
{
  "eventType": "ORDER_PLACED",
  "orderId": "ORD-123",
  "userId": "user123",
  "items": [
    { "productId": "PROD-123", "productName": "Samsung Galaxy S24", "price": 79999, "quantity": 1 }
  ],
  "totalAmount": 79999,
  "status": "PLACED",
  "createdAt": "2026-07-01T10:15:30Z"
}
```

---

## 11. Project Structure

```
payment-service/
├── pom.xml
├── README.md
└── src/main/java/com/ecommerce/payment/
    ├── handler/
    │   ├── PaymentHandler.java
    │   └── PaymentEventHandler.java
    ├── service/
    │   └── PaymentService.java
    ├── repository/
    │   └── PaymentRepository.java
    ├── model/
    │   ├── Payment.java
    │   ├── OrderPlacedEvent.java
    │   └── OrderItem.java
    ├── dto/
    │   ├── PaymentResponse.java
    │   ├── PaymentStatusUpdateRequest.java
    │   └── ApiResponse.java
    ├── util/
    │   ├── JsonUtil.java
    │   ├── ResponseUtil.java
    │   └── IdGenerator.java
    └── exception/
        └── PaymentNotFoundException.java
```
