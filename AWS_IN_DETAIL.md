# AWS IN DETAIL: The Definitive Serverless Architecture Guide

Welcome to the deep-dive architectural document for the E-Commerce Serverless Microservices project. This guide meticulously breaks down every AWS service utilized in our infrastructure. We will explore exactly **what** the service is, **why** it was chosen, **how** it operates behind the scenes, and most importantly, **where** to find its implementation in our codebase.

This document serves as the absolute source of truth for understanding the complex interplay between Terraform Infrastructure-as-Code, plain Java Lambda functions, event-driven messaging (SNS/SQS), NoSQL data persistence (DynamoDB), and global content delivery (CloudFront).

---

## 1. AWS Lambda: The Compute Engine

### What is AWS Lambda?
AWS Lambda is a serverless, event-driven compute service that lets you run code for virtually any type of application or backend service without provisioning or managing servers. You pay only for the compute time you consume—there is no charge when your code is not running.

### How is it used in our project?
In our E-Commerce platform, Lambda serves as the core backend compute layer. Instead of running a monolithic Spring Boot application on an EC2 instance that runs 24/7, our business logic is broken down into 7 distinct Java microservices:
1. `product-service`
2. `inventory-service`
3. `cart-service`
4. `order-service`
5. `payment-service`
6. `inventory-event-service` (Asynchronous event consumer)
7. `payment-event-service` (Asynchronous event consumer)

### Code Deep Dive & Implementation Details
**File References:**
- `pom.xml` (Root and all submodules)
- `product-service/src/main/java/com/ecommerce/product/handler/ProductHandler.java`
- `.gitlab-ci.yml` (Deployment stage)

Our Lambda functions are written in **Plain Java 21** and built using **Maven**. We deliberately avoided heavy frameworks like Spring Boot to eliminate "Cold Start" latency—the time it takes for AWS to spin up a new container and initialize the application context.

If you look at any of the `pom.xml` files inside our services (e.g., `product-service/pom.xml`), you will see the following crucial dependencies:
```xml
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-lambda-java-core</artifactId>
    <version>1.2.3</version>
</dependency>
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-lambda-java-events</artifactId>
    <version>3.11.4</version>
</dependency>
```
These libraries provide the native interfaces required by AWS. Our entry points (the Handlers) implement `RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent>`. 

Behind the scenes, when an HTTP request hits API Gateway, AWS spins up a secure Firecracker microVM. The Java Runtime Environment (JRE 21) is launched, and our Handler class is instantiated. The request payload, headers, and path parameters are mapped into the `APIGatewayProxyRequestEvent` object. Our Java code processes this, interacts with DynamoDB, and returns an `APIGatewayProxyResponseEvent` containing the HTTP status code and JSON body.

During deployment, the `maven-shade-plugin` bundles our code and all its dependencies into a single "Fat JAR". Our GitLab CI pipeline (`.gitlab-ci.yml`) then uses the AWS CLI to deploy this JAR directly to the Lambda function:
```bash
aws lambda update-function-code --function-name L_ProductService --zip-file fileb://product-service/target/product-service-1.0.0.jar
```

---

## 2. Amazon API Gateway: The Front Door

### What is API Gateway?
Amazon API Gateway is a fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale. We use **HTTP APIs (v2)**, which are optimized for serverless workloads and offer lower latency and lower cost compared to REST APIs.

### How is it used in our project?
API Gateway acts as the single entry point (the "Front Door") for our React frontend to communicate with the Java backend. 

### Implementation Details
When a user visits the frontend and attempts to fetch the product catalog, the React app makes an HTTP GET request to our API Gateway endpoint (e.g., `https://api.our-ecommerce.com/products`). 

**The routing flow works as follows:**
1. **Request Reception:** API Gateway receives the HTTPS request.
2. **Authentication (JWT):** For protected routes (like `/cart` or `/orders`), API Gateway automatically integrates with Amazon Cognito. It inspects the `Authorization` header, extracts the JWT (JSON Web Token), and mathematically verifies its signature against the Cognito User Pool's public keys. If the token is invalid or expired, API Gateway immediately returns a `401 Unauthorized` without ever invoking our Lambda function (saving us compute costs).
3. **Payload Format 2.0:** We use Payload Format 2.0, which dictates how the HTTP request is transformed into a JSON payload. This JSON is passed directly to the Lambda function's `APIGatewayProxyRequestEvent`.
4. **Proxy Integration:** The request is routed to the corresponding Lambda (e.g., `L_ProductService`). API Gateway waits for the Lambda to return its `APIGatewayProxyResponseEvent` and translates it back into a standard HTTP response for the frontend.

---

## 3. Amazon DynamoDB: The Serverless Database

### What is DynamoDB?
Amazon DynamoDB is a fully managed, serverless, key-value NoSQL database designed to run high-performance applications at any scale. It provides single-digit millisecond performance and automatic scaling.

### How is it used in our project?
Following microservice best practices, we use a **Database-per-Service** pattern. Each microservice owns its data and stores it in isolated DynamoDB tables:
- `L_ProductTable`
- `L_InventoryTable`
- `L_CartTable`
- `L_OrderTable`
- `L_PaymentTable`

### Code Deep Dive & Implementation Details
**File References:**
- `terraform/dynamodb.tf`
- `cart-service/src/main/java/com/ecommerce/cart/repository/CartRepository.java`
- `order-service/src/main/java/com/ecommerce/order/repository/OrderRepository.java`

If we look at our Terraform infrastructure (`terraform/dynamodb.tf`), we explicitly define these tables:
```hcl
resource "aws_dynamodb_table" "order_table" {
  name         = "L_OrderTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "orderId"

  attribute {
    name = "orderId"
    type = "S"
  }
}
```
Notice the `billing_mode = "PAY_PER_REQUEST"`. We use On-Demand capacity, meaning we don't provision read/write throughput in advance. We only pay for the exact number of database reads and writes our application performs. The `hash_key` (Partition Key) ensures data is evenly distributed across physical storage partitions in the AWS data center.

In our Java code, we use the **AWS SDK v2** for DynamoDB (`software.amazon.awssdk:dynamodb`). Inside classes like `CartRepository.java`, we inject the `DynamoDbClient`. When a user adds an item to their cart, our repository constructs a `PutItemRequest`, serializes the Java `Cart` object into a Map of `AttributeValue` objects, and executes the call. 
Because DynamoDB is schema-less, we don't have to manage complex database migrations; we simply write the JSON-like data directly to the table.

---

## 4. Amazon SNS (Simple Notification Service) & SQS (Simple Queue Service): The Event-Driven Backbone

### What are SNS and SQS?
- **SNS** is a fully managed Pub/Sub (Publish/Subscribe) messaging service. It allows a central system to broadcast messages to multiple subscribers simultaneously.
- **SQS** is a fully managed message queuing service. It allows you to decouple and scale microservices, serverless applications, and distributed systems by holding messages in a queue until a consumer is ready to process them.

### How are they used in our project?
Our system heavily relies on asynchronous, event-driven architecture to ensure high availability and prevent cascading failures. 

**The "Order Placed" Flow:**
When a user successfully places an order via the `order-service`, several things need to happen in the background:
1. Inventory must be deducted.
2. A payment must be processed.

Instead of the `order-service` making synchronous HTTP calls to the `inventory-service` and `payment-service` (which could fail and cause timeouts), the `order-service` simply shouts into the void: *"An order was placed!"*

### Code Deep Dive & Implementation Details
**File References:**
- `terraform/sns.tf`
- `terraform/sqs.tf`
- `order-service/src/main/java/com/ecommerce/order/util/SnsPublisher.java`

In `terraform/sns.tf`, we provision the topic:
```hcl
resource "aws_sns_topic" "order_placed_topic" {
  name = "L_OrderPlacedTopic"
}
```
In `terraform/sqs.tf`, we provision the queues and subscribe them to the SNS topic:
```hcl
resource "aws_sqs_queue" "inventory_queue" {
  name = "L_InventoryQueue"
}

resource "aws_sns_topic_subscription" "inventory_sqs_target" {
  topic_arn            = aws_sns_topic.order_placed_topic.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.inventory_queue.arn
  raw_message_delivery = true
}
```

Behind the scenes:
1. Inside `SnsPublisher.java`, the `order-service` constructs a JSON payload containing the `orderId` and purchased items. It uses the `SnsClient` to publish this JSON to the `L_OrderPlacedTopic`.
2. SNS immediately replicates this message and pushes it into **both** `L_InventoryQueue` and `L_PaymentQueue`. We use `raw_message_delivery = true` so SQS receives the pure JSON payload without SNS metadata wrappers.
3. AWS Lambda natively polls these SQS queues. As soon as a message lands in `L_InventoryQueue`, AWS automatically invokes the `L_InventoryEventService` (Lambda), passing the SQS message as the event payload. 
4. The event Lambdas process the messages and update their respective DynamoDB tables. If the `inventory-event-service` crashes, the message remains safely in the SQS queue and will be retried automatically based on our visibility timeout settings.

---

## 5. Terraform: Infrastructure as Code

### What is Terraform?
Terraform by HashiCorp is an Infrastructure as Code (IaC) tool that allows you to define both cloud and on-prem resources in human-readable configuration files that you can version, reuse, and share.

### How is it used in our project?
Instead of clicking around the AWS Management Console to manually create databases, queues, and user pools, we define our desired state in the `terraform/` directory using HCL (HashiCorp Configuration Language).

### Code Deep Dive & Implementation Details
**File References:**
- `terraform/providers.tf`
- `terraform/variables.tf`
- `terraform/cognito.tf`
- `.gitlab-ci.yml`

Our setup starts in `providers.tf`, where we tell Terraform we are using the AWS provider:
```hcl
provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}
```
When we run `terraform apply`, the Terraform core engine reads our `.tf` files, calculates the dependency graph, and makes API calls to AWS to create the resources exactly as defined. It then creates a `terraform.tfstate` file, which is a JSON map of our code configuration to the physical AWS resource IDs.

In our `.gitlab-ci.yml` pipeline, we run `terraform plan`. This allows the CI pipeline to safely evaluate if any infrastructure code has changed and outputs a preview of what will be created, modified, or destroyed, ensuring no accidental deletions happen in production.

---

## 6. Amazon CloudFront & S3: Global Content Delivery

### What are CloudFront and S3?
- **Amazon S3 (Simple Storage Service)** is highly durable object storage.
- **Amazon CloudFront** is a global Content Delivery Network (CDN) that securely delivers data, videos, applications, and APIs to customers globally with low latency.

### How are they used in our project?
Our React + Vite frontend is a Single Page Application (SPA). Because it consists entirely of static files (HTML, CSS, JS), we do not need a web server like Apache or Nginx to host it. 

### Implementation Details
**File References:**
- `.gitlab-ci.yml`

During the `deploy_frontend` stage in our GitLab CI pipeline, the runner builds our Vite application into the `frontend/dist/` directory. It then uses the AWS CLI to sync these files to an S3 bucket configured for static website hosting:
```bash
aws s3 sync frontend/dist/ s3://l-frontend/ --delete
```

However, serving directly from S3 is slow for users far away from our AWS region (ap-southeast-1). To solve this, we place **Amazon CloudFront** in front of the S3 bucket.
CloudFront has hundreds of Edge Locations worldwide. When a user in New York requests our website, CloudFront fetches the static files from the S3 bucket in Singapore *once*, and caches them in the New York Edge Location. Subsequent users in New York get millisecond response times because they are served directly from the cache.

When we deploy a new version of our frontend code, we run the `cloudfront_invalidation` step in our CI pipeline:
```bash
aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths "/*"
```
This API call explicitly tells CloudFront to wipe its global cache, forcing all Edge Locations to fetch the fresh, updated `index.html` and JavaScript bundles from our S3 bucket.

---

## Summary

By combining these AWS services, our E-Commerce platform achieves true cloud-native nirvana:
- **Zero Server Maintenance:** No operating systems to patch, no Tomcat servers to tune.
- **Infinite Scalability:** API Gateway and Lambda automatically scale from zero to thousands of concurrent requests in seconds. DynamoDB handles massive read/write spikes effortlessly.
- **Extreme Resilience:** By decoupling our services with SNS and SQS, if the Payment Service goes down, the Order Service remains fully operational, and payment processing simply resumes when the service recovers.
- **Global Performance:** CloudFront ensures our React application loads instantly anywhere in the world. 
- **Developer Agility:** Terraform and GitLab CI provide a fully automated, version-controlled deployment pipeline.

This architecture represents the pinnacle of modern software engineering on Amazon Web Services.
