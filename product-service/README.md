# product-service

AWS Serverless **Product Service** — Java 21, AWS Lambda, API Gateway, DynamoDB (AWS SDK v2), Jackson.
No Spring Boot, no Tomcat, no frontend, no IaC included.

---

## 1. Build

```bash
mvn clean package -DskipTests
```

Produces a fat JAR (via `maven-shade-plugin`) at:

```
target/product-service-1.0.0.jar
```

Upload this JAR directly as the Lambda deployment package.

---

## 2. Lambda Configuration

| Setting            | Value                                                    |
|---------------------|-----------------------------------------------------------|
| Runtime            | Java 21                                                  |
| Handler            | `com.ecommerce.product.handler.ProductHandler::handleRequest` |
| Deployment package | `target/product-service-1.0.0.jar`                       |

### Environment variable

```
PRODUCTS_TABLE=ProductsTable
```

If unset, the code falls back to the default table name `ProductsTable`.

### Required managed IAM policies on the Lambda execution role

- `AWSLambdaBasicExecutionRole`
- `AmazonDynamoDBFullAccess`

(No IAM role creation or AWS resource provisioning code is included in this repo — attach these policies manually or via your own tooling.)

---

## 3. DynamoDB Table

| Setting        | Value          |
|-----------------|----------------|
| Table name     | `ProductsTable` |
| Partition key  | `productId` (String) |
| Capacity mode  | On-demand      |

This service does not create the table — provision it separately (console, CLI, or your own IaC).

---

## 4. API Gateway Route Mappings (HTTP API)

All routes integrate with the same Lambda (`ProductHandler`) via Lambda proxy integration.

| Method | Route                              | Description                          |
|--------|-------------------------------------|---------------------------------------|
| POST   | `/products`                        | Create a product                     |
| GET    | `/products`                        | List all **active** products         |
| GET    | `/products/{productId}`            | Get a product by id (active or not)  |
| PUT    | `/products/{productId}`            | Update a product                     |
| DELETE | `/products/{productId}`            | Soft-delete a product (`active=false`) |
| GET    | `/products/category/{category}`    | List active products in a category (case-insensitive) |
| GET    | `/products/health`                 | Health check                         |

CORS is handled inside every Lambda response (`Access-Control-Allow-Origin: *`, etc.), and `OPTIONS` preflight requests are answered directly by the handler.

---

## 5. Product Fields

```json
{
  "productId": "PROD-1719830000000-a1b2c3d4",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "category": "Electronics",
  "price": 19.99,
  "active": true,
  "createdAt": "2026-07-01T10:15:30Z",
  "updatedAt": "2026-07-01T10:15:30Z"
}
```

> `quantity` is intentionally **not** part of the Product model — stock ownership belongs to the Inventory service.

Cart and Order services can safely read `productId`, `name`, `price`, `category`, and `active` directly from `ProductsTable` for validation.

---

## 6. Response Envelope

Every response (success or error) follows this shape:

```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": { ... }
}
```

| Status | Meaning                                  |
|--------|--------------------------------------------|
| 200    | OK                                         |
| 201    | Created                                    |
| 400    | Bad Request (validation failure)           |
| 404    | Not Found (unknown `productId`)            |
| 500    | Internal Server Error                      |

---

## 7. Business Rules

- `name`, `category` are required; `price` must be `>= 0`.
- `DELETE` performs a **soft delete**: sets `active=false`, updates `updatedAt`, and keeps the item in DynamoDB — this avoids broken references for Cart/Order services.
- `GET /products` returns **active-only** products.
- `GET /products/{productId}` returns the product regardless of active status (so downstream services can still see `active=false`).
- `GET /products/category/{category}` returns **active-only** products, matched case-insensitively.
- `createdAt` / `updatedAt` are ISO-8601 timestamp strings (`Instant.now().toString()`).
- No authentication/authorization is implemented in this service.

---

## 8. Postman Sample Requests

Replace `{{baseUrl}}` with your deployed API Gateway invoke URL, e.g.
`https://abc123.execute-api.us-east-1.amazonaws.com`.

### Create Product — `POST {{baseUrl}}/products`

```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "category": "Electronics",
  "price": 19.99
}
```

### List All Active Products — `GET {{baseUrl}}/products`

No body required.

### Get Product By Id — `GET {{baseUrl}}/products/PROD-1719830000000-a1b2c3d4`

No body required.

### Update Product — `PUT {{baseUrl}}/products/PROD-1719830000000-a1b2c3d4`

```json
{
  "name": "Wireless Mouse (2.4GHz)",
  "description": "Ergonomic wireless mouse with USB-C receiver",
  "category": "Electronics",
  "price": 24.99,
  "active": true
}
```

### Delete Product (soft delete) — `DELETE {{baseUrl}}/products/PROD-1719830000000-a1b2c3d4`

No body required.

### Get Products By Category — `GET {{baseUrl}}/products/category/electronics`

No body required. Matching is case-insensitive, so `electronics`, `Electronics`, and `ELECTRONICS` all match.

### Health Check — `GET {{baseUrl}}/products/health`

No body required.

---

## 9. Project Structure

```
product-service/
├── pom.xml
├── README.md
└── src/main/java/com/ecommerce/product/
    ├── handler/
    │   └── ProductHandler.java
    ├── service/
    │   └── ProductService.java
    ├── repository/
    │   └── ProductRepository.java
    ├── model/
    │   └── Product.java
    ├── dto/
    │   ├── ProductRequest.java
    │   ├── ProductResponse.java
    │   └── ApiResponse.java
    ├── util/
    │   ├── JsonUtil.java
    │   ├── ResponseUtil.java
    │   └── IdGenerator.java
    └── exception/
        └── ProductNotFoundException.java
```
