# Product Requirements Document: InvoiceMe ERP System
## Comprehensive Frontend & Backend Specifications

**Document Version:** 1.0
**Last Updated:** 2025-11-08
**Project:** InvoiceMe - AI-Assisted Full-Stack ERP Assessment
**Author:** Business Analysis Team

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Domain Model & Business Logic](#domain-model--business-logic)
4. [Backend Requirements](#backend-requirements)
5. [Frontend Requirements](#frontend-requirements)
6. [Database Schema](#database-schema)
7. [Security & Authentication](#security--authentication)
8. [Testing Requirements](#testing-requirements)
9. [Performance & Quality Standards](#performance--quality-standards)
10. [Deployment & Infrastructure](#deployment--infrastructure)

---

## 1. Executive Summary

### 1.1 Project Goal
InvoiceMe is a production-quality ERP-style invoicing system designed to demonstrate mastery of modern software architecture principles including Domain-Driven Design (DDD), Command Query Responsibility Segregation (CQRS), and Vertical Slice Architecture (VSA). The system manages the complete lifecycle of customer invoicing and payment processing.

### 1.2 Core Business Capabilities
- **Customer Management**: Create, update, and maintain customer records
- **Invoice Management**: Draft, send, and track invoices with line items
- **Payment Processing**: Record and apply payments against invoices
- **Reporting**: Query and report on customers, invoices, and payment history

### 1.3 Success Criteria
- Clean architectural separation of concerns
- Sub-200ms API response times for standard operations
- Responsive, lag-free UI experience
- Comprehensive integration test coverage
- Production-ready code quality

---

## 2. System Architecture Overview

### 2.1 Architectural Patterns

#### 2.1.1 Domain-Driven Design (DDD)
**Core Bounded Contexts:**
- **Customer Context**: Customer entity, customer lifecycle management
- **Invoicing Context**: Invoice entity, line items, invoice lifecycle, calculations
- **Payment Context**: Payment entity, payment application logic

**Aggregate Roots:**
- `Customer`: Root for customer-related operations
- `Invoice`: Root for invoice and line item operations
- `Payment`: Root for payment operations

#### 2.1.2 CQRS (Command Query Responsibility Segregation)
**Command Side (Write Operations):**
- Commands represent intent (CreateCustomerCommand, UpdateInvoiceCommand)
- Command handlers execute business logic and persist state changes
- Commands return success/failure acknowledgments (not data)

**Query Side (Read Operations):**
- Queries request specific data projections
- Query handlers retrieve and shape data for presentation
- Queries return DTOs optimized for client consumption

#### 2.1.3 Vertical Slice Architecture
**Feature Organization:**
```
src/
├── features/
│   ├── customers/
│   │   ├── commands/
│   │   │   ├── CreateCustomer/
│   │   │   │   ├── CreateCustomerCommand.java
│   │   │   │   ├── CreateCustomerCommandHandler.java
│   │   │   │   └── CreateCustomerValidator.java
│   │   │   ├── UpdateCustomer/
│   │   │   └── DeleteCustomer/
│   │   ├── queries/
│   │   │   ├── GetCustomerById/
│   │   │   └── ListCustomers/
│   │   └── domain/
│   │       └── Customer.java
│   ├── invoices/
│   │   ├── commands/
│   │   ├── queries/
│   │   └── domain/
│   └── payments/
│       ├── commands/
│       ├── queries/
│       └── domain/
```

### 2.2 Layer Architecture

**Presentation Layer (API Controllers)**
- REST endpoint exposure
- Request/response DTOs
- HTTP status code mapping
- Input validation (basic format validation)

**Application Layer (Command/Query Handlers)**
- Business workflow orchestration
- Transaction management
- Domain event publishing
- Cross-cutting concerns (logging, validation)

**Domain Layer (Entities, Value Objects, Domain Services)**
- Business logic encapsulation
- Domain invariants enforcement
- Rich entity behavior
- Domain event definitions

**Infrastructure Layer (Repositories, External Services)**
- Data persistence (JPA/Hibernate)
- External integrations
- Infrastructure services (email, file storage)

---

## 3. Domain Model & Business Logic

### 3.1 Customer Domain

#### 3.1.1 Customer Entity
**Attributes:**
```java
public class Customer {
    private CustomerId id;              // UUID-based identifier
    private CustomerName name;          // Value Object: FirstName, LastName
    private EmailAddress email;         // Value Object with validation
    private PhoneNumber phone;          // Value Object with formatting
    private Address billingAddress;     // Value Object: Street, City, State, Zip, Country
    private TaxIdentifier taxId;        // Optional: Value Object
    private CustomerStatus status;      // Enum: ACTIVE, INACTIVE, SUSPENDED
    private AuditInfo auditInfo;        // Created/Modified timestamps and user
}
```

**Business Rules:**
1. Customer email must be unique across the system
2. Customer name is required and must have both first and last name
3. Customer cannot be deleted if they have invoices in SENT or PAID status
4. Inactive customers cannot have new invoices created
5. Customer status changes must be audited

**Domain Events:**
- `CustomerCreated`
- `CustomerUpdated`
- `CustomerStatusChanged`
- `CustomerDeleted`

#### 3.1.2 Customer Commands & Validation

**CreateCustomerCommand:**
```java
public class CreateCustomerCommand {
    private String firstName;           // Required, 2-50 chars
    private String lastName;            // Required, 2-50 chars
    private String email;               // Required, valid email format
    private String phone;               // Optional, E.164 format
    private AddressDto billingAddress;  // Required
    private String taxId;               // Optional
}
```

**Validation Rules:**
- Email format validation (RFC 5322)
- Email uniqueness check
- Phone number format validation (if provided)
- Address validation (all required fields present)
- Name sanitization (no special characters except hyphen, apostrophe)

**UpdateCustomerCommand:**
```java
public class UpdateCustomerCommand {
    private UUID customerId;            // Required
    private String firstName;           // Optional
    private String lastName;            // Optional
    private String email;               // Optional
    private String phone;               // Optional
    private AddressDto billingAddress;  // Optional
    private String taxId;               // Optional
}
```

**Validation Rules:**
- Customer must exist
- If email changed, new email must be unique
- Cannot update customer with DELETED status
- At least one field must be provided for update

**DeleteCustomerCommand:**
```java
public class DeleteCustomerCommand {
    private UUID customerId;            // Required
    private boolean hardDelete;         // Default: false (soft delete)
}
```

**Business Rules:**
- Cannot delete customer with active invoices (SENT status)
- Soft delete: marks customer as DELETED, preserves data
- Hard delete: only allowed if no invoice history exists

#### 3.1.3 Customer Queries

**GetCustomerByIdQuery:**
```java
public class GetCustomerByIdQuery {
    private UUID customerId;
}

// Returns:
public class CustomerDetailDto {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private AddressDto billingAddress;
    private String taxId;
    private String status;
    private int totalInvoicesCount;
    private BigDecimal totalInvoicedAmount;
    private BigDecimal totalPaidAmount;
    private BigDecimal outstandingBalance;
    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;
}
```

**ListCustomersQuery:**
```java
public class ListCustomersQuery {
    private CustomerStatus status;      // Optional filter
    private String searchTerm;          // Optional: searches name, email
    private String sortBy;              // name | email | createdAt (default: name)
    private SortDirection sortDirection;// ASC | DESC
    private int pageNumber;             // Default: 0
    private int pageSize;               // Default: 20, Max: 100
}

// Returns:
public class PagedCustomerListDto {
    private List<CustomerSummaryDto> customers;
    private int totalCount;
    private int pageNumber;
    private int pageSize;
    private int totalPages;
}

public class CustomerSummaryDto {
    private UUID id;
    private String fullName;
    private String email;
    private String status;
    private BigDecimal outstandingBalance;
    private int activeInvoicesCount;
}
```

---

### 3.2 Invoice Domain

#### 3.2.1 Invoice Entity
**Attributes:**
```java
public class Invoice {
    private InvoiceId id;                   // UUID-based identifier
    private InvoiceNumber invoiceNumber;    // Value Object: formatted string
    private CustomerId customerId;          // Reference to Customer
    private InvoiceDate invoiceDate;        // Value Object: LocalDate
    private DueDate dueDate;                // Value Object: LocalDate
    private InvoiceStatus status;           // Enum: DRAFT, SENT, PAID, CANCELLED
    private List<LineItem> lineItems;       // Aggregate: min 1 item
    private Money subtotal;                 // Calculated from line items
    private Money taxAmount;                // Calculated or manual
    private Money totalAmount;              // subtotal + tax
    private Money paidAmount;               // Sum of applied payments
    private Money balance;                  // totalAmount - paidAmount
    private String notes;                   // Optional text field
    private AuditInfo auditInfo;
}
```

**LineItem Value Object:**
```java
public class LineItem {
    private LineItemId id;
    private String description;         // Required, 1-500 chars
    private Quantity quantity;          // Positive decimal, max 2 decimals
    private Money unitPrice;            // Positive amount
    private Money lineTotal;            // quantity * unitPrice
    private int sortOrder;              // Display order
}
```

**Business Rules:**
1. Invoice must have at least one line item
2. Invoice number is auto-generated and immutable once assigned
3. Due date must be >= invoice date
4. Invoice in DRAFT status can be edited; SENT invoices are immutable
5. Invoice can only be marked PAID when balance = 0
6. Invoice can only transition: DRAFT → SENT → PAID
7. CANCELLED invoices cannot be modified or have payments applied
8. Deleting a line item recalculates invoice totals

**Calculation Rules:**
```
lineTotal = quantity * unitPrice
subtotal = SUM(lineItems.lineTotal)
totalAmount = subtotal + taxAmount
balance = totalAmount - paidAmount
```

**Domain Events:**
- `InvoiceCreated`
- `InvoiceUpdated`
- `InvoiceLineItemAdded`
- `InvoiceLineItemRemoved`
- `InvoiceMarkedAsSent`
- `InvoicePaymentRecorded`
- `InvoiceMarkedAsPaid`
- `InvoiceCancelled`

#### 3.2.2 Invoice Commands & Validation

**CreateInvoiceCommand (Draft):**
```java
public class CreateInvoiceCommand {
    private UUID customerId;                // Required
    private LocalDate invoiceDate;          // Required
    private LocalDate dueDate;              // Required
    private List<LineItemDto> lineItems;    // Required, min 1 item
    private BigDecimal taxAmount;           // Optional, default 0
    private String notes;                   // Optional
}

public class LineItemDto {
    private String description;             // Required, 1-500 chars
    private BigDecimal quantity;            // Required, > 0
    private BigDecimal unitPrice;           // Required, >= 0
}
```

**Validation Rules:**
- Customer must exist and be ACTIVE
- Invoice date cannot be in the future
- Due date must be >= invoice date
- Each line item must have description, quantity > 0, unitPrice >= 0
- Tax amount must be >= 0
- At least one line item required

**UpdateInvoiceCommand:**
```java
public class UpdateInvoiceCommand {
    private UUID invoiceId;                 // Required
    private LocalDate invoiceDate;          // Optional
    private LocalDate dueDate;              // Optional
    private List<LineItemDto> lineItems;    // Optional (replaces all)
    private BigDecimal taxAmount;           // Optional
    private String notes;                   // Optional
}
```

**Business Rules:**
- Invoice must exist
- Invoice must be in DRAFT status
- Cannot update SENT, PAID, or CANCELLED invoices
- Same validation as CreateInvoiceCommand for modified fields

**MarkInvoiceAsSentCommand:**
```java
public class MarkInvoiceAsSentCommand {
    private UUID invoiceId;                 // Required
    private LocalDate sentDate;             // Required
}
```

**Business Rules:**
- Invoice must exist and be in DRAFT status
- Invoice must have at least one line item
- Invoice number is assigned at this point (auto-generated)
- Sent date defaults to current date if not provided
- Invoice becomes immutable after this operation

**RecordPaymentForInvoiceCommand:**
```java
public class RecordPaymentForInvoiceCommand {
    private UUID invoiceId;                 // Required
    private BigDecimal amount;              // Required, > 0
    private LocalDate paymentDate;          // Required
    private PaymentMethod paymentMethod;    // Enum: CASH, CHECK, CREDIT_CARD, BANK_TRANSFER, OTHER
    private String referenceNumber;         // Optional
    private String notes;                   // Optional
}
```

**Business Rules:**
- Invoice must exist and be in SENT status
- Payment amount must be > 0
- Payment amount cannot exceed invoice balance
- Payment date cannot be before invoice date
- If payment amount equals balance, invoice status changes to PAID
- Multiple partial payments are allowed

**CancelInvoiceCommand:**
```java
public class CancelInvoiceCommand {
    private UUID invoiceId;                 // Required
    private String cancellationReason;      // Required
}
```

**Business Rules:**
- Invoice must exist
- Cannot cancel PAID invoices
- Cannot cancel invoices with recorded payments (must void payments first)
- Cancellation is permanent and irreversible

#### 3.2.3 Invoice Queries

**GetInvoiceByIdQuery:**
```java
public class GetInvoiceByIdQuery {
    private UUID invoiceId;
}

// Returns:
public class InvoiceDetailDto {
    private UUID id;
    private String invoiceNumber;           // null if still DRAFT
    private CustomerSummaryDto customer;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private String status;
    private List<LineItemDto> lineItems;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balance;
    private String notes;
    private List<PaymentSummaryDto> payments;
    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;
    private LocalDateTime sentAt;           // null if not sent
    private LocalDateTime paidAt;           // null if not paid
}
```

**ListInvoicesQuery:**
```java
public class ListInvoicesQuery {
    private UUID customerId;                // Optional filter
    private InvoiceStatus status;           // Optional filter
    private LocalDate fromDate;             // Optional: invoice date >= fromDate
    private LocalDate toDate;               // Optional: invoice date <= toDate
    private Boolean overdue;                // Optional: dueDate < today AND balance > 0
    private String sortBy;                  // invoiceNumber | invoiceDate | dueDate | totalAmount | balance
    private SortDirection sortDirection;    // ASC | DESC
    private int pageNumber;
    private int pageSize;
}

// Returns:
public class PagedInvoiceListDto {
    private List<InvoiceSummaryDto> invoices;
    private int totalCount;
    private int pageNumber;
    private int pageSize;
    private int totalPages;
    private BigDecimal totalAmountSum;      // Sum of all matching invoices
    private BigDecimal totalBalanceSum;     // Sum of all balances
}

public class InvoiceSummaryDto {
    private UUID id;
    private String invoiceNumber;
    private String customerName;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal balance;
    private boolean isOverdue;
}
```

**GetInvoicesByStatusQuery:**
```java
public class GetInvoicesByStatusQuery {
    private InvoiceStatus status;           // Required
    private int pageNumber;
    private int pageSize;
}
```

**GetInvoicesByCustomerQuery:**
```java
public class GetInvoicesByCustomerQuery {
    private UUID customerId;                // Required
    private InvoiceStatus status;           // Optional
    private int pageNumber;
    private int pageSize;
}
```

---

### 3.3 Payment Domain

#### 3.3.1 Payment Entity
**Attributes:**
```java
public class Payment {
    private PaymentId id;                   // UUID-based identifier
    private InvoiceId invoiceId;            // Reference to Invoice
    private Money amount;                   // Payment amount
    private PaymentDate paymentDate;        // When payment received
    private PaymentMethod paymentMethod;    // Enum
    private ReferenceNumber referenceNumber;// Optional: check #, transaction ID
    private PaymentStatus status;           // Enum: APPLIED, VOIDED
    private String notes;                   // Optional
    private AuditInfo auditInfo;
}
```

**Business Rules:**
1. Payment must reference a valid invoice
2. Payment amount must be > 0
3. Payment cannot exceed invoice balance at time of recording
4. Payment date cannot be before invoice date
5. Applied payments reduce invoice balance
6. Voided payments reverse the balance reduction
7. Voided payments cannot be re-applied (create new payment instead)

**Domain Events:**
- `PaymentRecorded`
- `PaymentVoided`

#### 3.3.2 Payment Commands & Validation

**RecordPaymentCommand:**
(See RecordPaymentForInvoiceCommand above - same structure)

**VoidPaymentCommand:**
```java
public class VoidPaymentCommand {
    private UUID paymentId;                 // Required
    private String voidReason;              // Required
}
```

**Business Rules:**
- Payment must exist and have APPLIED status
- Voiding payment increases invoice balance
- If invoice was PAID, voiding payment changes status back to SENT
- Void operation is audited with reason

#### 3.3.3 Payment Queries

**GetPaymentByIdQuery:**
```java
public class GetPaymentByIdQuery {
    private UUID paymentId;
}

// Returns:
public class PaymentDetailDto {
    private UUID id;
    private InvoiceSummaryDto invoice;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String referenceNumber;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime voidedAt;
    private String voidedBy;
    private String voidReason;
}
```

**ListPaymentsForInvoiceQuery:**
```java
public class ListPaymentsForInvoiceQuery {
    private UUID invoiceId;                 // Required
    private PaymentStatus status;           // Optional filter
}

// Returns:
public class PaymentListDto {
    private List<PaymentSummaryDto> payments;
    private BigDecimal totalAppliedAmount;
    private BigDecimal totalVoidedAmount;
}

public class PaymentSummaryDto {
    private UUID id;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String referenceNumber;
    private String status;
}
```

**ListAllPaymentsQuery:**
```java
public class ListAllPaymentsQuery {
    private UUID customerId;                // Optional: filter by customer
    private LocalDate fromDate;             // Optional
    private LocalDate toDate;               // Optional
    private PaymentStatus status;           // Optional
    private String sortBy;                  // paymentDate | amount
    private SortDirection sortDirection;
    private int pageNumber;
    private int pageSize;
}
```

---

## 4. Backend Requirements

### 4.1 Technology Stack
- **Framework**: Spring Boot 3.2+ (Java 17+)
- **Build Tool**: Maven or Gradle
- **ORM**: Spring Data JPA with Hibernate
- **Database**: PostgreSQL 14+ (primary), H2 (testing)
- **Validation**: Jakarta Bean Validation (Hibernate Validator)
- **Mapping**: MapStruct for DTO ↔ Entity mapping
- **Testing**: JUnit 5, Mockito, Spring Boot Test, Testcontainers
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Logging**: SLF4J with Logback

### 4.2 Project Structure

```
invoice-me-backend/
├── src/main/java/com/invoiceme/
│   ├── InvoiceMeApplication.java
│   ├── common/
│   │   ├── domain/
│   │   │   ├── AuditInfo.java
│   │   │   ├── DomainEvent.java
│   │   │   └── Entity.java (base class)
│   │   ├── valueobjects/
│   │   │   ├── Money.java
│   │   │   ├── EmailAddress.java
│   │   │   ├── PhoneNumber.java
│   │   │   └── Address.java
│   │   ├── exceptions/
│   │   │   ├── BusinessRuleViolationException.java
│   │   │   ├── EntityNotFoundException.java
│   │   │   ├── DuplicateEntityException.java
│   │   │   └── InvalidOperationException.java
│   │   └── infrastructure/
│   │       ├── pagination/
│   │       ├── validation/
│   │       └── eventbus/
│   ├── features/
│   │   ├── customers/
│   │   │   ├── api/
│   │   │   │   └── CustomerController.java
│   │   │   ├── domain/
│   │   │   │   ├── Customer.java
│   │   │   │   ├── CustomerRepository.java (interface)
│   │   │   │   └── valueobjects/
│   │   │   ├── commands/
│   │   │   │   ├── CreateCustomer/
│   │   │   │   │   ├── CreateCustomerCommand.java
│   │   │   │   │   ├── CreateCustomerCommandHandler.java
│   │   │   │   │   └── CreateCustomerValidator.java
│   │   │   │   ├── UpdateCustomer/
│   │   │   │   └── DeleteCustomer/
│   │   │   ├── queries/
│   │   │   │   ├── GetCustomerById/
│   │   │   │   └── ListCustomers/
│   │   │   ├── infrastructure/
│   │   │   │   ├── CustomerEntity.java (JPA)
│   │   │   │   ├── CustomerJpaRepository.java
│   │   │   │   └── CustomerRepositoryImpl.java
│   │   │   └── dto/
│   │   │       ├── CustomerDetailDto.java
│   │   │       └── CreateCustomerRequestDto.java
│   │   ├── invoices/
│   │   │   └── [similar structure]
│   │   └── payments/
│   │       └── [similar structure]
│   └── security/
│       ├── config/
│       ├── services/
│       └── dto/
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/
│       ├── V1__create_customers_table.sql
│       ├── V2__create_invoices_table.sql
│       └── V3__create_payments_table.sql
└── src/test/
    └── [mirrors main structure]
```

### 4.3 REST API Endpoints

#### 4.3.1 Customer API

**Base Path:** `/api/v1/customers`

| Method | Endpoint | Description | Request Body | Response | Status Codes |
|--------|----------|-------------|--------------|----------|--------------|
| POST | `/` | Create customer | CreateCustomerRequest | CustomerDetailDto | 201, 400, 409 |
| GET | `/{id}` | Get customer by ID | - | CustomerDetailDto | 200, 404 |
| PUT | `/{id}` | Update customer | UpdateCustomerRequest | CustomerDetailDto | 200, 400, 404, 409 |
| DELETE | `/{id}` | Delete customer | - | - | 204, 404, 409 |
| GET | `/` | List customers (paginated) | Query params | PagedCustomerList | 200 |
| GET | `/{id}/invoices` | Get customer invoices | Query params | PagedInvoiceList | 200, 404 |
| GET | `/{id}/balance` | Get customer balance summary | - | BalanceSummaryDto | 200, 404 |

**Example Request/Response:**

```http
POST /api/v1/customers
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

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/customers/a3b7f8c2-1234-5678-9abc-def012345678

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

#### 4.3.2 Invoice API

**Base Path:** `/api/v1/invoices`

| Method | Endpoint | Description | Request Body | Response | Status Codes |
|--------|----------|-------------|--------------|----------|--------------|
| POST | `/` | Create invoice (draft) | CreateInvoiceRequest | InvoiceDetailDto | 201, 400, 404 |
| GET | `/{id}` | Get invoice by ID | - | InvoiceDetailDto | 200, 404 |
| PUT | `/{id}` | Update invoice (draft only) | UpdateInvoiceRequest | InvoiceDetailDto | 200, 400, 404, 409 |
| DELETE | `/{id}` | Delete invoice (draft only) | - | - | 204, 404, 409 |
| GET | `/` | List invoices (paginated) | Query params | PagedInvoiceList | 200 |
| POST | `/{id}/send` | Mark invoice as sent | MarkAsSentRequest | InvoiceDetailDto | 200, 404, 409 |
| POST | `/{id}/payments` | Record payment | RecordPaymentRequest | PaymentDetailDto | 201, 400, 404, 409 |
| POST | `/{id}/cancel` | Cancel invoice | CancelInvoiceRequest | InvoiceDetailDto | 200, 404, 409 |
| GET | `/{id}/payments` | List invoice payments | - | PaymentListDto | 200, 404 |
| GET | `/status/{status}` | Get invoices by status | Query params | PagedInvoiceList | 200 |
| GET | `/overdue` | Get overdue invoices | Query params | PagedInvoiceList | 200 |

**Example Request/Response:**

```http
POST /api/v1/invoices
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

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef

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
      "id": "line-1",
      "description": "Web Development Services - October 2025",
      "quantity": 40.0,
      "unitPrice": 150.00,
      "lineTotal": 6000.00,
      "sortOrder": 0
    },
    {
      "id": "line-2",
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

#### 4.3.3 Payment API

**Base Path:** `/api/v1/payments`

| Method | Endpoint | Description | Request Body | Response | Status Codes |
|--------|----------|-------------|--------------|----------|--------------|
| GET | `/{id}` | Get payment by ID | - | PaymentDetailDto | 200, 404 |
| GET | `/` | List all payments (paginated) | Query params | PagedPaymentList | 200 |
| POST | `/{id}/void` | Void payment | VoidPaymentRequest | PaymentDetailDto | 200, 404, 409 |

Note: Payment creation is done through Invoice API (`POST /api/v1/invoices/{id}/payments`)

#### 4.3.4 Authentication API

**Base Path:** `/api/v1/auth`

| Method | Endpoint | Description | Request Body | Response | Status Codes |
|--------|----------|-------------|--------------|----------|--------------|
| POST | `/login` | Authenticate user | LoginRequest | AuthResponse | 200, 401 |
| POST | `/logout` | Logout user | - | - | 204 |
| GET | `/me` | Get current user | - | UserDto | 200, 401 |
| POST | `/refresh` | Refresh auth token | RefreshTokenRequest | AuthResponse | 200, 401 |

### 4.4 Error Handling

#### 4.4.1 Standard Error Response Format

All error responses follow this structure:

```json
{
  "timestamp": "2025-11-08T10:40:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for object='createCustomerRequest'",
  "path": "/api/v1/customers",
  "errors": [
    {
      "field": "email",
      "rejectedValue": "invalid-email",
      "message": "Email must be a valid email address"
    },
    {
      "field": "billingAddress.zipCode",
      "rejectedValue": "",
      "message": "Zip code is required"
    }
  ],
  "traceId": "a3b7f8c2-trace-id"
}
```

#### 4.4.2 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 OK | Successful GET, PUT operations |
| 201 Created | Successful POST (resource created) |
| 204 No Content | Successful DELETE |
| 400 Bad Request | Validation errors, malformed requests |
| 401 Unauthorized | Authentication required or failed |
| 403 Forbidden | Authenticated but not authorized |
| 404 Not Found | Resource not found |
| 409 Conflict | Business rule violation (e.g., duplicate email, invalid state transition) |
| 422 Unprocessable Entity | Request valid but business logic prevents processing |
| 500 Internal Server Error | Unexpected server error |
| 503 Service Unavailable | Service temporarily unavailable |

#### 4.4.3 Business Rule Violation Examples

**Duplicate Email:**
```http
HTTP/1.1 409 Conflict

{
  "timestamp": "2025-11-08T10:45:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Customer with email 'john.doe@example.com' already exists",
  "path": "/api/v1/customers",
  "errorCode": "DUPLICATE_EMAIL",
  "traceId": "..."
}
```

**Invalid State Transition:**
```http
HTTP/1.1 409 Conflict

{
  "timestamp": "2025-11-08T10:46:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot update invoice in SENT status. Only DRAFT invoices can be modified.",
  "path": "/api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef",
  "errorCode": "INVALID_INVOICE_STATUS",
  "traceId": "..."
}
```

**Payment Exceeds Balance:**
```http
HTTP/1.1 422 Unprocessable Entity

{
  "timestamp": "2025-11-08T10:47:00Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Payment amount ($10,000.00) exceeds invoice balance ($8,300.00)",
  "path": "/api/v1/invoices/b5c9d1e3-5678-9012-3def-456789abcdef/payments",
  "errorCode": "PAYMENT_EXCEEDS_BALANCE",
  "details": {
    "invoiceBalance": 8300.00,
    "requestedAmount": 10000.00
  },
  "traceId": "..."
}
```

### 4.5 Validation Rules Implementation

#### 4.5.1 Bean Validation Annotations

```java
@Data
public class CreateCustomerRequestDto {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "First name contains invalid characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "Last name contains invalid characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number must be in E.164 format")
    private String phone;

    @NotNull(message = "Billing address is required")
    @Valid
    private AddressDto billingAddress;

    @Pattern(regexp = "^\\d{2}-\\d{7}$", message = "Tax ID must be in format XX-XXXXXXX")
    private String taxId;
}
```

#### 4.5.2 Custom Validators

**Email Uniqueness Validator:**
```java
@Component
public class UniqueEmailValidator {

    @Autowired
    private CustomerRepository customerRepository;

    public void validate(String email, UUID excludeCustomerId) {
        Optional<Customer> existing = customerRepository.findByEmail(email);
        if (existing.isPresent() && !existing.get().getId().equals(excludeCustomerId)) {
            throw new DuplicateEntityException("Customer with email '" + email + "' already exists");
        }
    }
}
```

**Invoice Status Transition Validator:**
```java
@Component
public class InvoiceStatusTransitionValidator {

    private static final Map<InvoiceStatus, Set<InvoiceStatus>> ALLOWED_TRANSITIONS = Map.of(
        InvoiceStatus.DRAFT, Set.of(InvoiceStatus.SENT, InvoiceStatus.CANCELLED),
        InvoiceStatus.SENT, Set.of(InvoiceStatus.PAID, InvoiceStatus.CANCELLED),
        InvoiceStatus.PAID, Set.of(),
        InvoiceStatus.CANCELLED, Set.of()
    );

    public void validate(InvoiceStatus currentStatus, InvoiceStatus newStatus) {
        if (!ALLOWED_TRANSITIONS.get(currentStatus).contains(newStatus)) {
            throw new InvalidOperationException(
                String.format("Cannot transition invoice from %s to %s", currentStatus, newStatus)
            );
        }
    }
}
```

### 4.6 Database Access & Repository Pattern

#### 4.6.1 Repository Interface (Domain Layer)

```java
public interface CustomerRepository {
    Customer save(Customer customer);
    Optional<Customer> findById(CustomerId id);
    Optional<Customer> findByEmail(String email);
    List<Customer> findAll(CustomerQuery query);
    void delete(CustomerId id);
    boolean existsByEmail(String email);
}
```

#### 4.6.2 JPA Entity (Infrastructure Layer)

```java
@Entity
@Table(name = "customers", indexes = {
    @Index(name = "idx_customer_email", columnList = "email", unique = true),
    @Index(name = "idx_customer_status", columnList = "status")
})
@Data
public class CustomerEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "street", column = @Column(name = "billing_street")),
        @AttributeOverride(name = "city", column = @Column(name = "billing_city")),
        @AttributeOverride(name = "state", column = @Column(name = "billing_state")),
        @AttributeOverride(name = "zipCode", column = @Column(name = "billing_zip")),
        @AttributeOverride(name = "country", column = @Column(name = "billing_country"))
    })
    private AddressEmbeddable billingAddress;

    @Column(name = "tax_id", length = 20)
    private String taxId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false, updatable = false, length = 100)
    private String createdBy;

    @Column(name = "last_modified_at", nullable = false)
    private LocalDateTime lastModifiedAt;

    @Column(name = "last_modified_by", nullable = false, length = 100)
    private String lastModifiedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastModifiedAt = LocalDateTime.now();
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }
}
```

#### 4.6.3 Repository Implementation

```java
@Repository
public class CustomerRepositoryImpl implements CustomerRepository {

    @Autowired
    private CustomerJpaRepository jpaRepository;

    @Autowired
    private CustomerMapper mapper;

    @Override
    public Customer save(Customer customer) {
        CustomerEntity entity = mapper.toEntity(customer);
        CustomerEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Customer> findById(CustomerId id) {
        return jpaRepository.findById(id.getValue())
            .map(mapper::toDomain);
    }

    @Override
    public Optional<Customer> findByEmail(String email) {
        return jpaRepository.findByEmail(email)
            .map(mapper::toDomain);
    }

    // ... additional methods
}
```

### 4.7 Transaction Management

#### 4.7.1 Command Handler Transaction Boundaries

```java
@Component
@Transactional
public class CreateCustomerCommandHandler {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UniqueEmailValidator emailValidator;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public UUID handle(CreateCustomerCommand command) {
        // Validation
        emailValidator.validate(command.getEmail(), null);

        // Create domain object
        Customer customer = Customer.create(
            command.getFirstName(),
            command.getLastName(),
            command.getEmail(),
            command.getPhone(),
            command.getBillingAddress(),
            command.getTaxId()
        );

        // Persist
        Customer saved = customerRepository.save(customer);

        // Publish domain events
        saved.getDomainEvents().forEach(eventPublisher::publishEvent);

        return saved.getId().getValue();
    }
}
```

#### 4.7.2 Transaction Isolation Levels

- **Default**: READ_COMMITTED for all operations
- **Invoice Payment Recording**: SERIALIZABLE to prevent concurrent payment race conditions
- **Read-only Queries**: Mark as `@Transactional(readOnly = true)` for optimization

### 4.8 Logging & Observability

#### 4.8.1 Logging Standards

**Log Levels:**
- **ERROR**: System errors, unhandled exceptions
- **WARN**: Business rule violations, validation failures
- **INFO**: Command executions, state transitions, API calls
- **DEBUG**: Query executions, detailed flow traces
- **TRACE**: Fine-grained debugging (development only)

**Logging Format:**
```java
@Slf4j
@Component
public class CreateInvoiceCommandHandler {

    public UUID handle(CreateInvoiceCommand command) {
        log.info("Creating invoice for customer [customerId={}]", command.getCustomerId());

        try {
            // ... business logic
            log.info("Invoice created successfully [invoiceId={}, customerId={}]",
                invoiceId, command.getCustomerId());
            return invoiceId;
        } catch (BusinessRuleViolationException e) {
            log.warn("Invoice creation failed due to business rule violation [customerId={}, reason={}]",
                command.getCustomerId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating invoice [customerId={}]",
                command.getCustomerId(), e);
            throw e;
        }
    }
}
```

#### 4.8.2 Metrics & Monitoring

**Key Metrics to Track:**
- API response times (p50, p95, p99)
- Command execution times
- Query execution times
- Database connection pool metrics
- Error rates by endpoint
- Business metrics (invoices created, payments recorded per time period)

**Implementation:**
Use Spring Boot Actuator + Micrometer for metrics collection

---

## 5. Frontend Requirements

### 5.1 Technology Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript (strict mode)
- **State Management**: React Context API + Zustand
- **Navigation**: React Navigation v6
- **UI Framework**: React Native Paper or NativeBase
- **Form Handling**: React Hook Form
- **API Client**: Axios with interceptors
- **Data Fetching**: TanStack Query (React Query)
- **Date Handling**: date-fns
- **Validation**: Zod
- **Testing**: Jest, React Native Testing Library

### 5.2 Architecture Pattern: MVVM

**Model-View-ViewModel Structure:**

```
src/
├── features/
│   ├── customers/
│   │   ├── models/
│   │   │   ├── Customer.ts
│   │   │   └── CustomerRepository.ts
│   │   ├── viewmodels/
│   │   │   ├── CustomerListViewModel.ts
│   │   │   ├── CustomerDetailViewModel.ts
│   │   │   └── CreateCustomerViewModel.ts
│   │   ├── views/
│   │   │   ├── CustomerListScreen.tsx
│   │   │   ├── CustomerDetailScreen.tsx
│   │   │   ├── CreateCustomerScreen.tsx
│   │   │   └── components/
│   │   │       ├── CustomerCard.tsx
│   │   │       └── CustomerForm.tsx
│   │   └── navigation/
│   │       └── CustomerNavigator.tsx
│   ├── invoices/
│   │   └── [similar structure]
│   └── payments/
│       └── [similar structure]
├── shared/
│   ├── models/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── services/
│       └── api/
│           ├── ApiClient.ts
│           ├── CustomerApi.ts
│           ├── InvoiceApi.ts
│           └── PaymentApi.ts
├── navigation/
│   ├── AppNavigator.tsx
│   └── types.ts
└── theme/
    ├── colors.ts
    ├── typography.ts
    └── spacing.ts
```

### 5.3 Screen Specifications

#### 5.3.1 Authentication Screens

**Login Screen**

**UI Elements:**
- App logo/branding (centered at top)
- Email input field (with email keyboard type)
- Password input field (with secure text entry)
- "Remember me" checkbox
- "Login" button (primary action)
- "Forgot password?" link (future enhancement placeholder)
- Error message display area
- Loading spinner (during authentication)

**Behavior:**
- Email validation (format check)
- Password minimum length validation (8 characters)
- Show/hide password toggle icon
- Disable login button during API call
- Display error messages below form
- On success: Navigate to Dashboard
- Store auth token securely (AsyncStorage or Secure Store)

**Error Handling:**
- Invalid credentials: "Email or password is incorrect"
- Network error: "Unable to connect. Please check your internet connection"
- Server error: "Service temporarily unavailable. Please try again later"

**ViewModel Interface:**
```typescript
interface LoginViewModel {
    email: string;
    password: string;
    rememberMe: boolean;
    isLoading: boolean;
    error: string | null;

    setEmail(email: string): void;
    setPassword(password: string): void;
    toggleRememberMe(): void;
    login(): Promise<void>;
    clearError(): void;
}
```

---

#### 5.3.2 Customer Management Screens

**Customer List Screen**

**UI Layout:**
- Search bar at top (searches name and email)
- Filter button (status: All, Active, Inactive)
- Sort dropdown (Name A-Z, Name Z-A, Outstanding Balance)
- Floating Action Button (FAB) for "Add Customer"
- Scrollable list of customer cards
- Pull-to-refresh functionality
- Infinite scroll pagination (load 20 at a time)
- Empty state: "No customers found. Tap + to add your first customer"

**Customer Card Component:**
```
┌────────────────────────────────────┐
│ [Icon] John Doe                    │
│        john.doe@example.com        │
│                                    │
│        Outstanding: $1,250.00      │
│        Active Invoices: 3          │
│                            [→]     │
└────────────────────────────────────┘
```

**Interactions:**
- Tap card: Navigate to Customer Detail Screen
- Long press: Show context menu (Edit, Delete, View Invoices)
- Swipe left: Quick action to view invoices
- FAB tap: Navigate to Create Customer Screen

**ViewModel Interface:**
```typescript
interface CustomerListViewModel {
    customers: CustomerSummary[];
    searchTerm: string;
    statusFilter: CustomerStatus | 'ALL';
    sortBy: 'name_asc' | 'name_desc' | 'balance_desc';
    isLoading: boolean;
    isRefreshing: boolean;
    hasMore: boolean;

    setSearchTerm(term: string): void;
    setStatusFilter(status: CustomerStatus | 'ALL'): void;
    setSortBy(sort: string): void;
    loadCustomers(): Promise<void>;
    loadMore(): Promise<void>;
    refresh(): Promise<void>;
    deleteCustomer(id: string): Promise<void>;
}
```

---

**Customer Detail Screen**

**UI Layout:**
```
┌────────────────────────────────────┐
│  [← Back]    Customer    [Edit]    │
├────────────────────────────────────┤
│                                    │
│  John Doe                          │
│  john.doe@example.com              │
│  +1-555-123-4567                   │
│                                    │
│  Billing Address:                  │
│  123 Main St                       │
│  Springfield, IL 62701             │
│  USA                               │
│                                    │
│  Tax ID: 12-3456789                │
│  Status: Active                    │
│                                    │
├────────────────────────────────────┤
│  Account Summary                   │
│  ────────────────────────────────  │
│  Total Invoiced:     $15,450.00    │
│  Total Paid:         $14,200.00    │
│  Outstanding:         $1,250.00    │
│                                    │
│  Active Invoices: 3                │
│  Total Invoices: 12                │
├────────────────────────────────────┤
│  [View All Invoices]               │
│  [Create Invoice]                  │
└────────────────────────────────────┘
```

**Header Actions:**
- Edit button: Navigate to Edit Customer Screen
- Delete button: Show confirmation dialog

**Tabs/Sections:**
1. **Details Tab** (shown above)
2. **Recent Invoices Tab**: Shows last 5 invoices with quick view
3. **Activity History Tab**: Audit log of changes

**ViewModel Interface:**
```typescript
interface CustomerDetailViewModel {
    customer: CustomerDetail | null;
    recentInvoices: InvoiceSummary[];
    isLoading: boolean;

    loadCustomer(id: string): Promise<void>;
    loadRecentInvoices(customerId: string): Promise<void>;
    navigateToEdit(): void;
    navigateToInvoices(): void;
    createInvoice(): void;
    deleteCustomer(): Promise<void>;
}
```

---

**Create/Edit Customer Screen**

**UI Layout (Form):**
```
┌────────────────────────────────────┐
│  [✕ Cancel]  New Customer  [Save]  │
├────────────────────────────────────┤
│                                    │
│  Personal Information              │
│  ────────────────────────────────  │
│  First Name *                      │
│  [________________]                │
│                                    │
│  Last Name *                       │
│  [________________]                │
│                                    │
│  Email Address *                   │
│  [________________]                │
│                                    │
│  Phone Number                      │
│  [________________]                │
│                                    │
│  Billing Address                   │
│  ────────────────────────────────  │
│  Street Address *                  │
│  [________________]                │
│                                    │
│  City *                            │
│  [________________]                │
│                                    │
│  State *         Zip Code *        │
│  [_________]     [_______]         │
│                                    │
│  Country *                         │
│  [________________]                │
│                                    │
│  Additional Information            │
│  ────────────────────────────────  │
│  Tax ID                            │
│  [________________]                │
│                                    │
└────────────────────────────────────┘
```

**Validation Rules (Real-time):**
- First Name: Required, 2-50 chars, letters only
- Last Name: Required, 2-50 chars, letters only
- Email: Required, valid format, unique check on blur
- Phone: Optional, E.164 format
- All address fields: Required
- Tax ID: Optional, format XX-XXXXXXX

**Error Display:**
- Show validation errors below each field in red
- Disable Save button until form is valid
- Show server errors in toast notification

**Behavior:**
- Auto-save to draft (local storage) every 30 seconds
- Confirmation dialog on Cancel if form is dirty
- Loading spinner on Save button during API call
- On success: Navigate back to Customer Detail or List

**ViewModel Interface:**
```typescript
interface CreateCustomerViewModel {
    formData: CustomerFormData;
    errors: Record<string, string>;
    isLoading: boolean;
    isDirty: boolean;

    setField(field: keyof CustomerFormData, value: any): void;
    validateField(field: keyof CustomerFormData): void;
    validateForm(): boolean;
    save(): Promise<void>;
    cancel(): void;
}
```

---

#### 5.3.3 Invoice Management Screens

**Invoice List Screen**

**UI Layout:**
```
┌────────────────────────────────────┐
│  Invoices                 [+ New]  │
├────────────────────────────────────┤
│  [Filter] [Status ▼] [Sort ▼]     │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │ INV-2025-001    John Doe     │ │
│  │ Due: Nov 15, 2025            │ │
│  │ $8,300.00          SENT      │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ INV-2025-002    Jane Smith   │ │
│  │ Due: Nov 20, 2025            │ │
│  │ $5,200.00          DRAFT     │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ INV-2025-003    Acme Corp    │ │
│  │ Due: Oct 30, 2025  OVERDUE   │ │
│  │ $3,150.00          SENT      │ │
│  └──────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

**Filter Options:**
- Status: All, Draft, Sent, Paid, Overdue, Cancelled
- Date Range: This Month, Last Month, Custom Range
- Customer: Dropdown of all customers

**Sort Options:**
- Invoice Number (A-Z, Z-A)
- Invoice Date (Newest, Oldest)
- Due Date (Nearest, Farthest)
- Amount (Highest, Lowest)
- Balance (Highest, Lowest)

**Invoice Card States:**
- Draft: Gray border, "DRAFT" badge
- Sent: Blue border, "SENT" badge
- Overdue: Red border, "OVERDUE" badge (due date < today)
- Paid: Green border, "PAID" badge with checkmark

**Quick Actions (Swipe):**
- Swipe left: Edit (draft only), Send (draft), Record Payment (sent), View
- Swipe right: Delete (draft only)

**ViewModel Interface:**
```typescript
interface InvoiceListViewModel {
    invoices: InvoiceSummary[];
    filters: InvoiceFilters;
    sortBy: string;
    isLoading: boolean;
    stats: {
        totalDraft: number;
        totalSent: number;
        totalOverdue: number;
        totalOutstanding: number;
    };

    setFilters(filters: InvoiceFilters): void;
    setSortBy(sort: string): void;
    loadInvoices(): Promise<void>;
    refresh(): Promise<void>;
    deleteInvoice(id: string): Promise<void>;
}
```

---

**Invoice Detail Screen**

**UI Layout:**
```
┌────────────────────────────────────┐
│  [← Back]   INV-2025-001  [⋮ More] │
├────────────────────────────────────┤
│  Status: SENT                      │
│  Created: Nov 8, 2025              │
│  Sent: Nov 8, 2025                 │
│                                    │
│  Bill To:                          │
│  John Doe                          │
│  john.doe@example.com              │
│  123 Main St                       │
│  Springfield, IL 62701             │
│                                    │
│  Invoice Date: Nov 8, 2025         │
│  Due Date: Dec 8, 2025             │
│  Days Until Due: 30                │
│                                    │
├────────────────────────────────────┤
│  Line Items                        │
│  ────────────────────────────────  │
│  Web Development Services          │
│  40 hrs × $150.00      $6,000.00   │
│                                    │
│  UI/UX Design Consultation         │
│  8 hrs × $200.00       $1,600.00   │
│                                    │
│                        ──────────  │
│  Subtotal:              $7,600.00  │
│  Tax:                     $700.00  │
│  Total:                 $8,300.00  │
│                                    │
│  Paid:                      $0.00  │
│  Balance Due:           $8,300.00  │
├────────────────────────────────────┤
│  Payment History                   │
│  No payments recorded              │
├────────────────────────────────────┤
│  Notes:                            │
│  Payment terms: Net 30 days        │
├────────────────────────────────────┤
│  [Record Payment]                  │
│  [Send Invoice]                    │
│  [Download PDF]                    │
└────────────────────────────────────┘
```

**More Menu (⋮) Actions:**
- Edit (if DRAFT)
- Send (if DRAFT)
- Cancel Invoice
- View Customer
- Download PDF
- Share

**Status-Specific Actions:**
- **DRAFT**: Edit, Send, Delete, Download
- **SENT**: Record Payment, Download, Cancel
- **PAID**: Download, View Payments
- **CANCELLED**: Download only

**ViewModel Interface:**
```typescript
interface InvoiceDetailViewModel {
    invoice: InvoiceDetail | null;
    isLoading: boolean;

    loadInvoice(id: string): Promise<void>;
    sendInvoice(): Promise<void>;
    recordPayment(payment: PaymentData): Promise<void>;
    cancelInvoice(reason: string): Promise<void>;
    downloadPdf(): Promise<void>;
    navigateToEdit(): void;
    navigateToCustomer(): void;
}
```

---

**Create/Edit Invoice Screen**

**UI Layout:**
```
┌────────────────────────────────────┐
│  [✕ Cancel] New Invoice    [Save]  │
├────────────────────────────────────┤
│                                    │
│  Customer *                        │
│  [Select Customer ▼]               │
│  ┌──────────────────────────────┐ │
│  │ 🔍 Search customers...       │ │
│  │ ┌──────────────────────────┐ │ │
│  │ │ John Doe                 │ │ │
│  │ │ john.doe@example.com     │ │ │
│  │ └──────────────────────────┘ │ │
│  │ ┌──────────────────────────┐ │ │
│  │ │ Jane Smith               │ │ │
│  │ │ jane.smith@example.com   │ │ │
│  │ └──────────────────────────┘ │ │
│  └──────────────────────────────┘ │
│                                    │
│  Invoice Details                   │
│  ────────────────────────────────  │
│  Invoice Date *                    │
│  [Nov 8, 2025    📅]               │
│                                    │
│  Due Date *                        │
│  [Dec 8, 2025    📅]               │
│                                    │
│  Line Items                        │
│  ────────────────────────────────  │
│  ┌──────────────────────────────┐ │
│  │ Description *                │ │
│  │ [____________________]       │ │
│  │                              │ │
│  │ Qty *      Rate *    Total   │ │
│  │ [___]  ×  [______] = $0.00   │ │
│  │                       [✕]    │ │
│  └──────────────────────────────┘ │
│                                    │
│  [+ Add Line Item]                 │
│                                    │
│  Calculations                      │
│  ────────────────────────────────  │
│  Subtotal:              $0.00      │
│                                    │
│  Tax Amount                        │
│  [________]                        │
│                                    │
│  Total:                 $0.00      │
│                                    │
│  Notes                             │
│  [________________________]        │
│  [________________________]        │
│                                    │
│  [Save as Draft]  [Send Invoice]   │
└────────────────────────────────────┘
```

**Field Behaviors:**
- Customer Selector: Searchable dropdown, required
- Invoice Date: Date picker, defaults to today
- Due Date: Date picker, defaults to 30 days from invoice date
- Line Items: Minimum 1 required, maximum 50
- Quantity: Number input, > 0, max 2 decimals
- Rate: Currency input, >= 0
- Line Total: Auto-calculated, read-only
- Tax Amount: Optional currency input
- Subtotal: Auto-calculated, read-only
- Total: Auto-calculated, read-only

**Line Item Management:**
- Add Line Item: Adds new empty line item form
- Remove Line Item: Confirm dialog if description is filled
- Reorder: Drag handles to reorder line items
- Auto-focus next field on Enter key

**Validation:**
- Customer: Required
- Invoice Date: Required, cannot be in future
- Due Date: Required, must be >= invoice date
- At least 1 line item with description, qty > 0, rate >= 0
- Tax amount >= 0

**Save Actions:**
- **Save as Draft**: Saves with DRAFT status, navigates back
- **Send Invoice**: Validates, saves, marks as SENT, shows success toast

**ViewModel Interface:**
```typescript
interface CreateInvoiceViewModel {
    formData: InvoiceFormData;
    lineItems: LineItemFormData[];
    errors: Record<string, string>;
    isLoading: boolean;
    isDirty: boolean;
    subtotal: number;
    total: number;

    setCustomer(customerId: string): void;
    setInvoiceDate(date: Date): void;
    setDueDate(date: Date): void;
    setTaxAmount(amount: number): void;
    setNotes(notes: string): void;

    addLineItem(): void;
    updateLineItem(index: number, field: string, value: any): void;
    removeLineItem(index: number): void;
    reorderLineItems(fromIndex: number, toIndex: number): void;

    calculateSubtotal(): number;
    calculateTotal(): number;

    validateForm(): boolean;
    saveAsDraft(): Promise<void>;
    sendInvoice(): Promise<void>;
    cancel(): void;
}
```

---

#### 5.3.4 Payment Management Screens

**Record Payment Dialog/Screen**

**UI Layout (Modal):**
```
┌────────────────────────────────────┐
│  Record Payment          [✕ Close] │
├────────────────────────────────────┤
│                                    │
│  Invoice: INV-2025-001             │
│  Customer: John Doe                │
│  Balance Due: $8,300.00            │
│                                    │
│  Payment Amount *                  │
│  [$ _______________]               │
│  Quick: [Full] [Half] [Custom]     │
│                                    │
│  Payment Date *                    │
│  [Nov 8, 2025    📅]               │
│                                    │
│  Payment Method *                  │
│  ○ Cash                            │
│  ○ Check                           │
│  ● Credit Card                     │
│  ○ Bank Transfer                   │
│  ○ Other                           │
│                                    │
│  Reference Number                  │
│  [________________]                │
│  (e.g., Check #, Transaction ID)   │
│                                    │
│  Notes                             │
│  [________________]                │
│                                    │
│  [Cancel]         [Record Payment] │
└────────────────────────────────────┘
```

**Quick Amount Buttons:**
- **Full**: Pre-fills with full balance amount
- **Half**: Pre-fills with half balance amount
- **Custom**: Clears amount for manual entry

**Validation:**
- Amount: Required, > 0, <= invoice balance
- Payment Date: Required, >= invoice date, <= today
- Payment Method: Required selection

**Behavior:**
- After successful payment: Show success toast
- If payment = balance: Show "Invoice fully paid!" message
- If payment < balance: Show "Partial payment recorded. Remaining balance: $X.XX"
- Navigate back to Invoice Detail Screen

**ViewModel Interface:**
```typescript
interface RecordPaymentViewModel {
    invoice: InvoiceDetail;
    amount: number;
    paymentDate: Date;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    notes: string;
    errors: Record<string, string>;
    isLoading: boolean;

    setAmount(amount: number): void;
    setFullAmount(): void;
    setHalfAmount(): void;
    setPaymentDate(date: Date): void;
    setPaymentMethod(method: PaymentMethod): void;
    setReferenceNumber(ref: string): void;
    setNotes(notes: string): void;

    validateForm(): boolean;
    recordPayment(): Promise<void>;
    cancel(): void;
}
```

---

**Payment History Screen (List)**

**UI Layout:**
```
┌────────────────────────────────────┐
│  [← Back]  Payments                │
├────────────────────────────────────┤
│  Filter: [All] [Applied] [Voided]  │
│  Date Range: [This Month ▼]        │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Nov 8, 2025                  │ │
│  │ INV-2025-001 - John Doe      │ │
│  │ $3,000.00    Credit Card     │ │
│  │ Ref: **** 1234      APPLIED  │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Nov 7, 2025                  │ │
│  │ INV-2025-002 - Jane Smith    │ │
│  │ $5,200.00    Bank Transfer   │ │
│  │ Ref: TXN-987654    APPLIED   │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Nov 6, 2025                  │ │
│  │ INV-2025-003 - Acme Corp     │ │
│  │ $1,000.00    Check           │ │
│  │ Ref: #5678         VOIDED    │ │
│  └──────────────────────────────┘ │
│                                    │
│  Total Collected: $8,200.00        │
└────────────────────────────────────┘
```

**Interactions:**
- Tap payment card: Navigate to Payment Detail Screen
- Long press: Show context menu (View Invoice, Void Payment)
- Pull to refresh

---

**Payment Detail Screen**

**UI Layout:**
```
┌────────────────────────────────────┐
│  [← Back]  Payment Detail [⋮ More] │
├────────────────────────────────────┤
│                                    │
│  Payment Information               │
│  ────────────────────────────────  │
│  Amount: $3,000.00                 │
│  Status: APPLIED                   │
│  Date: November 8, 2025            │
│  Method: Credit Card               │
│  Reference: **** 1234              │
│                                    │
│  Invoice Information               │
│  ────────────────────────────────  │
│  Invoice: INV-2025-001             │
│  Customer: John Doe                │
│  Invoice Total: $8,300.00          │
│  Amount Paid: $3,000.00            │
│  Remaining Balance: $5,300.00      │
│                                    │
│  Notes:                            │
│  First installment payment         │
│                                    │
│  Audit Trail                       │
│  ────────────────────────────────  │
│  Recorded: Nov 8, 2025 10:45 AM    │
│  Recorded By: admin@invoiceme.com  │
│                                    │
│  [View Invoice]                    │
│  [Void Payment]                    │
└────────────────────────────────────┘
```

**More Menu Actions:**
- View Invoice
- Void Payment (with confirmation)
- Download Receipt

**Void Payment Confirmation:**
```
┌────────────────────────────────────┐
│  Void Payment Confirmation         │
├────────────────────────────────────┤
│                                    │
│  Are you sure you want to void     │
│  this payment of $3,000.00?        │
│                                    │
│  This will:                        │
│  • Increase invoice balance        │
│  • Mark payment as VOIDED          │
│  • Cannot be undone                │
│                                    │
│  Reason for voiding: *             │
│  [____________________]            │
│                                    │
│  [Cancel]              [Void]      │
└────────────────────────────────────┘
```

---

#### 5.3.5 Dashboard Screen

**UI Layout:**
```
┌────────────────────────────────────┐
│  Dashboard              [☰ Menu]   │
├────────────────────────────────────┤
│                                    │
│  Welcome back, Admin               │
│  Friday, November 8, 2025          │
│                                    │
│  Quick Stats                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ DRAFT  │ │  SENT  │ │  PAID  │ │
│  │   12   │ │   45   │ │  203   │ │
│  └────────┘ └────────┘ └────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Outstanding Balance          │ │
│  │ $45,820.00                   │ │
│  │ ▲ 12% from last month        │ │
│  └──────────────────────────────┘ │
│                                    │
│  Recent Activity                   │
│  ────────────────────────────────  │
│  • Payment received: $3,000       │
│    John Doe • 2 hours ago          │
│                                    │
│  • Invoice sent: INV-2025-045     │
│    Acme Corp • 5 hours ago         │
│                                    │
│  • New customer added             │
│    Jane Smith • Yesterday          │
│                                    │
│  Overdue Invoices (5)              │
│  ────────────────────────────────  │
│  INV-2025-012  $2,150  10 days    │
│  INV-2025-018  $5,400   7 days    │
│  INV-2025-023  $1,800   3 days    │
│  [View All Overdue]                │
│                                    │
│  Quick Actions                     │
│  [Create Invoice] [Add Customer]   │
└────────────────────────────────────┘
```

**Menu (☰) Navigation:**
- Dashboard
- Customers
- Invoices
- Payments
- Reports (future)
- Settings
- Logout

**ViewModel Interface:**
```typescript
interface DashboardViewModel {
    stats: {
        draftCount: number;
        sentCount: number;
        paidCount: number;
        outstandingBalance: number;
        outstandingChangePercent: number;
    };
    recentActivity: Activity[];
    overdueInvoices: InvoiceSummary[];
    isLoading: boolean;

    loadDashboardData(): Promise<void>;
    refresh(): Promise<void>;
    navigateToInvoices(filter?: string): void;
    navigateToCustomers(): void;
    createInvoice(): void;
    addCustomer(): void;
}
```

---

### 5.4 Navigation Structure

**Navigation Hierarchy:**
```
App Navigator (Stack)
├── Auth Stack (if not authenticated)
│   └── Login Screen
├── Main Drawer Navigator (if authenticated)
│   ├── Dashboard Screen
│   ├── Customer Tab Navigator
│   │   ├── Customer List Screen
│   │   ├── Customer Detail Screen
│   │   └── Create/Edit Customer Screen (Modal)
│   ├── Invoice Tab Navigator
│   │   ├── Invoice List Screen
│   │   ├── Invoice Detail Screen
│   │   └── Create/Edit Invoice Screen (Modal)
│   ├── Payment Stack Navigator
│   │   ├── Payment List Screen
│   │   └── Payment Detail Screen
│   └── Settings Screen
└── Record Payment Modal (Global)
```

**Deep Linking Support:**
```
invoiceme://customers/:id
invoiceme://invoices/:id
invoiceme://payments/:id
invoiceme://invoices/create?customerId=:customerId
```

---

### 5.5 State Management

#### 5.5.1 Global State (Zustand)

**Auth Store:**
```typescript
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
}
```

**App Store:**
```typescript
interface AppState {
    isOnline: boolean;
    lastSyncTime: Date | null;
    pendingChanges: number;
    syncData: () => Promise<void>;
}
```

#### 5.5.2 Feature State (React Query)

**Query Keys:**
```typescript
const queryKeys = {
    customers: {
        all: ['customers'] as const,
        lists: () => [...queryKeys.customers.all, 'list'] as const,
        list: (filters: CustomerFilters) => [...queryKeys.customers.lists(), filters] as const,
        details: () => [...queryKeys.customers.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    },
    invoices: {
        all: ['invoices'] as const,
        lists: () => [...queryKeys.invoices.all, 'list'] as const,
        list: (filters: InvoiceFilters) => [...queryKeys.invoices.lists(), filters] as const,
        details: () => [...queryKeys.invoices.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
    },
    payments: {
        all: ['payments'] as const,
        forInvoice: (invoiceId: string) => [...queryKeys.payments.all, 'invoice', invoiceId] as const,
    }
};
```

**Custom Hooks:**
```typescript
// useCustomers.ts
export function useCustomers(filters: CustomerFilters) {
    return useQuery({
        queryKey: queryKeys.customers.list(filters),
        queryFn: () => customerApi.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCustomer(id: string) {
    return useQuery({
        queryKey: queryKeys.customers.detail(id),
        queryFn: () => customerApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: customerApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
        },
    });
}
```

---

### 5.6 API Integration

#### 5.6.1 API Client Setup

```typescript
// ApiClient.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.EXPO_PUBLIC_API_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor: Add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = useAuthStore.getState().token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor: Handle errors
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Token expired, try to refresh
                    try {
                        await useAuthStore.getState().refreshToken();
                        // Retry original request
                        return this.client.request(error.config!);
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        useAuthStore.getState().logout();
                        throw refreshError;
                    }
                }
                throw error;
            }
        );
    }

    public get<T>(url: string, config = {}) {
        return this.client.get<T>(url, config);
    }

    public post<T>(url: string, data?: any, config = {}) {
        return this.client.post<T>(url, data, config);
    }

    public put<T>(url: string, data?: any, config = {}) {
        return this.client.put<T>(url, data, config);
    }

    public delete<T>(url: string, config = {}) {
        return this.client.delete<T>(url, config);
    }
}

export const apiClient = new ApiClient();
```

#### 5.6.2 Feature-Specific API Services

```typescript
// CustomerApi.ts
export const customerApi = {
    async list(params: ListCustomersParams): Promise<PagedCustomerList> {
        const response = await apiClient.get<PagedCustomerList>('/customers', { params });
        return response.data;
    },

    async getById(id: string): Promise<CustomerDetail> {
        const response = await apiClient.get<CustomerDetail>(`/customers/${id}`);
        return response.data;
    },

    async create(data: CreateCustomerRequest): Promise<CustomerDetail> {
        const response = await apiClient.post<CustomerDetail>('/customers', data);
        return response.data;
    },

    async update(id: string, data: UpdateCustomerRequest): Promise<CustomerDetail> {
        const response = await apiClient.put<CustomerDetail>(`/customers/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/customers/${id}`);
    },
};
```

---

### 5.7 Form Handling & Validation

#### 5.7.1 Form Schema (Zod)

```typescript
// schemas/customerSchema.ts
import { z } from 'zod';

export const addressSchema = z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required').max(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format'),
    country: z.string().min(1, 'Country is required'),
});

export const customerFormSchema = z.object({
    firstName: z.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be at most 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),

    lastName: z.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be at most 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),

    email: z.string()
        .email('Invalid email format')
        .min(1, 'Email is required'),

    phone: z.string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Phone number must be in E.164 format')
        .optional()
        .or(z.literal('')),

    billingAddress: addressSchema,

    taxId: z.string()
        .regex(/^\d{2}-\d{7}$/, 'Tax ID must be in format XX-XXXXXXX')
        .optional()
        .or(z.literal('')),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
```

#### 5.7.2 Form Component Example

```typescript
// CreateCustomerScreen.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function CreateCustomerScreen() {
    const navigation = useNavigation();
    const createCustomer = useCreateCustomer();

    const { control, handleSubmit, formState: { errors, isDirty } } = useForm<CustomerFormData>({
        resolver: zodResolver(customerFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            billingAddress: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'USA',
            },
            taxId: '',
        },
    });

    const onSubmit = async (data: CustomerFormData) => {
        try {
            await createCustomer.mutateAsync(data);
            Toast.show({ type: 'success', text1: 'Customer created successfully' });
            navigation.goBack();
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Failed to create customer' });
        }
    };

    return (
        <ScrollView>
            <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        label="First Name *"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                    />
                )}
            />
            {/* ... more fields ... */}

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={createCustomer.isPending}
                disabled={!isDirty}
            >
                Create Customer
            </Button>
        </ScrollView>
    );
}
```

---

### 5.8 Theming & Styling

#### 5.8.1 Theme Configuration

```typescript
// theme/index.ts
export const theme = {
    colors: {
        primary: '#007AFF',      // Blue
        success: '#34C759',      // Green
        warning: '#FF9500',      // Orange
        danger: '#FF3B30',       // Red
        info: '#5856D6',         // Purple

        background: '#FFFFFF',
        surface: '#F2F2F7',
        card: '#FFFFFF',

        text: '#000000',
        textSecondary: '#8E8E93',
        textDisabled: '#C7C7CC',

        border: '#C6C6C8',
        divider: '#E5E5EA',

        draft: '#8E8E93',        // Gray for draft invoices
        sent: '#007AFF',         // Blue for sent invoices
        paid: '#34C759',         // Green for paid invoices
        overdue: '#FF3B30',      // Red for overdue invoices
        cancelled: '#8E8E93',    // Gray for cancelled
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    typography: {
        h1: {
            fontSize: 34,
            fontWeight: '700',
            lineHeight: 41,
        },
        h2: {
            fontSize: 28,
            fontWeight: '700',
            lineHeight: 34,
        },
        h3: {
            fontSize: 22,
            fontWeight: '600',
            lineHeight: 28,
        },
        body: {
            fontSize: 17,
            fontWeight: '400',
            lineHeight: 22,
        },
        caption: {
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 18,
        },
    },

    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
        },
    },
};
```

---

### 5.9 Error Handling & User Feedback

#### 5.9.1 Error Boundary

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to error reporting service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>
                        We're sorry, but something unexpected happened.
                    </Text>
                    <Button onPress={() => this.setState({ hasError: false })}>
                        Try Again
                    </Button>
                </View>
            );
        }

        return this.props.children;
    }
}
```

#### 5.9.2 Toast Notifications

**Success Examples:**
- "Customer created successfully"
- "Invoice sent to john.doe@example.com"
- "Payment of $3,000.00 recorded"
- "Changes saved"

**Error Examples:**
- "Failed to create customer. Please try again."
- "Unable to connect. Check your internet connection."
- "Email already exists. Please use a different email."

**Info Examples:**
- "Invoice saved as draft"
- "Syncing data..."
- "No internet connection. Changes will sync when online."

---

### 5.10 Performance Optimization

#### 5.10.1 List Optimization

- Use `FlatList` with `windowSize` prop for large lists
- Implement `getItemLayout` for fixed-height items
- Use `keyExtractor` for stable keys
- Implement `removeClippedSubviews` for Android

#### 5.10.2 Image Optimization

- Use `FastImage` for cached image loading
- Implement lazy loading for images
- Compress images before upload

#### 5.10.3 Bundle Size Optimization

- Enable Hermes engine
- Use code splitting for routes
- Tree-shake unused dependencies
- Analyze bundle with `react-native-bundle-visualizer`

---

## 6. Database Schema

### 6.1 PostgreSQL Schema

#### 6.1.1 Customers Table

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    billing_street VARCHAR(255) NOT NULL,
    billing_city VARCHAR(100) NOT NULL,
    billing_state VARCHAR(2) NOT NULL,
    billing_zip VARCHAR(10) NOT NULL,
    billing_country VARCHAR(100) NOT NULL,
    tax_id VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(100) NOT NULL,

    CONSTRAINT chk_customer_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED')),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_last_name ON customers(last_name);
```

#### 6.1.2 Invoices Table

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(100) NOT NULL,
    sent_at TIMESTAMP,
    sent_by VARCHAR(100),
    paid_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by VARCHAR(100),
    cancellation_reason TEXT,

    CONSTRAINT chk_invoice_status CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'CANCELLED')),
    CONSTRAINT chk_due_date CHECK (due_date >= invoice_date),
    CONSTRAINT chk_amounts CHECK (
        subtotal >= 0 AND
        tax_amount >= 0 AND
        total_amount >= 0 AND
        paid_amount >= 0 AND
        balance >= 0 AND
        total_amount = subtotal + tax_amount AND
        balance = total_amount - paid_amount
    )
);

CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_overdue ON invoices(due_date, status) WHERE status = 'SENT' AND due_date < CURRENT_DATE;
```

#### 6.1.3 Line Items Table

```sql
CREATE TABLE line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT chk_quantity CHECK (quantity > 0),
    CONSTRAINT chk_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_line_total CHECK (line_total = quantity * unit_price)
);

CREATE INDEX idx_line_items_invoice_id ON line_items(invoice_id);
CREATE INDEX idx_line_items_sort_order ON line_items(invoice_id, sort_order);
```

#### 6.1.4 Payments Table

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    reference_number VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    voided_at TIMESTAMP,
    voided_by VARCHAR(100),
    void_reason TEXT,

    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('CASH', 'CHECK', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER')),
    CONSTRAINT chk_payment_status CHECK (status IN ('APPLIED', 'VOIDED'))
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
```

#### 6.1.5 Users Table (Authentication)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    CONSTRAINT chk_user_role CHECK (role IN ('ADMIN', 'USER'))
);

CREATE INDEX idx_users_email ON users(email);
```

### 6.2 Database Migration Strategy

**Use Flyway or Liquibase for versioned migrations:**

```
db/migration/
├── V1__create_customers_table.sql
├── V2__create_invoices_table.sql
├── V3__create_line_items_table.sql
├── V4__create_payments_table.sql
├── V5__create_users_table.sql
└── V6__add_indexes.sql
```

---

## 7. Security & Authentication

### 7.1 Authentication Flow

**JWT-Based Authentication:**

1. User submits email/password to `/api/v1/auth/login`
2. Backend validates credentials
3. Backend generates JWT access token (15 min expiry) and refresh token (7 day expiry)
4. Frontend stores tokens securely
5. Frontend includes access token in `Authorization: Bearer <token>` header
6. On 401 response, frontend attempts token refresh
7. If refresh fails, redirect to login

### 7.2 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### 7.3 API Security

**Spring Security Configuration:**
- Enable CSRF protection for state-changing operations
- Configure CORS to allow frontend origin
- Implement rate limiting (100 requests per minute per IP)
- Enable HTTPS in production
- Implement request/response logging for audit

**Authorization:**
- All API endpoints require authentication (except `/auth/login`)
- Role-based access control (ADMIN vs USER)
- Resource ownership validation (users can only access their own data)

### 7.4 Data Validation & Sanitization

**Input Validation:**
- Validate all input at controller level (Bean Validation)
- Sanitize string inputs to prevent XSS
- Use parameterized queries to prevent SQL injection
- Validate file uploads (type, size limits)

**Output Encoding:**
- Encode data before rendering in frontend
- Use secure headers (Content-Security-Policy, X-Frame-Options)

---

## 8. Testing Requirements

### 8.1 Backend Testing

#### 8.1.1 Unit Tests

**Coverage Requirements:**
- Domain logic: 100%
- Command handlers: 100%
- Query handlers: 90%
- Validators: 100%

**Example Test:**
```java
@Test
void shouldCreateCustomer_WhenValidDataProvided() {
    // Arrange
    CreateCustomerCommand command = new CreateCustomerCommand(
        "John", "Doe", "john@example.com", "+15551234567",
        new AddressDto("123 Main St", "Springfield", "IL", "62701", "USA"),
        "12-3456789"
    );

    when(customerRepository.findByEmail(anyString())).thenReturn(Optional.empty());

    // Act
    UUID customerId = handler.handle(command);

    // Assert
    assertNotNull(customerId);
    verify(customerRepository).save(any(Customer.class));
}
```

#### 8.1.2 Integration Tests

**Requirements:**
- Use Testcontainers for PostgreSQL
- Test complete request/response cycle
- Test database transactions
- Test error scenarios

**Example Test:**
```java
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class CustomerApiIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:14");

    @Autowired
    MockMvc mockMvc;

    @Test
    void shouldCreateAndRetrieveCustomer() throws Exception {
        // Create customer
        String createRequest = """
            {
                "firstName": "John",
                "lastName": "Doe",
                "email": "john@example.com",
                "billingAddress": {
                    "street": "123 Main St",
                    "city": "Springfield",
                    "state": "IL",
                    "zipCode": "62701",
                    "country": "USA"
                }
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createRequest))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.fullName").value("John Doe"))
            .andReturn();

        String customerId = JsonPath.read(result.getResponse().getContentAsString(), "$.id");

        // Retrieve customer
        mockMvc.perform(get("/api/v1/customers/" + customerId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("john@example.com"));
    }
}
```

#### 8.1.3 End-to-End Business Flow Tests

**Required Test Scenarios:**
1. Complete customer payment flow:
   - Create customer
   - Create invoice with line items
   - Send invoice
   - Record partial payment
   - Record final payment
   - Verify invoice marked as PAID

2. Invoice cancellation flow
3. Payment void and correction flow
4. Overdue invoice identification

### 8.2 Frontend Testing

#### 8.2.1 Unit Tests (Components)

```typescript
// CustomerCard.test.tsx
describe('CustomerCard', () => {
    it('should render customer information correctly', () => {
        const customer = {
            id: '123',
            fullName: 'John Doe',
            email: 'john@example.com',
            outstandingBalance: 1250.00,
            activeInvoicesCount: 3,
        };

        const { getByText } = render(<CustomerCard customer={customer} />);

        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('john@example.com')).toBeTruthy();
        expect(getByText('$1,250.00')).toBeTruthy();
    });
});
```

#### 8.2.2 Integration Tests (ViewModels)

```typescript
// CreateCustomerViewModel.test.ts
describe('CreateCustomerViewModel', () => {
    it('should validate form and create customer', async () => {
        const mockApi = jest.fn().mockResolvedValue({ id: '123' });
        const viewModel = new CreateCustomerViewModel(mockApi);

        viewModel.setField('firstName', 'John');
        viewModel.setField('lastName', 'Doe');
        viewModel.setField('email', 'john@example.com');
        // ... set other fields

        expect(viewModel.validateForm()).toBe(true);

        await viewModel.save();

        expect(mockApi).toHaveBeenCalledWith(expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
        }));
    });
});
```

---

## 9. Performance & Quality Standards

### 9.1 API Performance Targets

| Operation | Target Latency (p95) | Max Latency (p99) |
|-----------|---------------------|-------------------|
| Create Customer | < 150ms | < 200ms |
| Get Customer by ID | < 50ms | < 100ms |
| List Customers (paginated) | < 100ms | < 150ms |
| Create Invoice | < 200ms | < 300ms |
| Record Payment | < 150ms | < 250ms |
| List Invoices | < 100ms | < 200ms |

### 9.2 Frontend Performance Targets

- Initial app load: < 3 seconds
- Screen transitions: < 300ms
- List scroll: 60 FPS
- Form input response: < 100ms
- API call feedback: Immediate loading indicator

### 9.3 Code Quality Standards

**Backend:**
- SonarQube quality gate: Pass
- Code coverage: > 80%
- Cyclomatic complexity: < 10 per method
- No critical/blocker issues
- Consistent code formatting (Checkstyle)

**Frontend:**
- ESLint: No errors
- TypeScript strict mode: Enabled
- No `any` types (except approved cases)
- Component complexity: < 300 lines
- Consistent formatting (Prettier)

---

## 10. Deployment & Infrastructure

### 10.1 Backend Deployment (AWS)

**Architecture:**
```
Internet → ALB → ECS Fargate (Spring Boot) → RDS PostgreSQL
                        ↓
                   ElastiCache Redis (session cache)
```

**Environment Configuration:**
- **Dev**: t3.small ECS, db.t3.micro RDS
- **Prod**: t3.medium ECS (2+ instances), db.t3.small RDS (Multi-AZ)

**Required Environment Variables:**
```
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
JWT_SECRET
JWT_EXPIRATION
REDIS_HOST
REDIS_PORT
```

### 10.2 Frontend Deployment

**Mobile App:**
- Build with EAS (Expo Application Services)
- Deploy to TestFlight (iOS) and Google Play Internal Testing
- Over-the-air updates enabled for non-native changes

**Web Version (Optional):**
- Deploy to Vercel/Netlify
- Environment-specific configs

---

## 11. Appendix

### 11.1 Glossary

- **Aggregate Root**: Main entity in DDD that controls access to related entities
- **Command**: Represents an intent to change system state
- **DTO**: Data Transfer Object, used for API communication
- **MVVM**: Model-View-ViewModel architectural pattern
- **Query**: Request for data without side effects
- **Value Object**: Immutable object defined by its attributes (e.g., Money, Address)

### 11.2 References

- Domain-Driven Design (Eric Evans)
- Clean Architecture (Robert C. Martin)
- Spring Boot Documentation
- React Native Documentation
- PostgreSQL Documentation

---

**End of Document**
