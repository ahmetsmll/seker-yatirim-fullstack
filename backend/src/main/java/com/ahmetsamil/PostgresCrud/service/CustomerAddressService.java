package com.ahmetsamil.PostgresCrud.service;

import com.ahmetsamil.PostgresCrud.entity.CustomerAddress;
import com.ahmetsamil.PostgresCrud.exception.ResourceNotFoundException;
import com.ahmetsamil.PostgresCrud.repository.CustomerAddressRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerAddressService {

    private final CustomerAddressRepository addressRepository;

    public CustomerAddressService(CustomerAddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<CustomerAddress> getAllAddresses() {
        return addressRepository.findAll();
    }

    public CustomerAddress getAddressById(Long id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
    }

    public List<CustomerAddress> getAddressesByCustomerId(Long customerId) {
        return addressRepository.findByCustomerId(customerId);
    }

    public CustomerAddress createAddress(CustomerAddress address) {
        address.setCreatedDate(LocalDateTime.now());
        return addressRepository.save(address);
    }

    public CustomerAddress updateAddress(Long id, CustomerAddress updatedAddress) {
        CustomerAddress existing = getAddressById(id);
        existing.setAddress(updatedAddress.getAddress());
        existing.setAddressKey(updatedAddress.getAddressKey());
        existing.setAddressType(updatedAddress.getAddressType());
        existing.setContactAddress(updatedAddress.getContactAddress());
        existing.setCustomerId(updatedAddress.getCustomerId());
        existing.setDomesticCityId(updatedAddress.getDomesticCityId());
        existing.setDomesticDistrictId(updatedAddress.getDomesticDistrictId());
        existing.setForeignCity(updatedAddress.getForeignCity());
        existing.setPhoneNumber(updatedAddress.getPhoneNumber());
        existing.setCustomerRefId(updatedAddress.getCustomerRefId());
        existing.setCountryId(updatedAddress.getCountryId());
        existing.setFaxNumber(updatedAddress.getFaxNumber());
        existing.setPostalCode(updatedAddress.getPostalCode());
        existing.setUpdatedDate(LocalDateTime.now());
        return addressRepository.save(existing);
    }

    public void deleteAddress(Long id) {
        CustomerAddress existing = getAddressById(id);
        addressRepository.delete(existing);
    }
}