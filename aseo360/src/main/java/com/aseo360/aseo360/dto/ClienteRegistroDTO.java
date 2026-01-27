package com.aseo360.aseo360.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClienteRegistroDTO {
    private String nombreCompleto;
    private String fotoPerfil;
    private String correo;
    private String dni;
    private String password;
    private String numeroCelular;
    private String direccion;
}
