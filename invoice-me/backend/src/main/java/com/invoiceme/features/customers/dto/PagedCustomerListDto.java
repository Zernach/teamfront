package com.invoiceme.features.customers.dto;

import java.util.List;

public class PagedCustomerListDto {
    private List<CustomerSummaryDto> customers;
    private int totalCount;
    private int pageNumber;
    private int pageSize;
    private int totalPages;
    
    public List<CustomerSummaryDto> getCustomers() {
        return customers;
    }
    
    public void setCustomers(List<CustomerSummaryDto> customers) {
        this.customers = customers;
    }
    
    public int getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
    
    public int getPageNumber() {
        return pageNumber;
    }
    
    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }
    
    public int getPageSize() {
        return pageSize;
    }
    
    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
    
    public int getTotalPages() {
        return totalPages;
    }
    
    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}







