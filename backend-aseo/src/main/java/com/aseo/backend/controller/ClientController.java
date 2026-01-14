package com.aseo.backend.controller;

import com.aseo.backend.model.Client;
import com.aseo.backend.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    @Autowired
    private ClientService clientService;

    /**
     * Obtener todos los clientes
     * GET /api/clients
     */
    @GetMapping
    public ResponseEntity<List<Client>> getAll() {
        return ResponseEntity.ok(clientService.findAll());
    }

    /**
     * Obtener cliente por ID
     * GET /api/clients/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Client> getById(@PathVariable Long id) {
        return clientService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Buscar cliente por número de documento
     * GET /api/clients/document/{docNumber}
     */
    @GetMapping("/document/{docNumber}")
    public ResponseEntity<Client> getByDocNumber(@PathVariable String docNumber) {
        return clientService.findByDocNumber(docNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Buscar clientes por nombre (búsqueda parcial)
     * GET /api/clients/search?name=juan
     */
    @GetMapping("/search")
    public ResponseEntity<List<Client>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(clientService.searchByName(name));
    }

    /**
     * Crear nuevo cliente
     * POST /api/clients
     */
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Client client) {
        try {
            // Verificar si ya existe un cliente con ese documento
            if (clientService.findByDocNumber(client.getDocNumber()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Ya existe un cliente con el documento " + client.getDocNumber()));
            }

            Client savedClient = clientService.save(client);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedClient);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error al crear cliente: " + e.getMessage()));
        }
    }

    /**
     * Actualizar cliente existente
     * PUT /api/clients/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Client client) {
        try {
            if (!clientService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }

            client.setId(id);
            Client updatedClient = clientService.save(client);
            return ResponseEntity.ok(updatedClient);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error al actualizar cliente: " + e.getMessage()));
        }
    }

    /**
     * Eliminar cliente (soft delete - marcar como inactivo)
     * DELETE /api/clients/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (!clientService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }

            clientService.deleteById(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Cliente eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error al eliminar cliente: " + e.getMessage()));
        }
    }

    /**
     * Obtener solo clientes activos
     * GET /api/clients/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<Client>> getActiveClients() {
        return ResponseEntity.ok(clientService.findActiveClients());
    }
}
