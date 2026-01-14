package com.aseo.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RucResponseDTO {
    private String ruc;
    private String razonSocial;
    private String nombreComercial;
    private String direccion;
    private String departamento;
    private String provincia;
    private String distrito;
    private String estado;
    private String condicion;
    private String tipo;
    private boolean success;
    private String message;
}
