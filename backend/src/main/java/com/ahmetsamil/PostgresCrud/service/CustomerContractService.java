package com.ahmetsamil.PostgresCrud.service;

import com.ahmetsamil.PostgresCrud.entity.CustomerContract;
import com.ahmetsamil.PostgresCrud.exception.ResourceNotFoundException;
import com.ahmetsamil.PostgresCrud.repository.CustomerContractRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerContractService {

    private final CustomerContractRepository contractRepository;

    public CustomerContractService(CustomerContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    public List<CustomerContract> getAllContracts() {
        return contractRepository.findAll();
    }

    public CustomerContract getContractById(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + id));
    }

    public List<CustomerContract> getContractsByCustomerRefId(Long customerRefId) {
        return contractRepository.findByCustomerRefId(customerRefId);
    }

    public CustomerContract createContract(CustomerContract contract) {
        contract.setCreatedDate(LocalDateTime.now());
        return contractRepository.save(contract);
    }

    public CustomerContract updateContract(Long id, CustomerContract updatedContract) {
        CustomerContract existing = getContractById(id);
        existing.setApprovedDate(updatedContract.getApprovedDate());
        existing.setContractStatus(updatedContract.getContractStatus());
        existing.setContractTypeId(updatedContract.getContractTypeId());
        existing.setContractVersion(updatedContract.getContractVersion());
        existing.setCustomerRefId(updatedContract.getCustomerRefId());
        existing.setUpdatedDate(LocalDateTime.now());
        return contractRepository.save(existing);
    }

    public void deleteContract(Long id) {
        CustomerContract existing = getContractById(id);
        contractRepository.delete(existing);
    }
}