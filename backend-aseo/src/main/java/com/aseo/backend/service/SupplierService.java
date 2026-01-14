package com.aseo.backend.service;

import com.aseo.backend.model.Supplier;
import com.aseo.backend.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public List<Supplier> findAll() {
        return supplierRepository.findAll();
    }

    public List<Supplier> findActive() {
        return supplierRepository.findByActiveTrue();
    }

    public Optional<Supplier> findById(Long id) {
        return supplierRepository.findById(id);
    }

    public Optional<Supplier> findByRuc(String ruc) {
        return supplierRepository.findByRuc(ruc);
    }

    public Supplier save(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public void deleteById(Long id) {
        supplierRepository.deleteById(id);
    }

    public boolean existsByRuc(String ruc) {
        return supplierRepository.existsByRuc(ruc);
    }
}
