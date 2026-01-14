package com.aseo360.aseo360.controller;

import com.aseo360.aseo360.service.interfaces.IConsumerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/Admin")
public class ConsumerController {
    private final IConsumerService consumerService;
    public ConsumerController(IConsumerService consumerService){
        this.consumerService = consumerService;
    }

    @GetMapping
    public ResponseEntity<?> listConsumers(){
        return ResponseEntity.ok(this.consumerService.listConsumers());
    }
}
