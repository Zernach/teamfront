package com.invoiceme.features.customers.domain.valueobjects;

import java.util.Objects;
import java.util.regex.Pattern;

public final class TaxIdentifier {
    private static final Pattern TAX_ID_PATTERN = Pattern.compile("^[A-Z]{2}-\\d{7}$");
    
    private final String value;
    
    private TaxIdentifier(String value) {
        if (value != null && !value.isBlank()) {
            if (!TAX_ID_PATTERN.matcher(value.toUpperCase()).matches()) {
                throw new IllegalArgumentException("Tax ID must be in format XX-XXXXXXX: " + value);
            }
            this.value = value.toUpperCase();
        } else {
            this.value = null;
        }
    }
    
    public static TaxIdentifier of(String value) {
        return new TaxIdentifier(value);
    }
    
    public static TaxIdentifier empty() {
        return new TaxIdentifier(null);
    }
    
    public String getValue() {
        return value;
    }
    
    public boolean isEmpty() {
        return value == null;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TaxIdentifier that = (TaxIdentifier) o;
        return Objects.equals(value, that.value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
    
    @Override
    public String toString() {
        return value != null ? value : "";
    }
}



