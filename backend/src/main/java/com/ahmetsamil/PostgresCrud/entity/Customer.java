package com.ahmetsamil.PostgresCrud.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer")
@Data
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "customer_id", nullable = false, unique = true)
    private Long customerId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "email_address")
    private String emailAddress;

    @Column(name = "cell_phone_number")
    private String cellPhoneNumber;

    @Column(name = "tr_identity_no")
    private String trIdentityNo;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "birth_place")
    private String birthPlace;

    @Column(name = "gender")
    private String gender;

    @Column(name = "customer_type")
    private String customerType;

    @Column(name = "customer_class")
    private String customerClass;

    @Column(name = "last_sync_status")
    private String lastSyncStatus;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;
}