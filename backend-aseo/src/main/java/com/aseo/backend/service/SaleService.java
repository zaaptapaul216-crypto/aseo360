package com.aseo.backend.service;

import com.aseo.backend.model.Product;
import com.aseo.backend.model.Sale;
import com.aseo.backend.model.SaleDetail;
import com.aseo.backend.repository.ProductRepository;
import com.aseo.backend.repository.SaleRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Sale> findAll() {
        return saleRepository.findAll();
    }

    @Transactional
    public Sale createSale(Sale sale) {
        // Link details to sale and update stock
        if (sale.getItems() != null) {
            for (SaleDetail detail : sale.getItems()) {
                detail.setSale(sale);
                
                Product product = productRepository.findById(detail.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + detail.getProduct().getId()));

                if (product.getStock() < detail.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }

                product.setStock(product.getStock() - detail.getQuantity());
                productRepository.save(product);
            }
        }
        return saleRepository.save(sale);
    }
}
