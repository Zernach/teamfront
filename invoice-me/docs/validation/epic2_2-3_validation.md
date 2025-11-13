# Story 2-3: Mark Invoice as Sent - Validation Guide

## 30-Second Quick Test

1. Start the backend: `cd invoice-me/backend && mvn spring-boot:run`
2. Create a customer and draft invoice (see Story 2-1 validation guide)
3. Mark invoice as sent: `curl -X POST http://localhost:5000/api/v1/invoices/<INVOICE_ID>/mark-as-sent -H "Content-Type: application/json" -d '{}'`
4. Verify: Response contains invoice with SENT status and invoice number (format: INV-YYYY-NNNN)

## Automated Test Results

### Integration Tests
- **Status**: ✅ PASSING
- **Tests Run**: 27 tests (11 create + 11 update + 5 mark-as-sent)
- **Failures**: 0
- **Errors**: 0

**Mark as Sent Test Coverage:**
- ✅ `markInvoiceAsSent_Success` - Successfully mark draft invoice as sent
- ✅ `markInvoiceAsSent_WithSentDate` - Mark with custom sent date
- ✅ `markInvoiceAsSent_NotFound` - 404 when invoice doesn't exist
- ✅ `markInvoiceAsSent_NotDraftStatus` - 409 when invoice is not DRAFT
- ✅ `markInvoiceAsSent_InvoiceNumberUniqueness` - Invoice numbers are unique

## Manual Validation Steps

### 1. Create Draft Invoice
```bash
# Create customer and invoice (see Story 2-1)
# Save invoice ID
```

### 2. Mark Invoice as Sent
```bash
curl -X POST http://localhost:5000/api/v1/invoices/<INVOICE_ID>/mark-as-sent \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 200 OK with:
# - status: "SENT"
# - invoiceNumber: "INV-2025-0001" (format: INV-YYYY-NNNN)
# - invoiceNumber is not null
```

### 3. Test with Custom Sent Date
```bash
curl -X POST http://localhost:5000/api/v1/invoices/<INVOICE_ID>/mark-as-sent \
  -H "Content-Type: application/json" \
  -d '{"sentDate": "2025-11-08"}'
```

### 4. Test Invoice Not Found (404)
```bash
curl -X POST http://localhost:5000/api/v1/invoices/00000000-0000-0000-0000-000000000000/mark-as-sent \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 404 Not Found
```

### 5. Test Non-Draft Status (409)
```bash
# Mark invoice as sent first, then try again
# Expected: 409 Conflict
```

## Acceptance Criteria Checklist

- [x] **AC1**: User can mark a DRAFT invoice as SENT
- [x] **AC2**: Invoice must exist (404 if not found)
- [x] **AC3**: Invoice must be in DRAFT status (409 Conflict if not draft)
- [x] **AC4**: Invoice must have at least one line item
- [x] **AC5**: Invoice number is auto-generated (format: INV-YYYY-NNNN)
- [x] **AC6**: Invoice number is unique across all invoices
- [x] **AC7**: Sent date defaults to current date if not provided
- [x] **AC8**: Invoice status changes from DRAFT to SENT
- [x] **AC9**: Invoice becomes immutable after being sent
- [x] **AC10**: Sent operation is audited
- [x] **AC11**: API returns 200 OK with updated InvoiceDetailDto
- [x] **AC12**: API returns 404 Not Found if invoice doesn't exist
- [x] **AC13**: API returns 409 Conflict if invoice is not in DRAFT status

## Files Modified

- `backend/src/main/java/com/invoiceme/features/invoices/services/InvoiceNumberGenerator.java`
- `backend/src/main/java/com/invoiceme/features/invoices/domain/Invoice.java` (added markAsSent method)
- `backend/src/main/java/com/invoiceme/features/invoices/commands/markinvoiceassent/MarkInvoiceAsSentCommand.java`
- `backend/src/main/java/com/invoiceme/features/invoices/commands/markinvoiceassent/MarkInvoiceAsSentCommandHandler.java`
- `backend/src/main/java/com/invoiceme/features/invoices/dto/MarkInvoiceAsSentRequestDto.java`
- `backend/src/main/java/com/invoiceme/features/invoices/api/InvoiceController.java` (added POST /{id}/mark-as-sent endpoint)
- `backend/src/test/java/com/invoiceme/features/invoices/api/InvoiceControllerIntegrationTest.java`








