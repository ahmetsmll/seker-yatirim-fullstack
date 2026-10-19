package com.ahmetsamil.PostgresCrud.controller;

import com.ahmetsamil.PostgresCrud.entity.IpoProspectusApproval;
import com.ahmetsamil.PostgresCrud.service.IpoProspectusApprovalService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ipo-approvals")
@Tag(name = "IPO Prospectus Approval Controller", description = "Endpoints for managing IPO prospectus approvals")
public class IpoProspectusApprovalController {

    private final IpoProspectusApprovalService ipoApprovalService;

    public IpoProspectusApprovalController(IpoProspectusApprovalService ipoApprovalService) {
        this.ipoApprovalService = ipoApprovalService;
    }

    @GetMapping
    public ResponseEntity<List<IpoProspectusApproval>> getAllApprovals() {
        return ResponseEntity.ok(ipoApprovalService.getAllApprovals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IpoProspectusApproval> getApprovalById(@PathVariable Long id) {
        return ResponseEntity.ok(ipoApprovalService.getApprovalById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<IpoProspectusApproval>> getApprovalsByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(ipoApprovalService.getApprovalsByCustomerId(customerId));
    }

    @PostMapping
    public ResponseEntity<IpoProspectusApproval> createApproval(@RequestBody IpoProspectusApproval approval) {
        return new ResponseEntity<>(ipoApprovalService.createApproval(approval), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IpoProspectusApproval> updateApproval(@PathVariable Long id, @RequestBody IpoProspectusApproval approval) {
        return ResponseEntity.ok(ipoApprovalService.updateApproval(id, approval));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApproval(@PathVariable Long id) {
        ipoApprovalService.deleteApproval(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/batch-approve")
    public ResponseEntity<Void> approveMultipleIpoApprovals(@RequestBody List<Long> ids) {
        ipoApprovalService.approveMultipleIpoApprovals(ids);
        return ResponseEntity.ok().build();
    }
}