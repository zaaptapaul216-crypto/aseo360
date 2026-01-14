package com.aseo.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El código es requerido")
    @Column(unique = true, nullable = false)
    private String code;

    @NotBlank(message = "El nombre es requerido")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "El precio es requerido")
    @Positive(message = "El precio debe ser mayor a 0")
    private BigDecimal price;

    @PositiveOrZero(message = "El costo no puede ser negativo")
    private BigDecimal cost;

    @NotNull(message = "El stock es requerido")
    @PositiveOrZero(message = "El stock no puede ser negativo")
    private Integer stock;

    private String category;

    @Column(name = "image_url")
    private String imageUrl;

    private String description;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    // Auditoría
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (stock == null)
            stock = 0;
        if (cost == null)
            cost = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
