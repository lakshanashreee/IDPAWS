# E-Commerce AWS Serverless Microservices — Authentication & Authorization

This document provides details on the Cognito JWT authentication and Role-Based Access Control (RBAC) architecture implemented in the e-commerce microservices.

---

## Authentication Architecture

The architecture uses **Amazon Cognito** as the identity provider and **Amazon API Gateway HTTP API** as the entry point. Handlers run in AWS Lambda and connect to Amazon DynamoDB.

```
[ Client / Postman ]
    │
    │ 1. Request with Authorization: Bearer <JWT>
    ▼
[ API Gateway HTTP API ] ── 2. Validates JWT signature, expiry, issuer (Cognito)
    │
    │ 3. Forwards claims in requestContext.authorizer.jwt
    ▼
[ Lambda Handler ] ──── 4. Extracts claims & verifies groups (ADMIN, CUSTOMER)
    │
    ▼
[ DynamoDB Table ]
```

---

## JWT Flow

1. **User Sign Up / Sign In**:
   - The user authenticates against the Cognito User Pool (`L_ECommerceAuth`).
   - Cognito returns three JSON Web Tokens: `IdToken`, `AccessToken`, and `RefreshToken`.
2. **Accessing HTTP APIs**:
   - The client includes the `IdToken` (or `AccessToken` containing groups and identity claims) in the `Authorization` HTTP header of every request:
     ```http
     Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
3. **API Gateway JWT Validation**:
   - API Gateway intercepts the request and automatically validates the token:
     - Signature validation against the Cognito User Pool JWKS (JSON Web Key Set).
     - Token expiry check (`exp` claim).
     - Issuer check (`iss` claim) matches the pool's issuer URL.
     - Audience check (`aud` claim) matches the API Gateway's client ID configurations.
   - If invalid, API Gateway rejects the request immediately with `401 Unauthorized` before invoking the Lambda, saving execution costs.
4. **Lambda Context Processing**:
   - If valid, API Gateway forwards the parsed JWT claims to the Lambda inside the request object:
     `requestContext.authorizer.jwt.claims`
   - Lambdas trust the API Gateway verification and do **not** manually fetch keys or verify signatures.

---

## Role-Based Access Control (RBAC) & Cognito Groups

We enforce RBAC using Cognito Groups. Users are assigned to one of the following two Cognito groups:
1. **`ADMIN`**: Represents store administrators who manage catalog, inventory, and can inspect all orders and payments.
2. **`CUSTOMER`**: Represents shoppers who manage their own carts, place orders, and view their own order/payment history.

### Endpoint Permissions Matrix

| Service | Route | HTTP Method | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Product** | `/products` | `POST` | `ADMIN` | Create a new product |
| | `/products/{id}` | `PUT` | `ADMIN` | Update a product |
| | `/products/{id}` | `DELETE` | `ADMIN` | Delete a product (soft delete) |
| | `/products` | `GET` | `ADMIN`, `CUSTOMER` | View all products |
| | `/products/{id}` | `GET` | `ADMIN`, `CUSTOMER` | View a product by ID |
| | `/products/category/{category}` | `GET` | `ADMIN`, `CUSTOMER` | View products by category |
| | `/products/health` | `GET` | *Public* | Health check |
| **Inventory**| `/inventory` | `POST` | `ADMIN` | Initialize product inventory |
| | `/inventory` | `GET` | `ADMIN` | View inventory of all items |
| | `/inventory/{productId}`| `GET` | `ADMIN` | View inventory of a single item |
| | `/inventory/{productId}/add-stock` | `PUT` | `ADMIN` | Add stock quantity |
| | `/inventory/{productId}/reduce-stock`| `PUT` | `ADMIN` | Reduce stock quantity |
| | `/inventory/low-stock` | `GET` | `ADMIN` | View items below minimum threshold |
| | `/inventory/{productId}`| `DELETE` | `ADMIN` | Delete inventory |
| | `/inventory/health` | `GET` | *Public* | Health check |
| **Cart** | `/cart/{userId}/items` | `POST` | `CUSTOMER` (Own) \| `ADMIN` | Add item to cart |
| | `/cart/{userId}` | `GET` | `CUSTOMER` (Own) \| `ADMIN` | Get user's cart |
| | `/cart/{userId}/summary` | `GET` | `CUSTOMER` (Own) \| `ADMIN` | Get cart totals |
| | `/cart/{userId}/items/{productId}` | `PUT` | `CUSTOMER` (Own) \| `ADMIN` | Update item quantity |
| | `/cart/{userId}/items/{productId}` | `DELETE` | `CUSTOMER` (Own) \| `ADMIN` | Remove item from cart |
| | `/cart/{userId}/clear` | `DELETE` | `CUSTOMER` (Own) \| `ADMIN` | Empty user's cart |
| | `/cart/health` | `GET` | *Public* | Health check |
| **Order** | `/orders` | `POST` | `CUSTOMER`, `ADMIN` | Create order (enforces matching client ID if CUSTOMER) |
| | `/orders` | `GET` | `ADMIN` | List all orders |
| | `/orders/{orderId}` | `GET` | `CUSTOMER` (Own) \| `ADMIN` | Get order details |
| | `/orders/user/{userId}` | `GET` | `CUSTOMER` (Own) \| `ADMIN` | List orders for a specific user |
| | `/orders/{orderId}/status`| `PUT` | `ADMIN` | Update order status |
| | `/orders/{orderId}` | `DELETE` | `ADMIN` | Delete order |
| | `/orders/health` | `GET` | *Public* | Health check |
| **Payment** | `/payments` | `GET` | `ADMIN` | List all payments |
| | `/payments/{paymentId}` | `GET` | `CUSTOMER` (Own) \| `ADMIN` | Get payment details |
| | `/payments/order/{orderId}` | `GET` | `CUSTOMER` (Own) \| `ADMIN` | Get payments for a specific order |
| | `/payments/{paymentId}/status`| `PUT` | `ADMIN` | Update payment status |
| | `/payments/health` | `GET` | *Public* | Health check |

---

## Security Context Extraction in Lambda

Each Lambda utilizes a reusable security helper under the package `com.ecommerce.common.security` to extract and validate identities.

1. **`UserContext`**: Wraps the user's identity details:
   - `userId` (derived from the `sub` claim)
   - `email` (derived from the `email` claim)
   - `username` (derived from the `cognito:username` or `username` claim)
   - `groups` (derived from the `cognito:groups` list or string)
2. **`AuthorizationUtil`**: Provides clean static helper methods:
   - `extractUser(request)`: Extracts the `UserContext`.
   - `requireAdmin(request)`: Asserts the caller has the `ADMIN` group.
   - `requireCustomer(request)`: Asserts the caller has the `CUSTOMER` group.
   - `requireAdminOrCustomer(request)`: Asserts the caller is in at least one group.
   - `requireOwnerOrAdmin(request, resourceUserId)`: Asserts the caller is either an `ADMIN` or a `CUSTOMER` whose `userId` matches the resource's owner ID (prevents cross-user data tampering).

### Improving User ID Security (Request Bodies)
For `POST /orders`, order requests contain a `userId` inside the request body. If the caller is a `CUSTOMER`, the handler automatically overrides `orderRequest.userId` with the validated Cognito identity (`sub` claim) from the token. This prevents users from placing orders on behalf of other users.

---

## Example Authorization Header

```http
GET /orders/user/user-123 HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidXNlckBlbWFpbC5jb20iLCJjb2duaXRvOmdyb3VwcyI6WyJDVVNUT01FUiJdfQ.signature
```
