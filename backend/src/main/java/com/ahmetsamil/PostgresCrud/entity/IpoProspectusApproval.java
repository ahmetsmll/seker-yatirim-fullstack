package com.ahmetsamil.PostgresCrud.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ipo_prospectus_approval")
@Data
public class IpoProspectusApproval extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "approved", nullable = false)
    private Boolean approved;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "client_ip")
    private String clientIp;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "device_id")
    private String deviceId;

    @Column(name = "ipo_id", nullable = false)
    private Long ipoId;
}