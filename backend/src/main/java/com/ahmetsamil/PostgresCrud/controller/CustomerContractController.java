package com.ahmetsamil.PostgresCrud.controller;

import com.ahmetsamil.PostgresCrud.entity.CustomerContract;
import com.ahmetsamil.PostgresCrud.service.CustomerContractService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-contracts")
@Tag(name = "Customer Contract Controller", description = "Endpoints for managing customer contracts")
public class CustomerContractController {

    private final CustomerContractService contractService;

    public CustomerContractController(CustomerContractService contractService) {
        this.contractService = contractService;
    }

    @GetMapping
    public ResponseEntity<List<CustomerContract>> getAllContracts() {
        return ResponseEntity.ok(contractService.getAllContracts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerContract> getContractById(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.getContractById(id));
    }

    @GetMapping("/customer-ref/{customerRefId}")
    public ResponseEntity<List<CustomerContract>> getContractsByCustomerRefId(@PathVariable Long customerRefId) {
        return ResponseEntity.ok(contractService.getContractsByCustomerRefId(customerRefId));
    }

    @PostMapping
    public ResponseEntity<CustomerContract> createContract(@RequestBody CustomerContract contract) {
        return new ResponseEntity<>(contractService.createContract(contract), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerContract> updateContract(@PathVariable Long id, @RequestBody CustomerContract contract) {
        return ResponseEntity.ok(contractService.updateContract(id, contract));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable Long id) {
        contractService.deleteContract(id);
        return ResponseEntity.noContent().build();
    }
}