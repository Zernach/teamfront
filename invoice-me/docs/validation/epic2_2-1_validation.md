# Story 2-1: Create Invoice (Draft) - Validation Guide

## 30-Second Quick Test

1. Start the backend: `cd invoice-me/backend && mvn spring-boot:run`
2. Create a customer: `curl -X POST http://localhost:5000/api/v1/customers -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"test@example.com","street":"123 Main","city":"NYC","state":"NY","zipCode":"10001","country":"USA"}'`
3. Note the customer ID from the response
4. Create an invoice: `curl -X POST http://localhost:5000/api/v1/invoices -H "Content-Type: application/json" -d '{"customerId":"<CUSTOMER_ID>","invoiceDate":"2025-11-08","dueDate":"2025-12-08","lineItems":[{"description":"Product A","quantity":2.0,"unitPrice":100.00}],"taxAmount":20.00}'`
5. Verify: Response contains invoice with DRAFT status, correct calculations, and line items

## Automated Test Results

### Unit Tests
- **Status**: N/A (Integration tests cover functionality)
- **Coverage**: N/A

### Integration Tests
- **Status**: ✅ PASSING
- **Tests Run**: 11 tests
- **Failures**: 0
- **Errors**: 0
- **Skipped**: 0

**Test Coverage:**
- ✅ `createInvoice_Success` - Basic invoice creation with calculations
- ✅ `createInvoice_WithMultipleLineItems` - Multiple line items and subtotal calculation
- ✅ `createInvoice_WithoutTaxAmount` - Default tax amount (0) when not provided
- ✅ `createInvoice_CustomerNotFound` - 404 when customer doesn't exist
- ✅ `createInvoice_NoLineItems` - 400 when no line items provided
- ✅ `createInvoice_InvalidInvoiceDate` - 400 when invoice date is in future
- ✅ `createInvoice_InvalidDueDate` - 400 when due date is before invoice date
- ✅ `createInvoice_InvalidLineItemQuantity` - 400 when quantity <= 0
- ✅ `createInvoice_InvalidLineItemUnitPrice` - 400 when unit price < 0
- ✅ `createInvoice_NegativeTaxAmount` - 400 when tax amount < 0
- ✅ `createInvoice_InactiveCustomer` - 409 when customer is inactive

### Test Command
```bash
cd invoice-me/backend
mvn test -Dtest=InvoiceControllerIntegrationTest
```

## Manual Validation Steps

### 1. Start Backend Server
```bash
cd invoice-me/backend
mvn spring-boot:run
```

### 2. Create a Test Customer
```bash
curl -X POST http://localhost:5000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }'

# Save the customer ID from the response (e.g., "id": "550e8400-e29b-41d4-a716-446655440000")
```

### 3. Test Successful Invoice Creation
```bash
# Replace <CUSTOMER_ID> with the actual customer ID from step 2
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_ID>",
    "invoiceDate": "2025-11-08",
    "dueDate": "2025-12-08",
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 2.0,
        "unitPrice": 100.00
      }
    ],
    "taxAmount": 20.00,
    "notes": "Test invoice"
  }'

# Expected: 201 Created with InvoiceDetailDto containing:
# - id: UUID
# - customerId: matches input
# - invoiceNumber: null (assigned when sent)
# - status: "DRAFT"
# - subtotal: 200.00 (2.0 * 100.00)
# - taxAmount: 20.00
# - totalAmount: 220.00 (200.00 + 20.00)
# - paidAmount: 0.00
# - balance: 220.00 (equals totalAmount initially)
# - lineItems: array with 1 item
```

### 4. Test Multiple Line Items
```bash
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_ID>",
    "invoiceDate": "2025-11-08",
    "dueDate": "2025-12-08",
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 2.0,
        "unitPrice": 100.00
      },
      {
        "description": "Product B",
        "quantity": 3.0,
        "unitPrice": 50.00
      }
    ],
    "taxAmount": 25.00
  }'

# Expected: subtotal = 350.00 (200.00 + 150.00), totalAmount = 375.00
```

### 5. Test Without Tax Amount
```bash
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_ID>",
    "invoiceDate": "2025-11-08",
    "dueDate": "2025-12-08",
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 1.0,
        "unitPrice": 100.00
      }
    ]
  }'

# Expected: taxAmount = 0.00, totalAmount = 100.00
```

### 6. Test Customer Not Found (404)
```bash
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "00000000-0000-0000-0000-000000000000",
    "invoiceDate": "2025-11-08",
    "dueDate": "2025-12-08",
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 1.0,
        "unitPrice": 100.00
      }
    ]
  }'

# Expected: 404 Not Found
```

### 7. Test Validation Errors (400)
```bash
# No line items
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_ID>",
    "invoiceDate": "2025-11-08",
    "dueDate": "2025-12-08",
    "lineItems": []
  }'

# Future invoice date
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_ID>",
    "invoiceDate": "2026-01-01",
    "dueDate": "2026-01-31",
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 1.0,
        "unitPrice": 100.00
      }
    ]
  }'

# Due date before invoice date
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_ID>",
    "invoiceDate": "2025-11-08",
    "dueDate": "2025-11-07",
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 1.0,
        "unitPrice": 100.00
      }
    ]
  }'

# Invalid line item quantity
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_ID>",
    "invoiceDate": "2025-11-08",
    "dueDate": "2025-12-08",
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 0,
        "unitPrice": 100.00
      }
    ]
  }'

# Invalid line item unit price
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_ID>",
    "invoiceDate": "2025-11-08",
    "dueDate": "2025-12-08",
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 1.0,
        "unitPrice": -10.00
      }
    ]
  }'

# Negative tax amount
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_ID>",
    "invoiceDate": "2025-11-08",
    "dueDate": "2025-12-08",
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 1.0,
        "unitPrice": 100.00
      }
    ],
    "taxAmount": -10.00
  }'

# All should return: 400 Bad Request
```

### 8. Test Inactive Customer (409)
```bash
# First, create a customer and update it to INACTIVE status via database or update endpoint
# Then try to create an invoice for that customer

curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<INACTIVE_CUSTOMER_ID>",
    "invoiceDate": "2025-11-08",
    "dueDate": "2025-12-08",
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 1.0,
        "unitPrice": 100.00
      }
    ]
  }'

# Expected: 409 Conflict
```

## Edge Cases and Error Handling

### Test Cases Covered
1. ✅ **Successful Creation**: Invoice created with correct calculations
2. ✅ **Multiple Line Items**: Subtotal correctly sums all line items
3. ✅ **Optional Tax Amount**: Defaults to 0 when not provided
4. ✅ **Customer Not Found**: Returns 404
5. ✅ **Inactive Customer**: Returns 409 Conflict
6. ✅ **No Line Items**: Returns 400 Bad Request
7. ✅ **Future Invoice Date**: Returns 400 Bad Request
8. ✅ **Invalid Due Date**: Returns 400 Bad Request (due date < invoice date)
9. ✅ **Invalid Line Item Quantity**: Returns 400 Bad Request (quantity <= 0)
10. ✅ **Invalid Line Item Unit Price**: Returns 400 Bad Request (unit price < 0)
11. ✅ **Negative Tax Amount**: Returns 400 Bad Request

### Edge Cases to Test Manually
```bash
# Line item with decimal quantity (e.g., 2.5)
# Expected: Should work correctly

# Line item with very large numbers
# Expected: Should handle BigDecimal precision correctly

# Very long description (500+ characters)
# Expected: Should return 400 Bad Request

# Missing required fields
# Expected: Should return 400 Bad Request with validation errors

# Invalid date format
# Expected: Should return 400 Bad Request
```

## Acceptance Criteria Checklist

- [x] **AC1**: User can create an invoice with customerId, invoiceDate, dueDate, lineItems, taxAmount (optional), notes (optional)
  - ✅ All fields accepted correctly
  - ✅ Optional fields work as expected

- [x] **AC2**: Customer must exist and be ACTIVE (404 if customer not found, 409 if inactive)
  - ✅ 404 returned when customer doesn't exist
  - ✅ 409 returned when customer is inactive

- [x] **AC3**: Invoice must have at least one line item
  - ✅ Validation prevents empty line items list

- [x] **AC4**: Each line item must have description (1-500 chars), quantity (> 0, max 2 decimals), unitPrice (>= 0)
  - ✅ Description validation works
  - ✅ Quantity validation works
  - ✅ Unit price validation works

- [x] **AC5**: Invoice date cannot be in the future
  - ✅ Validation prevents future dates

- [x] **AC6**: Due date must be >= invoice date
  - ✅ Validation prevents due date before invoice date

- [x] **AC7**: Tax amount must be >= 0 (defaults to 0 if not provided)
  - ✅ Defaults to 0 when not provided
  - ✅ Validation prevents negative values

- [x] **AC8**: Invoice is created with DRAFT status
  - ✅ Status is always DRAFT on creation

- [x] **AC9**: Invoice number is null until invoice is sent
  - ✅ Invoice number is null on creation

- [x] **AC10**: Line totals are calculated: lineTotal = quantity * unitPrice
  - ✅ Calculations are correct

- [x] **AC11**: Subtotal is calculated: subtotal = SUM(lineItems.lineTotal)
  - ✅ Subtotal correctly sums all line items

- [x] **AC12**: Total amount is calculated: totalAmount = subtotal + taxAmount
  - ✅ Total amount calculation is correct

- [x] **AC13**: Balance equals totalAmount initially (paidAmount = 0)
  - ✅ Balance equals totalAmount
  - ✅ paidAmount starts at 0

- [x] **AC14**: API returns 201 Created with InvoiceDetailDto on success
  - ✅ Status code is 201 Created
  - ✅ Response structure matches InvoiceDetailDto

- [x] **AC15**: API returns 400 Bad Request with validation errors if validation fails
  - ✅ 400 returned for validation errors

- [x] **AC16**: API returns 404 Not Found if customer doesn't exist
  - ✅ 404 returned when customer not found

- [x] **AC17**: API returns 409 Conflict if customer is inactive
  - ✅ 409 returned when customer is inactive

## Rollback Plan

If issues are found:

1. **Revert Code Changes**:
   ```bash
   cd invoice-me/backend
   git checkout HEAD -- src/main/java/com/invoiceme/features/invoices/
   ```

2. **Revert Database Changes** (if any):
   - Drop invoices and line_items tables if created
   - If using JPA ddl-auto=update, restart with ddl-auto=none

3. **Revert Test Changes**:
   ```bash
   cd invoice-me/backend
   git checkout HEAD -- src/test/java/com/invoiceme/features/invoices/
   ```

4. **Verify Rollback**:
   ```bash
   mvn test -Dtest=InvoiceControllerIntegrationTest
   ```

## Notes

- All monetary calculations use `BigDecimal` for precision
- Line item totals are rounded to 2 decimal places using `HALF_UP` rounding mode
- Invoice status is always `DRAFT` when created
- Invoice number is `null` until the invoice is sent (separate story)
- The `createdBy` field is currently hardcoded to "system" - will be updated when authentication is implemented (Epic 7)
- Customer status validation ensures only ACTIVE customers can have invoices created

## Files Modified

- `backend/src/main/java/com/invoiceme/features/invoices/domain/InvoiceStatus.java`
- `backend/src/main/java/com/invoiceme/features/invoices/domain/Invoice.java`
- `backend/src/main/java/com/invoiceme/features/invoices/domain/LineItem.java`
- `backend/src/main/java/com/invoiceme/features/invoices/domain/InvoiceRepository.java`
- `backend/src/main/java/com/invoiceme/features/invoices/infrastructure/InvoiceEntity.java`
- `backend/src/main/java/com/invoiceme/features/invoices/infrastructure/LineItemEntity.java`
- `backend/src/main/java/com/invoiceme/features/invoices/infrastructure/InvoiceJpaRepository.java`
- `backend/src/main/java/com/invoiceme/features/invoices/infrastructure/InvoiceRepositoryImpl.java`
- `backend/src/main/java/com/invoiceme/features/invoices/commands/createinvoice/CreateInvoiceCommand.java`
- `backend/src/main/java/com/invoiceme/features/invoices/commands/createinvoice/CreateInvoiceCommandHandler.java`
- `backend/src/main/java/com/invoiceme/features/invoices/dto/CreateInvoiceRequestDto.java`
- `backend/src/main/java/com/invoiceme/features/invoices/dto/InvoiceDetailDto.java`
- `backend/src/main/java/com/invoiceme/features/invoices/api/InvoiceController.java`
- `backend/src/test/java/com/invoiceme/features/invoices/api/InvoiceControllerIntegrationTest.java`




