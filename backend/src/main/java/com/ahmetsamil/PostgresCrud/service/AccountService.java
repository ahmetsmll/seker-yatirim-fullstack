package com.ahmetsamil.PostgresCrud.service;

import com.ahmetsamil.PostgresCrud.entity.Account;
import com.ahmetsamil.PostgresCrud.exception.ResourceNotFoundException;
import com.ahmetsamil.PostgresCrud.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
    }

    public List<Account> getAccountsByCustomerId(Long customerId) {
        return accountRepository.findByCustomerId(customerId);
    }

    public Account createAccount(Account account) {
        account.setCreatedDate(LocalDateTime.now());
        return accountRepository.save(account);
    }

    public Account updateAccount(Long id, Account updatedAccount) {
        Account existing = getAccountById(id);
        existing.setAccountId(updatedAccount.getAccountId());
        existing.setBranchId(updatedAccount.getBranchId());
        existing.setCustomerId(updatedAccount.getCustomerId());
        existing.setDefaultAccount(updatedAccount.getDefaultAccount());
        existing.setFullname(updatedAccount.getFullname());
        existing.setCustomerRefId(updatedAccount.getCustomerRefId());
        existing.setAccountVerificationStatus(updatedAccount.getAccountVerificationStatus());
        existing.setCustodianMessage(updatedAccount.getCustodianMessage());
        existing.setIsOwnerOrPartner(updatedAccount.getIsOwnerOrPartner());
        existing.setUpdatedDate(LocalDateTime.now());
        return accountRepository.save(existing);
    }

    public void deleteAccount(Long id) {
        Account existing = getAccountById(id);
        accountRepository.delete(existing);
    }

    @Transactional
    public void deleteMultipleAccounts(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            accountRepository.deleteAllByIdInBatch(ids);
        }
    }

}