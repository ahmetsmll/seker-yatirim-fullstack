package com.ahmetsamil.PostgresCrud.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "account")
@Data
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "account_id")
    private String accountId;

    @Column(name = "branch_id")
    private Integer branchId;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "default_account")
    private Boolean defaultAccount;

    @Column(name = "fullname")
    private String fullname;

    @Column(name = "customer_ref_id")
    private Long customerRefId;

    @Column(name = "account_verification_status")
    private String accountVerificationStatus;

    @Column(name = "custodian_message")
    private String custodianMessage;

    @Column(name = "is_owner_or_partner")
    private Boolean isOwnerOrPartner;
}