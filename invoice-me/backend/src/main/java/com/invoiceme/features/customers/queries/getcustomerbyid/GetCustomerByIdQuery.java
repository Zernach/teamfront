package com.invoiceme.features.customers.queries.getcustomerbyid;

import java.util.UUID;

public class GetCustomerByIdQuery {
    private final UUID customerId;
    
    public GetCustomerByIdQuery(UUID customerId) {
        this.customerId = customerId;
    }
    
    public UUID getCustomerId() {
        return customerId;
    }
}







