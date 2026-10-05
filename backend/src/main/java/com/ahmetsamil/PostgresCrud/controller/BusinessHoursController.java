package com.ahmetsamil.PostgresCrud.controller;

import com.ahmetsamil.PostgresCrud.entity.BusinessHours;
import com.ahmetsamil.PostgresCrud.service.BusinessHoursService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/business-hours")
@Tag(name = "Business Hours", description = "Endpoints for managing business hours")
public class BusinessHoursController {

    private final BusinessHoursService businessHoursService;

    public BusinessHoursController(BusinessHoursService businessHoursService) {
        this.businessHoursService = businessHoursService;
    }

    @GetMapping
    public ResponseEntity<List<BusinessHours>> getAllBusinessHours() {
        return ResponseEntity.ok(businessHoursService.getAllBusinessHours());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessHours> getBusinessHoursById(@PathVariable Long id) {
        return ResponseEntity.ok(businessHoursService.getBusinessHoursById(id));
    }

    @PostMapping
    public ResponseEntity<BusinessHours> createBusinessHours(@RequestBody BusinessHours businessHours) {
        return new ResponseEntity<>(businessHoursService.createBusinessHours(businessHours), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusinessHours> updateBusinessHours(@PathVariable Long id, @RequestBody BusinessHours businessHours) {
        return ResponseEntity.ok(businessHoursService.updateBusinessHours(id, businessHours));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBusinessHours(@PathVariable Long id) {
        businessHoursService.deleteBusinessHours(id);
        return ResponseEntity.noContent().build();
    }
}