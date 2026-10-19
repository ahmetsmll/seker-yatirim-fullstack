package com.ahmetsamil.PostgresCrud.controller;

import com.ahmetsamil.PostgresCrud.dto.CustomerLookupDto;
import com.ahmetsamil.PostgresCrud.entity.Customer;
import com.ahmetsamil.PostgresCrud.service.CustomerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customer Controller", description = "API for managing customers")
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @GetMapping("/lookup")
    public ResponseEntity<List<CustomerLookupDto>> getCustomerLookup() {
        // Sadece ID, Ad, Soyad ve TCKN dönen optimize servis çağrısı
        return ResponseEntity.ok(customerService.getCustomerLookupList());
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.createCustomer(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        return ResponseEntity.ok(customerService.updateCustomer(id, customerDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Void> deleteMultipleCustomers(@RequestBody List<Long> ids) {
        customerService.deleteMultipleCustomers(ids);
        return ResponseEntity.noContent().build();
    }
}
