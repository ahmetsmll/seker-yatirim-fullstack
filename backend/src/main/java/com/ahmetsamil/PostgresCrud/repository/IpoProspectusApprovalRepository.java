package com.ahmetsamil.PostgresCrud.repository;

import com.ahmetsamil.PostgresCrud.entity.IpoProspectusApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface IpoProspectusApprovalRepository extends JpaRepository<IpoProspectusApproval, Long> {
    List<IpoProspectusApproval> findByCustomerId(Long customerId);

    @Modifying
    @Transactional
    @Query("UPDATE IpoProspectusApproval i SET i.approved = true WHERE i.id IN :ids")
    void approveMultipleProspectuses(@Param("ids") List<Long> ids);
}