package com.invoiceme.features.customers.api;

import com.invoiceme.features.customers.commands.createcustomer.CreateCustomerCommand;
import com.invoiceme.features.customers.commands.createcustomer.CreateCustomerCommandHandler;
import com.invoiceme.features.customers.commands.deletecustomer.DeleteCustomerCommand;
import com.invoiceme.features.customers.commands.deletecustomer.DeleteCustomerCommandHandler;
import com.invoiceme.features.customers.commands.updatecustomer.UpdateCustomerCommand;
import com.invoiceme.features.customers.commands.updatecustomer.UpdateCustomerCommandHandler;
import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerStatus;
import com.invoiceme.features.customers.dto.AddressDto;
import com.invoiceme.features.customers.dto.CreateCustomerRequestDto;
import com.invoiceme.features.customers.dto.CustomerDetailDto;
import com.invoiceme.features.customers.dto.PagedCustomerListDto;
import com.invoiceme.features.customers.dto.UpdateCustomerRequestDto;
import com.invoiceme.features.customers.queries.getcustomerbyid.GetCustomerByIdQuery;
import com.invoiceme.features.customers.queries.getcustomerbyid.GetCustomerByIdQueryHandler;
import com.invoiceme.features.customers.queries.listcustomers.ListCustomersQuery;
import com.invoiceme.features.customers.queries.listcustomers.ListCustomersQueryHandler;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {
    private final CreateCustomerCommandHandler createCustomerCommandHandler;
    private final UpdateCustomerCommandHandler updateCustomerCommandHandler;
    private final DeleteCustomerCommandHandler deleteCustomerCommandHandler;
    private final GetCustomerByIdQueryHandler getCustomerByIdQueryHandler;
    private final ListCustomersQueryHandler listCustomersQueryHandler;
    
    public CustomerController(CreateCustomerCommandHandler createCustomerCommandHandler,
                             UpdateCustomerCommandHandler updateCustomerCommandHandler,
                             DeleteCustomerCommandHandler deleteCustomerCommandHandler,
                             GetCustomerByIdQueryHandler getCustomerByIdQueryHandler,
                             ListCustomersQueryHandler listCustomersQueryHandler) {
        this.createCustomerCommandHandler = createCustomerCommandHandler;
        this.updateCustomerCommandHandler = updateCustomerCommandHandler;
        this.deleteCustomerCommandHandler = deleteCustomerCommandHandler;
        this.getCustomerByIdQueryHandler = getCustomerByIdQueryHandler;
        this.listCustomersQueryHandler = listCustomersQueryHandler;
    }
    
    @GetMapping
    public ResponseEntity<PagedCustomerListDto> listCustomers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false, defaultValue = "name") String sortBy,
            @RequestParam(required = false, defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false, defaultValue = "0") int pageNumber,
            @RequestParam(required = false, defaultValue = "20") int pageSize) {
        
        CustomerStatus customerStatus = null;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            try {
                customerStatus = CustomerStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status, will be ignored
            }
        }
        
        ListCustomersQuery query = new ListCustomersQuery(
            customerStatus,
            searchTerm,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        );
        
        PagedCustomerListDto response = listCustomersQueryHandler.handle(query);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<CustomerDetailDto> createCustomer(@Valid @RequestBody CreateCustomerRequestDto request) {
        try {
            CreateCustomerCommand command = new CreateCustomerCommand(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhone(),
                request.getStreet(),
                request.getCity(),
                request.getState(),
                request.getZipCode(),
                request.getCountry(),
                "system" // TODO: Get from security context
            );
            
            Customer customer = createCustomerCommandHandler.handle(command);
            CustomerDetailDto response = mapToDto(customer);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (CreateCustomerCommandHandler.EmailAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CustomerDetailDto> updateCustomer(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCustomerRequestDto request) {
        try {
            UpdateCustomerCommand command = new UpdateCustomerCommand(
                id,
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhone(),
                request.getStreet(),
                request.getCity(),
                request.getState(),
                request.getZipCode(),
                request.getCountry(),
                "system" // TODO: Get from security context
            );
            
            Customer customer = updateCustomerCommandHandler.handle(command);
            CustomerDetailDto response = mapToDto(customer);
            
            return ResponseEntity.ok(response);
        } catch (UpdateCustomerCommandHandler.CustomerNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (UpdateCustomerCommandHandler.CannotUpdateDeletedCustomerException |
                 UpdateCustomerCommandHandler.EmailAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (UpdateCustomerCommandHandler.NoFieldsProvidedException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailDto> getCustomerById(@PathVariable UUID id) {
        try {
            GetCustomerByIdQuery query = new GetCustomerByIdQuery(id);
            CustomerDetailDto response = getCustomerByIdQueryHandler.handle(query);
            return ResponseEntity.ok(response);
        } catch (GetCustomerByIdQueryHandler.CustomerNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "false") boolean hardDelete) {
        try {
            DeleteCustomerCommand command = new DeleteCustomerCommand(
                id,
                hardDelete,
                "system" // TODO: Get from security context
            );
            
            deleteCustomerCommandHandler.handle(command);
            
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (DeleteCustomerCommandHandler.CustomerNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (DeleteCustomerCommandHandler.CannotDeleteCustomerWithActiveInvoicesException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (DeleteCustomerCommandHandler.HardDeleteNotSupportedException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    private CustomerDetailDto mapToDto(Customer customer) {
        CustomerDetailDto dto = new CustomerDetailDto();
        dto.setId(customer.getId());
        dto.setFirstName(customer.getName().getFirstName());
        dto.setLastName(customer.getName().getLastName());
        dto.setFullName(customer.getName().getFullName());
        dto.setEmail(customer.getEmail().getValue());
        dto.setPhone(customer.getPhone().isEmpty() ? null : customer.getPhone().getValue());
        
        AddressDto addressDto = new AddressDto();
        addressDto.setStreet(customer.getBillingAddress().getStreet());
        addressDto.setCity(customer.getBillingAddress().getCity());
        addressDto.setState(customer.getBillingAddress().getState());
        addressDto.setZipCode(customer.getBillingAddress().getZipCode());
        addressDto.setCountry(customer.getBillingAddress().getCountry());
        dto.setBillingAddress(addressDto);
        
        // Set flat address fields for frontend compatibility
        dto.setStreet(customer.getBillingAddress().getStreet());
        dto.setCity(customer.getBillingAddress().getCity());
        dto.setState(customer.getBillingAddress().getState());
        dto.setZipCode(customer.getBillingAddress().getZipCode());
        dto.setCountry(customer.getBillingAddress().getCountry());
        
        dto.setStatus(customer.getStatus().name());
        dto.setCreatedAt(customer.getAuditInfo().getCreatedAt());
        dto.setLastModifiedAt(customer.getAuditInfo().getLastModifiedAt());
        
        return dto;
    }
}

