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
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El RUC es requerido")
    @Column(unique = true, nullable = false, length = 11)
    private String ruc;

    @NotBlank(message = "La razón social es requerida")
    @Column(nullable = false)
    private String name;

    @Column(length = 20)
    private String phone;

    @Email(message = "Email inválido")
    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String address;

    // Campos adicionales
    @Column(name = "contact_person")
    private String contactPerson;

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
