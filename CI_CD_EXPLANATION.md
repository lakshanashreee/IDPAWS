# CI/CD Pipeline & Project Architecture Guide

Welcome to the comprehensive guide to what your CI/CD pipeline is doing and how your microservices project is structured!

## 🏗️ Project Architecture Overview

This project is an **E-Commerce Application** built using a modern AWS Serverless Microservices architecture.

### The Microservices
You have several independent Java back-end services, all managed by Maven:
1. **Product Service:** Manages your product catalog.
2. **Inventory Service:** Tracks stock levels.
3. **Order Service:** Handles customer orders.
4. **Payment Service:** Processes transactions.
5. **Cart Service:** Manages shopping carts.
6. **User Service:** Manages user profiles.
7. **Cognito Trigger Service:** Contains AWS Lambda triggers for custom Amazon Cognito authentication flows.

### The Frontend
You have a **React + Vite** frontend app (in the `frontend/` folder) which serves as the user interface for your e-commerce store.

### Cloud Infrastructure (Terraform)
All of the AWS infrastructure (like Cognito User Pools, S3 buckets, CloudFront distributions, SQS queues, SNS topics, DynamoDB tables, etc.) is defined as code in the `terraform/` folder. This means your infrastructure is version-controlled and reproducible.

---

## 🚀 The GitLab CI/CD Pipeline Explained

The `.gitlab-ci.yml` file is the blueprint for your automation. Whenever you push code to GitLab, this pipeline runs automatically. Here is exactly what happens step-by-step:

### Stage 1: `validate`
* **What it does:** Runs `mvn validate`.
* **Purpose:** Checks that your Java Maven project structure is correct (which we recently fixed by adding the parent `pom.xml`).

### Stage 2: `build`
* **`build_backend`:** Runs `mvn clean package` to compile all 7 of your Java microservices into deployable `.jar` files. These files are temporarily saved as "artifacts".
* **`build_frontend`:** Installs Node.js dependencies and builds the production-ready React app (creating a `dist/` folder).

### Stage 3: `test`
* **`test_backend`:** Runs unit tests (`mvn test`) across your Java microservices to ensure your code logic works and no bugs were introduced.

### Stage 4: `sonarqube`
* **`sonarqube_analysis`:** Scans your code for security vulnerabilities, bugs, and code smells. (This is configured to only run on the `main` branch).

### Stage 5 & 6: Terraform (`terraform_validate`, `terraform_plan`)
* **What it does:** Downloads the `hashicorp/terraform` Docker image, initializes your Terraform environment, and runs `terraform plan`.
* **Purpose:** Previews any changes that need to be made to your AWS infrastructure. It acts as a safety check before applying changes to AWS.

### Stage 7: `deploy_backend` (Manual)
* **What it does:** Uses the AWS CLI to deploy the newly built `.jar` files directly to your live AWS Lambda functions.
* **Trigger:** This is set to `when: manual` and only on `main`, meaning you must physically click "Play" in GitLab to release the backend.

### Stage 8: `deploy_frontend` (Manual)
* **What it does:** Syncs your compiled React `dist/` folder to your AWS S3 bucket for website hosting.

### Stage 9: `cloudfront_invalidation`
* **What it does:** Tells AWS CloudFront (your Content Delivery Network) to clear its cache. 
* **Purpose:** Ensures your users see the newly deployed frontend immediately instead of a stale cached version.

---

## 🔧 Troubleshooting

If a pipeline stage fails, the logs will show exactly which command threw an error. The architecture is designed to fail early (e.g., during tests or validation) to prevent broken code from ever reaching AWS!
