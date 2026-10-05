package com.ahmetsamil.PostgresCrud.repository;

import com.ahmetsamil.PostgresCrud.entity.CustomerContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerContractRepository extends JpaRepository<CustomerContract, Long> {
    List<CustomerContract> findByCustomerRefId(Long customerRefId);
}