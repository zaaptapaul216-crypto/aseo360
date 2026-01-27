package com.aseo360.aseo360.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoRegistroDTO {
    private String nombreCompleto;
    private String fotoPerfil;
    private String dni;
    private String password;
    private String numeroCelular;
    private Long rolId;
}
