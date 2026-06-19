package com.aseo360.aseo360.repositorio;

import com.aseo360.aseo360.modelo.GuiaRemision;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IGuiaRemisionRepositorio extends JpaRepository<GuiaRemision, Long> {
    Page<GuiaRemision> findAllByOrderByFechaEmisionDesc(Pageable pageable);

    // Obtener la última guía generada por serie excluyendo los RECHAZADOS (que pueden ser reutilizados).
    Optional<GuiaRemision> findTopBySerieAndEstadoSunatNotOrderByNumeroDesc(String serie, String estadoSunat);
}
