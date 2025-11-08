# Story 1.1: Create Customer

Status: drafted

## Story

As a user,
I want to create a new customer with their contact information and billing address,
so that I can track and invoice them.

## Acceptance Criteria

1. User can create a customer with required fields: firstName, lastName, email, billingAddress
2. Email must be unique across all customers
3. Email format must be valid (RFC 5322)
4. Customer name fields must be 2-50 characters and contain only valid characters (letters, spaces, hyphens, apostrophes)
5. Phone number is optional but must be in E.164 format if provided
6. Billing address must include all required fields: street, city, state, zipCode, country
7. Tax ID is optional but must be in format XX-XXXXXXX if provided
8. New customer is created with ACTIVE status by default
9. Customer creation is audited with created timestamp and user
10. API returns 201 Created with CustomerDetailDto on success
11. API returns 400 Bad Request with validation errors if validation fails
12. API returns 409 Conflict if email already exists

## Tasks / Subtasks

- [ ] Task 1: Implement Customer domain entity (AC: 1, 8)
  - [ ] Create Customer aggregate root with value objects (CustomerName, EmailAddress, PhoneNumber, Address, TaxIdentifier)
  - [ ] Implement CustomerStatus enum (ACTIVE, INACTIVE, SUSPENDED, DELETED)
  - [ ] Implement AuditInfo value object
  - [ ] Implement Customer.create() factory method with business rules
- [ ] Task 2: Implement CreateCustomerCommand and handler (AC: 1-9)
  - [ ] Create CreateCustomerCommand DTO
  - [ ] Create CreateCustomerCommandHandler with @Transactional
  - [ ] Implement email uniqueness validation
  - [ ] Implement field validation using Jakarta Bean Validation
  - [ ] Map command to domain entity
  - [ ] Save customer via repository
  - [ ] Publish CustomerCreated domain event
- [ ] Task 3: Implement CustomerRepository interface and implementation (AC: 1, 2)
  - [ ] Create CustomerRepository interface in domain layer
  - [ ] Create CustomerEntity JPA entity
  - [ ] Create CustomerJpaRepository interface
  - [ ] Implement CustomerRepositoryImpl with mapping
  - [ ] Add unique index on email column
- [ ] Task 4: Implement REST API endpoint (AC: 10-12)
  - [ ] Create CustomerController with POST /api/v1/customers endpoint
  - [ ] Create CreateCustomerRequestDto with validation annotations
  - [ ] Map request DTO to command
  - [ ] Handle command execution
  - [ ] Map domain entity to CustomerDetailDto response
  - [ ] Implement error handling for validation errors (400)
  - [ ] Implement error handling for duplicate email (409)
- [ ] Task 5: Implement value objects (AC: 3-7)
  - [ ] Create EmailAddress value object with validation
  - [ ] Create PhoneNumber value object with E.164 format validation
  - [ ] Create Address value object with required field validation
  - [ ] Create TaxIdentifier value object with format validation
  - [ ] Create CustomerName value object with character validation
- [ ] Task 6: Write integration tests (AC: All)
  - [ ] Test successful customer creation
  - [ ] Test validation failures
  - [ ] Test duplicate email rejection
  - [ ] Test optional fields (phone, taxId)

## Dev Notes

- Follow DDD patterns: Customer is an aggregate root
- Use Value Objects for email, phone, address, taxId, name to encapsulate validation
- Use Jakarta Bean Validation for request DTO validation
- Use custom validator for email uniqueness check
- Follow Vertical Slice Architecture: features/customers/commands/CreateCustomer/
- Use MapStruct for DTO ↔ Entity mapping
- Transaction boundary: Command handler method level
- Domain events: Publish CustomerCreated event after successful save

### Project Structure Notes

- Backend structure: `src/main/java/com/invoiceme/features/customers/`
- Commands: `commands/CreateCustomer/CreateCustomerCommand.java`
- Domain: `domain/Customer.java`
- Infrastructure: `infrastructure/CustomerEntity.java`
- API: `api/CustomerController.java`
- DTOs: `dto/CreateCustomerRequestDto.java`, `dto/CustomerDetailDto.java`

### References

- [Source: docs/epics/epic-1-customer-domain.md#3.1.1 Customer Entity]
- [Source: docs/epics/epic-1-customer-domain.md#3.1.2 Customer Commands & Validation]
- [Source: docs/epics/epic-4-backend-infrastructure.md#4.3.1 Customer API]
- [Source: docs/epics/epic-4-backend-infrastructure.md#4.5 Validation Rules Implementation]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

