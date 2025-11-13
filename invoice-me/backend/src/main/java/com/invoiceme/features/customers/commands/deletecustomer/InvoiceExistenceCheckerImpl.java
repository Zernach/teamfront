package com.invoiceme.features.customers.commands.deletecustomer;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class InvoiceExistenceCheckerImpl implements DeleteCustomerCommandHandler.InvoiceExistenceChecker {
    @Override
    public boolean hasActiveInvoices(UUID customerId) {
        // TODO: Implement when Invoice domain is created (Epic 2)
        // For now, no invoices exist, so always return false
        return false;
    }
}








