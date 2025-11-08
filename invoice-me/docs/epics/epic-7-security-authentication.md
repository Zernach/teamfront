# Epic 7: Security & Authentication

**Source:** PRD-InvoiceMe-Detailed.md - Section 7  
**Date:** 2025-11-08

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

