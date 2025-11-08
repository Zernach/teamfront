package com.invoiceme.features.customers.queries.getcustomerbyid;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service("getCustomerByIdAccountSummaryCalculator")
public class GetCustomerByIdAccountSummaryCalculatorImpl implements GetCustomerByIdQueryHandler.AccountSummaryCalculator {
    @Override
    public GetCustomerByIdQueryHandler.AccountSummary calculate(UUID customerId) {
        // TODO: Implement when Invoice domain is created (Epic 2)
        // For now, return zeros/defaults
        return new GetCustomerByIdQueryHandler.AccountSummary(
            0,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO
        );
    }
}
