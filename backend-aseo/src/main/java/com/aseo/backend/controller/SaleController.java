package com.aseo.backend.controller;

import com.aseo.backend.model.Sale;
import com.aseo.backend.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @GetMapping
    public List<Sale> getAll() {
        return saleService.findAll();
    }

    @PostMapping
    public Sale create(@RequestBody Sale sale) {
        return saleService.createSale(sale);
    }
}
