package com.aseo.backend.service;

import com.aseo.backend.model.Product;
import com.aseo.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    public Optional<Product> findByCode(String code) {
        return productRepository.findByCode(code);
    }

    public List<Product> search(String term) {
        return productRepository.search(term);
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public void deleteById(Long id) {
        productRepository.deleteById(id);
    }

    public boolean existsByCode(String code) {
        return productRepository.existsByCode(code);
    }

    /**
     * Actualizar stock de manera segura
     */
    public void updateStock(Long id, int quantity) {
        productRepository.findById(id).ifPresent(product -> {
            int newStock = product.getStock() + quantity;
            if (newStock < 0) {
                throw new RuntimeException("Stock insuficiente");
            }
            product.setStock(newStock);
            productRepository.save(product);
        });
    }
}
