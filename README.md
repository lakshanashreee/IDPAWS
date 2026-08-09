<div align="center">
  <img src="https://placehold.co/800x200/0f172a/38bdf8?text=LAURITE+E-Commerce+Platform&font=playfair-display" alt="LAURITE Banner">
  
  <h1>LAURITE: Enterprise Cloud-Native Serverless E-Commerce</h1>

  <p>
    A high-performance, event-driven serverless platform built with <b>React + Vite</b>, <b>Java 21 Microservices</b>, <b>Terraform IaC</b>, and <b>AWS Cloud Infrastructure</b>.
  </p>

  <!-- Badges -->
  <p>
    <a href="#-architecture--event-driven-flow"><img src="https://img.shields.io/badge/Architecture-Event--Driven-007396?style=for-the-badge&logo=amazonaws&logoColor=white" alt="Architecture"></a>
    <a href="#-ci-cd--security-pipeline"><img src="https://img.shields.io/badge/Security-SonarQube%20%2B%20Snyk-46E3B7?style=for-the-badge&logo=sonarqube&logoColor=black" alt="Security"></a>
    <a href="#-quick-start-guide"><img src="https://img.shields.io/badge/Deployment-GitLab%20CI%2FCD-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white" alt="Deployment"></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/Backend-Java%2021%20Microservices-007396?style=flat-square&logo=java&logoColor=white" alt="Java">
    <img src="https://img.shields.io/badge/Cloud-AWS%20Lambda%20%2B%20DynamoDB-232F3E?style=flat-square&logo=amazonaws&logoColor=white" alt="AWS">
    <img src="https://img.shields.io/badge/IaC-Terraform-7B42BC?style=flat-square&logo=terraform&logoColor=white" alt="Terraform">
  </p>
</div>

---

## 🌟 Architecture Overview

**LAURITE** is a fully functional, highly scalable e-commerce application designed to demonstrate the power of modern **cloud-native patterns**, **event-driven architecture**, and **clean code principles**. 

Moving away from traditional monolithic frameworks, LAURITE pairs **Plain Java 21 AWS Lambda microservices** for sub-50ms cold starts with a **React 18 + Vite CDN frontend**, achieving high operational efficiency, zero server idle costs, and sub-second global performance.

---

## ✨ Core Key Features

### 🔐 1. Authentication & Security Engine
- **Verification Code Dispatch:** Amazon Cognito integration dispatches a secure verification code via email during user registration and sign-in authorization challenges.
- **Role-Based Access Control (RBAC):** Strict JWT token validation partitioning Customer storefront features from Admin operational capabilities.
- **Security & Password Challenges:** Support for first-time login credential updates, token expiration handling, and admin password resets.

### 🔔 2. Intelligent Notification & Restock Engine
- **Pre-Restock Alerting & Email Dispatch:** Customers can subscribe to out-of-stock items via "Notify Me". When inventory is replenished, the platform queues pre-notification emails featuring product details and CloudFront links before opening stock publicly.
- **Real-Time Stock Awareness:** Live stock tracking prevents overselling during high-concurrency checkout bursts.

### 🧾 3. Order Processing & Automated Invoicing
- **Asynchronous Event-Driven Checkout:** Placing an order triggers AWS SQS/SNS events to process inventory reduction and payment settlement without blocking client execution.
- **Automated PDF Invoice Email Dispatch:** Instant post-purchase receipt generation and automated email dispatch delivering professional PDF invoices directly to customer inboxes.

### 🛍️ 4. Customer Storefront
- **Dynamic Product Catalogue:** High-performance catalog browsing, category filtering, instant search, and rich product views.
- **Persistent Cart & Wishlist Management:** Synchronized shopping cart state and wishlist management across active user sessions.
- **Interactive Order Tracking:** View order histories, payment status breakdown, and download past PDF invoices directly on demand.

### 🛡️ 5. Admin Operations & Analytics Hub
- **Product & Media Operations:** Direct-to-S3 pre-signed upload URLs for optimized asset storage without overloading backend APIs.
- **Live Inventory Control & Restock:** On-demand inventory level modifications instantly triggering automated customer restock notification workflows.
- **Analytics & Customer Management:** Comprehensive visual dashboard for revenue analytics, order fulfillment pipeline, and customer CRM insights.

---

## 🏛️ Architecture & Event-Driven Flow

LAURITE utilizes a fully decoupled event-driven model to guarantee zero blocking latency on client requests.

```
                  +-------------------------------------------------+
                  |          AWS CloudFront CDN + S3 Bucket         |
                  |                (React + Vite UI)                |
                  +------------------------+------------------------+
                                           |
                                           v
                                 +------------------+
                                 |  AWS API Gateway |
                                 +--------+---------+
                                          |
                +-------------------------+-------------------------+
                |                         |                         |
                v                         v                         v
     +--------------------+    +--------------------+    +--------------------+
     |   Product Service  |    |    User Service    |    |   Cognito Service  |
     |   (Java 21 Lambda) |    |   (Java 21 Lambda) |    | (Email Verification|
     +---------+----------+    +---------+----------+    |   & Code Delivery) |
               |                         |               +--------------------+
               v                         v
     +--------------------+    +--------------------+
     | DynamoDB (Products)|    |   DynamoDB (Users) |
     +--------------------+    +--------------------+

                               Order Placement Flow
  +-------------------+        +--------------------+        +--------------------+
  |   Order Service   | ------>|   AWS SNS Topic    | ------>|    SQS Queue       |
  |  (Order Created)  |        |  (OrderPlacedEvt)  |        |  (Payment / Stock) |
  +-------------------+        +--------------------+        +--------+-----------+
                                                                      |
                                                                      v
                                                             +--------------------+
                                                             |  Notification &    |
                                                             |   Invoice Lambda   |
                                                             | (PDF Mail Dispatch)|
                                                             +--------------------+
```

### 🧠 Why Plain Java 21 (No Heavy Frameworks)?
While traditional Java frameworks (like Spring Boot) introduce significant reflection overhead leading to multi-second **Cold Starts** in Lambda environments, LAURITE uses **Pure Java 21 with native AWS SDK v2**. This architecture achieves **< 50ms startup times**, lower RAM consumption, and drastically reduced execution costs.

---

## 🛠️ DevSecOps & CI/CD Pipeline

Our **GitLab CI/CD** pipeline ensures every code commit is automatically vetted for code quality, security vulnerabilities, and infrastructure validity prior to zero-downtime deployment:

```
[ Stage 1: Build & Test ]  --->  [ Stage 2: Security & IaC ]  --->  [ Stage 3: Deploy ]
 ├── Maven Microservices          ├── SonarQube Code Analysis         ├── Lambda Update
 └── React Frontend Vite          ├── Snyk Dependency Scan            └── S3 Sync + CloudFront
                                  └── Terraform Plan & Validate           Invalidation
```

1. **Parallel Compilation & Caching:** Maven and NPM modules compile concurrently with persistent dependency caches (`.m2`, `node_modules`).
2. **SonarQube Static Analysis:** Automated scans verify Java microservice maintainability, code coverage, and bug risks.
3. **Snyk Security Auditing:** Vulnerability scanning across third-party dependencies and Infrastructure as Code (`.tf` files).
4. **Automated Infrastructure as Code:** Terraform automatically validates, plans, and applies infrastructure states.
5. **Zero-Downtime Deployment:** Sequential Lambda function code updates and instant CloudFront edge cache invalidations.

---

## 💻 Tech Stack Summary

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, CSS | Sub-second client rendering, high-responsiveness UI |
| **Backend** | Java 21, AWS SDK v2 | Lightweight, low-latency serverless microservices |
| **Identity & Auth** | Amazon Cognito | Secure user authentication, MFA & email verification code |
| **Database** | Amazon DynamoDB | On-demand PAY_PER_REQUEST NoSQL table isolation |
| **Messaging** | AWS SNS & SQS | Asynchronous event publishing and queue decoupling |
| **Infrastructure** | Terraform | Modular, reproducible Infrastructure as Code |
| **CI/CD & Security** | GitLab CI, SonarQube, Snyk | Automated security scanning and CD deployment pipeline |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** v18+
- **Java:** OpenJDK 21 & Apache Maven 3.9+
- **AWS CLI:** Configured with valid deployment credentials
- **Terraform:** v1.5+

### 1. Local Frontend Setup
```bash
cd frontend
npm ci
npm run dev
# Application available at http://localhost:5173
```

### 2. Microservices Build
```bash
cd backend
mvn clean package
# Compiles all microservice JARs ready for Lambda execution
```

### 3. Deploy Infrastructure via Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

---

<div align="center">
  <p>Built with precision using Cloud-Native Serverless Standards.</p>
</div>
