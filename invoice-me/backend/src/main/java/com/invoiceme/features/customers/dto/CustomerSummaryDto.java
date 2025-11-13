package com.invoiceme.features.customers.dto;

import java.util.List;

public class CustomerSummaryDto {
    private String id;
    private String fullName;
    private String email;
    private String status;
    private java.math.BigDecimal outstandingBalance;
    private int activeInvoicesCount;
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public java.math.BigDecimal getOutstandingBalance() {
        return outstandingBalance;
    }
    
    public void setOutstandingBalance(java.math.BigDecimal outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }
    
    public int getActiveInvoicesCount() {
        return activeInvoicesCount;
    }
    
    public void setActiveInvoicesCount(int activeInvoicesCount) {
        this.activeInvoicesCount = activeInvoicesCount;
    }
}







