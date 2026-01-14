package com.aseo360.aseo360.service.implementation;

import com.aseo360.aseo360.model.Consumer;
import com.aseo360.aseo360.repository.IConsumerRepository;
import com.aseo360.aseo360.service.interfaces.IConsumerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConsumerService implements IConsumerService {
    private final IConsumerRepository consumerRepository;

    @Autowired
    public ConsumerService(IConsumerRepository consumerRepository){
        this.consumerRepository = consumerRepository;
    }

    @Override
    public List<Consumer> listConsumers() {
        return this.consumerRepository.findAll();
    }

    @Override
    public Consumer registerConsumer(Consumer consumer) {
        return this.consumerRepository.save(consumer);
    }

    @Override
    public Consumer findById(Long id) throws Exception {
        return this.consumerRepository.findById(id)
                .orElseThrow(()-> new Exception("No se encontro cliente con id: " + id));
    }
}
