# Epic 5: Frontend Application & UI Development

**Source:** PRD-InvoiceMe-Detailed.md - Section 5  
**Date:** 2025-11-08

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

