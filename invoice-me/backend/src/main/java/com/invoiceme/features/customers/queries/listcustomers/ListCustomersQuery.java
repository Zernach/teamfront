package com.invoiceme.features.customers.queries.listcustomers;

import com.invoiceme.features.customers.domain.CustomerStatus;

public class ListCustomersQuery {
    private final CustomerStatus status;
    private final String searchTerm;
    private final String sortBy;
    private final String sortDirection;
    private final int pageNumber;
    private final int pageSize;
    
    public ListCustomersQuery(CustomerStatus status, String searchTerm, String sortBy,
                              String sortDirection, int pageNumber, int pageSize) {
        this.status = status;
        this.searchTerm = searchTerm;
        this.sortBy = sortBy;
        this.sortDirection = sortDirection;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
    }
    
    public CustomerStatus getStatus() {
        return status;
    }
    
    public String getSearchTerm() {
        return searchTerm;
    }
    
    public String getSortBy() {
        return sortBy;
    }
    
    public String getSortDirection() {
        return sortDirection;
    }
    
    public int getPageNumber() {
        return pageNumber;
    }
    
    public int getPageSize() {
        return pageSize;
    }
}








