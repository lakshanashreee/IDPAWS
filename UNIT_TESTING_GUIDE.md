# Microservices Unit Testing Guide & Handbook

This guide provides complete documentation on the unit testing suite implemented across all microservices in the **E-Commerce AWS Serverless Architecture**.

---

## 1. Unit Testing Overview

The architecture utilizes **JUnit 5 (Jupiter)** and **Mockito** for unit testing. All tests run **100% offline** locally by using Mockito mocks for external AWS services (Amazon DynamoDB, S3, SNS, Cognito).

### Microservices Test Matrix

| Microservice | Test Class | Test Cases Covered | Total Tests | Status |
| :--- | :--- | :--- | :---: | :---: |
| **Product Service** | `ProductServiceTest` | Create, Read All, Get By ID, Update, Delete, Validation, S3 Presigned URLs | 7 | `PASSED` |
| **Cart Service** | `CartServiceTest` | Add Item, Quantity Increment, Get Cart, Cart Summary, Update Quantity, Remove Item, Clear Cart | 8 | `PASSED` |
| **Order Service** | `OrderServiceTest` | Create Order, Items Validation, Get By ID, Get By User ID, Status Transition, Delete, SNS Fallback | 8 | `PASSED` |
| **Payment Service** | `PaymentServiceTest` | OrderPlaced SQS Event Ingestion, Direct Payment Request, Get By ID, Get By Order ID, Status Update | 6 | `PASSED` |
| **Inventory Service** | `InventoryServiceTest` | Initialize Stock, Add Stock, Reduce Stock, Insufficient Stock Guard, Low Stock Threshold Filter, Delete | 8 | `PASSED` |
| **Cognito Trigger Service** | `PostConfirmationHandlerTest` | PostConfirmation Event Ingestion, User Group Assignment ("CUSTOMER"), Ignored Trigger Filters | 3 | `PASSED` |
| **TOTAL** | | | **40 Tests** | **100% PASS** |

---

## 2. Prerequisites

To execute the unit tests, ensure you have the following installed on your environment:

1. **Java JDK 21** or higher (`java -version`)
2. **Apache Maven 3.9+** (`mvn -v`)

---

## 3. How to Execute Unit Tests

### Option A: Run Unit Tests for a Single Service

Navigate to the directory of any microservice and execute `mvn test`:

#### 1. Product Service:
```bash
cd product-service
mvn test
```

#### 2. Cart Service:
```bash
cd cart-service
mvn test
```

#### 3. Order Service:
```bash
cd order-service
mvn test
```

#### 4. Payment Service:
```bash
cd payment-service
mvn test
```

#### 5. Inventory Service:
```bash
cd inventory-service
mvn test
```

#### 6. Cognito Trigger Service:
```bash
cd cognito-trigger-service
mvn test
```

---

### Option B: Run All Unit Tests Across ALL Microservices in One Command

#### Windows PowerShell:
```powershell
Get-ChildItem -Directory -Filter "*service*" | ForEach-Object { Set-Location $_.FullName; Write-Host "=== Testing $($_.Name) ===" -ForegroundColor Gold; mvn test }
```

#### Windows Command Prompt (CMD):
```cmd
cmd /c "cd product-service && mvn test && cd ../cart-service && mvn test && cd ../order-service && mvn test && cd ../payment-service && mvn test && cd ../inventory-service && mvn test && cd ../cognito-trigger-service && mvn test"
```

---

## 4. Test Reports & Inspection

When Maven runs unit tests, test reports are generated under each service's target directory:

```text
<service-directory>/target/surefire-reports/
├── com.ecommerce.<service>.service.<TestClass>.txt
└── TEST-com.ecommerce.<service>.service.<TestClass>.xml
```

You can view the summary directly in the terminal output:

```text
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.ecommerce.product.service.ProductServiceTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.915 s
[INFO] BUILD SUCCESS
```

---

## 5. How Mocking Works (Offline Testing)

All service constructors accept repository interface/object injection. For example, in `OrderService.java`:

```java
public OrderService(OrderRepository orderRepository, S3Publisher snsPublisher) {
    this.orderRepository = orderRepository;
    this.snsPublisher = snsPublisher;
}
```

In unit tests (`OrderServiceTest.java`), Mockito injects dummy mock implementations:

```java
@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private SnsPublisher snsPublisher;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, snsPublisher);
    }
}
```

This guarantees tests run instantly without making real network requests to AWS AWS cloud endpoints.

---

## 6. Adding New Unit Tests

To add a new unit test:
1. Open the test file under `<service>/src/test/java/.../<Service>Test.java`.
2. Annotate your test method with `@Test`.
3. Use standard JUnit 5 assertions (`assertEquals`, `assertNotNull`, `assertTrue`, `assertThrows`).
4. Re-run `mvn test`.
