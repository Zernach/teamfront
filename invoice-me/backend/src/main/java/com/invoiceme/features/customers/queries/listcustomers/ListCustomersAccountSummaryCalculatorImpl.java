package com.invoiceme.features.customers.queries.listcustomers;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service("listCustomersAccountSummaryCalculator")
public class ListCustomersAccountSummaryCalculatorImpl implements ListCustomersQueryHandler.AccountSummaryCalculator {
    @Override
    public ListCustomersQueryHandler.AccountSummary calculate(UUID customerId) {
        // TODO: Implement when Invoice domain is created (Epic 2)
        // For now, return zeros/defaults
        return new ListCustomersQueryHandler.AccountSummary(
            BigDecimal.ZERO,
            0
        );
    }
}
