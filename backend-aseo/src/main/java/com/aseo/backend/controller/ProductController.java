package com.aseo.backend.controller;

import com.aseo.backend.model.Product;
import com.aseo.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAll() {
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> search(@RequestParam String term) {
        return ResponseEntity.ok(productService.search(term));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Product product) {
        if (productService.existsByCode(product.getCode())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Ya existe un producto con el código " + product.getCode()));
        }
        return ResponseEntity.ok(productService.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Product product) {
        if (!productService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        product.setId(id);
        return ResponseEntity.ok(productService.save(product));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        try {
            if (!payload.containsKey("quantity")) {
                return ResponseEntity.badRequest().body("Se requiere campo 'quantity'");
            }
            productService.updateStock(id, payload.get("quantity"));
            return ResponseEntity.ok(Map.of("success", true, "message", "Stock actualizado"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!productService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        productService.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Producto eliminado"));
    }
}
