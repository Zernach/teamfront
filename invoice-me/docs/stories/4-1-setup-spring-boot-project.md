# Story 4.1: Set Up Spring Boot Project Structure

Status: drafted

## Story

As a developer,
I want to set up the Spring Boot project structure following Vertical Slice Architecture,
so that the codebase is organized and maintainable.

## Acceptance Criteria

1. Spring Boot 3.2+ project is initialized with Java 17+
2. Project structure follows Vertical Slice Architecture pattern
3. Common domain value objects are created: Money, EmailAddress, PhoneNumber, Address, AuditInfo
4. Common exceptions are created: BusinessRuleViolationException, EntityNotFoundException, DuplicateEntityException, InvalidOperationException
5. Common infrastructure components are set up: pagination, validation, event bus
6. Spring Data JPA is configured with PostgreSQL
7. MapStruct is configured for DTO mapping
8. Jakarta Bean Validation is configured
9. SpringDoc OpenAPI (Swagger) is configured for API documentation
10. Logging is configured with SLF4J and Logback
11. Application properties files are set up: application.yml, application-dev.yml, application-prod.yml
12. Database migration tool (Flyway or Liquibase) is configured
13. Test configuration is set up with H2 for testing

## Tasks / Subtasks

- [ ] Task 1: Initialize Spring Boot project (AC: 1)
  - [ ] Create Spring Boot 3.2+ project with Maven or Gradle
  - [ ] Configure Java 17+ compatibility
  - [ ] Set up main application class: InvoiceMeApplication.java
- [ ] Task 2: Create project directory structure (AC: 2)
  - [ ] Create features/ directory structure
  - [ ] Create common/ directory for shared components
  - [ ] Create security/ directory for authentication
  - [ ] Set up package structure: com.invoiceme.features.*
- [ ] Task 3: Create common domain value objects (AC: 3)
  - [ ] Create Money value object (BigDecimal wrapper)
  - [ ] Create EmailAddress value object with validation
  - [ ] Create PhoneNumber value object with E.164 format
  - [ ] Create Address value object
  - [ ] Create AuditInfo value object
- [ ] Task 4: Create common exceptions (AC: 4)
  - [ ] Create BusinessRuleViolationException
  - [ ] Create EntityNotFoundException
  - [ ] Create DuplicateEntityException
  - [ ] Create InvalidOperationException
  - [ ] Create global exception handler (@ControllerAdvice)
- [ ] Task 5: Set up common infrastructure (AC: 5)
  - [ ] Create pagination utilities
  - [ ] Create validation utilities
  - [ ] Create event bus/ApplicationEventPublisher wrapper
- [ ] Task 6: Configure Spring Data JPA (AC: 6)
  - [ ] Add Spring Data JPA dependency
  - [ ] Add PostgreSQL driver dependency
  - [ ] Configure DataSource in application.yml
  - [ ] Configure JPA properties
- [ ] Task 7: Configure MapStruct (AC: 7)
  - [ ] Add MapStruct dependency
  - [ ] Configure MapStruct annotation processor
  - [ ] Create example mapper interface
- [ ] Task 8: Configure Jakarta Bean Validation (AC: 8)
  - [ ] Add Hibernate Validator dependency
  - [ ] Configure validation in Spring Boot
- [ ] Task 9: Configure SpringDoc OpenAPI (AC: 9)
  - [ ] Add SpringDoc OpenAPI dependency
  - [ ] Configure Swagger UI
  - [ ] Create API documentation annotations
- [ ] Task 10: Configure logging (AC: 10)
  - [ ] Configure Logback with logback-spring.xml
  - [ ] Set up log levels per environment
  - [ ] Configure log format
- [ ] Task 11: Create application properties files (AC: 11)
  - [ ] Create application.yml with common configuration
  - [ ] Create application-dev.yml for development
  - [ ] Create application-prod.yml for production
- [ ] Task 12: Configure database migration (AC: 12)
  - [ ] Add Flyway or Liquibase dependency
  - [ ] Configure migration tool
  - [ ] Create db/migration/ directory
- [ ] Task 13: Configure test setup (AC: 13)
  - [ ] Add H2 database dependency for testing
  - [ ] Configure test application properties
  - [ ] Set up test base classes

## Dev Notes

- Follow Vertical Slice Architecture: organize by feature, not by layer
- Use Spring Boot auto-configuration where possible
- Keep common components reusable across features
- Use value objects for domain concepts (Money, Email, etc.)
- Configure proper exception handling from the start
- Set up proper logging and monitoring infrastructure
- Use database migration tool for schema versioning

### Project Structure Notes

- Root: `invoice-me-backend/`
- Source: `src/main/java/com/invoiceme/`
- Features: `features/customers/`, `features/invoices/`, `features/payments/`
- Common: `common/domain/`, `common/valueobjects/`, `common/exceptions/`, `common/infrastructure/`
- Resources: `src/main/resources/application.yml`, `db/migration/`

### References

- [Source: docs/epics/epic-4-backend-infrastructure.md#4.1 Technology Stack]
- [Source: docs/epics/epic-4-backend-infrastructure.md#4.2 Project Structure]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

