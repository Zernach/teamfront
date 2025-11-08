package com.invoiceme.features.customers.commands.createcustomer;

import java.util.UUID;

public class CreateCustomerCommand {
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phone;
    private final String street;
    private final String city;
    private final String state;
    private final String zipCode;
    private final String country;
    private final String taxId;
    private final String createdBy;
    
    public CreateCustomerCommand(String firstName, String lastName, String email, String phone,
                                String street, String city, String state, String zipCode, String country,
                                String taxId, String createdBy) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
        this.taxId = taxId;
        this.createdBy = createdBy;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public String getStreet() {
        return street;
    }
    
    public String getCity() {
        return city;
    }
    
    public String getState() {
        return state;
    }
    
    public String getZipCode() {
        return zipCode;
    }
    
    public String getCountry() {
        return country;
    }
    
    public String getTaxId() {
        return taxId;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
}

