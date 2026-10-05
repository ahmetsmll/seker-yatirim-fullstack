package com.ahmetsamil.PostgresCrud.service;

import com.ahmetsamil.PostgresCrud.entity.Customer;
import com.ahmetsamil.PostgresCrud.exception.ResourceNotFoundException;
import com.ahmetsamil.PostgresCrud.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long customerId) {
        return customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
    }

    public Customer createCustomer(Customer customer) {
        customer.setCreatedDate(LocalDateTime.now());
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id , Customer updatedCustomer) {
        Customer existingCustomer = getCustomerById(id);

        existingCustomer.setFirstName(updatedCustomer.getFirstName());
        existingCustomer.setLastName(updatedCustomer.getLastName());
        existingCustomer.setEmailAddress(updatedCustomer.getEmailAddress());
        existingCustomer.setCellPhoneNumber(updatedCustomer.getCellPhoneNumber());
        existingCustomer.setUpdatedDate(LocalDateTime.now());

        return customerRepository.save(existingCustomer);
    }

    public void deleteCustomer(Long id) {
        Customer existingCustomer = getCustomerById(id);
        customerRepository.delete(existingCustomer);
    }
}
