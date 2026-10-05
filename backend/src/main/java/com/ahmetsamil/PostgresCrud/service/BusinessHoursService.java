package com.ahmetsamil.PostgresCrud.service;

import com.ahmetsamil.PostgresCrud.entity.BusinessHours;
import com.ahmetsamil.PostgresCrud.exception.ResourceNotFoundException;
import com.ahmetsamil.PostgresCrud.repository.BusinessHoursRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BusinessHoursService {

    private final BusinessHoursRepository businessHoursRepository;

    public BusinessHoursService(BusinessHoursRepository businessHoursRepository) {
        this.businessHoursRepository = businessHoursRepository;
    }

    public List<BusinessHours> getAllBusinessHours() {
        return businessHoursRepository.findAll();
    }

    public BusinessHours getBusinessHoursById(Long id) {
        return businessHoursRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business hours not found with id: " + id));
    }

    public BusinessHours createBusinessHours(BusinessHours businessHours) {
        businessHours.setCreatedDate(LocalDateTime.now());
        return businessHoursRepository.save(businessHours);
    }

    public BusinessHours updateBusinessHours(Long id, BusinessHours updated) {
        BusinessHours existing = getBusinessHoursById(id);
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setLunchBreakEnabled(updated.getLunchBreakEnabled());
        existing.setLunchStartTime(updated.getLunchStartTime());
        existing.setLunchEndTime(updated.getLunchEndTime());
        existing.setUpdatedDate(LocalDateTime.now());
        return businessHoursRepository.save(existing);
    }

    public void deleteBusinessHours(Long id) {
        BusinessHours existing = getBusinessHoursById(id);
        businessHoursRepository.delete(existing);
    }
}