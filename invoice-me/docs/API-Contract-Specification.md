# InvoiceMe API Contract Specification
## Complete REST API Documentation with Request/Response Examples

**Document Version:** 1.0
**Last Updated:** 2025-11-08
**Base URL:** `https://teamfront-invoice-me-archlife.us-west-1.elasticbeanstalk.com`

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Customer Endpoints](#customer-endpoints)
3. [Invoice Endpoints](#invoice-endpoints)
4. [Payment Endpoints](#payment-endpoints)
5. [Common Response Structures](#common-response-structures)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Pagination](#pagination)

---

## 1. Authentication Endpoints

### POST /auth/login

Authenticate a user and receive JWT tokens.

**Request:**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@invoiceme.com",
  "password": "SecureP@ssw0rd!"
}
```

**Request Body Schema:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Yes | Valid email format | User's email address |
| password | string | Yes | Min 8 characters | User's password |

**Success Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "a3b7f8c2-1234-5678-9abc-def012345678",
    "email": "admin@invoiceme.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  }
}
```

**Error Responses:**

```json
// 401 Unauthorized - Invalid credentials
{
  "timestamp": "2025-11-08T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "path": "/api/v1/auth/login",
  "errorCode": "INVALID_CREDENTIALS"
}
```

```json
// 400 Bad Request - Validation error
{
  "timestamp": "2025-11-08T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/auth/login",
  "errors": [
    {
      "field": "email",
      "rejectedValue": "invalid-email",
      "message": "must be a well-formed email address"
    }
  ]
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request:**

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

### POST /auth/logout

Invalidate current session.

**Request:**

```http
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (204 No Content)**

### GET /auth/me

Get current authenticated user information.

**Request:**

```http
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**

```json
{
  "id": "a3b7f8c2-1234-5678-9abc-def012345678",
  "email": "admin@invoiceme.com",
  "fullName": "Admin User",
  "role": "ADMIN",
  "isActive": true,
  "lastLoginAt": "2025-11-08T10:30:00Z"
}
```

---

## 2. Customer Endpoints

### POST /customers

Create a new customer.

**Request:**

```http
POST /api/v1/customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "billingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "taxId": "12-3456789"
}
```

**Request Body Schema:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| firstName | string | Yes | 2-50 chars, letters only | Customer's first name |
| lastName | string | Yes | 2-50 chars, letters only | Customer's last name |
| email | string | Yes | Valid email, unique | Customer's email |
| phone | string | No | E.164 format | Customer's phone number |
| billingAddress | object | Yes | Complete address | Billing address |
| billingAddress.street | string | Yes | Max 255 chars | Street address |
| billingAddress.city | string | Yes | Max 100 chars | City |
| billingAddress.state | string | Yes | 2 chars | State code |
| billingAddress.zipCode | string | Yes | 5 or 9 digits | ZIP code |
| billingAddress.country | string | Yes | Max 100 chars | Country |
| taxId | string | No | Format: XX-XXXXXXX | Tax identifier |

**Success Response (201 Created):**

```http
HTTP/1.1 201 Created
Location: /api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678
Content-Type: application/json

{
  "id": "a3b7f8c2-1234-5678-9abc-def012345678",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "billingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "taxId": "12-3456789",
  "status": "ACTIVE",
  "totalInvoicesCount": 0,
  "totalInvoicedAmount": 0.00,
  "totalPaidAmount": 0.00,
  "outstandingBalance": 0.00,
  "createdAt": "2025-11-08T10:30:00Z",
  "lastModifiedAt": "2025-11-08T10:30:00Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Validation errors
{
  "timestamp": "2025-11-08T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for object='createCustomerRequest'",
  "path": "/api/v1/customers",
  "errors": [
    {
      "field": "firstName",
      "rejectedValue": "J",
      "message": "First name must be at least 2 characters"
    },
    {
      "field": "email",
      "rejectedValue": "invalid-email",
      "message": "Email must be a valid email address"
    },
    {
      "field": "billingAddress.zipCode",
      "rejectedValue": "123",
      "message": "ZIP code must be 5 or 9 digits"
    }
  ],
  "traceId": "a3b7f8c2-trace-123"
}
```

```json
// 409 Conflict - Duplicate email
{
  "timestamp": "2025-11-08T10:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Customer with email 'john.doe@example.com' already exists",
  "path": "/api/v1/customers",
  "errorCode": "DUPLICATE_EMAIL",
  "traceId": "a3b7f8c2-trace-124"
}
```

### GET /customers/{id}

Get customer by ID with full details.

**Request:**

```http
GET /api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678
Authorization: Bearer {token}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Customer unique identifier |

**Success Response (200 OK):**

```json
{
  "id": "a3b7f8c2-1234-5678-9abc-def012345678",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "billingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "taxId": "12-3456789",
  "status": "ACTIVE",
  "totalInvoicesCount": 15,
  "totalInvoicedAmount": 125450.00,
  "totalPaidAmount": 118200.00,
  "outstandingBalance": 7250.00,
  "createdAt": "2025-01-15T10:30:00Z",
  "lastModifiedAt": "2025-11-01T14:20:00Z"
}
```

**Error Response:**

```json
// 404 Not Found
{
  "timestamp": "2025-11-08T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Customer not found with id: a3b7f8c2-1234-5678-9abc-def012345678",
  "path": "/api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678",
  "errorCode": "CUSTOMER_NOT_FOUND",
  "traceId": "a3b7f8c2-trace-125"
}
```

### GET /customers

List customers with filtering, sorting, and pagination.

**Request:**

```http
GET /api/v1/customers?status=ACTIVE&searchTerm=john&sortBy=name&sortDirection=ASC&pageNumber=0&pageSize=20
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | all | Filter by status: ACTIVE, INACTIVE, SUSPENDED |
| searchTerm | string | No | - | Search in name and email |
| sortBy | string | No | name | Sort field: name, email, createdAt |
| sortDirection | string | No | ASC | Sort direction: ASC, DESC |
| pageNumber | integer | No | 0 | Page number (0-indexed) |
| pageSize | integer | No | 20 | Items per page (max 100) |

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": "a3b7f8c2-1234-5678-9abc-def012345678",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "status": "ACTIVE",
      "outstandingBalance": 7250.00,
      "activeInvoicesCount": 3
    },
    {
      "id": "b4c8e9d3-2345-6789-0bcd-ef1234567890",
      "fullName": "John Smith",
      "email": "john.smith@example.com",
      "status": "ACTIVE",
      "outstandingBalance": 0.00,
      "activeInvoicesCount": 0
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 2,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 2,
  "empty": false
}
```

### PUT /customers/{id}

Update an existing customer.

**Request:**

```http
PUT /api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe.updated@example.com",
  "phone": "+1-555-987-6543",
  "billingAddress": {
    "street": "456 Oak Ave",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62702",
    "country": "USA"
  },
  "taxId": "12-3456789"
}
```

**Request Body Schema:**

Same as POST /customers, but all fields are optional except those being updated.

**Success Response (200 OK):**

```json
{
  "id": "a3b7f8c2-1234-5678-9abc-def012345678",
  "fullName": "John Doe",
  "email": "john.doe.updated@example.com",
  "phone": "+1-555-987-6543",
  "billingAddress": {
    "street": "456 Oak Ave",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62702",
    "country": "USA"
  },
  "taxId": "12-3456789",
  "status": "ACTIVE",
  "totalInvoicesCount": 15,
  "totalInvoicedAmount": 125450.00,
  "totalPaidAmount": 118200.00,
  "outstandingBalance": 7250.00,
  "createdAt": "2025-01-15T10:30:00Z",
  "lastModifiedAt": "2025-11-08T10:35:00Z"
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "timestamp": "2025-11-08T10:35:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Customer not found with id: a3b7f8c2-1234-5678-9abc-def012345678",
  "path": "/api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678",
  "errorCode": "CUSTOMER_NOT_FOUND"
}
```

```json
// 409 Conflict - Email already in use
{
  "timestamp": "2025-11-08T10:35:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Email 'john.doe.updated@example.com' is already in use by another customer",
  "path": "/api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678",
  "errorCode": "DUPLICATE_EMAIL"
}
```

### DELETE /customers/{id}

Soft delete a customer.

**Request:**

```http
DELETE /api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678
Authorization: Bearer {token}
```

**Success Response (204 No Content)**

**Error Responses:**

```json
// 404 Not Found
{
  "timestamp": "2025-11-08T10:40:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Customer not found with id: a3b7f8c2-1234-5678-9abc-def012345678",
  "path": "/api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678",
  "errorCode": "CUSTOMER_NOT_FOUND"
}
```

```json
// 409 Conflict - Has active invoices
{
  "timestamp": "2025-11-08T10:40:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot delete customer with active invoices. Found 3 invoices in SENT status.",
  "path": "/api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678",
  "errorCode": "CUSTOMER_HAS_ACTIVE_INVOICES",
  "details": {
    "activeInvoicesCount": 3,
    "invoiceIds": [
      "inv-uuid-1",
      "inv-uuid-2",
      "inv-uuid-3"
    ]
  }
}
```

### GET /customers/{id}/invoices

Get all invoices for a customer.

**Request:**

```http
GET /api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678/invoices?status=SENT&pageNumber=0&pageSize=20
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | all | Filter by status: DRAFT, SENT, PAID, CANCELLED |
| pageNumber | integer | No | 0 | Page number |
| pageSize | integer | No | 20 | Items per page |

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": "b5c9d1e3-5678-9012-3def-456789abcdef",
      "invoiceNumber": "INV-2025-001",
      "customerName": "John Doe",
      "invoiceDate": "2025-11-01",
      "dueDate": "2025-12-01",
      "status": "SENT",
      "totalAmount": 8300.00,
      "balance": 5300.00
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

### GET /customers/{id}/balance

Get customer balance summary.

**Request:**

```http
GET /api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678/balance
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "customerId": "a3b7f8c2-1234-5678-9abc-def012345678",
  "totalInvoiced": 125450.00,
  "totalPaid": 118200.00,
  "totalOutstanding": 7250.00,
  "overdueAmount": 2150.00,
  "invoiceSummary": {
    "draftCount": 2,
    "sentCount": 3,
    "paidCount": 10,
    "overdueCount": 1
  }
}
```

---

## 3. Invoice Endpoints

### POST /invoices

Create a new invoice in DRAFT status.

**Request:**

```http
POST /api/v1/invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "a3b7f8c2-1234-5678-9abc-def012345678",
  "invoiceDate": "2025-11-08",
  "dueDate": "2025-12-08",
  "lineItems": [
    {
      "description": "Web Development Services - October 2025",
      "quantity": 40.0,
      "unitPrice": 150.00
    },
    {
      "description": "UI/UX Design Consultation",
      "quantity": 8.0,
      "unitPrice": 200.00
    }
  ],
  "taxAmount": 700.00,
  "notes": "Payment terms: Net 30 days"
}
```

**Request Body Schema:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| customerId | UUID | Yes | Must exist, ACTIVE | Customer ID |
| invoiceDate | date | Yes | Not in future | Invoice date |
| dueDate | date | Yes | >= invoiceDate | Due date |
| lineItems | array | Yes | Min 1, Max 50 | Line items |
| lineItems[].description | string | Yes | 1-500 chars | Item description |
| lineItems[].quantity | number | Yes | > 0 | Quantity |
| lineItems[].unitPrice | number | Yes | >= 0 | Unit price |
| taxAmount | number | No | >= 0 | Tax amount |
| notes | string | No | Max 2000 chars | Additional notes |

**Success Response (201 Created):**

```http
HTTP/1.1 201 Created
Location: /api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef
Content-Type: application/json

{
  "id": "b5c9d1e3-5678-9012-3def-456789abcdef",
  "invoiceNumber": null,
  "customer": {
    "id": "a3b7f8c2-1234-5678-9abc-def012345678",
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  },
  "invoiceDate": "2025-11-08",
  "dueDate": "2025-12-08",
  "status": "DRAFT",
  "lineItems": [
    {
      "id": "line-item-uuid-1",
      "description": "Web Development Services - October 2025",
      "quantity": 40.0,
      "unitPrice": 150.00,
      "lineTotal": 6000.00,
      "sortOrder": 0
    },
    {
      "id": "line-item-uuid-2",
      "description": "UI/UX Design Consultation",
      "quantity": 8.0,
      "unitPrice": 200.00,
      "lineTotal": 1600.00,
      "sortOrder": 1
    }
  ],
  "subtotal": 7600.00,
  "taxAmount": 700.00,
  "totalAmount": 8300.00,
  "paidAmount": 0.00,
  "balance": 8300.00,
  "notes": "Payment terms: Net 30 days",
  "payments": [],
  "createdAt": "2025-11-08T10:35:00Z",
  "lastModifiedAt": "2025-11-08T10:35:00Z",
  "sentAt": null,
  "paidAt": null
}
```

**Error Responses:**

```json
// 400 Bad Request - Validation errors
{
  "timestamp": "2025-11-08T10:35:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/invoices",
  "errors": [
    {
      "field": "dueDate",
      "rejectedValue": "2025-10-08",
      "message": "Due date must be on or after invoice date"
    },
    {
      "field": "lineItems",
      "rejectedValue": [],
      "message": "At least one line item is required"
    },
    {
      "field": "lineItems[0].quantity",
      "rejectedValue": -5,
      "message": "Quantity must be greater than zero"
    }
  ]
}
```

```json
// 404 Not Found - Customer doesn't exist
{
  "timestamp": "2025-11-08T10:35:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Customer not found with id: a3b7f8c2-1234-5678-9abc-def012345678",
  "path": "/api/v1/invoices",
  "errorCode": "CUSTOMER_NOT_FOUND"
}
```

```json
// 409 Conflict - Customer not active
{
  "timestamp": "2025-11-08T10:35:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot create invoice for inactive customer",
  "path": "/api/v1/invoices",
  "errorCode": "CUSTOMER_NOT_ACTIVE",
  "details": {
    "customerId": "a3b7f8c2-1234-5678-9abc-def012345678",
    "customerStatus": "INACTIVE"
  }
}
```

### GET /invoices/{id}

Get invoice by ID with full details.

**Request:**

```http
GET /api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "id": "b5c9d1e3-5678-9012-3def-456789abcdef",
  "invoiceNumber": "INV-2025-001",
  "customer": {
    "id": "a3b7f8c2-1234-5678-9abc-def012345678",
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  },
  "invoiceDate": "2025-11-08",
  "dueDate": "2025-12-08",
  "status": "SENT",
  "lineItems": [
    {
      "id": "line-item-uuid-1",
      "description": "Web Development Services - October 2025",
      "quantity": 40.0,
      "unitPrice": 150.00,
      "lineTotal": 6000.00,
      "sortOrder": 0
    },
    {
      "id": "line-item-uuid-2",
      "description": "UI/UX Design Consultation",
      "quantity": 8.0,
      "unitPrice": 200.00,
      "lineTotal": 1600.00,
      "sortOrder": 1
    }
  ],
  "subtotal": 7600.00,
  "taxAmount": 700.00,
  "totalAmount": 8300.00,
  "paidAmount": 3000.00,
  "balance": 5300.00,
  "notes": "Payment terms: Net 30 days",
  "payments": [
    {
      "id": "payment-uuid-1",
      "amount": 3000.00,
      "paymentDate": "2025-11-15",
      "paymentMethod": "CREDIT_CARD",
      "referenceNumber": "**** 1234",
      "status": "APPLIED"
    }
  ],
  "createdAt": "2025-11-08T10:35:00Z",
  "lastModifiedAt": "2025-11-15T14:20:00Z",
  "sentAt": "2025-11-08T10:40:00Z",
  "paidAt": null
}
```

### GET /invoices

List invoices with filtering, sorting, and pagination.

**Request:**

```http
GET /api/v1/invoices?status=SENT&customerId=a3b7f8c2-1234-5678-9abc-def012345678&fromDate=2025-01-01&toDate=2025-12-31&overdue=true&sortBy=dueDate&sortDirection=ASC&pageNumber=0&pageSize=20
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| customerId | UUID | No | all | Filter by customer |
| status | string | No | all | DRAFT, SENT, PAID, CANCELLED |
| fromDate | date | No | - | Invoice date >= fromDate |
| toDate | date | No | - | Invoice date <= toDate |
| overdue | boolean | No | false | Show only overdue invoices |
| sortBy | string | No | invoiceDate | invoiceNumber, invoiceDate, dueDate, totalAmount, balance |
| sortDirection | string | No | DESC | ASC, DESC |
| pageNumber | integer | No | 0 | Page number |
| pageSize | integer | No | 20 | Items per page (max 100) |

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": "b5c9d1e3-5678-9012-3def-456789abcdef",
      "invoiceNumber": "INV-2025-001",
      "customerName": "John Doe",
      "invoiceDate": "2025-11-08",
      "dueDate": "2025-12-08",
      "status": "SENT",
      "totalAmount": 8300.00,
      "balance": 5300.00,
      "isOverdue": false
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "summary": {
    "totalAmountSum": 8300.00,
    "totalBalanceSum": 5300.00
  }
}
```

### PUT /invoices/{id}

Update invoice (DRAFT only).

**Request:**

```http
PUT /api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceDate": "2025-11-08",
  "dueDate": "2025-12-15",
  "lineItems": [
    {
      "description": "Updated service description",
      "quantity": 45.0,
      "unitPrice": 150.00
    }
  ],
  "taxAmount": 750.00,
  "notes": "Updated payment terms"
}
```

**Success Response (200 OK):**

Returns updated invoice (same structure as GET /invoices/{id})

**Error Responses:**

```json
// 409 Conflict - Cannot update sent invoice
{
  "timestamp": "2025-11-08T10:45:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot update invoice in SENT status. Only DRAFT invoices can be modified.",
  "path": "/api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef",
  "errorCode": "INVALID_INVOICE_STATUS",
  "details": {
    "currentStatus": "SENT",
    "allowedStatuses": ["DRAFT"]
  }
}
```

### POST /invoices/{id}/send

Mark invoice as SENT (assigns invoice number).

**Request:**

```http
POST /api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "sentDate": "2025-11-08"
}
```

**Request Body Schema:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| sentDate | date | No | Current date | Date invoice was sent |

**Success Response (200 OK):**

Returns updated invoice with invoiceNumber assigned and status = SENT.

**Error Responses:**

```json
// 409 Conflict - Invalid status
{
  "timestamp": "2025-11-08T10:50:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot send invoice. Only DRAFT invoices can be sent.",
  "path": "/api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef/send",
  "errorCode": "INVALID_INVOICE_STATUS"
}
```

### POST /invoices/{id}/payments

Record a payment against an invoice.

**Request:**

```http
POST /api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 3000.00,
  "paymentDate": "2025-11-15",
  "paymentMethod": "CREDIT_CARD",
  "referenceNumber": "**** 1234",
  "notes": "First installment payment"
}
```

**Request Body Schema:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| amount | number | Yes | > 0, <= balance | Payment amount |
| paymentDate | date | Yes | >= invoiceDate, <= today | Payment date |
| paymentMethod | string | Yes | CASH, CHECK, CREDIT_CARD, BANK_TRANSFER, OTHER | Payment method |
| referenceNumber | string | No | Max 100 chars | Check #, transaction ID, etc. |
| notes | string | No | Max 500 chars | Additional notes |

**Success Response (201 Created):**

```http
HTTP/1.1 201 Created
Location: /api/v1/payments/payment-uuid-1
Content-Type: application/json

{
  "id": "payment-uuid-1",
  "invoice": {
    "id": "b5c9d1e3-5678-9012-3def-456789abcdef",
    "invoiceNumber": "INV-2025-001",
    "totalAmount": 8300.00,
    "previousBalance": 8300.00,
    "newBalance": 5300.00
  },
  "amount": 3000.00,
  "paymentDate": "2025-11-15",
  "paymentMethod": "CREDIT_CARD",
  "referenceNumber": "**** 1234",
  "status": "APPLIED",
  "notes": "First installment payment",
  "createdAt": "2025-11-15T14:20:00Z",
  "createdBy": "admin@invoiceme.com"
}
```

**Error Responses:**

```json
// 422 Unprocessable Entity - Payment exceeds balance
{
  "timestamp": "2025-11-15T14:20:00Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Payment amount ($10,000.00) exceeds invoice balance ($8,300.00)",
  "path": "/api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef/payments",
  "errorCode": "PAYMENT_EXCEEDS_BALANCE",
  "details": {
    "invoiceBalance": 8300.00,
    "requestedAmount": 10000.00,
    "maxAllowedAmount": 8300.00
  }
}
```

```json
// 409 Conflict - Invalid invoice status
{
  "timestamp": "2025-11-15T14:20:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot record payment for invoice in DRAFT status. Invoice must be SENT.",
  "path": "/api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef/payments",
  "errorCode": "INVALID_INVOICE_STATUS",
  "details": {
    "currentStatus": "DRAFT",
    "requiredStatus": "SENT"
  }
}
```

### POST /invoices/{id}/cancel

Cancel an invoice.

**Request:**

```http
POST /api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Customer requested cancellation due to duplicate invoice"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Cancellation reason (required for audit) |

**Success Response (200 OK):**

Returns updated invoice with status = CANCELLED.

**Error Responses:**

```json
// 409 Conflict - Cannot cancel paid invoice
{
  "timestamp": "2025-11-15T14:25:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot cancel invoice in PAID status. Paid invoices cannot be cancelled.",
  "path": "/api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef/cancel",
  "errorCode": "CANNOT_CANCEL_PAID_INVOICE"
}
```

```json
// 409 Conflict - Has payments
{
  "timestamp": "2025-11-15T14:25:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot cancel invoice with recorded payments. Void payments first.",
  "path": "/api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef/cancel",
  "errorCode": "INVOICE_HAS_PAYMENTS",
  "details": {
    "paymentsCount": 2,
    "totalPaid": 5000.00
  }
}
```

### GET /invoices/{id}/payments

Get all payments for an invoice.

**Request:**

```http
GET /api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef/payments
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "payments": [
    {
      "id": "payment-uuid-1",
      "amount": 3000.00,
      "paymentDate": "2025-11-15",
      "paymentMethod": "CREDIT_CARD",
      "referenceNumber": "**** 1234",
      "status": "APPLIED"
    },
    {
      "id": "payment-uuid-2",
      "amount": 2300.00,
      "paymentDate": "2025-11-20",
      "paymentMethod": "BANK_TRANSFER",
      "referenceNumber": "TXN-987654",
      "status": "APPLIED"
    }
  ],
  "totalAppliedAmount": 5300.00,
  "totalVoidedAmount": 0.00,
  "paymentsCount": 2
}
```

### GET /invoices/status/{status}

Get invoices by status.

**Request:**

```http
GET /api/v1/invoices/status/SENT?pageNumber=0&pageSize=20
Authorization: Bearer {token}
```

**Path Parameters:**

| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| status | string | Yes | DRAFT, SENT, PAID, CANCELLED |

**Success Response (200 OK):**

Returns paginated list of invoices (same structure as GET /invoices).

### GET /invoices/overdue

Get all overdue invoices.

**Request:**

```http
GET /api/v1/invoices/overdue?pageNumber=0&pageSize=20
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": "invoice-uuid-1",
      "invoiceNumber": "INV-2025-012",
      "customerName": "Jane Smith",
      "invoiceDate": "2025-10-15",
      "dueDate": "2025-11-01",
      "status": "SENT",
      "totalAmount": 5400.00,
      "balance": 5400.00,
      "isOverdue": true,
      "daysOverdue": 7
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "summary": {
    "totalOverdueAmount": 5400.00,
    "overdueInvoicesCount": 1
  }
}
```

---

## 4. Payment Endpoints

### GET /payments/{id}

Get payment by ID.

**Request:**

```http
GET /api/v1/payments/payment-uuid-1
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "id": "payment-uuid-1",
  "invoice": {
    "id": "b5c9d1e3-5678-9012-3def-456789abcdef",
    "invoiceNumber": "INV-2025-001",
    "customerName": "John Doe"
  },
  "amount": 3000.00,
  "paymentDate": "2025-11-15",
  "paymentMethod": "CREDIT_CARD",
  "referenceNumber": "**** 1234",
  "status": "APPLIED",
  "notes": "First installment payment",
  "createdAt": "2025-11-15T14:20:00Z",
  "createdBy": "admin@invoiceme.com",
  "voidedAt": null,
  "voidedBy": null,
  "voidReason": null
}
```

### GET /payments

List payments for an invoice with optional status filtering.

**Request:**

```http
GET /api/v1/payments?invoiceId=b5c9d1e3-5678-9012-3def-456789abcdef&status=APPLIED
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| invoiceId | UUID | Yes | - | Invoice ID to list payments for |
| status | string | No | all | Filter by payment status (APPLIED, VOIDED) |

**Success Response (200 OK):**

```json
[
  {
    "id": "payment-uuid-1",
    "invoiceId": "b5c9d1e3-5678-9012-3def-456789abcdef",
    "amount": 3000.00,
    "paymentDate": "2025-11-15",
    "paymentMethod": "CREDIT_CARD",
    "referenceNumber": "**** 1234",
    "status": "APPLIED",
    "notes": "First installment payment",
    "createdAt": "2025-11-15T14:20:00Z",
    "createdBy": "admin@invoiceme.com",
    "voidedAt": null,
    "voidedBy": null,
    "voidReason": null
  },
  {
    "id": "payment-uuid-2",
    "invoiceId": "b5c9d1e3-5678-9012-3def-456789abcdef",
    "amount": 2300.00,
    "paymentDate": "2025-11-20",
    "paymentMethod": "BANK_TRANSFER",
    "referenceNumber": "TRX-2025-11-20-001",
    "status": "APPLIED",
    "notes": "Final payment",
    "createdAt": "2025-11-20T09:30:00Z",
    "createdBy": "admin@invoiceme.com",
    "voidedAt": null,
    "voidedBy": null,
    "voidReason": null
  }
]
```

### POST /payments/{id}/void

Void a payment.

**Request:**

```http
POST /api/v1/payments/payment-uuid-1/void
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Chargeback received from credit card company"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Void reason (required for audit) |

**Success Response (200 OK):**

```json
{
  "id": "payment-uuid-1",
  "invoice": {
    "id": "b5c9d1e3-5678-9012-3def-456789abcdef",
    "invoiceNumber": "INV-2025-001",
    "customerName": "John Doe",
    "newBalance": 8300.00
  },
  "amount": 3000.00,
  "paymentDate": "2025-11-15",
  "paymentMethod": "CREDIT_CARD",
  "referenceNumber": "**** 1234",
  "status": "VOIDED",
  "notes": "First installment payment",
  "createdAt": "2025-11-15T14:20:00Z",
  "createdBy": "admin@invoiceme.com",
  "voidedAt": "2025-11-20T10:15:00Z",
  "voidedBy": "admin@invoiceme.com",
  "voidReason": "Chargeback received from credit card company"
}
```

**Error Responses:**

```json
// 409 Conflict - Already voided
{
  "timestamp": "2025-11-20T10:15:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Payment is already voided",
  "path": "/api/v1/payments/payment-uuid-1/void",
  "errorCode": "PAYMENT_ALREADY_VOIDED"
}
```

---

## 5. Common Response Structures

### Paginated Response

All list endpoints return paginated responses with this structure:

```typescript
{
  "content": Array<T>,          // Array of items
  "pageNumber": number,         // Current page (0-indexed)
  "pageSize": number,           // Items per page
  "totalElements": number,      // Total items across all pages
  "totalPages": number,         // Total number of pages
  "first": boolean,             // Is this the first page?
  "last": boolean,              // Is this the last page?
  "numberOfElements": number,   // Items in current page
  "empty": boolean              // Is the page empty?
}
```

---

## 6. Error Handling

### Standard Error Response

All error responses follow this structure:

```typescript
{
  "timestamp": string,          // ISO 8601 timestamp
  "status": number,             // HTTP status code
  "error": string,              // HTTP status text
  "message": string,            // Human-readable error message
  "path": string,               // Request path
  "errorCode"?: string,         // Application-specific error code
  "errors"?: Array<{            // Validation errors (400 only)
    field: string,
    rejectedValue: any,
    message: string
  }>,
  "details"?: object,           // Additional error context
  "traceId"?: string            // Request trace ID for debugging
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Business rule violation, duplicate resource |
| 422 | Unprocessable Entity | Valid request but business logic prevents processing |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## 7. Rate Limiting

API requests are rate limited to prevent abuse.

**Rate Limits:**
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699444800
```

**Rate Limit Exceeded Response:**

```json
{
  "timestamp": "2025-11-08T10:30:00Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "path": "/api/v1/customers",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 100,
    "resetAt": "2025-11-08T10:31:00Z"
  }
}
```

---

## 8. Pagination

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| pageNumber | integer | 0 | - | Page number (0-indexed) |
| pageSize | integer | 20 | 100 | Items per page |

### Link Header (Optional)

Paginated responses may include Link header for navigation:

```http
Link: <https://api.invoiceme.com/api/v1/customers?pageNumber=0&pageSize=20>; rel="first",
      <https://api.invoiceme.com/api/v1/customers?pageNumber=1&pageSize=20>; rel="next",
      <https://api.invoiceme.com/api/v1/customers?pageNumber=9&pageSize=20>; rel="last"
```

---

**End of API Contract Specification**

This document provides complete API contracts for all endpoints. Use this as the source of truth for frontend-backend integration.