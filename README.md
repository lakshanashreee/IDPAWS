<div align="center">
  <img src="https://placehold.co/800x200/faf8f5/c5a059?text=LAURITE+E-Commerce+Platform&font=playfair-display" alt="LAURITE Banner">
  
  <h1>LAURITE: Cloud-Native Serverless E-Commerce</h1>

  <p>
    An enterprise-grade, event-driven serverless e-commerce platform built with React, Java 21, and AWS.
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/Backend-Java%2021%20Microservices-007396?style=for-the-badge&logo=java&logoColor=white" alt="Java">
    <img src="https://img.shields.io/badge/Cloud-AWS%20Serverless-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS">
    <img src="https://img.shields.io/badge/IaC-Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" alt="Terraform">
  </p>
</div>

## 🌟 Overview

**LAURITE** is a fully functional, highly scalable e-commerce application designed to demonstrate the power of modern **cloud-native patterns**, **event-driven architecture**, and **clean code principles**. 

Moving away from heavy monolithic frameworks, this project embraces **AWS Lambda and Plain Java 21** to achieve lightning-fast cold starts and ultra-low computing costs, paired with a blazing-fast **React + Vite** frontend.

---

## ✨ Comprehensive Feature Set

### 🛍️ Customer Experience
- **Dynamic Product Catalogue:** Beautifully presented products with rich imagery, pricing, and category filtering.
- **Real-Time Inventory Awareness:** Customers see exactly how many items are left, or if an item is completely out of stock.
- **Smart "Notify Me" System:** When an item is out of stock, customers can seamlessly subscribe to restock alerts. Automated emails (featuring beautiful product images and direct CloudFront links) are dispatched instantly upon restock!
- **Seamless Cart & Checkout:** Add items to a persistent cart, proceed through a streamlined checkout flow, and securely submit orders.
- **User Profiles & Wishlists:** Customers can manage their profiles, update their display names and avatars, and save favorite products for later.
- **Order Tracking & PDF Invoices:** View past orders, track their status, and instantly generate/download professional PDF invoices directly from the browser.

### 🛡️ Admin & Operations Dashboard
- **Comprehensive Product Management:** Create, edit, and categorize products. Drag-and-drop image uploads instantly push beautiful imagery to AWS S3.
- **Real-Time Inventory Control:** Restock items on the fly, adjust low-stock thresholds, and seamlessly trigger automated customer restock notifications.
- **Order Fulfillment Pipeline:** View customer orders in real-time, mark them as shipped, and track fulfillment metrics.
- **Customer Insights:** Access a CRM-like view of registered users, their purchase history, and overall engagement.

---

## 🏛️ Architecture & Infrastructure

LAURITE is built on a highly resilient, event-driven AWS serverless backbone.

### 🌐 The Cloud-Native Stack
- **Compute (AWS Lambda):** 5+ independent Java microservices (Product, Inventory, Cart, Order, Payment) running completely serverless.
- **Database (Amazon DynamoDB):** High-performance NoSQL data storage tailored for microservice data isolation.
- **Authentication (Amazon Cognito):** Secure, scalable user identity management with custom Lambda triggers.
- **Event-Driven Messaging (AWS SNS & SQS):** Decoupled asynchronous communication between services (e.g., Order service notifying Payment and Inventory services without blocking the user).
- **Frontend Hosting (AWS S3 & CloudFront):** Global CDN distribution for sub-second frontend loading times.
- **API Gateway:** Secure, scalable REST endpoints connecting the frontend to our backend microservices.

### 🔧 Why Plain Java (No Spring Boot)?
While Spring Boot is fantastic, it suffers from severe **"Cold Start"** latency in serverless environments due to heavy dependency injection. By utilizing **Plain Java 21**, our Lambdas boot in milliseconds, ensuring the UI remains incredibly responsive while keeping AWS costs at a fraction of traditional containerized workloads.

---

## 🛠️ CI/CD & Security Pipeline

Our continuous integration and deployment pipeline (powered by **GitLab CI**) is built to elite enterprise standards:
1. **Parallel Builds:** Maven and npm independently build backend and frontend artifacts to save time.
2. **Static Code Analysis:** **SonarQube** scans all Java microservices for code smells, bugs, and maintainability metrics.
3. **Vulnerability Scanning:** **Snyk** integration analyzes dependencies and Infrastructure as Code for known CVEs. *(Highly optimized with global tool caching for blazing-fast execution!)*
4. **Automated IaC:** **Terraform** validates, plans, and seamlessly applies infrastructure changes directly to AWS.
5. **Zero-Downtime Deployments:** Updates are pushed directly to AWS Lambda and S3/CloudFront with automatic cache invalidation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- Java 21 & Maven
- AWS CLI configured with appropriate permissions
- Terraform CLI (for infrastructure deployment)

### 1. Local Frontend Development
```bash
cd frontend
npm ci
npm run dev
```
*The app will be available at `http://localhost:5173`.*

### 2. Building Backend Microservices
```bash
cd backend
mvn clean package
```
*This compiles all independent Java modules into deployable Lambda JARs.*

### 3. Deploying Infrastructure
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

---

