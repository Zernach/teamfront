# Epic 8: Testing & Quality Assurance

**Source:** PRD-InvoiceMe-Detailed.md - Section 8  
**Date:** 2025-11-08

---

## 8. Testing Requirements

### 8.1 Backend Testing

#### 8.1.1 Unit Tests

**Coverage Requirements:**
- Domain logic: 100%
- Command handlers: 100%
- Query handlers: 90%
- Validators: 100%

**Example Test:**
```java
@Test
void shouldCreateCustomer_WhenValidDataProvided() {
    // Arrange
    CreateCustomerCommand command = new CreateCustomerCommand(
        "John", "Doe", "john@example.com", "+15551234567",
        new AddressDto("123 Main St", "Springfield", "IL", "62701", "USA"),
        "12-3456789"
    );

    when(customerRepository.findByEmail(anyString())).thenReturn(Optional.empty());

    // Act
    UUID customerId = handler.handle(command);

    // Assert
    assertNotNull(customerId);
    verify(customerRepository).save(any(Customer.class));
}
```

#### 8.1.2 Integration Tests

**Requirements:**
- Use Testcontainers for PostgreSQL
- Test complete request/response cycle
- Test database transactions
- Test error scenarios

**Example Test:**
```java
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class CustomerApiIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:14");

    @Autowired
    MockMvc mockMvc;

    @Test
    void shouldCreateAndRetrieveCustomer() throws Exception {
        // Create customer
        String createRequest = """
            {
                "firstName": "John",
                "lastName": "Doe",
                "email": "john@example.com",
                "billingAddress": {
                    "street": "123 Main St",
                    "city": "Springfield",
                    "state": "IL",
                    "zipCode": "62701",
                    "country": "USA"
                }
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/v1/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createRequest))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.fullName").value("John Doe"))
            .andReturn();

        String customerId = JsonPath.read(result.getResponse().getContentAsString(), "$.id");

        // Retrieve customer
        mockMvc.perform(get("/api/v1/customers/" + customerId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("john@example.com"));
    }
}
```

#### 8.1.3 End-to-End Business Flow Tests

**Required Test Scenarios:**
1. Complete customer payment flow:
   - Create customer
   - Create invoice with line items
   - Send invoice
   - Record partial payment
   - Record final payment
   - Verify invoice marked as PAID

2. Invoice cancellation flow
3. Payment void and correction flow
4. Overdue invoice identification

### 8.2 Frontend Testing

#### 8.2.1 Unit Tests (Components)

```typescript
// CustomerCard.test.tsx
describe('CustomerCard', () => {
    it('should render customer information correctly', () => {
        const customer = {
            id: '123',
            fullName: 'John Doe',
            email: 'john@example.com',
            outstandingBalance: 1250.00,
            activeInvoicesCount: 3,
        };

        const { getByText } = render(<CustomerCard customer={customer} />);

        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('john@example.com')).toBeTruthy();
        expect(getByText('$1,250.00')).toBeTruthy();
    });
});
```

#### 8.2.2 Integration Tests (ViewModels)

```typescript
// CreateCustomerViewModel.test.ts
describe('CreateCustomerViewModel', () => {
    it('should validate form and create customer', async () => {
        const mockApi = jest.fn().mockResolvedValue({ id: '123' });
        const viewModel = new CreateCustomerViewModel(mockApi);

        viewModel.setField('firstName', 'John');
        viewModel.setField('lastName', 'Doe');
        viewModel.setField('email', 'john@example.com');
        // ... set other fields

        expect(viewModel.validateForm()).toBe(true);

        await viewModel.save();

        expect(mockApi).toHaveBeenCalledWith(expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
        }));
    });
});
```

---

