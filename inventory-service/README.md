# inventory-service

AWS Serverless **Inventory Service** — Java 21, AWS Lambda (two functions), API Gateway HTTP API (payload format 2.0), SQS, DynamoDB (AWS SDK v2), Jackson.

No Spring Boot, no Spring Framework, no JPA/Hibernate, no Spring Data, no Tomcat/embedded server, no MongoDB. No SAM, CDK, Terraform, or Docker used to build or deploy this project.

This service is **completely independent**. It does not call the Product Service (or any other service) directly. Stock reduction on order placement happens asynchronously via **SQS** — there is no direct HTTP call to Order Service.

This project ships **two Lambda functions from one shaded JAR** — pick a different handler string per function when you deploy:

| Lambda                     | Purpose                              | Handler                                                              |
|----------------------------|--------------------------------------|----------------------------------------------------------------------|
| `L_InventoryService`       | Public HTTP API (CRUD + stock ops)   | `com.ecommerce.inventory.handler.InventoryHandler::handleRequest`    |
| `L_InventoryEventService`  | SQS consumer that reduces stock      | `com.ecommerce.inventory.handler.InventoryEventHandler::handleRequest` |

---

## 1. Build

```bash
mvn clean package -DskipTests
```

Produces a fat JAR (via `maven-shade-plugin`) at:

```
target/inventory-service-1.0.0.jar
```

Upload this **same JAR** to both Lambda functions — only the configured handler string differs between them.

---

## 2. Lambda Configuration

### API Lambda — `L_InventoryService`

| Setting            | Value                                                        |
|---------------------|----------------------------------------------------------------|
| Runtime            | Java 21                                                        |
| Handler            | `com.ecommerce.inventory.handler.InventoryHandler::handleRequest` |
| Deployment package | `target/inventory-service-1.0.0.jar`                           |
| Payload format     | **2.0** (HTTP API) — implements `RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>` |

Environment variable:

```
INVENTORY_TABLE=L_InventoryTable
```

### SQS Lambda — `L_InventoryEventService`

| Setting            | Value                                                              |
|---------------------|--------------------------------------------------------------------------|
| Runtime            | Java 21                                                                    |
| Handler            | `com.ecommerce.inventory.handler.InventoryEventHandler::handleRequest`  |
| Deployment package | `target/inventory-service-1.0.0.jar`                                         |
| Memory             | 1024 MB                                                                    |
| Timeout            | 30 seconds                                                                 |
| Trigger            | SQS queue **`L_InventoryQueue`**                                           |

Environment variable:

```
INVENTORY_TABLE=L_InventoryTable
```

If `INVENTORY_TABLE` is unset on either function, the code falls back to the default table name `L_InventoryTable`.

### Required managed IAM policies

**L_InventoryService** (API):

- `AWSLambdaBasicExecutionRole`
- `AmazonDynamoDBFullAccess`

**L_InventoryEventService** (SQS):

- `AWSLambdaBasicExecutionRole`
- `AmazonDynamoDBFullAccess`
- `AmazonSQSFullAccess`

(No IAM role creation or AWS resource provisioning code is included in this repo — attach these policies manually or via your own tooling.)

---

## 3. DynamoDB Table

| Setting        | Value              |
|-----------------|--------------------|
| Table name     | `L_InventoryTable` |
| Partition key  | `productId` (String) |
| Capacity mode  | On-demand          |

This service does not create the table — provision it separately (console, CLI, or your own IaC).

---

## 4. SQS Trigger and SNS Subscription

Attach queue **`L_InventoryQueue`** as the event source trigger for `L_InventoryEventService`.

Subscribe **`L_InventoryQueue`** to the Order Service SNS topic **`L_OrderPlacedTopic`**.

**Enable raw message delivery** on the SNS → SQS subscription so the SQS message body is the plain `ORDER_PLACED` JSON (not wrapped in an SNS envelope).

This service does not create the queue or the SNS subscription — provision that separately. See `DEPLOYMENT_NOTES.md` at the project root for the full wiring checklist.

---

## 5. SQS Event Flow (Stock Reduction)

`InventoryEventHandler` consumes `ORDER_PLACED` events from SQS. Expected message body:

```json
{
  "eventType": "ORDER_PLACED",
  "orderId": "ORD-123",
  "userId": "user123",
  "items": [
    { "productId": "PROD-123", "productName": "Wireless Mouse", "price": 19.99, "quantity": 2 }
  ],
  "totalAmount": 39.98,
  "status": "PLACED",
  "createdAt": "2026-07-01T10:15:30Z"
}
```

For each SQS record:

1. Parse the message body into an `OrderPlacedEvent`.
2. Validate `eventType` is `ORDER_PLACED` and `orderId` is present.
3. For each item, call `inventoryService.reduceStock(productId, quantity)`.
4. Log success or failure per item; continue with remaining items and messages if one fails.

(`L_InventoryEventService` does not return HTTP responses — it returns `Void` and communicates outcomes only via CloudWatch logs.)

---

## 6. API Gateway Route Mappings (HTTP API, Payload v2.0)

All routes integrate with the same Lambda (`InventoryHandler`) via Lambda proxy integration.

| Method | Route                                   | Description                                             |
|--------|-------------------------------------------|-----------------------------------------------------------|
| POST   | `/inventory`                             | Create an inventory record                               |
| GET    | `/inventory`                             | List all inventory records                               |
| GET    | `/inventory/{productId}`                 | Get inventory for a product                               |
| PUT    | `/inventory/{productId}/add-stock`       | Increase `availableQuantity` by `quantity`                |
| PUT    | `/inventory/{productId}/reduce-stock`    | Decrease `availableQuantity` by `quantity` (400 if it would go negative) |
| GET    | `/inventory/low-stock`                   | List records where `availableQuantity <= lowStockThreshold` |
| DELETE | `/inventory/{productId}`                 | Delete an inventory record                                |
| GET    | `/inventory/health`                      | Health check                                              |

CORS is handled inside every Lambda response (`Access-Control-Allow-Origin: *`, etc.), and `OPTIONS` preflight requests are answered directly by the handler.

> **Path normalization**: the handler strips a leading `/default` segment from `rawPath` (relevant if you deploy the HTTP API to a stage literally named `default`), and strips trailing slashes, before routing.

---

## 7. Inventory Fields

```json
{
  "productId": "PROD-1719830000000-a1b2c3d4",
  "availableQuantity": 50,
  "reservedQuantity": 5,
  "lowStockThreshold": 10,
  "lastUpdated": "2026-07-01T10:15:30Z"
}
```

- `productId` links this record to a product created in the Product Service, but this service never calls Product Service — the link is by value only.
- `lastUpdated` is an ISO-8601 timestamp string (`Instant.now().toString()`).

---

## 8. Response Envelope

Every response (success or error) follows this shape:

```json
{
  "success": true,
  "message": "Inventory fetched successfully",
  "data": { ... }
}
```

| Status | Meaning                                              |
|--------|---------------------------------------------------------|
| 200    | OK                                                       |
| 201    | Created                                                  |
| 400    | Bad Request (validation failure, or reduce-stock would go negative) |
| 404    | Not Found (unknown `productId`)                          |
| 500    | Internal Server Error                                    |

---

## 9. Business Rules

- `POST /inventory` requires `productId`; `availableQuantity`, `reservedQuantity`, `lowStockThreshold` are optional and default to `0`, `0`, and `5` respectively if omitted.
- `PUT /inventory/{productId}/add-stock` requires a positive `quantity` in the body; increases `availableQuantity`.
- `PUT /inventory/{productId}/reduce-stock` requires a positive `quantity` in the body; decreases `availableQuantity`. If the result would be negative, the service returns **400 Bad Request** and does not change the stored record.
- `GET /inventory/low-stock` returns every record where `availableQuantity <= lowStockThreshold`.
- `DELETE /inventory/{productId}` performs a hard delete of the DynamoDB item.
- No authentication/authorization is implemented in this service.

---

## 10. Postman Sample Requests

Replace `{{baseUrl}}` with your deployed API Gateway invoke URL, e.g.
`https://abc123.execute-api.us-east-1.amazonaws.com`.

### Create Inventory — `POST {{baseUrl}}/inventory`

```json
{
  "productId": "PROD-1719830000000-a1b2c3d4",
  "availableQuantity": 100,
  "reservedQuantity": 0,
  "lowStockThreshold": 10
}
```

### List All Inventory — `GET {{baseUrl}}/inventory`

No body required.

### Get Inventory By productId — `GET {{baseUrl}}/inventory/PROD-1719830000000-a1b2c3d4`

No body required.

### Add Stock — `PUT {{baseUrl}}/inventory/PROD-1719830000000-a1b2c3d4/add-stock`

```json
{
  "quantity": 20
}
```

### Reduce Stock — `PUT {{baseUrl}}/inventory/PROD-1719830000000-a1b2c3d4/reduce-stock`

```json
{
  "quantity": 5
}
```

If `quantity` exceeds `availableQuantity`, the API responds with `400 Bad Request` and does not modify the record.

### Get Low Stock Products — `GET {{baseUrl}}/inventory/low-stock`

No body required.

### Delete Inventory — `DELETE {{baseUrl}}/inventory/PROD-1719830000000-a1b2c3d4`

No body required.

### Health Check — `GET {{baseUrl}}/inventory/health`

No body required.

---

### (For manual testing) Sample SQS message body to send to L_InventoryQueue

```json
{
  "eventType": "ORDER_PLACED",
  "orderId": "ORD-123",
  "userId": "user123",
  "items": [
    { "productId": "PROD-123", "productName": "Wireless Mouse", "price": 19.99, "quantity": 2 }
  ],
  "totalAmount": 39.98,
  "status": "PLACED",
  "createdAt": "2026-07-01T10:15:30Z"
}
```

---

## 11. Project Structure

```
inventory-service/
├── pom.xml
├── README.md
└── src/main/java/com/ecommerce/inventory/
    ├── handler/
    │   ├── InventoryHandler.java
    │   └── InventoryEventHandler.java
    ├── service/
    │   └── InventoryService.java
    ├── repository/
    │   └── InventoryRepository.java
    ├── model/
    │   ├── Inventory.java
    │   ├── OrderPlacedEvent.java
    │   └── OrderItem.java
    ├── dto/
    │   ├── InventoryRequest.java
    │   ├── StockUpdateRequest.java
    │   ├── InventoryResponse.java
    │   └── ApiResponse.java
    ├── util/
    │   ├── JsonUtil.java
    │   └── ResponseUtil.java
    └── exception/
        ├── InventoryNotFoundException.java
        └── InsufficientStockException.java
```
