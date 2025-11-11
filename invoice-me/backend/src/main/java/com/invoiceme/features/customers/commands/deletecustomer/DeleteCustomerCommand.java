package com.invoiceme.features.customers.commands.deletecustomer;

import java.util.UUID;

public class DeleteCustomerCommand {
    private final UUID customerId;
    private final boolean hardDelete;
    private final String deletedBy;
    
    public DeleteCustomerCommand(UUID customerId, boolean hardDelete, String deletedBy) {
        this.customerId = customerId;
        this.hardDelete = hardDelete;
        this.deletedBy = deletedBy;
    }
    
    public UUID getCustomerId() {
        return customerId;
    }
    
    public boolean isHardDelete() {
        return hardDelete;
    }
    
    public String getDeletedBy() {
        return deletedBy;
    }
}




