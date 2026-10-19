package com.ahmetsamil.PostgresCrud.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerLookupDto {
    private Long customerId;
    private String firstName;
    private String lastName;
    private String trIdentityNo;
}