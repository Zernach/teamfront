# Epic 4: Backend Infrastructure & API Development

**Source:** PRD-InvoiceMe-Detailed.md - Section 4  
**Date:** 2025-11-08

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

