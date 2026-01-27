package com.aseo360.aseo360.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class ProductoRegistroDTO{
    private String idProducto;
    private Long idCategoriaProducto;
    private Long idAroma;
    private String idProveedor;
    private Long idSede;
    private String nombre;
    private String descripcion;
    private String imagen;
    private Integer cantidad;
    private BigDecimal precioCompra;
    private BigDecimal precioVenta;
    private String estado;
}
