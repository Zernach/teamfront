# InvoiceMe Backend Implementation Guide
## Complete Java Spring Boot Implementation Specifications

**Document Version:** 1.0
**Last Updated:** 2025-11-08
**Framework:** Spring Boot 3.2+, Java 17+

---

## Table of Contents

1. [Project Setup & Configuration](#project-setup--configuration)
2. [Domain Layer Implementation](#domain-layer-implementation)
3. [Application Layer Implementation](#application-layer-implementation)
4. [Infrastructure Layer Implementation](#infrastructure-layer-implementation)
5. [API Layer Implementation](#api-layer-implementation)
6. [Security Implementation](#security-implementation)
7. [Error Handling](#error-handling)
8. [Testing Implementation](#testing-implementation)
9. [Performance Optimization](#performance-optimization)
10. [Deployment Configuration](#deployment-configuration)

---

## 1. Project Setup & Configuration

### 1.1 Maven Dependencies (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <groupId>com.invoiceme</groupId>
    <artifactId>invoice-me-backend</artifactId>
    <version>1.0.0</version>
    <name>InvoiceMe Backend</name>
    <description>ERP Invoicing System Backend</description>

    <properties>
        <java.version>17</java.version>
        <mapstruct.version>1.5.5.Final</mapstruct.version>
        <lombok.version>1.18.30</lombok.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Database -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>

        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>

        <!-- MapStruct -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>${mapstruct.version}</version>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
            <scope>provided</scope>
        </dependency>

        <!-- OpenAPI Documentation -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <version>1.19.3</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>1.19.3</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>${lombok.version}</version>
                        </path>
                        <path>
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>${mapstruct.version}</version>
                        </path>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok-mapstruct-binding</artifactId>
                            <version>0.2.0</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### 1.2 Application Configuration

**application.yml:**

```yaml
spring:
  application:
    name: invoice-me-backend

  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/invoiceme}
    username: ${DATABASE_USERNAME:invoiceme}
    password: ${DATABASE_PASSWORD:invoiceme123}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        use_sql_comments: true
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true

  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration

  jackson:
    serialization:
      write-dates-as-timestamps: false
    deserialization:
      fail-on-unknown-properties: false
    default-property-inclusion: non_null

server:
  port: 8080
  error:
    include-message: always
    include-binding-errors: always
    include-stacktrace: never
    include-exception: false

logging:
  level:
    root: INFO
    com.invoiceme: DEBUG
    org.springframework.web: INFO
    org.springframework.security: INFO
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE

# JWT Configuration
jwt:
  secret: ${JWT_SECRET:YourSecretKeyShouldBeLongAndRandomForProductionUse}
  expiration: 900000  # 15 minutes in milliseconds
  refresh-expiration: 604800000  # 7 days in milliseconds

# API Documentation
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    enabled: true

# Management Endpoints
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true
```

**application-dev.yml:**

```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true

logging:
  level:
    com.invoiceme: DEBUG
    org.springframework.web: DEBUG

server:
  error:
    include-stacktrace: on_param
```

**application-prod.yml:**

```yaml
spring:
  jpa:
    show-sql: false
    properties:
      hibernate:
        format_sql: false

logging:
  level:
    root: WARN
    com.invoiceme: INFO
    org.springframework.web: WARN

server:
  error:
    include-stacktrace: never
    include-exception: false
```

---

## 2. Domain Layer Implementation

### 2.1 Base Domain Classes

**Base Entity:**

```java
// src/main/java/com/invoiceme/common/domain/BaseEntity.java
package com.invoiceme.common.domain;

import lombok.Getter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
public abstract class BaseEntity {
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    public void clearEvents() {
        domainEvents.clear();
    }

    protected UUID generateId() {
        return UUID.randomUUID();
    }
}
```

**Domain Event Interface:**

```java
// src/main/java/com/invoiceme/common/domain/DomainEvent.java
package com.invoiceme.common.domain;

import java.time.LocalDateTime;
import java.util.UUID;

public interface DomainEvent {
    UUID getEventId();
    LocalDateTime getOccurredOn();
    String getEventType();
}
```

**Base Domain Event:**

```java
// src/main/java/com/invoiceme/common/domain/BaseDomainEvent.java
package com.invoiceme.common.domain;

import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public abstract class BaseDomainEvent implements DomainEvent {
    private final UUID eventId;
    private final LocalDateTime occurredOn;

    protected BaseDomainEvent() {
        this.eventId = UUID.randomUUID();
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public String getEventType() {
        return this.getClass().getSimpleName();
    }
}
```

### 2.2 Value Objects

**Money Value Object:**

```java
// src/main/java/com/invoiceme/common/domain/valueobjects/Money.java
package com.invoiceme.common.domain.valueobjects;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;

@Getter
@EqualsAndHashCode
public class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money(BigDecimal amount, Currency currency) {
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        if (currency == null) {
            throw new IllegalArgumentException("Currency cannot be null");
        }

        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        this.currency = currency;
    }

    public Money(BigDecimal amount) {
        this(amount, Currency.getInstance("USD"));
    }

    public Money add(Money other) {
        assertSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        assertSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    public Money multiply(BigDecimal multiplier) {
        return new Money(this.amount.multiply(multiplier), this.currency);
    }

    public Money divide(BigDecimal divisor) {
        return new Money(this.amount.divide(divisor, 2, RoundingMode.HALF_UP), this.currency);
    }

    public boolean isGreaterThan(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) > 0;
    }

    public boolean isLessThan(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) < 0;
    }

    public boolean isZero() {
        return this.amount.compareTo(BigDecimal.ZERO) == 0;
    }

    public boolean isPositive() {
        return this.amount.compareTo(BigDecimal.ZERO) > 0;
    }

    private void assertSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                String.format("Cannot operate on different currencies: %s and %s",
                    this.currency, other.currency)
            );
        }
    }

    public static Money zero() {
        return new Money(BigDecimal.ZERO);
    }

    public static Money zero(Currency currency) {
        return new Money(BigDecimal.ZERO, currency);
    }

    @Override
    public String toString() {
        return String.format("%s %s", currency.getSymbol(), amount);
    }
}
```

**EmailAddress Value Object:**

```java
// src/main/java/com/invoiceme/common/domain/valueobjects/EmailAddress.java
package com.invoiceme.common.domain.valueobjects;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import java.util.regex.Pattern;

@Getter
@EqualsAndHashCode
public class EmailAddress {
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private final String value;

    public EmailAddress(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Email address cannot be empty");
        }

        String trimmed = value.trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("Invalid email format: " + value);
        }

        this.value = trimmed;
    }

    @Override
    public String toString() {
        return value;
    }
}
```

**Address Value Object:**

```java
// src/main/java/com/invoiceme/common/domain/valueobjects/Address.java
package com.invoiceme.common.domain.valueobjects;

import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode
public class Address {
    private final String street;
    private final String city;
    private final String state;
    private final String zipCode;
    private final String country;

    public Address(String street, String city, String state, String zipCode, String country) {
        if (street == null || street.trim().isEmpty()) {
            throw new IllegalArgumentException("Street cannot be empty");
        }
        if (city == null || city.trim().isEmpty()) {
            throw new IllegalArgumentException("City cannot be empty");
        }
        if (state == null || state.trim().isEmpty()) {
            throw new IllegalArgumentException("State cannot be empty");
        }
        if (zipCode == null || zipCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Zip code cannot be empty");
        }
        if (country == null || country.trim().isEmpty()) {
            throw new IllegalArgumentException("Country cannot be empty");
        }

        this.street = street.trim();
        this.city = city.trim();
        this.state = state.trim();
        this.zipCode = zipCode.trim();
        this.country = country.trim();
    }

    public String getFullAddress() {
        return String.format("%s, %s, %s %s, %s",
            street, city, state, zipCode, country);
    }

    @Override
    public String toString() {
        return getFullAddress();
    }
}
```

**PhoneNumber Value Object:**

```java
// src/main/java/com/invoiceme/common/domain/valueobjects/PhoneNumber.java
package com.invoiceme.common.domain.valueobjects;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import java.util.regex.Pattern;

@Getter
@EqualsAndHashCode
public class PhoneNumber {
    private static final Pattern E164_PATTERN = Pattern.compile("^\\+?[1-9]\\d{1,14}$");

    private final String value;

    public PhoneNumber(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number cannot be empty");
        }

        String cleaned = value.replaceAll("[\\s-()]", "");

        if (!E164_PATTERN.matcher(cleaned).matches()) {
            throw new IllegalArgumentException("Invalid phone number format: " + value);
        }

        this.value = cleaned;
    }

    @Override
    public String toString() {
        return value;
    }
}
```

### 2.3 Customer Domain

**Customer Entity:**

```java
// src/main/java/com/invoiceme/features/customers/domain/Customer.java
package com.invoiceme.features.customers.domain;

import com.invoiceme.common.domain.BaseEntity;
import com.invoiceme.common.domain.valueobjects.*;
import com.invoiceme.features.customers.domain.events.*;
import com.invoiceme.features.customers.domain.valueobjects.*;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class Customer extends BaseEntity {
    private CustomerId id;
    private CustomerName name;
    private EmailAddress email;
    private PhoneNumber phone;
    private Address billingAddress;
    private TaxIdentifier taxId;
    private CustomerStatus status;
    private AuditInfo auditInfo;

    // Private constructor - use factory method
    private Customer() {
    }

    public static Customer create(
        String firstName,
        String lastName,
        String email,
        String phone,
        Address billingAddress,
        String taxId,
        String createdBy
    ) {
        Customer customer = new Customer();
        customer.id = new CustomerId(UUID.randomUUID());
        customer.name = new CustomerName(firstName, lastName);
        customer.email = new EmailAddress(email);
        customer.phone = phone != null ? new PhoneNumber(phone) : null;
        customer.billingAddress = billingAddress;
        customer.taxId = taxId != null ? new TaxIdentifier(taxId) : null;
        customer.status = CustomerStatus.ACTIVE;
        customer.auditInfo = AuditInfo.create(createdBy);

        customer.registerEvent(new CustomerCreated(
            customer.id,
            customer.name.getFullName(),
            customer.email.getValue()
        ));

        return customer;
    }

    public void update(
        String firstName,
        String lastName,
        String email,
        String phone,
        Address billingAddress,
        String taxId,
        String modifiedBy
    ) {
        if (this.status == CustomerStatus.DELETED) {
            throw new IllegalStateException("Cannot update deleted customer");
        }

        boolean emailChanged = !this.email.getValue().equals(email);

        this.name = new CustomerName(firstName, lastName);
        this.email = new EmailAddress(email);
        this.phone = phone != null ? new PhoneNumber(phone) : null;
        this.billingAddress = billingAddress;
        this.taxId = taxId != null ? new TaxIdentifier(taxId) : null;
        this.auditInfo = this.auditInfo.updateModified(modifiedBy);

        this.registerEvent(new CustomerUpdated(
            this.id,
            this.name.getFullName(),
            emailChanged
        ));
    }

    public void deactivate(String modifiedBy) {
        if (this.status == CustomerStatus.DELETED) {
            throw new IllegalStateException("Cannot deactivate deleted customer");
        }

        this.status = CustomerStatus.INACTIVE;
        this.auditInfo = this.auditInfo.updateModified(modifiedBy);

        this.registerEvent(new CustomerStatusChanged(
            this.id,
            CustomerStatus.ACTIVE,
            CustomerStatus.INACTIVE
        ));
    }

    public void activate(String modifiedBy) {
        if (this.status == CustomerStatus.DELETED) {
            throw new IllegalStateException("Cannot activate deleted customer");
        }

        CustomerStatus oldStatus = this.status;
        this.status = CustomerStatus.ACTIVE;
        this.auditInfo = this.auditInfo.updateModified(modifiedBy);

        this.registerEvent(new CustomerStatusChanged(
            this.id,
            oldStatus,
            CustomerStatus.ACTIVE
        ));
    }

    public void delete(String modifiedBy) {
        this.status = CustomerStatus.DELETED;
        this.auditInfo = this.auditInfo.updateModified(modifiedBy);

        this.registerEvent(new CustomerDeleted(this.id));
    }

    public boolean isActive() {
        return this.status == CustomerStatus.ACTIVE;
    }

    public boolean canBeDeleted() {
        // Business rule: Only inactive customers with no active invoices can be deleted
        return this.status == CustomerStatus.INACTIVE;
    }
}
```

**Customer Value Objects:**

```java
// src/main/java/com/invoiceme/features/customers/domain/valueobjects/CustomerId.java
package com.invoiceme.features.customers.domain.valueobjects;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import java.util.UUID;

@Getter
@EqualsAndHashCode
public class CustomerId {
    private final UUID value;

    public CustomerId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("Customer ID cannot be null");
        }
        this.value = value;
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
```

```java
// src/main/java/com/invoiceme/features/customers/domain/valueobjects/CustomerName.java
package com.invoiceme.features.customers.domain.valueobjects;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import java.util.regex.Pattern;

@Getter
@EqualsAndHashCode
public class CustomerName {
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z\\s'-]+$");
    private static final int MIN_LENGTH = 2;
    private static final int MAX_LENGTH = 50;

    private final String firstName;
    private final String lastName;

    public CustomerName(String firstName, String lastName) {
        this.firstName = validateName(firstName, "First name");
        this.lastName = validateName(lastName, "Last name");
    }

    private String validateName(String name, String fieldName) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " cannot be empty");
        }

        String trimmed = name.trim();

        if (trimmed.length() < MIN_LENGTH || trimmed.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                fieldName + " must be between " + MIN_LENGTH + " and " + MAX_LENGTH + " characters"
            );
        }

        if (!NAME_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException(fieldName + " contains invalid characters");
        }

        return trimmed;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    @Override
    public String toString() {
        return getFullName();
    }
}
```

```java
// src/main/java/com/invoiceme/features/customers/domain/valueobjects/TaxIdentifier.java
package com.invoiceme.features.customers.domain.valueobjects;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import java.util.regex.Pattern;

@Getter
@EqualsAndHashCode
public class TaxIdentifier {
    private static final Pattern TAX_ID_PATTERN = Pattern.compile("^\\d{2}-\\d{7}$");

    private final String value;

    public TaxIdentifier(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Tax ID cannot be empty");
        }

        String trimmed = value.trim();

        if (!TAX_ID_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("Tax ID must be in format XX-XXXXXXX");
        }

        this.value = trimmed;
    }

    @Override
    public String toString() {
        return value;
    }
}
```

**Customer Status Enum:**

```java
// src/main/java/com/invoiceme/features/customers/domain/CustomerStatus.java
package com.invoiceme.features.customers.domain;

public enum CustomerStatus {
    ACTIVE,
    INACTIVE,
    SUSPENDED,
    DELETED
}
```

**Audit Info Value Object:**

```java
// src/main/java/com/invoiceme/common/domain/valueobjects/AuditInfo.java
package com.invoiceme.common.domain.valueobjects;

import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class AuditInfo {
    private final LocalDateTime createdAt;
    private final String createdBy;
    private final LocalDateTime lastModifiedAt;
    private final String lastModifiedBy;

    private AuditInfo(LocalDateTime createdAt, String createdBy,
                      LocalDateTime lastModifiedAt, String lastModifiedBy) {
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.lastModifiedAt = lastModifiedAt;
        this.lastModifiedBy = lastModifiedBy;
    }

    public static AuditInfo create(String createdBy) {
        LocalDateTime now = LocalDateTime.now();
        return new AuditInfo(now, createdBy, now, createdBy);
    }

    public AuditInfo updateModified(String modifiedBy) {
        return new AuditInfo(
            this.createdAt,
            this.createdBy,
            LocalDateTime.now(),
            modifiedBy
        );
    }
}
```

**Customer Domain Events:**

```java
// src/main/java/com/invoiceme/features/customers/domain/events/CustomerCreated.java
package com.invoiceme.features.customers.domain.events;

import com.invoiceme.common.domain.BaseDomainEvent;
import com.invoiceme.features.customers.domain.valueobjects.CustomerId;
import lombok.Getter;

@Getter
public class CustomerCreated extends BaseDomainEvent {
    private final CustomerId customerId;
    private final String customerName;
    private final String email;

    public CustomerCreated(CustomerId customerId, String customerName, String email) {
        super();
        this.customerId = customerId;
        this.customerName = customerName;
        this.email = email;
    }
}
```

```java
// src/main/java/com/invoiceme/features/customers/domain/events/CustomerUpdated.java
package com.invoiceme.features.customers.domain.events;

import com.invoiceme.common.domain.BaseDomainEvent;
import com.invoiceme.features.customers.domain.valueobjects.CustomerId;
import lombok.Getter;

@Getter
public class CustomerUpdated extends BaseDomainEvent {
    private final CustomerId customerId;
    private final String customerName;
    private final boolean emailChanged;

    public CustomerUpdated(CustomerId customerId, String customerName, boolean emailChanged) {
        super();
        this.customerId = customerId;
        this.customerName = customerName;
        this.emailChanged = emailChanged;
    }
}
```

```java
// src/main/java/com/invoiceme/features/customers/domain/events/CustomerStatusChanged.java
package com.invoiceme.features.customers.domain.events;

import com.invoiceme.common.domain.BaseDomainEvent;
import com.invoiceme.features.customers.domain.CustomerStatus;
import com.invoiceme.features.customers.domain.valueobjects.CustomerId;
import lombok.Getter;

@Getter
public class CustomerStatusChanged extends BaseDomainEvent {
    private final CustomerId customerId;
    private final CustomerStatus oldStatus;
    private final CustomerStatus newStatus;

    public CustomerStatusChanged(CustomerId customerId, CustomerStatus oldStatus, CustomerStatus newStatus) {
        super();
        this.customerId = customerId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
}
```

```java
// src/main/java/com/invoiceme/features/customers/domain/events/CustomerDeleted.java
package com.invoiceme.features.customers.domain.events;

import com.invoiceme.common.domain.BaseDomainEvent;
import com.invoiceme.features.customers.domain.valueobjects.CustomerId;
import lombok.Getter;

@Getter
public class CustomerDeleted extends BaseDomainEvent {
    private final CustomerId customerId;

    public CustomerDeleted(CustomerId customerId) {
        super();
        this.customerId = customerId;
    }
}
```

**Customer Repository Interface:**

```java
// src/main/java/com/invoiceme/features/customers/domain/CustomerRepository.java
package com.invoiceme.features.customers.domain;

import com.invoiceme.features.customers.domain.valueobjects.CustomerId;
import java.util.Optional;

public interface CustomerRepository {
    Customer save(Customer customer);
    Optional<Customer> findById(CustomerId id);
    Optional<Customer> findByEmail(String email);
    boolean existsByEmail(String email);
    void delete(CustomerId id);
}
```

### 2.4 Invoice Domain

**Invoice Entity:**

```java
// src/main/java/com/invoiceme/features/invoices/domain/Invoice.java
package com.invoiceme.features.invoices.domain;

import com.invoiceme.common.domain.BaseEntity;
import com.invoiceme.common.domain.valueobjects.*;
import com.invoiceme.features.customers.domain.valueobjects.CustomerId;
import com.invoiceme.features.invoices.domain.events.*;
import com.invoiceme.features.invoices.domain.valueobjects.*;
import lombok.Getter;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Getter
public class Invoice extends BaseEntity {
    private InvoiceId id;
    private InvoiceNumber invoiceNumber;
    private CustomerId customerId;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private InvoiceStatus status;
    private List<LineItem> lineItems;
    private Money taxAmount;
    private String notes;
    private AuditInfo auditInfo;

    // Cached calculated values
    private Money subtotal;
    private Money totalAmount;
    private Money paidAmount;
    private Money balance;

    private Invoice() {
        this.lineItems = new ArrayList<>();
        this.paidAmount = Money.zero();
    }

    public static Invoice createDraft(
        CustomerId customerId,
        LocalDate invoiceDate,
        LocalDate dueDate,
        List<LineItem> lineItems,
        Money taxAmount,
        String notes,
        String createdBy
    ) {
        Invoice invoice = new Invoice();
        invoice.id = new InvoiceId(UUID.randomUUID());
        invoice.customerId = customerId;
        invoice.invoiceDate = invoiceDate;
        invoice.dueDate = dueDate;
        invoice.status = InvoiceStatus.DRAFT;
        invoice.taxAmount = taxAmount != null ? taxAmount : Money.zero();
        invoice.notes = notes;
        invoice.auditInfo = AuditInfo.create(createdBy);

        // Validate dates
        if (dueDate.isBefore(invoiceDate)) {
            throw new IllegalArgumentException("Due date cannot be before invoice date");
        }

        // Add line items
        if (lineItems == null || lineItems.isEmpty()) {
            throw new IllegalArgumentException("Invoice must have at least one line item");
        }

        for (LineItem item : lineItems) {
            invoice.addLineItem(item);
        }

        invoice.recalculateAmounts();

        invoice.registerEvent(new InvoiceCreated(
            invoice.id,
            invoice.customerId,
            invoice.totalAmount
        ));

        return invoice;
    }

    public void update(
        LocalDate invoiceDate,
        LocalDate dueDate,
        List<LineItem> lineItems,
        Money taxAmount,
        String notes,
        String modifiedBy
    ) {
        if (this.status != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT invoices can be updated");
        }

        if (dueDate.isBefore(invoiceDate)) {
            throw new IllegalArgumentException("Due date cannot be before invoice date");
        }

        this.invoiceDate = invoiceDate;
        this.dueDate = dueDate;
        this.taxAmount = taxAmount != null ? taxAmount : Money.zero();
        this.notes = notes;

        // Replace line items
        this.lineItems.clear();
        if (lineItems == null || lineItems.isEmpty()) {
            throw new IllegalArgumentException("Invoice must have at least one line item");
        }

        for (LineItem item : lineItems) {
            this.addLineItem(item);
        }

        this.recalculateAmounts();
        this.auditInfo = this.auditInfo.updateModified(modifiedBy);

        this.registerEvent(new InvoiceUpdated(this.id));
    }

    public void markAsSent(String sentBy) {
        if (this.status != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT invoices can be sent");
        }

        // Assign invoice number
        this.invoiceNumber = InvoiceNumber.generate();
        this.status = InvoiceStatus.SENT;
        this.auditInfo = this.auditInfo.updateModified(sentBy);

        this.registerEvent(new InvoiceMarkedAsSent(
            this.id,
            this.invoiceNumber,
            this.customerId
        ));
    }

    public void recordPayment(Money paymentAmount, String modifiedBy) {
        if (this.status != InvoiceStatus.SENT) {
            throw new IllegalStateException("Can only record payment for SENT invoices");
        }

        if (paymentAmount.isGreaterThan(this.balance)) {
            throw new IllegalArgumentException("Payment amount cannot exceed balance");
        }

        this.paidAmount = this.paidAmount.add(paymentAmount);
        this.balance = this.totalAmount.subtract(this.paidAmount);
        this.auditInfo = this.auditInfo.updateModified(modifiedBy);

        this.registerEvent(new InvoicePaymentRecorded(
            this.id,
            paymentAmount,
            this.balance
        ));

        // Auto-mark as paid if balance is zero
        if (this.balance.isZero()) {
            this.status = InvoiceStatus.PAID;
            this.registerEvent(new InvoiceMarkedAsPaid(this.id));
        }
    }

    public void cancel(String reason, String cancelledBy) {
        if (this.status == InvoiceStatus.PAID) {
            throw new IllegalStateException("Cannot cancel PAID invoices");
        }

        if (this.paidAmount.isPositive()) {
            throw new IllegalStateException("Cannot cancel invoice with recorded payments");
        }

        this.status = InvoiceStatus.CANCELLED;
        this.auditInfo = this.auditInfo.updateModified(cancelledBy);

        this.registerEvent(new InvoiceCancelled(this.id, reason));
    }

    private void addLineItem(LineItem item) {
        this.lineItems.add(item);
    }

    private void recalculateAmounts() {
        this.subtotal = this.lineItems.stream()
            .map(LineItem::getLineTotal)
            .reduce(Money.zero(), Money::add);

        this.totalAmount = this.subtotal.add(this.taxAmount);
        this.balance = this.totalAmount.subtract(this.paidAmount);
    }

    public List<LineItem> getLineItems() {
        return Collections.unmodifiableList(lineItems);
    }

    public boolean isOverdue() {
        return this.status == InvoiceStatus.SENT &&
               this.balance.isPositive() &&
               LocalDate.now().isAfter(this.dueDate);
    }
}
```

**Line Item Value Object:**

```java
// src/main/java/com/invoiceme/features/invoices/domain/valueobjects/LineItem.java
package com.invoiceme.features.invoices.domain.valueobjects;

import com.invoiceme.common.domain.valueobjects.Money;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@EqualsAndHashCode
public class LineItem {
    private final UUID id;
    private final String description;
    private final Quantity quantity;
    private final Money unitPrice;
    private final Money lineTotal;
    private final int sortOrder;

    public LineItem(String description, BigDecimal quantity, Money unitPrice, int sortOrder) {
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Line item description cannot be empty");
        }

        if (description.length() > 500) {
            throw new IllegalArgumentException("Line item description cannot exceed 500 characters");
        }

        this.id = UUID.randomUUID();
        this.description = description.trim();
        this.quantity = new Quantity(quantity);
        this.unitPrice = unitPrice;
        this.lineTotal = unitPrice.multiply(quantity);
        this.sortOrder = sortOrder;
    }
}
```

```java
// src/main/java/com/invoiceme/features/invoices/domain/valueobjects/Quantity.java
package com.invoiceme.features.invoices.domain.valueobjects;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Getter
@EqualsAndHashCode
public class Quantity {
    private final BigDecimal value;

    public Quantity(BigDecimal value) {
        if (value == null) {
            throw new IllegalArgumentException("Quantity cannot be null");
        }

        if (value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        this.value = value.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
```

**Invoice Number Value Object:**

```java
// src/main/java/com/invoiceme/features/invoices/domain/valueobjects/InvoiceNumber.java
package com.invoiceme.features.invoices.domain.valueobjects;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import java.time.Year;
import java.util.concurrent.atomic.AtomicInteger;

@Getter
@EqualsAndHashCode
public class InvoiceNumber {
    private static final AtomicInteger counter = new AtomicInteger(1);

    private final String value;

    private InvoiceNumber(String value) {
        this.value = value;
    }

    public static InvoiceNumber generate() {
        int year = Year.now().getValue();
        int sequence = counter.getAndIncrement();
        String formatted = String.format("INV-%d-%03d", year, sequence);
        return new InvoiceNumber(formatted);
    }

    public static InvoiceNumber fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Invoice number cannot be empty");
        }
        return new InvoiceNumber(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
```

This is Part 1 of the Backend Implementation Guide. Would you like me to continue with:

1. Part 2: Application Layer (Commands, Queries, Handlers)
2. Part 3: Infrastructure Layer (JPA Entities, Repositories)
3. Part 4: API Layer (Controllers, DTOs)
4. Part 5: Security, Testing, and Deployment

Let me know and I'll continue with the remaining sections!