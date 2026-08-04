# E-Commerce AWS Serverless Microservices

Welcome to the E-Commerce Serverless Microservices project! This repository contains a full-stack e-commerce application powered by React and AWS Serverless Java microservices.

## 🚀 Quick Start

1. **Frontend**: The `frontend/` folder contains a React + Vite application. Run `npm install` and `npm run dev` to start it locally.
2. **Backend**: The backend consists of 5 main Java microservices (`product`, `inventory`, `cart`, `order`, `payment`). Each is a standard Maven project that compiles into a deployable JAR for AWS Lambda. Run `mvn clean package` in any service directory to build it.
3. **Infrastructure**: The `terraform/` folder contains the Infrastructure as Code (IaC) definitions for deploying to AWS.

## 📚 Project Documentation

To keep this repository clean and easy to navigate, all detailed documentation has been consolidated into two main guides. **Please start here:**

*   👉 **[AWS Project & DevOps Guide](AWS_PROJECT_DOCUMENTATION.md)**
    *   *Read this to understand:* The AWS Serverless Architecture (Lambda, DynamoDB, SNS, SQS, API Gateway, Cognito), the GitLab CI/CD pipeline, Terraform setup, and Unit Testing strategies.

*   👉 **[Java Microservices Learning Guide](JAVA_MICROSERVICES_GUIDE.md)**
    *   *Read this to understand:* The standard Java project template used across all 5 microservices. It explains the purpose of the `handler`, `service`, `repository`, `model`, and `dto` packages, making it perfect for those learning Java backend development.

---
*This repository is designed to demonstrate modern cloud-native patterns and clean Java architecture.*
