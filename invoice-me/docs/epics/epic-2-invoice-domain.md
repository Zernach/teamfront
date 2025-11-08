# Epic 2: Invoice Domain & Management

**Source:** PRD-InvoiceMe-Detailed.md - Section 3.2  
**Date:** 2025-11-08

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

