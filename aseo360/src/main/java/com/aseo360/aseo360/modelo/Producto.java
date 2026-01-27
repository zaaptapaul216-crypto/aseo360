package com.aseo360.aseo360.modelo;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@Table(name = "productos")
public class Producto {
    @Id
    private String idProducto;

    @ManyToOne
    @JoinColumn(name = "categoria_id", referencedColumnName = "idCategoria")
    private CategoriaProducto categoriaProducto;

    @ManyToOne
    @JoinColumn(name = "aroma_id", referencedColumnName = "idAroma")
    private Aroma aroma;

    @ManyToOne
    @JoinColumn(name = "proveedor_id", referencedColumnName = "ruc")
    private Proveedor proveedor;

    @ManyToOne
    @JoinColumn(name = "sede_id", referencedColumnName = "idSede")
    private Sede sede;

    private String nombre;

    private String descripcion;

    private String imagen;

    private Integer cantidad;

    private BigDecimal precioCompra;

    private BigDecimal precioVenta;

    private LocalDate fechaRegistro;

    private String estado; //DISPONIBLE - NO DISPONIBLE
}
