# Epic 3: Payment Domain & Management

**Source:** PRD-InvoiceMe-Detailed.md - Section 3.3  
**Date:** 2025-11-08

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

