# cart-service

AWS Serverless **Cart Service** — Java 21, AWS Lambda, API Gateway HTTP API (payload format 2.0), DynamoDB (AWS SDK v2), Jackson.

No Spring Boot, no Spring Framework, no JPA/Hibernate, no Spring Data, no Tomcat/embedded server, no MongoDB. No SAM, CDK, Terraform, or Docker used to build or deploy this project.

This service is **completely independent**. It does not call the Product Service, Inventory Service, or any other service directly. Cross-service communication (e.g. validating that a `productId` exists in Product Service) will be added later using SNS/SQS.

---

## 1. Build

```bash
mvn clean package -DskipTests
```

Produces a fat JAR (via `maven-shade-plugin`) at:

```
target/cart-service-1.0.0.jar
```

Upload this JAR directly as the Lambda deployment package.

---

## 2. Lambda Configuration

| Setting            | Value                                                    |
|---------------------|-------------------------------------------------------------|
| Lambda name        | `L_CartService`                                             |
| Runtime            | Java 21                                                     |
| Handler            | `com.ecommerce.cart.handler.CartHandler::handleRequest`     |
| Deployment package | `target/cart-service-1.0.0.jar`                             |
| Payload format     | **2.0** (HTTP API) — the handler implements `RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>` |

### Environment variable

```
CART_TABLE=L_CartTable
```

If unset, the code falls back to the default table name `L_CartTable`.

### Required managed IAM policies on the Lambda execution role

- `AWSLambdaBasicExecutionRole`
- `AmazonDynamoDBFullAccess`

(No IAM role creation or AWS resource provisioning code is included in this repo — attach these policies manually or via your own tooling.)

---

## 3. DynamoDB Table

| Setting        | Value          |
|-----------------|----------------|
| Table name     | `L_CartTable`  |
| Partition key  | `userId` (String) |
| Capacity mode  | On-demand      |

One item exists per `userId`. The `items` attribute is stored as a DynamoDB **List of Maps** — one map per cart line item (`productId`, `productName`, `price`, `quantity`, `updatedAt`).

This service does not create the table — provision it separately (console, CLI, or your own IaC).

---

## 4. API Gateway Route Mappings (HTTP API, Payload v2.0)

All routes integrate with the same Lambda (`CartHandler`) via Lambda proxy integration.

| Method | Route                                    | Description                                     |
|--------|---------------------------------------------|----------------------------------------------------|
| POST   | `/cart/{userId}/items`                     | Add a product to the cart (bumps quantity if it already exists) |
| GET    | `/cart/{userId}`                           | Return the complete cart                            |
| GET    | `/cart/{userId}/summary`                   | Return `totalItems`, `totalQuantity`, `totalAmount` |
| PUT    | `/cart/{userId}/items/{productId}`         | Update the quantity of one item                     |
| DELETE | `/cart/{userId}/items/{productId}`         | Remove one item from the cart                        |
| DELETE | `/cart/{userId}/clear`                     | Delete the entire cart record                        |
| GET    | `/cart/health`                             | Health check                                         |

CORS is handled inside every Lambda response (`Access-Control-Allow-Origin: *`, etc.), and `OPTIONS` preflight requests are answered directly by the handler.

> **Path normalization**: the handler strips a leading `/default` segment from `rawPath` (relevant if you deploy the HTTP API to a stage literally named `default`), and strips trailing slashes, before routing.

---

## 5. Cart Fields

```json
{
  "userId": "user-123",
  "items": [
    {
      "productId": "PROD-1719830000000-a1b2c3d4",
      "productName": "Wireless Mouse",
      "price": 19.99,
      "quantity": 2,
      "updatedAt": "2026-07-01T10:15:30Z"
    }
  ]
}
```

- `updatedAt` on each item is an ISO-8601 timestamp string (`Instant.now().toString()`), refreshed whenever that item's quantity changes.
- `productId` links back to a product created in the Product Service, but this service never calls Product Service directly.

---

## 6. Response Envelope

Every response (success or error) follows this shape:

```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "data": { ... }
}
```

| Status | Meaning                                                     |
|--------|------------------------------------------------------------------|
| 200    | OK                                                                 |
| 201    | Created (item added)                                               |
| 400    | Bad Request (validation failure)                                   |
| 404    | Not Found (unknown cart item, e.g. updating/removing a product that isn't in the cart) |
| 500    | Internal Server Error                                              |

---

## 7. Business Rules

- `POST /cart/{userId}/items` requires `productId`, `productName`, `price >= 0`, and a positive `quantity`. If the product is already in the cart, its `quantity` is **increased** by the new amount (and `productName`/`price` are refreshed from the request) rather than adding a duplicate line.
- `GET /cart/{userId}` returns an **empty cart** (not a 404) if the user has never added anything — a cart is implicitly created on the first item add.
- `GET /cart/{userId}/summary` returns zeroed totals if no cart exists yet.
- `PUT /cart/{userId}/items/{productId}` requires a positive `quantity`; returns 404 if the cart or the item doesn't exist.
- `DELETE /cart/{userId}/items/{productId}` returns 404 if the cart or the item doesn't exist.
- `DELETE /cart/{userId}/clear` deletes the entire cart record from DynamoDB and is idempotent (succeeds even if no cart exists).
- No authentication/authorization is implemented in this service.

---

## 8. Postman Sample Requests

Replace `{{baseUrl}}` with your deployed API Gateway invoke URL, e.g.
`https://abc123.execute-api.us-east-1.amazonaws.com`.

### Add Product to Cart — `POST {{baseUrl}}/cart/user-123/items`

```json
{
  "productId": "PROD-1719830000000-a1b2c3d4",
  "productName": "Wireless Mouse",
  "price": 19.99,
  "quantity": 2
}
```

### Get Full Cart — `GET {{baseUrl}}/cart/user-123`

No body required.

### Get Cart Summary — `GET {{baseUrl}}/cart/user-123/summary`

No body required.

### Update Item Quantity — `PUT {{baseUrl}}/cart/user-123/items/PROD-1719830000000-a1b2c3d4`

```json
{
  "quantity": 5
}
```

### Remove Item — `DELETE {{baseUrl}}/cart/user-123/items/PROD-1719830000000-a1b2c3d4`

No body required.

### Clear Cart — `DELETE {{baseUrl}}/cart/user-123/clear`

No body required.

### Health Check — `GET {{baseUrl}}/cart/health`

No body required.

---

## 9. Project Structure

```
cart-service/
├── pom.xml
├── README.md
└── src/main/java/com/ecommerce/cart/
    ├── handler/
    │   └── CartHandler.java
    ├── service/
    │   └── CartService.java
    ├── repository/
    │   └── CartRepository.java
    ├── model/
    │   ├── Cart.java
    │   └── CartItem.java
    ├── dto/
    │   ├── AddCartItemRequest.java
    │   ├── UpdateCartItemRequest.java
    │   ├── CartItemResponse.java
    │   ├── CartResponse.java
    │   ├── CartSummaryResponse.java
    │   └── ApiResponse.java
    ├── util/
    │   ├── JsonUtil.java
    │   └── ResponseUtil.java
    └── exception/
        ├── CartNotFoundException.java
        └── CartItemNotFoundException.java
```
