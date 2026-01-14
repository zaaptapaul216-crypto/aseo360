package com.aseo.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El tipo de documento es requerido")
    @Column(name = "doc_type", nullable = false)
    private String type; // DNI, RUC, CE (Carnet de Extranjería)

    @NotBlank(message = "El número de documento es requerido")
    @Column(name = "doc_number", nullable = false, unique = true)
    private String docNumber;

    @NotBlank(message = "El nombre es requerido")
    @Column(nullable = false)
    private String name;

    @Column(length = 20)
    private String phone;

    @Email(message = "Email inválido")
    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String address;

    // Campos adicionales para RUC
    @Column(name = "razon_social")
    private String razonSocial;

    @Column(name = "nombre_comercial")
    private String nombreComercial;

    private String departamento;
    private String provincia;
    private String distrito;

    // Estado del cliente
    @Column(nullable = false)
    private Boolean active = true;

    // Auditoría
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
