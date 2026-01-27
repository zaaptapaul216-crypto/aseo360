package com.aseo360.aseo360.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoResponseDTO{
    private String idProducto;
    private String imagen;
    private String nombre;
    private String descripcion;
    private BigDecimal precioCompra;
    private BigDecimal precioVenta;
    private Integer cantidad;
    private String categoria;
    private String aroma;
    private String proveedor;
    private String sede;
    private LocalDate fechaRegistro;
    private String estado;
}
