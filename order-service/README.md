# order-service

AWS Serverless **Order Service** — Java 21, AWS Lambda, API Gateway HTTP API (payload format 2.0), DynamoDB (AWS SDK v2), SNS (AWS SDK v2), Jackson.

No Spring Boot, no Spring Framework, no JPA/Hibernate, no Spring Data, no Tomcat/embedded server, no MongoDB, no caching layer, no frontend. No SAM, CDK, Terraform, or Docker used to build or deploy this project.

This service is **completely independent**. It does not call the Product, Cart, Inventory, or Payment services directly. All event-driven communication happens through **SNS** — this service publishes an `ORDER_PLACED` event; it does not subscribe to anything.

---

## 1. Build

```bash
mvn clean package -DskipTests
```

Produces a fat JAR (via `maven-shade-plugin`) at:

```
target/order-service-1.0.0.jar
```

Upload this JAR directly as the Lambda deployment package.

---

## 2. Lambda Configuration

| Setting            | Value                                                        |
|---------------------|------------------------------------------------------------------|
| Lambda name        | `L_OrderService`                                                 |
| Runtime            | Java 21                                                           |
| Handler            | `com.ecommerce.order.handler.OrderHandler::handleRequest`        |
| Deployment package | `target/order-service-1.0.0.jar`                                  |
| Memory             | 1024 MB                                                           |
| Timeout            | 30 seconds                                                        |
| Payload format     | **2.0** (HTTP API) — the handler implements `RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>` |

### Environment variables

```
ORDER_TABLE=L_OrderTable
ORDER_TOPIC_ARN=<actual topic ARN>
```

- If `ORDER_TABLE` is unset, the code falls back to the default table name `L_OrderTable`.
- If `ORDER_TOPIC_ARN` is missing or blank, order creation still succeeds — the SNS publish step is simply skipped (see section 7).

### Required managed IAM policies on the Lambda execution role

- `AWSLambdaBasicExecutionRole`
- `AmazonDynamoDBFullAccess`
- `AmazonSNSFullAccess`

(No IAM role creation or AWS resource provisioning code is included in this repo — attach these policies manually or via your own tooling.)

---

## 3. DynamoDB Table

| Setting        | Value          |
|-----------------|----------------|
| Table name     | `L_OrderTable` |
| Partition key  | `orderId` (String) |
| Capacity mode  | On-demand      |

The `items` attribute is stored as a DynamoDB **List of Maps** — one map per order line item (`productId`, `productName`, `price`, `quantity`).

This service does not create the table — provision it separately (console, CLI, or your own IaC).

---

## 4. SNS Topic

| Setting     | Value                 |
|--------------|-----------------------|
| Topic name  | `L_OrderPlacedTopic`  |

Create the topic separately and put its ARN into the `ORDER_TOPIC_ARN` environment variable. This service only **publishes** to it.

### SNS fan-out to SQS (provision separately)

| SNS topic              | SQS queue            | Consumer Lambda              |
|------------------------|----------------------|------------------------------|
| `L_OrderPlacedTopic`   | `L_InventoryQueue`   | `L_InventoryEventService`    |
| `L_OrderPlacedTopic`   | `L_PaymentQueue`     | `L_PaymentEventService`      |

**Enable raw message delivery** on both SNS → SQS subscriptions so consumers receive the plain `ORDER_PLACED` JSON body.

See `DEPLOYMENT_NOTES.md` at the project root for the full wiring checklist.

---

## 5. API Gateway Route Mappings (HTTP API, Payload v2.0)

All routes integrate with the same Lambda (`OrderHandler`) via Lambda proxy integration.

| Method | Route                          | Description                                  |
|--------|-----------------------------------|--------------------------------------------------|
| POST   | `/orders`                        | Create an order and publish `ORDER_PLACED` event |
| GET    | `/orders`                        | List all orders                                   |
| GET    | `/orders/{orderId}`              | Get a single order                                |
| GET    | `/orders/user/{userId}`          | List all orders for a user                        |
| PUT    | `/orders/{orderId}/status`       | Update order status                               |
| DELETE | `/orders/{orderId}`              | Delete an order                                   |
| GET    | `/orders/health`                 | Health check                                      |

CORS is handled inside every Lambda response (`Access-Control-Allow-Origin: *`, etc.), and `OPTIONS` preflight requests are answered directly by the handler.

> **Path normalization**: the handler strips a leading `/default` segment from `rawPath` (relevant if you deploy the HTTP API to a stage literally named `default`), and strips trailing slashes, before routing.

---

## 6. Order Fields

```json
{
  "orderId": "ORD-1719830000000-a1b2c3d4",
  "userId": "user123",
  "items": [
    {
      "productId": "PROD-123",
      "productName": "Samsung Galaxy S24",
      "price": 79999,
      "quantity": 1
    }
  ],
  "totalAmount": 79999,
  "status": "PLACED",
  "createdAt": "2026-07-01T10:15:30Z",
  "updatedAt": "2026-07-01T10:15:30Z"
}
```

Valid `status` values: `PLACED`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`.

---

## 7. Response Envelope

Every response follows this shape:

```json
{
  "success": true,
  "message": "...",
  "data": ...
}
```

| Status | Meaning                                                                 |
|--------|--------------------------------------------------------------------------|
| 200    | OK, or "partial success" for `POST /orders` when the order saved but the SNS publish failed (`success: false`, order still returned in `data`) |
| 201    | Created (order saved and — if configured — its event published)         |
| 400    | Bad Request (validation failure)                                         |
| 404    | Not Found (unknown `orderId`)                                            |
| 500    | Internal Server Error (e.g. the DynamoDB save itself failed)             |

### POST /orders response messages

| Scenario                                              | HTTP status | `success` | `message`                                                                 |
|--------------------------------------------------------|-------------|-----------|------------------------------------------------------------------------------|
| DynamoDB save fails                                     | 500         | `false`   | `"Internal server error: ..."`                                              |
| Save succeeds, `ORDER_TOPIC_ARN` not configured          | 201         | `true`    | `"Order created successfully, SNS publish skipped because ORDER_TOPIC_ARN is not configured"` |
| Save succeeds, SNS publish succeeds                      | 201         | `true`    | `"Order created successfully and event published"`                          |
| Save succeeds, SNS publish fails                         | 200         | `false`   | `"Order saved but event publish failed: <reason>"` (order is **not** rolled back and is still returned in `data`) |

---

## 8. Business Rules

- `POST /orders` requires `userId` and a non-empty `items` list; every item needs `productId`, `productName`, `price >= 0`, and `quantity > 0`.
- `orderId` is generated as `ORD-<epochMillis>-<shortUuid>`.
- `totalAmount` is calculated server-side as the sum of `price * quantity` across all items — it is never trusted from the request.
- New orders are always created with status `PLACED`.
- `GET /orders/user/{userId}` uses a DynamoDB `Scan` with an in-application filter on `userId` — no GSI is required for this.
- `PUT /orders/{orderId}/status` only accepts one of the six defined statuses (case-insensitive input is normalized to uppercase) and updates `updatedAt`.
- `DELETE /orders/{orderId}` performs a hard delete.
- No authentication/authorization is implemented in this service.

---

## 9. Postman Sample Requests

Replace `{{baseUrl}}` with your deployed API Gateway invoke URL, e.g.
`https://abc123.execute-api.us-east-1.amazonaws.com`.

### Create Order — `POST {{baseUrl}}/orders`

```json
{
  "userId": "user123",
  "items": [
    {
      "productId": "PROD-123",
      "productName": "Samsung Galaxy S24",
      "price": 79999,
      "quantity": 1
    }
  ]
}
```

### List All Orders — `GET {{baseUrl}}/orders`

No body required.

### Get Order By Id — `GET {{baseUrl}}/orders/ORD-1719830000000-a1b2c3d4`

No body required.

### Get Orders By User — `GET {{baseUrl}}/orders/user/user123`

No body required.

### Update Order Status — `PUT {{baseUrl}}/orders/ORD-1719830000000-a1b2c3d4/status`

```json
{
  "status": "CONFIRMED"
}
```

### Delete Order — `DELETE {{baseUrl}}/orders/ORD-1719830000000-a1b2c3d4`

No body required.

### Health Check — `GET {{baseUrl}}/orders/health`

No body required.

---

## 10. Project Structure

```
order-service/
├── pom.xml
├── README.md
└── src/main/java/com/ecommerce/order/
    ├── handler/
    │   └── OrderHandler.java
    ├── service/
    │   └── OrderService.java
    ├── repository/
    │   └── OrderRepository.java
    ├── model/
    │   ├── Order.java
    │   └── OrderItem.java
    ├── dto/
    │   ├── OrderRequest.java
    │   ├── OrderItemRequest.java
    │   ├── OrderResponse.java
    │   ├── StatusUpdateRequest.java
    │   └── ApiResponse.java
    ├── util/
    │   ├── JsonUtil.java
    │   ├── ResponseUtil.java
    │   ├── IdGenerator.java
    │   └── SnsPublisher.java
    └── exception/
        └── OrderNotFoundException.java
```
