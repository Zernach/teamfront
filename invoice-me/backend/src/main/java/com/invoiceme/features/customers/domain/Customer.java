package com.invoiceme.features.customers.domain;

import com.invoiceme.features.customers.domain.valueobjects.*;
import java.util.UUID;

public class Customer {
    private UUID id;
    private CustomerName name;
    private EmailAddress email;
    private PhoneNumber phone;
    private Address billingAddress;
    private CustomerStatus status;
    private AuditInfo auditInfo;
    
    // Private constructor for JPA
    private Customer() {
    }
    
    // Package-private constructor for reconstruction from entity
    Customer(UUID id, CustomerName name, EmailAddress email, PhoneNumber phone,
                    Address billingAddress, CustomerStatus status, AuditInfo auditInfo) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.billingAddress = billingAddress;
        this.status = status;
        this.auditInfo = auditInfo;
    }
    
    public static Customer reconstruct(UUID id, CustomerName name, EmailAddress email, PhoneNumber phone,
                                      Address billingAddress, CustomerStatus status, AuditInfo auditInfo) {
        return new Customer(id, name, email, phone, billingAddress, status, auditInfo);
    }
    
    public static Customer create(CustomerName name, EmailAddress email, PhoneNumber phone,
                                 Address billingAddress, String createdBy) {
        return new Customer(
            UUID.randomUUID(),
            name,
            email,
            phone,
            billingAddress,
            CustomerStatus.ACTIVE,
            AuditInfo.create(createdBy)
        );
    }
    
    public UUID getId() {
        return id;
    }
    
    public CustomerName getName() {
        return name;
    }
    
    public EmailAddress getEmail() {
        return email;
    }
    
    public PhoneNumber getPhone() {
        return phone;
    }
    
    public Address getBillingAddress() {
        return billingAddress;
    }
    
    public CustomerStatus getStatus() {
        return status;
    }
    
    public AuditInfo getAuditInfo() {
        return auditInfo;
    }
}

