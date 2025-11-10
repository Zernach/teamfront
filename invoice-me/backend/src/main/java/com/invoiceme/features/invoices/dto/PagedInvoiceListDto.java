package com.invoiceme.features.invoices.dto;

import java.math.BigDecimal;
import java.util.List;

public class PagedInvoiceListDto {
    private List<InvoiceSummaryDto> invoices;
    private int totalCount;
    private int pageNumber;
    private int pageSize;
    private int totalPages;
    private BigDecimal totalAmountSum;
    private BigDecimal totalBalanceSum;

    public List<InvoiceSummaryDto> getInvoices() {
        return invoices;
    }

    public void setInvoices(List<InvoiceSummaryDto> invoices) {
        this.invoices = invoices;
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

    public BigDecimal getTotalAmountSum() {
        return totalAmountSum;
    }

    public void setTotalAmountSum(BigDecimal totalAmountSum) {
        this.totalAmountSum = totalAmountSum;
    }

    public BigDecimal getTotalBalanceSum() {
        return totalBalanceSum;
    }

    public void setTotalBalanceSum(BigDecimal totalBalanceSum) {
        this.totalBalanceSum = totalBalanceSum;
    }
}

