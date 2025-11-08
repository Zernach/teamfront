# Epic 9: Performance & Quality Standards

**Source:** PRD-InvoiceMe-Detailed.md - Section 9  
**Date:** 2025-11-08

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

