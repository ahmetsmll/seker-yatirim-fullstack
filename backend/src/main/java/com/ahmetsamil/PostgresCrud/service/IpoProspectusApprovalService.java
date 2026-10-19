package com.ahmetsamil.PostgresCrud.service;

import com.ahmetsamil.PostgresCrud.entity.IpoProspectusApproval;
import com.ahmetsamil.PostgresCrud.exception.ResourceNotFoundException;
import com.ahmetsamil.PostgresCrud.repository.IpoProspectusApprovalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IpoProspectusApprovalService {

    private final IpoProspectusApprovalRepository ipoApprovalRepository;

    public IpoProspectusApprovalService(IpoProspectusApprovalRepository ipoApprovalRepository) {
        this.ipoApprovalRepository = ipoApprovalRepository;
    }

    public List<IpoProspectusApproval> getAllApprovals() {
        return ipoApprovalRepository.findAll();
    }

    public IpoProspectusApproval getApprovalById(Long id) {
        return ipoApprovalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IPO Approval not found with id: " + id));
    }

    public List<IpoProspectusApproval> getApprovalsByCustomerId(Long customerId) {
        return ipoApprovalRepository.findByCustomerId(customerId);
    }

    public IpoProspectusApproval createApproval(IpoProspectusApproval approval) {
        approval.setCreatedDate(LocalDateTime.now());
        if (Boolean.TRUE.equals(approval.getApproved()) && approval.getApprovedAt() == null) {
            approval.setApprovedAt(LocalDateTime.now());
        }
        return ipoApprovalRepository.save(approval);
    }

    public IpoProspectusApproval updateApproval(Long id, IpoProspectusApproval updated) {
        IpoProspectusApproval existing = getApprovalById(id);
        existing.setApproved(updated.getApproved());
        existing.setApprovedAt(updated.getApprovedAt());
        existing.setClientIp(updated.getClientIp());
        existing.setCustomerId(updated.getCustomerId());
        existing.setDeviceId(updated.getDeviceId());
        existing.setIpoId(updated.getIpoId());
        existing.setUpdatedDate(LocalDateTime.now());
        return ipoApprovalRepository.save(existing);
    }

    public void deleteApproval(Long id) {
        IpoProspectusApproval existing = getApprovalById(id);
        ipoApprovalRepository.delete(existing);
    }

    @Transactional
    public void approveMultipleIpoApprovals(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            ipoApprovalRepository.approveMultipleProspectuses(ids);
        }
    }
}