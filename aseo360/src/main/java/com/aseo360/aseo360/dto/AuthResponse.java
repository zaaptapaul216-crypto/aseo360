package com.aseo360.aseo360.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String nombreCompleto;
    private String fotoPerfil;
    private String rol;
    private String tipoUsuario;

    public AuthResponse(String token, String nombreCompleto, String fotoPerfil, String rol, String tipoUsuario) {
        this.token = token;
        this.nombreCompleto = nombreCompleto;
        this.fotoPerfil = fotoPerfil;
        this.rol = rol;
        this.tipoUsuario = tipoUsuario;
    }
}
