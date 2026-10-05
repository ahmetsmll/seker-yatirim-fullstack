package com.ahmetsamil.PostgresCrud.repository;

import com.ahmetsamil.PostgresCrud.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
    Optional<CustomerAddress> findByAddressKey(String addressKey);
    List<CustomerAddress> findByCustomerId(Long customerId);
    List<CustomerAddress> findByCustomerRefId(Long customerRefId);
}