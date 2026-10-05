package com.ahmetsamil.PostgresCrud.repository;

import com.ahmetsamil.PostgresCrud.entity.BusinessHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Long> {
}