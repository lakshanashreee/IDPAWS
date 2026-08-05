# E-Commerce AWS Serverless Microservices

Welcome to the E-Commerce Serverless Microservices project! This repository contains a full-stack e-commerce application powered by React and AWS Serverless Java microservices.

## 🚀 Quick Start

1. **Frontend**: The `frontend/` folder contains a React + Vite application. Run `npm install` and `npm run dev` to start it locally.
2. **Backend**: The backend consists of 5 main Java microservices (`product`, `inventory`, `cart`, `order`, `payment`). Each is a standard Maven project that compiles into a deployable JAR for AWS Lambda. Run `mvn clean package` in any service directory to build it.
3. **Infrastructure**: The `terraform/` folder contains the Infrastructure as Code (IaC) definitions for deploying to AWS.

## 🛠️ Tech Stack & Architecture Choices

Here are the technologies used in this project and why they were chosen:

### Backend: Plain Java 21 & Maven (No Spring Boot)
*   **What we use:** Core Java 21 built with Maven, using the standard `aws-lambda-java-core` libraries.
*   **Why no Spring Boot?** While Spring Boot is the industry standard for traditional microservices, it suffers from severe **"Cold Start"** latency when used in AWS Lambda serverless environments due to its heavy dependency injection and startup time. By using plain Java, our Lambdas start incredibly fast, keeping the application responsive and AWS costs low.
*   **Why Maven?** It provides a highly standardized, predictable dependency management and build lifecycle across all microservices.

### Frontend: React + Vite
*   **What we use:** React for the UI components, bundled with Vite (and Node.js).
*   **Why Vite instead of Create-React-App/Webpack?** Vite offers a significantly faster development server (starting in milliseconds) and optimized production builds. It provides a much better Developer Experience (DX) for modern React applications.

### Infrastructure & CI/CD: Terraform & GitLab CI
*   **What we use:** HashiCorp Terraform for Infrastructure as Code (IaC) and GitLab CI for automation.
*   **Why Terraform?** It allows us to define our AWS architecture (DynamoDB, API Gateway, SQS, SNS, Cognito) declaratively, meaning we can version control and easily reproduce our cloud environment.

## 📚 Project Documentation

To keep this repository clean and easy to navigate, all detailed documentation has been consolidated into two main guides. **Please start here:**

*   👉 **[AWS Project & DevOps Guide](AWS_PROJECT_DOCUMENTATION.md)**
    *   *Read this to understand:* The AWS Serverless Architecture (Lambda, DynamoDB, SNS, SQS, API Gateway, Cognito), the GitLab CI/CD pipeline, Terraform setup, and Unit Testing strategies.

*   👉 **[Java Microservices Learning Guide](JAVA_MICROSERVICES_GUIDE.md)**
    *   *Read this to understand:* The standard Java project template used across all 5 microservices. It explains the purpose of the `handler`, `service`, `repository`, `model`, and `dto` packages, making it perfect for those learning Java backend development.

---
*This repository is designed to demonstrate modern cloud-native patterns and clean Java architecture.*
