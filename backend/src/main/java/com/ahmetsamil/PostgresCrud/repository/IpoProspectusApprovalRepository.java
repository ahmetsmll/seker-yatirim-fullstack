package com.ahmetsamil.PostgresCrud.repository;

import com.ahmetsamil.PostgresCrud.entity.IpoProspectusApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IpoProspectusApprovalRepository extends JpaRepository<IpoProspectusApproval, Long> {
    List<IpoProspectusApproval> findByCustomerId(Long customerId);
}