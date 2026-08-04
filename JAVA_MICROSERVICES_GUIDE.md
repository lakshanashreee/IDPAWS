# Java Microservices Structure & Learning Guide

Welcome to the Java Learning Guide for the E-Commerce Microservices project! 
This project consists of 5 main backend services (`cart-service`, `inventory-service`, `order-service`, `payment-service`, and `product-service`). They are all built using the same underlying structural template.

If you are learning Java, understanding this template will help you navigate and modify any of the services easily.

---

## 🏗️ The Common Project Template

Each microservice is a standard Maven project. If you open any service (for example, `product-service`), you will find the source code in `src/main/java/com/ecommerce/product`. 

Inside this directory, the code is separated into specific **packages**. Each package has a distinct responsibility. This separation of concerns is a fundamental best practice in Java backend development.

Here is the breakdown of what each package does, with examples from across the services:

### 1. `handler/` (The Entry Point)
**Purpose:** This package contains the AWS Lambda handlers. These classes are the front door to the microservice. When API Gateway routes an HTTP request to Lambda, the execution starts here.
*   **What it does:** It takes the raw JSON event (the HTTP request), parses it, extracts headers or path parameters, passes the data to the `service` layer, and formats the final HTTP response.
*   **Example:** `ProductHandler.java` or `OrderHandler.java`.
*   **Key interface:** Typically implements `RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>` from the AWS SDK.

### 2. `service/` (The Business Logic)
**Purpose:** This is the heart of the application. It contains the core business rules and logic. 
*   **What it does:** It receives validated requests from the `handler`, performs calculations, orchestrates calls to the database, and enforces rules (e.g., "cannot place an order if inventory is 0").
*   **Why it's separate:** By keeping logic here, you can easily write unit tests for it without needing to mock complicated HTTP requests.
*   **Example:** `CartService.java` manages adding items, calculating totals, and clearing the cart. `PaymentService.java` handles payment status transitions.

### 3. `repository/` (The Database Layer)
**Purpose:** This package is exclusively responsible for interacting with the database (Amazon DynamoDB).
*   **What it does:** It uses the AWS SDK (like `DynamoDbEnhancedClient`) to save, read, update, or delete records. No business logic belongs here; it should only contain "CRUD" (Create, Read, Update, Delete) operations.
*   **Example:** `InventoryRepository.java` saves stock counts to the `L_InventoryTable`.

### 4. `model/` (The Database Entities)
**Purpose:** These are standard Java objects (POJOs) that represent the actual records stored in the database. 
*   **What it does:** They use annotations (like `@DynamoDbBean`, `@DynamoDbPartitionKey`) to tell the AWS SDK how to map the Java object to a DynamoDB row.
*   **Example:** `Order.java` represents an order in the database, containing a list of `OrderItem` objects, total price, and status.

### 5. `dto/` (Data Transfer Objects)
**Purpose:** DTOs are objects used to pass data between the client (like a React frontend or Postman) and the backend, or between different layers of the application.
*   **What it does:** They define the JSON structure of API requests and responses. They are often different from `model` classes because you might not want to expose every database field to the client, or the client might send data in a slightly different format.
*   **Example:** `CreateProductRequest.java` (what the client sends) and `ProductResponse.java` (what the server returns).

### 6. `exception/` (Error Handling)
**Purpose:** Contains custom exception classes used to handle specific error scenarios gracefully.
*   **What it does:** Instead of throwing generic Java `RuntimeException`s, we throw specific ones. The `handler` catches these and translates them into appropriate HTTP status codes (e.g., `404 Not Found` or `400 Bad Request`).
*   **Example:** `ResourceNotFoundException.java` (thrown when searching for a product that doesn't exist) or `InsufficientStockException.java`.

### 7. `util/` (Utilities and Helpers)
**Purpose:** A catch-all package for helper classes, constants, or cross-cutting tools.
*   **What it does:** Shared functions that don't belong to a specific business service.
*   **Example:** `SnsPublisher.java` (used in the Order Service to publish messages to SNS) or `JsonUtil.java` for converting objects to JSON strings.

---

## 🔍 How to Read the Code (A Learning Workflow)

If you want to understand how a specific feature works in Java, follow this path:
1.  **Start in the `handler/`**: Look at the `handleRequest` method. See how it identifies which route is being called (e.g., `POST /orders`).
2.  **Follow to the `service/`**: Once you see the handler call something like `orderService.createOrder(...)`, open the Service class and read the business logic.
3.  **Check the `repository/`**: Inside the Service, you will see it call `orderRepository.save(...)`. This is where the data actually gets persisted.
4.  **Look at the `dto/` and `model/`**: Whenever you see an object being passed around, open its class to see what fields it contains.
