# End-to-End Payment Flow Testing Guide
## Comprehensive Testing for Payment Query Features

**Date:** November 13, 2025  
**Status:** Ready for Testing

---

## Features Implemented

### Backend

1. **Payment Query Endpoints**
   - `GET /api/v1/payments/{id}` - Retrieve payment by ID
   - `GET /api/v1/payments?invoiceId={id}&status={status}` - List payments for an invoice

2. **Query Handlers**
   - `GetPaymentByIdQueryHandler` - Fetches single payment with full details
   - `ListPaymentsForInvoiceQueryHandler` - Lists payments with optional status filter

3. **Database**
   - Payments table migration created (`V5__create_payments_table.sql`)
   - All constraints and indexes in place

### Frontend

1. **API Client Updates**
   - `paymentApi.getPaymentById()` - Get payment by ID
   - `paymentApi.listPaymentsForInvoice()` - List payments for invoice

2. **New Component**
   - `PaymentList` - Displays payment history with void functionality
   - Real-time refresh capability
   - Status badges (APPLIED/VOIDED)
   - Void payment action with confirmation

3. **Invoice Detail Integration**
   - Payment history section for SENT/PAID invoices
   - Automatic reload on payment voided
   - Clean, responsive UI

---

## Test Scenarios

### Scenario 1: View Payment by ID

**Prerequisites:**
- Invoice exists with status SENT or PAID
- At least one payment has been recorded

**Steps:**
1. Get a payment ID from the database or invoice detail
2. Call `GET /api/v1/payments/{paymentId}`

**Expected Result:**
```json
{
  "id": "uuid",
  "invoiceId": "invoice-uuid",
  "amount": 1000.00,
  "paymentDate": "2025-11-13",
  "paymentMethod": "CREDIT_CARD",
  "referenceNumber": "REF123",
  "status": "APPLIED",
  "notes": "Payment note",
  "createdAt": "2025-11-13T10:00:00Z",
  "createdBy": "user@example.com",
  "voidedAt": null,
  "voidedBy": null,
  "voidReason": null
}
```

**Validation:**
- Payment details match database
- All fields populated correctly
- Status is correct
- 404 returned for non-existent payment

---

### Scenario 2: List All Payments for Invoice

**Prerequisites:**
- Invoice exists with status SENT or PAID
- Multiple payments recorded

**Steps:**
1. Get invoice ID
2. Call `GET /api/v1/payments?invoiceId={invoiceId}`

**Expected Result:**
```json
[
  {
    "id": "payment-1",
    "amount": 500.00,
    "paymentDate": "2025-11-10",
    "status": "APPLIED",
    ...
  },
  {
    "id": "payment-2",
    "amount": 300.00,
    "paymentDate": "2025-11-12",
    "status": "APPLIED",
    ...
  }
]
```

**Validation:**
- All payments for invoice returned
- Payments sorted by date (newest first recommended)
- Status field accurate
- Empty array for invoice with no payments

---

### Scenario 3: Filter Payments by Status

**Prerequisites:**
- Invoice with both APPLIED and VOIDED payments

**Steps:**
1. Call `GET /api/v1/payments?invoiceId={id}&status=APPLIED`
2. Call `GET /api/v1/payments?invoiceId={id}&status=VOIDED`

**Expected Result:**
- First call returns only APPLIED payments
- Second call returns only VOIDED payments
- Each list excludes payments with other status

**Validation:**
- Filter works correctly
- No cross-contamination between statuses

---

### Scenario 4: Frontend Payment List Display

**Prerequisites:**
- Running frontend application
- Invoice with payments

**Steps:**
1. Navigate to invoice detail page
2. Observe Payment History section

**Expected Result:**
- Payment list loads automatically
- Each payment shows:
  - Amount with currency formatting
  - Payment date (formatted)
  - Payment method (formatted, no underscores)
  - Reference number (if present)
  - Status badge (colored: green for APPLIED, red for VOIDED)
  - Creator info at bottom
  - Void button (only for APPLIED payments)

**Validation:**
- UI renders correctly on all screen sizes
- Data matches API response
- Loading spinner shows during fetch
- Empty state displayed when no payments

---

### Scenario 5: Void Payment from UI

**Prerequisites:**
- Invoice with APPLIED payment
- Frontend running

**Steps:**
1. Navigate to invoice with APPLIED payment
2. Click "Void" button on payment
3. Confirm action
4. Enter void reason when prompted

**Expected Result:**
- Confirmation dialog appears
- Void reason prompt shows
- Payment voided successfully
- Payment list refreshes automatically
- Payment now shows VOIDED status
- Invoice balance updated

**Validation:**
- API call made with void reason
- Payment status changed to VOIDED
- Invoice balance recalculated
- UI updates without page refresh
- Void button removed from voided payment
- Void details displayed (date, user, reason)

---

### Scenario 6: Pull-to-Refresh Payment List

**Prerequisites:**
- Mobile device or mobile view
- Invoice with payments

**Steps:**
1. Navigate to invoice payment history
2. Pull down on payment list
3. Release to refresh

**Expected Result:**
- Refresh spinner shows
- API call made to fetch latest payments
- List updates with latest data
- Spinner disappears

**Validation:**
- Latest payment data displayed
- No duplicate items
- Smooth animation

---

### Scenario 7: Invoice Balance Calculation

**Prerequisites:**
- Invoice with initial balance

**Steps:**
1. Record payment via UI
2. Observe invoice balance
3. Void payment via payment list
4. Observe balance again

**Expected Result:**
- Balance decreases after payment
- Balance increases when payment voided
- Status changes: SENT → PAID → SENT
- All calculations accurate

**Validation:**
- Balance = Total - Paid Amount
- Status transitions correct
- No rounding errors

---

## API Testing Commands

### Using curl

```bash
# Get payment by ID
curl -X GET "https://api-endpoint/api/v1/payments/{paymentId}" \
  -H "Authorization: Bearer {token}"

# List payments for invoice
curl -X GET "https://api-endpoint/api/v1/payments?invoiceId={invoiceId}" \
  -H "Authorization: Bearer {token}"

# List only APPLIED payments
curl -X GET "https://api-endpoint/api/v1/payments?invoiceId={invoiceId}&status=APPLIED" \
  -H "Authorization: Bearer {token}"

# Void payment
curl -X POST "https://api-endpoint/api/v1/payments/{paymentId}/void" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"voidReason": "Customer dispute"}'
```

---

## Database Verification

### Check Payment Records

```sql
-- View all payments for an invoice
SELECT id, amount, payment_date, payment_method, status, voided_at, void_reason
FROM payments
WHERE invoice_id = 'your-invoice-uuid'
ORDER BY payment_date DESC;

-- Check invoice balance calculation
SELECT 
    i.invoice_number,
    i.total_amount,
    i.paid_amount,
    i.balance,
    SUM(CASE WHEN p.status = 'APPLIED' THEN p.amount ELSE 0 END) as calculated_paid_amount
FROM invoices i
LEFT JOIN payments p ON i.id = p.invoice_id
WHERE i.id = 'your-invoice-uuid'
GROUP BY i.id;

-- Verify void constraints
SELECT id, status, voided_at, voided_by, void_reason
FROM payments
WHERE voided_at IS NOT NULL OR voided_by IS NOT NULL OR void_reason IS NOT NULL;
-- All records returned should have status = 'VOIDED' and ALL void fields populated
```

---

## Backend Build & Deployment

### Build Backend

```bash
cd backend
mvn clean package -DskipTests

# Verify compilation
mvn compile

# Run with database
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### Check Logs

```bash
# Check if endpoints registered
tail -f logs/application.log | grep "Mapped.*payment"

# Should see:
# Mapped "{[/api/v1/payments/{id}],methods=[GET]}"
# Mapped "{[/api/v1/payments],methods=[GET]}"
# Mapped "{[/api/v1/payments/{id}/void],methods=[POST]}"
```

---

## Frontend Build & Run

### Development

```bash
cd frontend
yarn install
yarn start

# Or for web
yarn web
```

### Production Build

```bash
cd frontend
yarn build
yarn deploy
```

---

## Success Criteria

### ✅ Backend
- [ ] Backend compiles without errors
- [ ] All payment query endpoints return 200 OK
- [ ] Payment by ID returns correct data or 404
- [ ] List payments returns array (empty or populated)
- [ ] Status filter works correctly
- [ ] Database constraints enforced

### ✅ Frontend
- [ ] TypeScript compiles without errors
- [ ] Payment list component renders
- [ ] API calls execute successfully
- [ ] UI updates on payment void
- [ ] Pull-to-refresh works
- [ ] Error handling functional
- [ ] Loading states display

### ✅ Integration
- [ ] End-to-end payment record → view → void flow works
- [ ] Invoice balance updates correctly
- [ ] Status transitions work (SENT → PAID → SENT)
- [ ] No race conditions in concurrent operations
- [ ] All validation rules enforced

---

## Known Issues / Future Enhancements

### Current Limitations
- No pagination for payment list (acceptable for MVP - most invoices have < 10 payments)
- No search/filter by date range in UI (backend supports via API params if needed)
- No bulk void operation

### Future Enhancements
1. Add payment receipt PDF generation
2. Email notification on payment void
3. Payment method validation (e.g., credit card format)
4. Payment plans / recurring payments
5. Refund vs Void distinction
6. Payment audit log / history tracking

---

## Rollback Plan

If issues are discovered:

1. **Backend:** Revert files:
   - `PaymentController.java` - Remove GET endpoints
   - Delete query handler files
   - Keep migration (data preserved)

2. **Frontend:** Revert files:
   - `paymentApi.ts` - Remove query methods
   - Delete `payment-list` component
   - Restore original invoice detail view

3. **Database:** No rollback needed (migrations are additive)

---

## Contact & Support

For issues or questions:
- Check backend logs: `backend/logs/application.log`
- Check frontend console for errors
- Review API documentation: `docs/API-Contract-Specification.md`
- Database schema: `docs/Database-Schema-and-Migrations.md`

---

**Testing Status:** ✅ Ready for Manual Testing  
**Automated Tests:** Pending (recommended for future sprint)

All features implemented and integrated. Ready for comprehensive manual testing.

