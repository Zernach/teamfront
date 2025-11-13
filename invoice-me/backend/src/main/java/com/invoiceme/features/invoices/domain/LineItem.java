package com.invoiceme.features.invoices.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class LineItem {
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;

    private LineItem(String description, BigDecimal quantity, BigDecimal unitPrice) {
        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.lineTotal = quantity.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);
    }

    public static LineItem of(String description, BigDecimal quantity, BigDecimal unitPrice) {
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Line item description is required");
        }
        if (description.length() > 500) {
            throw new IllegalArgumentException("Line item description must be 500 characters or less");
        }
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Line item quantity must be greater than 0");
        }
        if (quantity.scale() > 2) {
            throw new IllegalArgumentException("Line item quantity cannot have more than 2 decimal places");
        }
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Line item unit price must be greater than or equal to 0");
        }

        return new LineItem(description.trim(), quantity, unitPrice);
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }
}








