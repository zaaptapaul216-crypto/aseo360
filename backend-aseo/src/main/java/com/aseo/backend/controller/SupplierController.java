package com.aseo.backend.controller;

import com.aseo.backend.model.Supplier;
import com.aseo.backend.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    public ResponseEntity<List<Supplier>> getAll() {
        return ResponseEntity.ok(supplierService.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Supplier>> getActive() {
        return ResponseEntity.ok(supplierService.findActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getById(@PathVariable Long id) {
        return supplierService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Supplier supplier) {
        if (supplierService.existsByRuc(supplier.getRuc())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Ya existe un proveedor con el RUC " + supplier.getRuc()));
        }
        return ResponseEntity.ok(supplierService.save(supplier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Supplier supplier) {
        if (!supplierService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        supplier.setId(id);
        return ResponseEntity.ok(supplierService.save(supplier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!supplierService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        supplierService.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Proveedor eliminado"));
    }
}
