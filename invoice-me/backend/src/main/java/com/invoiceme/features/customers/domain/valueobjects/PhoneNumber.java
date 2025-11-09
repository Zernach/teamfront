package com.invoiceme.features.customers.domain.valueobjects;

import java.util.Objects;
import java.util.regex.Pattern;

public final class PhoneNumber {
    private static final Pattern E164_PATTERN = Pattern.compile("^\\+[1-9]\\d{1,14}$");
    
    private final String value;
    
    private PhoneNumber(String value) {
        if (value != null && !value.isBlank()) {
            if (!E164_PATTERN.matcher(value).matches()) {
                throw new IllegalArgumentException("Phone number must be in E.164 format: " + value);
            }
            this.value = value;
        } else {
            this.value = null;
        }
    }
    
    public static PhoneNumber of(String value) {
        return new PhoneNumber(value);
    }
    
    public static PhoneNumber empty() {
        return new PhoneNumber(null);
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
        PhoneNumber that = (PhoneNumber) o;
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


