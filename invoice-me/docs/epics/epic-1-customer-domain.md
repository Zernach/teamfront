# Epic 1: Customer Domain & Management

**Source:** PRD-InvoiceMe-Detailed.md - Section 3.1  
**Date:** 2025-11-08

---

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

