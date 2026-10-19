package com.ahmetsamil.PostgresCrud.repository;

import com.ahmetsamil.PostgresCrud.dto.CustomerLookupDto;
import com.ahmetsamil.PostgresCrud.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCustomerId(Long customerId);
    boolean existsByTrIdentityNo(Long customerId);

    @Query("SELECT new com.ahmetsamil.PostgresCrud.dto.CustomerLookupDto(c.customerId, c.firstName, c.lastName, c.trIdentityNo) FROM Customer c")
    List<CustomerLookupDto> findAllCustomerLookup();
}
