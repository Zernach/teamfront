package com.invoiceme.features.invoices.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoiceme.features.customers.api.CustomerController;
import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerRepository;
import com.invoiceme.features.customers.domain.CustomerStatus;
import com.invoiceme.features.customers.dto.CreateCustomerRequestDto;
import com.invoiceme.features.customers.infrastructure.CustomerEntity;
import com.invoiceme.features.customers.infrastructure.CustomerJpaRepository;
import com.invoiceme.features.invoices.domain.InvoiceStatus;
import com.invoiceme.features.invoices.infrastructure.InvoiceEntity;
import com.invoiceme.features.invoices.infrastructure.InvoiceJpaRepository;
import com.invoiceme.features.invoices.dto.CreateInvoiceRequestDto;
import com.invoiceme.features.invoices.dto.InvoiceDetailDto;
import com.invoiceme.features.invoices.dto.UpdateInvoiceRequestDto;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.invoiceme.config.TestSecurityConfig;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
@Transactional
class InvoiceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerJpaRepository customerJpaRepository;

    @Autowired
    private InvoiceJpaRepository invoiceJpaRepository;

    private UUID createTestCustomer() throws Exception {
        CreateCustomerRequestDto customerRequest = new CreateCustomerRequestDto();
        String uniqueId = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        customerRequest.setFirstName("Test");
        customerRequest.setLastName("Customer");
        customerRequest.setEmail("testcustomer" + uniqueId + "@example.com");
        customerRequest.setStreet("123 Main St");
        customerRequest.setCity("New York");
        customerRequest.setState("NY");
        customerRequest.setZipCode("10001");
        customerRequest.setCountry("USA");

        String response = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customerRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract customer ID from response
        return UUID.fromString(objectMapper.readTree(response).get("id").asText());
    }

    @Test
    void createInvoice_Success() throws Exception {
        UUID customerId = createTestCustomer();

        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(30));

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("2.0"));
        lineItem1.setUnitPrice(new BigDecimal("100.00"));
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);
        request.setTaxAmount(new BigDecimal("20.00"));
        request.setNotes("Test invoice");

        mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.customerId").value(customerId.toString()))
                .andExpect(jsonPath("$.invoiceNumber").isEmpty())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.subtotal").value(200.00))
                .andExpect(jsonPath("$.taxAmount").value(20.00))
                .andExpect(jsonPath("$.totalAmount").value(220.00))
                .andExpect(jsonPath("$.paidAmount").value(0.00))
                .andExpect(jsonPath("$.balance").value(220.00))
                .andExpect(jsonPath("$.lineItems").isArray())
                .andExpect(jsonPath("$.lineItems[0].description").value("Product A"))
                .andExpect(jsonPath("$.lineItems[0].quantity").value(2.0))
                .andExpect(jsonPath("$.lineItems[0].unitPrice").value(100.00))
                .andExpect(jsonPath("$.lineItems[0].lineTotal").value(200.00));
    }

    @Test
    void createInvoice_WithMultipleLineItems() throws Exception {
        UUID customerId = createTestCustomer();

        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(30));

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("2.0"));
        lineItem1.setUnitPrice(new BigDecimal("100.00"));
        lineItems.add(lineItem1);

        CreateInvoiceRequestDto.LineItemDto lineItem2 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem2.setDescription("Product B");
        lineItem2.setQuantity(new BigDecimal("3.0"));
        lineItem2.setUnitPrice(new BigDecimal("50.00"));
        lineItems.add(lineItem2);

        request.setLineItems(lineItems);
        request.setTaxAmount(new BigDecimal("25.00"));

        String response = mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        InvoiceDetailDto invoice = objectMapper.readValue(response, InvoiceDetailDto.class);
        Assertions.assertEquals(new BigDecimal("350.00"), invoice.getSubtotal()); // 200 + 150
        Assertions.assertEquals(new BigDecimal("25.00"), invoice.getTaxAmount());
        Assertions.assertEquals(new BigDecimal("375.00"), invoice.getTotalAmount()); // 350 + 25
        Assertions.assertEquals(2, invoice.getLineItems().size());
    }

    @Test
    void createInvoice_WithoutTaxAmount() throws Exception {
        UUID customerId = createTestCustomer();

        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(30));

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("1.0"));
        lineItem1.setUnitPrice(new BigDecimal("100.00"));
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);
        // taxAmount is null

        mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.taxAmount").value(0.00))
                .andExpect(jsonPath("$.totalAmount").value(100.00));
    }

    @Test
    void createInvoice_CustomerNotFound() throws Exception {
        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(UUID.randomUUID()); // Non-existent customer
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(30));

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("1.0"));
        lineItem1.setUnitPrice(new BigDecimal("100.00"));
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);

        mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void createInvoice_NoLineItems() throws Exception {
        UUID customerId = createTestCustomer();

        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(30));
        request.setLineItems(new ArrayList<>()); // Empty list

        mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createInvoice_InvalidInvoiceDate() throws Exception {
        UUID customerId = createTestCustomer();

        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now().plusDays(1)); // Future date
        request.setDueDate(LocalDate.now().plusDays(30));

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("1.0"));
        lineItem1.setUnitPrice(new BigDecimal("100.00"));
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);

        mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createInvoice_InvalidDueDate() throws Exception {
        UUID customerId = createTestCustomer();

        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().minusDays(1)); // Before invoice date

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("1.0"));
        lineItem1.setUnitPrice(new BigDecimal("100.00"));
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);

        mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createInvoice_InvalidLineItemQuantity() throws Exception {
        UUID customerId = createTestCustomer();

        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(30));

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("0")); // Invalid: must be > 0
        lineItem1.setUnitPrice(new BigDecimal("100.00"));
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);

        mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createInvoice_InvalidLineItemUnitPrice() throws Exception {
        UUID customerId = createTestCustomer();

        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(30));

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("1.0"));
        lineItem1.setUnitPrice(new BigDecimal("-10.00")); // Invalid: must be >= 0
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);

        mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createInvoice_NegativeTaxAmount() throws Exception {
        UUID customerId = createTestCustomer();

        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(30));

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("1.0"));
        lineItem1.setUnitPrice(new BigDecimal("100.00"));
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);
        request.setTaxAmount(new BigDecimal("-10.00")); // Invalid: must be >= 0

        mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createInvoice_InactiveCustomer() throws Exception {
        UUID customerId = createTestCustomer();

        // Set customer to INACTIVE status directly via JPA entity
        CustomerEntity customerEntity = customerJpaRepository.findById(customerId).orElseThrow();
        customerEntity.setStatus(CustomerStatus.INACTIVE);
        customerJpaRepository.save(customerEntity);

        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(30));

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("1.0"));
        lineItem1.setUnitPrice(new BigDecimal("100.00"));
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);

        mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    private UUID createTestInvoice(UUID customerId) throws Exception {
        CreateInvoiceRequestDto request = new CreateInvoiceRequestDto();
        request.setCustomerId(customerId);
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(30));

        List<CreateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        CreateInvoiceRequestDto.LineItemDto lineItem1 = new CreateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product A");
        lineItem1.setQuantity(new BigDecimal("1.0"));
        lineItem1.setUnitPrice(new BigDecimal("100.00"));
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);
        request.setTaxAmount(new BigDecimal("10.00"));

        String response = mockMvc.perform(post("/api/v1/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return UUID.fromString(objectMapper.readTree(response).get("id").asText());
    }

    @Test
    void updateInvoice_Success() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        request.setInvoiceDate(LocalDate.now().minusDays(1));
        request.setDueDate(LocalDate.now().plusDays(20));
        request.setTaxAmount(new BigDecimal("15.00"));
        request.setNotes("Updated invoice");

        List<UpdateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        UpdateInvoiceRequestDto.LineItemDto lineItem1 = new UpdateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product B");
        lineItem1.setQuantity(new BigDecimal("2.0"));
        lineItem1.setUnitPrice(new BigDecimal("50.00"));
        lineItems.add(lineItem1);

        request.setLineItems(lineItems);

        mockMvc.perform(put("/api/v1/invoices/" + invoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(invoiceId.toString()))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.subtotal").value(100.00)) // 2.0 * 50.00
                .andExpect(jsonPath("$.taxAmount").value(15.00))
                .andExpect(jsonPath("$.totalAmount").value(115.00)) // 100.00 + 15.00
                .andExpect(jsonPath("$.balance").value(115.00))
                .andExpect(jsonPath("$.notes").value("Updated invoice"))
                .andExpect(jsonPath("$.lineItems[0].description").value("Product B"));
    }

    @Test
    void updateInvoice_PartialUpdate() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        // Update only notes
        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        request.setNotes("Updated notes only");

        mockMvc.perform(put("/api/v1/invoices/" + invoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value("Updated notes only"))
                .andExpect(jsonPath("$.subtotal").value(100.00)) // Original values preserved
                .andExpect(jsonPath("$.taxAmount").value(10.00));
    }

    @Test
    void updateInvoice_UpdateLineItems() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        List<UpdateInvoiceRequestDto.LineItemDto> lineItems = new ArrayList<>();
        UpdateInvoiceRequestDto.LineItemDto lineItem1 = new UpdateInvoiceRequestDto.LineItemDto();
        lineItem1.setDescription("Product C");
        lineItem1.setQuantity(new BigDecimal("3.0"));
        lineItem1.setUnitPrice(new BigDecimal("25.00"));
        lineItems.add(lineItem1);

        UpdateInvoiceRequestDto.LineItemDto lineItem2 = new UpdateInvoiceRequestDto.LineItemDto();
        lineItem2.setDescription("Product D");
        lineItem2.setQuantity(new BigDecimal("1.0"));
        lineItem2.setUnitPrice(new BigDecimal("75.00"));
        lineItems.add(lineItem2);

        request.setLineItems(lineItems);

        String response = mockMvc.perform(put("/api/v1/invoices/" + invoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        InvoiceDetailDto invoice = objectMapper.readValue(response, InvoiceDetailDto.class);
        Assertions.assertEquals(new BigDecimal("150.00"), invoice.getSubtotal()); // 75.00 + 75.00
        Assertions.assertEquals(2, invoice.getLineItems().size());
    }

    @Test
    void updateInvoice_NotFound() throws Exception {
        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        request.setNotes("Test");

        mockMvc.perform(put("/api/v1/invoices/" + UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateInvoice_InvalidInvoiceDate() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        request.setInvoiceDate(LocalDate.now().plusDays(1)); // Future date

        mockMvc.perform(put("/api/v1/invoices/" + invoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateInvoice_InvalidDueDate() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        request.setInvoiceDate(LocalDate.now());
        request.setDueDate(LocalDate.now().minusDays(1)); // Before invoice date

        mockMvc.perform(put("/api/v1/invoices/" + invoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateInvoice_EmptyLineItems() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        request.setLineItems(new ArrayList<>()); // Empty list

        mockMvc.perform(put("/api/v1/invoices/" + invoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateInvoice_NegativeTaxAmount() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        request.setTaxAmount(new BigDecimal("-10.00"));

        mockMvc.perform(put("/api/v1/invoices/" + invoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateInvoice_NotDraftStatus() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        // Set invoice to SENT status directly via JPA entity
        InvoiceEntity invoiceEntity = invoiceJpaRepository.findById(invoiceId).orElseThrow();
        invoiceEntity.setStatus(InvoiceStatus.SENT);
        invoiceJpaRepository.save(invoiceEntity);

        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        request.setNotes("Try to update SENT invoice");

        mockMvc.perform(put("/api/v1/invoices/" + invoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void updateInvoice_PaidStatus() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        // Set invoice to PAID status directly via JPA entity
        InvoiceEntity invoiceEntity = invoiceJpaRepository.findById(invoiceId).orElseThrow();
        invoiceEntity.setStatus(InvoiceStatus.PAID);
        invoiceJpaRepository.save(invoiceEntity);

        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        request.setNotes("Try to update PAID invoice");

        mockMvc.perform(put("/api/v1/invoices/" + invoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void updateInvoice_CancelledStatus() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        // Set invoice to CANCELLED status directly via JPA entity
        InvoiceEntity invoiceEntity = invoiceJpaRepository.findById(invoiceId).orElseThrow();
        invoiceEntity.setStatus(InvoiceStatus.CANCELLED);
        invoiceJpaRepository.save(invoiceEntity);

        UpdateInvoiceRequestDto request = new UpdateInvoiceRequestDto();
        request.setNotes("Try to update CANCELLED invoice");

        mockMvc.perform(put("/api/v1/invoices/" + invoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void markInvoiceAsSent_Success() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        mockMvc.perform(post("/api/v1/invoices/" + invoiceId + "/mark-as-sent")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(invoiceId.toString()))
                .andExpect(jsonPath("$.status").value("SENT"))
                .andExpect(jsonPath("$.invoiceNumber").exists())
                .andExpect(jsonPath("$.invoiceNumber").value(org.hamcrest.Matchers.startsWith("INV-")));
    }

    @Test
    void markInvoiceAsSent_WithSentDate() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        String requestBody = "{\"sentDate\":\"2025-11-08\"}";

        mockMvc.perform(post("/api/v1/invoices/" + invoiceId + "/mark-as-sent")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SENT"))
                .andExpect(jsonPath("$.invoiceNumber").exists());
    }

    @Test
    void markInvoiceAsSent_NotFound() throws Exception {
        mockMvc.perform(post("/api/v1/invoices/" + UUID.randomUUID() + "/mark-as-sent")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void markInvoiceAsSent_NotDraftStatus() throws Exception {
        UUID customerId = createTestCustomer();
        UUID invoiceId = createTestInvoice(customerId);

        // Mark invoice as sent first
        mockMvc.perform(post("/api/v1/invoices/" + invoiceId + "/mark-as-sent")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());

        // Try to mark as sent again
        mockMvc.perform(post("/api/v1/invoices/" + invoiceId + "/mark-as-sent")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isConflict());
    }

    @Test
    void markInvoiceAsSent_InvoiceNumberUniqueness() throws Exception {
        UUID customerId1 = createTestCustomer();
        UUID invoiceId1 = createTestInvoice(customerId1);
        UUID customerId2 = createTestCustomer();
        UUID invoiceId2 = createTestInvoice(customerId2);

        // Mark first invoice as sent
        String response1 = mockMvc.perform(post("/api/v1/invoices/" + invoiceId1 + "/mark-as-sent")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String invoiceNumber1 = objectMapper.readTree(response1).get("invoiceNumber").asText();

        // Mark second invoice as sent
        String response2 = mockMvc.perform(post("/api/v1/invoices/" + invoiceId2 + "/mark-as-sent")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String invoiceNumber2 = objectMapper.readTree(response2).get("invoiceNumber").asText();

        // Verify invoice numbers are different
        Assertions.assertNotEquals(invoiceNumber1, invoiceNumber2, "Invoice numbers should be unique");
    }
}

