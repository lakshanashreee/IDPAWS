# AWS Project Architecture & DevOps Guide

Welcome to the comprehensive guide for the E-Commerce Serverless Application. This document explains the underlying AWS services, the CI/CD pipeline, how infrastructure is managed with Terraform, and the unit testing strategy.

---

## 🏗️ 1. Architecture & AWS Services

This project is an **E-Commerce Application** built using a modern AWS Serverless Microservices architecture. 

### Core Flow
```text
POST /orders
  → L_OrderService (Lambda)
  → L_OrderTable (DynamoDB)
  → L_OrderPlacedTopic (SNS)
       ├── SQS L_InventoryQueue → L_InventoryEventService (Lambda) → L_InventoryTable (DynamoDB)
       └── SQS L_PaymentQueue   → L_PaymentEventService (Lambda)   → L_PaymentTable (DynamoDB)
```

### AWS Services Utilized
*   **Amazon API Gateway (HTTP API v2)**: Acts as the single entry point. It validates JWT tokens from Cognito and routes traffic to the appropriate Lambda function.
*   **AWS Lambda**: Runs plain Java 21 handlers containing our business logic.
*   **Amazon DynamoDB**: NoSQL database for ultra-fast, predictable performance. Each microservice has its own table (e.g., `L_ProductTable`, `L_OrderTable`) with on-demand capacity.
*   **Amazon SNS (Simple Notification Service)**: Used for publish/subscribe messaging. The Order Service publishes an `ORDER_PLACED` event to the `L_OrderPlacedTopic`.
*   **Amazon SQS (Simple Queue Service)**: Used for decoupling and reliable asynchronous processing. `L_InventoryQueue` and `L_PaymentQueue` subscribe to the SNS topic. Event-driven Lambdas consume these queues.
*   **Amazon Cognito**: Manages user authentication and authorization (RBAC). It issues JWT tokens for customers and admins.

### AWS Wiring Checklist
When setting up manually without Terraform:
- Create DynamoDB tables (Partition keys: `productId`, `userId`, `orderId`, `paymentId`).
- Create SNS topic `L_OrderPlacedTopic` and SQS queues (`L_InventoryQueue`, `L_PaymentQueue`).
- Subscribe queues to the SNS topic with **raw message delivery enabled**.
- Connect API Gateway routes to the Lambdas with Payload Format 2.0.

---

## 🚀 2. CI/CD Pipeline (GitLab CI)

The `.gitlab-ci.yml` automates testing, building, and deployment.

1.  **Validate**: Runs `mvn validate` to check the parent `pom.xml` structure.
2.  **Build**:
    *   **Backend**: `mvn clean package` compiles 7 Java microservices into deployable `.jar` files.
    *   **Frontend**: Installs Node dependencies and builds the React app into `dist/`.
3.  **Test**: Runs unit tests offline across all microservices using Maven.
4.  **SonarQube Analysis**: Scans for vulnerabilities, bugs, and code smells on the `main` branch.
5.  **Terraform Validate & Plan**: Initializes Terraform, checking what AWS infrastructure needs changing before applying.
6.  **Deploy (Manual)**:
    *   **Backend**: Uses AWS CLI to deploy `.jar` files to Lambda.
    *   **Frontend**: Syncs `dist/` to an S3 bucket for website hosting.
7.  **CloudFront Invalidation**: Clears the CDN cache so users see the latest frontend immediately.

---

## 🌍 3. Infrastructure as Code (Terraform)

While this project allows for manual wiring, production infrastructure is defined as code in the `terraform/` directory. 
*   **Benefit**: Your infrastructure (Cognito Pools, API Gateway, DynamoDB, S3, CloudFront) is version-controlled and completely reproducible.
*   The GitLab pipeline automatically runs `terraform plan` to preview infrastructure changes safely.

---

## 🧪 4. Unit Testing Strategy

All microservices are thoroughly tested using **JUnit 5 (Jupiter)** and **Mockito**. The test suite is designed to run **100% offline**.

### Mocking External AWS Services
Instead of hitting live AWS endpoints, Mockito injects dummy implementations.
```java
@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {
    @Mock
    private OrderRepository orderRepository; // Mocks DynamoDB
    @Mock
    private SnsPublisher snsPublisher;       // Mocks SNS

    private OrderService orderService;
    
    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, snsPublisher);
    }
}
```

### Execution
Run tests for a single service:
```bash
cd product-service
mvn test
```
Or run across the whole workspace using PowerShell:
```powershell
Get-ChildItem -Directory -Filter "*service*" | ForEach-Object { Set-Location $_.FullName; mvn test }
```
Test reports are generated in the `target/surefire-reports/` folder of each microservice.

---

## 🔐 5. Cognito Setup Notes
*   **App Client**: Ensure "Generate client secret" is **disabled** for browser-based apps.
*   **Auth Flows**: Enable `ALLOW_USER_PASSWORD_AUTH` and `ALLOW_REFRESH_TOKEN_AUTH`.
*   **RBAC**: Create `ADMIN` and `CUSTOMER` groups. Users can be assigned automatically via a Post Confirmation Lambda trigger.
