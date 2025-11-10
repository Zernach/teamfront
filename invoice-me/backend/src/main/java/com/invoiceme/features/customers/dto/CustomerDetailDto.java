package com.invoiceme.features.customers.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class CustomerDetailDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private AddressDto billingAddress;
    // Flat address fields for frontend compatibility
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String status;
    private int totalInvoicesCount;
    private BigDecimal totalInvoicedAmount;
    private BigDecimal totalPaidAmount;
    private BigDecimal outstandingBalance;
    // Frontend-compatible field names
    private int activeInvoicesCount;
    private BigDecimal totalInvoiced;
    private BigDecimal totalPaid;
    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;
    
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
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
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
    
    public AddressDto getBillingAddress() {
        return billingAddress;
    }
    
    public void setBillingAddress(AddressDto billingAddress) {
        this.billingAddress = billingAddress;
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public int getTotalInvoicesCount() {
        return totalInvoicesCount;
    }
    
    public void setTotalInvoicesCount(int totalInvoicesCount) {
        this.totalInvoicesCount = totalInvoicesCount;
        // Also set frontend-compatible field
        this.activeInvoicesCount = totalInvoicesCount;
    }
    
    public BigDecimal getTotalInvoicedAmount() {
        return totalInvoicedAmount;
    }
    
    public void setTotalInvoicedAmount(BigDecimal totalInvoicedAmount) {
        this.totalInvoicedAmount = totalInvoicedAmount;
        // Also set frontend-compatible field
        this.totalInvoiced = totalInvoicedAmount;
    }
    
    public BigDecimal getTotalPaidAmount() {
        return totalPaidAmount;
    }
    
    public void setTotalPaidAmount(BigDecimal totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
        // Also set frontend-compatible field
        this.totalPaid = totalPaidAmount;
    }
    
    public int getActiveInvoicesCount() {
        return activeInvoicesCount;
    }
    
    public void setActiveInvoicesCount(int activeInvoicesCount) {
        this.activeInvoicesCount = activeInvoicesCount;
    }
    
    public BigDecimal getTotalInvoiced() {
        return totalInvoiced;
    }
    
    public void setTotalInvoiced(BigDecimal totalInvoiced) {
        this.totalInvoiced = totalInvoiced;
    }
    
    public BigDecimal getTotalPaid() {
        return totalPaid;
    }
    
    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }
    
    public BigDecimal getOutstandingBalance() {
        return outstandingBalance;
    }
    
    public void setOutstandingBalance(BigDecimal outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
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
}

