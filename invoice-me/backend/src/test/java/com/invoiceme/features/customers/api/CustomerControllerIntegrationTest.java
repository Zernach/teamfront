package com.invoiceme.features.customers.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoiceme.features.customers.dto.CreateCustomerRequestDto;
import com.invoiceme.features.customers.dto.CustomerDetailDto;
import com.invoiceme.features.customers.dto.PagedCustomerListDto;
import com.invoiceme.features.customers.dto.UpdateCustomerRequestDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CustomerControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    void createCustomer_Success() throws Exception {
        CreateCustomerRequestDto request = new CreateCustomerRequestDto();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@example.com");
        request.setStreet("123 Main St");
        request.setCity("New York");
        request.setState("NY");
        request.setZipCode("10001");
        request.setCountry("USA");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.fullName").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.billingAddress.street").value("123 Main St"));
    }
    
    @Test
    void createCustomer_WithOptionalFields_Success() throws Exception {
        CreateCustomerRequestDto request = new CreateCustomerRequestDto();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setEmail("jane.smith@example.com");
        request.setPhone("+1234567890");
        request.setStreet("456 Oak Ave");
        request.setCity("Los Angeles");
        request.setState("CA");
        request.setZipCode("90001");
        request.setCountry("USA");
        request.setTaxId("US-1234567");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.phone").value("+1234567890"))
                .andExpect(jsonPath("$.taxId").value("US-1234567"));
    }
    
    @Test
    void createCustomer_DuplicateEmail_Conflict() throws Exception {
        CreateCustomerRequestDto request1 = new CreateCustomerRequestDto();
        request1.setFirstName("John");
        request1.setLastName("Doe");
        request1.setEmail("duplicate@example.com");
        request1.setStreet("123 Main St");
        request1.setCity("New York");
        request1.setState("NY");
        request1.setZipCode("10001");
        request1.setCountry("USA");
        
        // Create first customer
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());
        
        // Try to create second customer with same email
        CreateCustomerRequestDto request2 = new CreateCustomerRequestDto();
        request2.setFirstName("Jane");
        request2.setLastName("Doe");
        request2.setEmail("duplicate@example.com");
        request2.setStreet("456 Oak Ave");
        request2.setCity("Los Angeles");
        request2.setState("CA");
        request2.setZipCode("90001");
        request2.setCountry("USA");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isConflict());
    }
    
    @Test
    void createCustomer_InvalidEmail_BadRequest() throws Exception {
        CreateCustomerRequestDto request = new CreateCustomerRequestDto();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("invalid-email");
        request.setStreet("123 Main St");
        request.setCity("New York");
        request.setState("NY");
        request.setZipCode("10001");
        request.setCountry("USA");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }
    
    @Test
    void createCustomer_MissingRequiredFields_BadRequest() throws Exception {
        CreateCustomerRequestDto request = new CreateCustomerRequestDto();
        request.setFirstName("John");
        // Missing lastName, email, address fields
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").exists());
    }
    
    @Test
    void createCustomer_InvalidPhoneFormat_BadRequest() throws Exception {
        CreateCustomerRequestDto request = new CreateCustomerRequestDto();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@example.com");
        request.setPhone("1234567890"); // Invalid E.164 format
        request.setStreet("123 Main St");
        request.setCity("New York");
        request.setState("NY");
        request.setZipCode("10001");
        request.setCountry("USA");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.phone").exists());
    }
    
    @Test
    void createCustomer_InvalidTaxIdFormat_BadRequest() throws Exception {
        CreateCustomerRequestDto request = new CreateCustomerRequestDto();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@example.com");
        request.setTaxId("INVALID"); // Invalid format
        request.setStreet("123 Main St");
        request.setCity("New York");
        request.setState("NY");
        request.setZipCode("10001");
        request.setCountry("USA");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.taxId").exists());
    }
    
    @Test
    void updateCustomer_Success() throws Exception {
        // Create customer first
        CreateCustomerRequestDto createRequest = new CreateCustomerRequestDto();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.doe@example.com");
        createRequest.setStreet("123 Main St");
        createRequest.setCity("New York");
        createRequest.setState("NY");
        createRequest.setZipCode("10001");
        createRequest.setCountry("USA");
        
        String responseJson = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        CustomerDetailDto created = objectMapper.readValue(responseJson, CustomerDetailDto.class);
        UUID customerId = created.getId();
        
        // Update customer
        UpdateCustomerRequestDto updateRequest = new UpdateCustomerRequestDto();
        updateRequest.setFirstName("Jane");
        updateRequest.setEmail("jane.doe@example.com");
        
        mockMvc.perform(put("/api/v1/customers/" + customerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Jane Doe"))
                .andExpect(jsonPath("$.email").value("jane.doe@example.com"));
    }
    
    @Test
    void updateCustomer_NotFound() throws Exception {
        UpdateCustomerRequestDto request = new UpdateCustomerRequestDto();
        request.setFirstName("Jane");
        
        mockMvc.perform(put("/api/v1/customers/" + UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void updateCustomer_NoFieldsProvided_BadRequest() throws Exception {
        // Create customer first
        CreateCustomerRequestDto createRequest = new CreateCustomerRequestDto();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.doe@example.com");
        createRequest.setStreet("123 Main St");
        createRequest.setCity("New York");
        createRequest.setState("NY");
        createRequest.setZipCode("10001");
        createRequest.setCountry("USA");
        
        String responseJson = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        CustomerDetailDto created = objectMapper.readValue(responseJson, CustomerDetailDto.class);
        UUID customerId = created.getId();
        
        // Try to update with no fields
        UpdateCustomerRequestDto updateRequest = new UpdateCustomerRequestDto();
        
        mockMvc.perform(put("/api/v1/customers/" + customerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void updateCustomer_DuplicateEmail_Conflict() throws Exception {
        // Create first customer
        CreateCustomerRequestDto createRequest1 = new CreateCustomerRequestDto();
        createRequest1.setFirstName("John");
        createRequest1.setLastName("Doe");
        createRequest1.setEmail("john.doe@example.com");
        createRequest1.setStreet("123 Main St");
        createRequest1.setCity("New York");
        createRequest1.setState("NY");
        createRequest1.setZipCode("10001");
        createRequest1.setCountry("USA");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest1)))
                .andExpect(status().isCreated());
        
        // Create second customer
        CreateCustomerRequestDto createRequest2 = new CreateCustomerRequestDto();
        createRequest2.setFirstName("Jane");
        createRequest2.setLastName("Smith");
        createRequest2.setEmail("jane.smith@example.com");
        createRequest2.setStreet("456 Oak Ave");
        createRequest2.setCity("Los Angeles");
        createRequest2.setState("CA");
        createRequest2.setZipCode("90001");
        createRequest2.setCountry("USA");
        
        String responseJson = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest2)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        CustomerDetailDto created = objectMapper.readValue(responseJson, CustomerDetailDto.class);
        UUID customerId = created.getId();
        
        // Try to update second customer with first customer's email
        UpdateCustomerRequestDto updateRequest = new UpdateCustomerRequestDto();
        updateRequest.setEmail("john.doe@example.com");
        
        mockMvc.perform(put("/api/v1/customers/" + customerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isConflict());
    }
    
    @Test
    void updateCustomer_InvalidEmailFormat_BadRequest() throws Exception {
        // Create customer first
        CreateCustomerRequestDto createRequest = new CreateCustomerRequestDto();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.doe@example.com");
        createRequest.setStreet("123 Main St");
        createRequest.setCity("New York");
        createRequest.setState("NY");
        createRequest.setZipCode("10001");
        createRequest.setCountry("USA");
        
        String responseJson = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        CustomerDetailDto created = objectMapper.readValue(responseJson, CustomerDetailDto.class);
        UUID customerId = created.getId();
        
        // Try to update with invalid email
        UpdateCustomerRequestDto updateRequest = new UpdateCustomerRequestDto();
        updateRequest.setEmail("invalid-email");
        
        mockMvc.perform(put("/api/v1/customers/" + customerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }
    
    @Test
    void deleteCustomer_Success() throws Exception {
        // Create customer first
        CreateCustomerRequestDto createRequest = new CreateCustomerRequestDto();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.doe@example.com");
        createRequest.setStreet("123 Main St");
        createRequest.setCity("New York");
        createRequest.setState("NY");
        createRequest.setZipCode("10001");
        createRequest.setCountry("USA");
        
        String responseJson = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        CustomerDetailDto created = objectMapper.readValue(responseJson, CustomerDetailDto.class);
        UUID customerId = created.getId();
        
        // Delete customer (soft delete)
        mockMvc.perform(delete("/api/v1/customers/" + customerId))
                .andExpect(status().isNoContent());
        
        // Verify customer is marked as DELETED by trying to update it
        UpdateCustomerRequestDto updateRequest = new UpdateCustomerRequestDto();
        updateRequest.setFirstName("Jane");
        
        mockMvc.perform(put("/api/v1/customers/" + customerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isConflict()); // Cannot update DELETED customer
    }
    
    @Test
    void deleteCustomer_NotFound() throws Exception {
        mockMvc.perform(delete("/api/v1/customers/" + UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void deleteCustomer_HardDeleteNotSupported() throws Exception {
        // Create customer first
        CreateCustomerRequestDto createRequest = new CreateCustomerRequestDto();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.doe@example.com");
        createRequest.setStreet("123 Main St");
        createRequest.setCity("New York");
        createRequest.setState("NY");
        createRequest.setZipCode("10001");
        createRequest.setCountry("USA");
        
        String responseJson = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        CustomerDetailDto created = objectMapper.readValue(responseJson, CustomerDetailDto.class);
        UUID customerId = created.getId();
        
        // Try hard delete
        mockMvc.perform(delete("/api/v1/customers/" + customerId + "?hardDelete=true"))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void getCustomerById_Success() throws Exception {
        // Create customer first
        CreateCustomerRequestDto createRequest = new CreateCustomerRequestDto();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.doe@example.com");
        createRequest.setPhone("+1234567890");
        createRequest.setStreet("123 Main St");
        createRequest.setCity("New York");
        createRequest.setState("NY");
        createRequest.setZipCode("10001");
        createRequest.setCountry("USA");
        createRequest.setTaxId("US-1234567");
        
        String responseJson = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        CustomerDetailDto created = objectMapper.readValue(responseJson, CustomerDetailDto.class);
        UUID customerId = created.getId();
        
        // Get customer by ID
        mockMvc.perform(get("/api/v1/customers/" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(customerId.toString()))
                .andExpect(jsonPath("$.fullName").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.phone").value("+1234567890"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.totalInvoicesCount").value(0))
                .andExpect(jsonPath("$.totalInvoicedAmount").value(0))
                .andExpect(jsonPath("$.totalPaidAmount").value(0))
                .andExpect(jsonPath("$.outstandingBalance").value(0));
    }
    
    @Test
    void getCustomerById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/customers/" + UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void listCustomers_Success() throws Exception {
        // Create multiple customers with unique emails
        String[] firstNames = {"Alice", "Bob", "Charlie"};
        for (int i = 0; i < 3; i++) {
            CreateCustomerRequestDto request = new CreateCustomerRequestDto();
            request.setFirstName(firstNames[i]);
            request.setLastName("Test");
            String uniqueId = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
            request.setEmail("listtest" + uniqueId + "@example.com");
            request.setStreet("123 Main St");
            request.setCity("New York");
            request.setState("NY");
            request.setZipCode("10001");
            request.setCountry("USA");
            
            mockMvc.perform(post("/api/v1/customers")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }
        
        // List all customers
        mockMvc.perform(get("/api/v1/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customers").isArray())
                .andExpect(jsonPath("$.totalCount").exists())
                .andExpect(jsonPath("$.pageNumber").value(0))
                .andExpect(jsonPath("$.pageSize").value(20));
    }
    
    @Test
    void listCustomers_WithPagination() throws Exception {
        // Create 5 customers with unique emails
        String[] firstNames = {"Alice", "Bob", "Charlie", "David", "Eve"};
        for (int i = 0; i < 5; i++) {
            CreateCustomerRequestDto request = new CreateCustomerRequestDto();
            request.setFirstName(firstNames[i]);
            request.setLastName("Test");
            // Generate valid email: remove hyphens from UUID and use first 8 chars
            String uniqueId = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
            request.setEmail("pagetest" + uniqueId + "@example.com");
            request.setStreet("123 Main St");
            request.setCity("New York");
            request.setState("NY");
            request.setZipCode("10001");
            request.setCountry("USA");
            
            mockMvc.perform(post("/api/v1/customers")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }
        
        // Get first page (size 2) - verify pagination structure
        String response = mockMvc.perform(get("/api/v1/customers?pageNumber=0&pageSize=2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customers").isArray())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        PagedCustomerListDto result = objectMapper.readValue(response, PagedCustomerListDto.class);
        Assertions.assertNotNull(result.getCustomers(), "Customers list should not be null");
        Assertions.assertTrue(result.getCustomers().size() <= 2, "Page should have at most 2 customers");
        Assertions.assertTrue(result.getTotalCount() >= 5, "Should have at least 5 customers total");
        Assertions.assertEquals(0, result.getPageNumber(), "Should be page 0");
        Assertions.assertEquals(2, result.getPageSize(), "Page size should be 2");
        Assertions.assertTrue(result.getTotalPages() > 0, "Should have at least 1 page");
        
        // Verify pagination metadata is correct
        if (result.getTotalCount() > 0) {
            int expectedPages = (int) Math.ceil((double) result.getTotalCount() / result.getPageSize());
            Assertions.assertEquals(expectedPages, result.getTotalPages(), "Total pages should match calculation");
        }
    }
    
    @Test
    void listCustomers_WithStatusFilter() throws Exception {
        // Create active customer with unique email
        String uniqueEmail = "statusfilter" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        CreateCustomerRequestDto activeRequest = new CreateCustomerRequestDto();
        activeRequest.setFirstName("Active");
        activeRequest.setLastName("Customer");
        activeRequest.setEmail(uniqueEmail);
        activeRequest.setStreet("123 Main St");
        activeRequest.setCity("New York");
        activeRequest.setState("NY");
        activeRequest.setZipCode("10001");
        activeRequest.setCountry("USA");
        
        String responseJson = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(activeRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        CustomerDetailDto created = objectMapper.readValue(responseJson, CustomerDetailDto.class);
        UUID customerId = created.getId();
        
        // Delete customer (soft delete - marks as DELETED)
        mockMvc.perform(delete("/api/v1/customers/" + customerId))
                .andExpect(status().isNoContent());
        
        // Filter by ACTIVE status - should not include the deleted customer
        String activeResponse = mockMvc.perform(get("/api/v1/customers?status=ACTIVE"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        PagedCustomerListDto activeList = objectMapper.readValue(activeResponse, PagedCustomerListDto.class);
        // Verify all returned customers are ACTIVE
        activeList.getCustomers().forEach(customer -> 
            Assertions.assertEquals("ACTIVE", customer.getStatus(), "All customers should be ACTIVE")
        );
        
        // Filter by DELETED status - should include the deleted customer
        String deletedResponse = mockMvc.perform(get("/api/v1/customers?status=DELETED"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        PagedCustomerListDto deletedList = objectMapper.readValue(deletedResponse, PagedCustomerListDto.class);
        // Verify the deleted customer is in the list
        boolean foundDeleted = deletedList.getCustomers().stream()
            .anyMatch(c -> c.getId().equals(customerId.toString()));
        Assertions.assertTrue(foundDeleted, "Deleted customer should be in DELETED status filter results");
    }
    
    @Test
    void listCustomers_WithSearch() throws Exception {
        // Create customers with different names and unique emails
        String uniqueId1 = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String uniqueEmail1 = "searchtest1" + uniqueId1 + "@example.com";
        CreateCustomerRequestDto request1 = new CreateCustomerRequestDto();
        request1.setFirstName("John");
        request1.setLastName("Doe");
        request1.setEmail(uniqueEmail1);
        request1.setStreet("123 Main St");
        request1.setCity("New York");
        request1.setState("NY");
        request1.setZipCode("10001");
        request1.setCountry("USA");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());
        
        String uniqueId2 = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String uniqueEmail2 = "jane.smith" + uniqueId2 + "@example.com";
        CreateCustomerRequestDto request2 = new CreateCustomerRequestDto();
        request2.setFirstName("Jane");
        request2.setLastName("Smith");
        request2.setEmail(uniqueEmail2);
        request2.setStreet("456 Oak Ave");
        request2.setCity("Los Angeles");
        request2.setState("CA");
        request2.setZipCode("90001");
        request2.setCountry("USA");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated());
        
        // Search by name
        String searchResponse = mockMvc.perform(get("/api/v1/customers?searchTerm=John"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        PagedCustomerListDto searchList = objectMapper.readValue(searchResponse, PagedCustomerListDto.class);
        boolean foundJohn = searchList.getCustomers().stream()
            .anyMatch(c -> c.getFullName().contains("John"));
        Assertions.assertTrue(foundJohn, "Should find John Doe in search results");
        
        // Search by email (searching for "jane.smith" should find the customer with email containing "jane.smith")
        String emailSearchResponse = mockMvc.perform(get("/api/v1/customers?searchTerm=jane.smith"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        PagedCustomerListDto emailSearchList = objectMapper.readValue(emailSearchResponse, PagedCustomerListDto.class);
        boolean foundJane = emailSearchList.getCustomers().stream()
            .anyMatch(c -> c.getEmail().contains("jane.smith") || c.getFullName().contains("Jane"));
        Assertions.assertTrue(foundJane, "Should find Jane Smith in email search results");
    }
    
    @Test
    void listCustomers_WithSorting() throws Exception {
        // Create customers with unique emails
        String uniqueEmail1 = "sorttest1" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        CreateCustomerRequestDto request1 = new CreateCustomerRequestDto();
        request1.setFirstName("Alice");
        request1.setLastName("Zebra");
        request1.setEmail(uniqueEmail1);
        request1.setStreet("123 Main St");
        request1.setCity("New York");
        request1.setState("NY");
        request1.setZipCode("10001");
        request1.setCountry("USA");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());
        
        String uniqueEmail2 = "sorttest2" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        CreateCustomerRequestDto request2 = new CreateCustomerRequestDto();
        request2.setFirstName("Bob");
        request2.setLastName("Apple");
        request2.setEmail(uniqueEmail2);
        request2.setStreet("456 Oak Ave");
        request2.setCity("Los Angeles");
        request2.setState("CA");
        request2.setZipCode("90001");
        request2.setCountry("USA");
        
        mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated());
        
        // Sort by name ASC
        String ascResponse = mockMvc.perform(get("/api/v1/customers?sortBy=name&sortDirection=ASC"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        PagedCustomerListDto ascList = objectMapper.readValue(ascResponse, PagedCustomerListDto.class);
        Assertions.assertTrue(ascList.getCustomers().size() >= 2, "Should have at least 2 customers");
        // Find our test customers in the sorted list
        boolean foundApple = ascList.getCustomers().stream()
            .anyMatch(c -> c.getFullName().contains("Apple"));
        boolean foundZebra = ascList.getCustomers().stream()
            .anyMatch(c -> c.getFullName().contains("Zebra"));
        Assertions.assertTrue(foundApple && foundZebra, "Should find both test customers");
        
        // Sort by name DESC
        String descResponse = mockMvc.perform(get("/api/v1/customers?sortBy=name&sortDirection=DESC"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        PagedCustomerListDto descList = objectMapper.readValue(descResponse, PagedCustomerListDto.class);
        Assertions.assertTrue(descList.getCustomers().size() >= 2, "Should have at least 2 customers");
        // Find our test customers in the sorted list
        boolean foundAppleDesc = descList.getCustomers().stream()
            .anyMatch(c -> c.getFullName().contains("Apple"));
        boolean foundZebraDesc = descList.getCustomers().stream()
            .anyMatch(c -> c.getFullName().contains("Zebra"));
        Assertions.assertTrue(foundAppleDesc && foundZebraDesc, "Should find both test customers");
    }
}

