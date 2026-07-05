# AWS Deployment Notes — E-Commerce Microservices

Plain Java 21 Lambda services with API Gateway HTTP API (payload v2), DynamoDB, SNS, and SQS.
No Terraform/SAM/CDK in this repo — wire resources manually in AWS Console or CLI.

---

## Architecture Overview

```
POST /orders
  → L_OrderService
  → L_OrderTable
  → SNS L_OrderPlacedTopic
       ├── SQS L_InventoryQueue → L_InventoryEventService → L_InventoryTable
       └── SQS L_PaymentQueue   → L_PaymentEventService   → L_PaymentTable
```

All other services (Product, Cart, Inventory API, Payment API) are synchronous HTTP → DynamoDB only.

---

## DynamoDB Tables

| Table             | Partition key | Used by                          |
|-------------------|---------------|----------------------------------|
| `L_ProductTable`  | `productId`   | Product Service (env: `PRODUCTS_TABLE`; code default may be `ProductsTable` if already deployed — keep env aligned with your table) |
| `L_InventoryTable`| `productId`   | Inventory Service                |
| `L_CartTable`     | `userId`      | Cart Service                     |
| `L_OrderTable`    | `orderId`     | Order Service                    |
| `L_PaymentTable`  | `paymentId`   | Payment Service                  |

Capacity mode: on-demand for all tables.

---

## SNS Topic

| Name                 | Purpose                                      |
|----------------------|----------------------------------------------|
| `L_OrderPlacedTopic` | Fan-out `ORDER_PLACED` events after checkout |

Publisher: **Order Service** only (`L_OrderService`).

---

## SQS Queues

| Queue               | Subscriber Lambda           | Subscribed to SNS topic      |
|---------------------|-------------------------------|------------------------------|
| `L_InventoryQueue`  | `L_InventoryEventService`     | `L_OrderPlacedTopic`         |
| `L_PaymentQueue`    | `L_PaymentEventService`       | `L_OrderPlacedTopic`         |

### SNS → SQS subscription settings (both queues)

1. Subscribe each queue to `L_OrderPlacedTopic`.
2. **Enable raw message delivery** on both subscriptions.
   - The SQS message body must be the plain JSON event, not the SNS wrapper.
3. Grant SNS permission to send to each queue (Console usually adds this automatically).

---

## Lambda Functions

### Product — `L_ProductService`

| Setting   | Value                                                          |
|-----------|----------------------------------------------------------------|
| Handler   | `com.ecommerce.product.handler.ProductHandler::handleRequest`    |
| JAR       | `product-service/target/product-service-1.0.0.jar`               |
| Env       | `PRODUCTS_TABLE=<your product table name>`                       |
| Policies  | `AWSLambdaBasicExecutionRole`, `AmazonDynamoDBFullAccess`      |

### Inventory API — `L_InventoryService`

| Setting   | Value                                                              |
|-----------|--------------------------------------------------------------------|
| Handler   | `com.ecommerce.inventory.handler.InventoryHandler::handleRequest`  |
| JAR       | `inventory-service/target/inventory-service-1.0.0.jar`               |
| Env       | `INVENTORY_TABLE=L_InventoryTable`                                 |
| Policies  | `AWSLambdaBasicExecutionRole`, `AmazonDynamoDBFullAccess`        |

### Inventory Event — `L_InventoryEventService`

| Setting   | Value                                                                   |
|-----------|-------------------------------------------------------------------------|
| Handler   | `com.ecommerce.inventory.handler.InventoryEventHandler::handleRequest`  |
| JAR       | `inventory-service/target/inventory-service-1.0.0.jar` (same JAR)       |
| Env       | `INVENTORY_TABLE=L_InventoryTable`                                      |
| Trigger   | SQS `L_InventoryQueue`                                                  |
| Policies  | `AWSLambdaBasicExecutionRole`, `AmazonDynamoDBFullAccess`, `AmazonSQSFullAccess` |

### Cart — `L_CartService`

| Setting   | Value                                                      |
|-----------|------------------------------------------------------------|
| Handler   | `com.ecommerce.cart.handler.CartHandler::handleRequest`    |
| JAR       | `cart-service/target/cart-service-1.0.0.jar`               |
| Env       | `CART_TABLE=L_CartTable`                                   |
| Policies  | `AWSLambdaBasicExecutionRole`, `AmazonDynamoDBFullAccess`  |

### Order — `L_OrderService`

| Setting   | Value                                                       |
|-----------|-------------------------------------------------------------|
| Handler   | `com.ecommerce.order.handler.OrderHandler::handleRequest`   |
| JAR       | `order-service/target/order-service-1.0.0.jar`              |
| Env       | `ORDER_TABLE=L_OrderTable`                                  |
| Env       | `ORDER_TOPIC_ARN=<ARN of L_OrderPlacedTopic>`               |
| Policies  | `AWSLambdaBasicExecutionRole`, `AmazonDynamoDBFullAccess`, `AmazonSNSFullAccess` |

### Payment API — `L_PaymentService`

| Setting   | Value                                                        |
|-----------|--------------------------------------------------------------|
| Handler   | `com.ecommerce.payment.handler.PaymentHandler::handleRequest`|
| JAR       | `payment-service/target/payment-service-1.0.0.jar`           |
| Env       | `PAYMENT_TABLE=L_PaymentTable`                               |
| Policies  | `AWSLambdaBasicExecutionRole`, `AmazonDynamoDBFullAccess`    |

### Payment Event — `L_PaymentEventService`

| Setting   | Value                                                                 |
|-----------|-----------------------------------------------------------------------|
| Handler   | `com.ecommerce.payment.handler.PaymentEventHandler::handleRequest`    |
| JAR       | `payment-service/target/payment-service-1.0.0.jar` (same JAR)         |
| Env       | `PAYMENT_TABLE=L_PaymentTable`                                        |
| Trigger   | SQS `L_PaymentQueue`                                                  |
| Policies  | `AWSLambdaBasicExecutionRole`, `AmazonDynamoDBFullAccess`, `AmazonSQSFullAccess` |

---

## ORDER_PLACED Event JSON

Published by Order Service to `L_OrderPlacedTopic`:

```json
{
  "eventType": "ORDER_PLACED",
  "orderId": "ORD-1719830000000-a1b2c3d4",
  "userId": "user-123",
  "items": [
    {
      "productId": "PROD-1719830000000-a1b2c3d4",
      "productName": "Wireless Mouse",
      "price": 19.99,
      "quantity": 2
    }
  ],
  "totalAmount": 39.98,
  "status": "PLACED",
  "createdAt": "2026-07-01T10:15:30Z"
}
```

---

## Build Commands

From each service directory:

```bash
mvn clean package -DskipTests
```

| Service   | Output JAR                                              |
|-----------|---------------------------------------------------------|
| Product   | `product-service (1)/product-service/target/product-service-1.0.0.jar` |
| Inventory | `inventory-service/target/inventory-service-1.0.0.jar`  |
| Cart      | `cart-service/target/cart-service-1.0.0.jar`            |
| Order     | `order-service/target/order-service-1.0.0.jar`            |
| Payment   | `payment-service/target/payment-service-1.0.0.jar`      |

Upload the shaded JAR to each Lambda. Inventory and Payment each use **one JAR, two handler strings**.

---

## AWS Wiring Checklist

- [ ] Create DynamoDB tables (see table list above)
- [ ] Create SNS topic `L_OrderPlacedTopic`
- [ ] Create SQS queues `L_InventoryQueue` and `L_PaymentQueue`
- [ ] Subscribe `L_InventoryQueue` to `L_OrderPlacedTopic` with **raw message delivery enabled**
- [ ] Subscribe `L_PaymentQueue` to `L_OrderPlacedTopic` with **raw message delivery enabled**
- [ ] Deploy `L_OrderService` with `ORDER_TOPIC_ARN` set
- [ ] Deploy `L_InventoryEventService` with SQS trigger on `L_InventoryQueue`
- [ ] Deploy `L_PaymentEventService` with SQS trigger on `L_PaymentQueue`
- [ ] Connect API Gateway HTTP API routes to Product, Cart, Inventory, Order, Payment API Lambdas
- [ ] Set payload format **2.0** on all HTTP API integrations

---

## End-to-End Test

1. `POST /products` — create a product
2. `POST /inventory` — create inventory for the same `productId` with sufficient `availableQuantity`
3. `POST /cart/{userId}/items` — add the product to cart
4. `POST /orders` — create order with the same `productId`
   - Order saved in `L_OrderTable`
   - `ORDER_PLACED` published to `L_OrderPlacedTopic`
5. SNS delivers to both SQS queues
6. `L_InventoryEventService` reduces stock in `L_InventoryTable`
7. `L_PaymentEventService` creates payment in `L_PaymentTable`
8. `GET /payments/order/{orderId}` — payment record visible
9. `GET /inventory/{productId}` — reduced `availableQuantity`

Check CloudWatch logs for `L_InventoryEventService` and `L_PaymentEventService` if async steps do not appear immediately.
