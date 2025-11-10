package com.invoiceme.features.customers.infrastructure;

import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerStatus;
import com.invoiceme.features.customers.domain.valueobjects.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customers", indexes = {
    @Index(name = "idx_customer_email", columnList = "email", unique = true)
})
public class CustomerEntity {
    @Id
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;
    
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "street", nullable = false, length = 255)
    private String street;
    
    @Column(name = "city", nullable = false, length = 100)
    private String city;
    
    @Column(name = "state", nullable = false, length = 50)
    private String state;
    
    @Column(name = "zip_code", nullable = false, length = 20)
    private String zipCode;
    
    @Column(name = "country", nullable = false, length = 100)
    private String country;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CustomerStatus status;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "last_modified_at", nullable = false)
    private LocalDateTime lastModifiedAt;
    
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;
    
    @Column(name = "last_modified_by", nullable = false, length = 100)
    private String lastModifiedBy;
    
    protected CustomerEntity() {
    }
    
    public CustomerEntity(Customer customer) {
        this.id = customer.getId();
        this.firstName = customer.getName().getFirstName();
        this.lastName = customer.getName().getLastName();
        this.email = customer.getEmail().getValue();
        this.phone = customer.getPhone().isEmpty() ? null : customer.getPhone().getValue();
        this.street = customer.getBillingAddress().getStreet();
        this.city = customer.getBillingAddress().getCity();
        this.state = customer.getBillingAddress().getState();
        this.zipCode = customer.getBillingAddress().getZipCode();
        this.country = customer.getBillingAddress().getCountry();
        this.status = customer.getStatus();
        this.createdAt = customer.getAuditInfo().getCreatedAt();
        this.lastModifiedAt = customer.getAuditInfo().getLastModifiedAt();
        this.createdBy = customer.getAuditInfo().getCreatedBy();
        this.lastModifiedBy = customer.getAuditInfo().getLastModifiedBy();
    }
    
    public Customer toDomain() {
        return Customer.reconstruct(
            id,
            CustomerName.of(firstName, lastName),
            EmailAddress.of(email),
            phone != null ? PhoneNumber.of(phone) : PhoneNumber.empty(),
            Address.of(street, city, state, zipCode, country),
            status,
            AuditInfo.reconstruct(createdAt, lastModifiedAt, createdBy, lastModifiedBy)
        );
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getStreet() {
        return street;
    }
    
    public void setStreet(String street) {
        this.street = street;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getZipCode() {
        return zipCode;
    }
    
    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public CustomerStatus getStatus() {
        return status;
    }
    
    public void setStatus(CustomerStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastModifiedAt() {
        return lastModifiedAt;
    }
    
    public void setLastModifiedAt(LocalDateTime lastModifiedAt) {
        this.lastModifiedAt = lastModifiedAt;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public String getLastModifiedBy() {
        return lastModifiedBy;
    }
    
    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }
}

