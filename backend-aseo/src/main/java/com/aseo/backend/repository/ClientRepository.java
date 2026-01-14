package com.aseo.backend.repository;

import com.aseo.backend.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    /**
     * Buscar cliente por número de documento
     */
    Optional<Client> findByDocNumber(String docNumber);

    /**
     * Buscar clientes por nombre (búsqueda parcial, case-insensitive)
     */
    @Query("SELECT c FROM Client c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Client> searchByName(@Param("name") String name);

    /**
     * Buscar clientes activos
     */
    List<Client> findByActiveTrue();

    /**
     * Buscar por tipo de documento
     */
    List<Client> findByType(String type);

    /**
     * Verificar si existe un cliente con ese documento
     */
    boolean existsByDocNumber(String docNumber);
}
