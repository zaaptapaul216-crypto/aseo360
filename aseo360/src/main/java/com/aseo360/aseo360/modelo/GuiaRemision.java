package com.aseo360.aseo360.modelo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "guias_remision")
public class GuiaRemision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", referencedColumnName = "idVenta", nullable = true)
    @JsonIgnoreProperties({"clienteTienda", "inventario", "hibernateLazyInitializer", "handler"})
    private Venta venta;

    private String serie;
    private String numero;
    private String motivoTraslado; // Ej. "01" Venta

    private String destinatarioDocumento;
    private String destinatarioDenominacion;

    private String estadoSunat; // Ej: ACEPTADO, RECHAZADO, PENDIENTE
    private String hash;

    @Column(length = 500)
    private String enlacePdfA4;

    @Column(length = 500)
    private String enlaceXml;

    @Column(length = 500)
    private String enlaceCdr;

    @Column(columnDefinition = "TEXT")
    private String mensajeSunat;

    private LocalDateTime fechaEmision;
}
