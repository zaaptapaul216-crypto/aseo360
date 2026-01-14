package com.aseo.backend.service;

import com.aseo.backend.model.Client;
import com.aseo.backend.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    /**
     * Obtener todos los clientes
     */
    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    /**
     * Buscar cliente por ID
     */
    public Optional<Client> findById(Long id) {
        return clientRepository.findById(id);
    }

    /**
     * Buscar cliente por número de documento
     */
    public Optional<Client> findByDocNumber(String docNumber) {
        return clientRepository.findByDocNumber(docNumber);
    }

    /**
     * Buscar clientes por nombre
     */
    public List<Client> searchByName(String name) {
        return clientRepository.searchByName(name);
    }

    /**
     * Obtener solo clientes activos
     */
    public List<Client> findActiveClients() {
        return clientRepository.findByActiveTrue();
    }

    /**
     * Buscar por tipo de documento
     */
    public List<Client> findByType(String type) {
        return clientRepository.findByType(type);
    }

    /**
     * Guardar o actualizar cliente
     */
    public Client save(Client client) {
        return clientRepository.save(client);
    }

    /**
     * Eliminar cliente por ID
     */
    public void deleteById(Long id) {
        clientRepository.deleteById(id);
    }

    /**
     * Verificar si existe un cliente con ese documento
     */
    public boolean existsByDocNumber(String docNumber) {
        return clientRepository.existsByDocNumber(docNumber);
    }
}
