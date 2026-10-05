package com.ahmetsamil.PostgresCrud.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_contract")
@Data
public class CustomerContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "approved_date")
    private LocalDate approvedDate;

    @Column(name = "contract_status")
    private Integer contractStatus;

    @Column(name = "contract_type_id", nullable = false)
    private Integer contractTypeId;

    @Column(name = "contract_version", nullable = false)
    private BigDecimal contractVersion;

    @Column(name = "customer_ref_id", nullable = false)
    private Long customerRefId;
}