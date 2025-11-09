package com.invoiceme.features.customers.domain.valueobjects;

import java.util.Objects;
import java.util.regex.Pattern;

public final class CustomerName {
    private static final Pattern VALID_NAME_PATTERN = Pattern.compile("^[a-zA-Z\\s'-]+$");
    private static final int MIN_LENGTH = 2;
    private static final int MAX_LENGTH = 50;
    
    private final String firstName;
    private final String lastName;
    
    private CustomerName(String firstName, String lastName) {
        validateName(firstName, "First name");
        validateName(lastName, "Last name");
        
        this.firstName = firstName.trim();
        this.lastName = lastName.trim();
    }
    
    private void validateName(String name, String fieldName) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        String trimmed = name.trim();
        if (trimmed.length() < MIN_LENGTH || trimmed.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                String.format("%s must be between %d and %d characters", fieldName, MIN_LENGTH, MAX_LENGTH)
            );
        }
        if (!VALID_NAME_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException(
                fieldName + " can only contain letters, spaces, hyphens, and apostrophes"
            );
        }
    }
    
    public static CustomerName of(String firstName, String lastName) {
        return new CustomerName(firstName, lastName);
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CustomerName that = (CustomerName) o;
        return Objects.equals(firstName, that.firstName) &&
               Objects.equals(lastName, that.lastName);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(firstName, lastName);
    }
    
    @Override
    public String toString() {
        return getFullName();
    }
}


