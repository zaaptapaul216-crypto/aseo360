package com.aseo360.aseo360.service.interfaces;

import com.aseo360.aseo360.model.Consumer;

import java.util.List;

public interface IConsumerService {
    public List<Consumer> listConsumers();
    public Consumer registerConsumer(Consumer consumer);
    public Consumer findById(Long id) throws Exception;
}
