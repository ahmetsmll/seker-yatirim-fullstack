package com.ahmetsamil.PostgresCrud.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_address")
@Data
public class CustomerAddress extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "address")
    private String address;

    @Column(name = "address_key", nullable = false, unique = true)
    private String addressKey;

    @Column(name = "address_type", nullable = false)
    private String addressType; // HOME veya BUSINESS

    @Column(name = "contact_address", nullable = false)
    private Boolean contactAddress;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "domestic_city_id")
    private String domesticCityId;

    @Column(name = "domestic_district_id")
    private Integer domesticDistrictId;

    @Column(name = "foreign_city")
    private String foreignCity;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "customer_ref_id", nullable = false)
    private Long customerRefId;

    @Column(name = "country_id")
    private Integer countryId;

    @Column(name = "fax_number")
    private String faxNumber;

    @Column(name = "postal_code")
    private String postalCode;
}