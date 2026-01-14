package com.aseo.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DniResponseDTO {
    private String dni;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombreCompleto;
    private boolean success;
    private String message;

    public String getNombreCompleto() {
        if (nombreCompleto != null && !nombreCompleto.isEmpty()) {
            return nombreCompleto;
        }
        if (nombres != null && apellidoPaterno != null && apellidoMaterno != null) {
            return apellidoPaterno + " " + apellidoMaterno + " " + nombres;
        }
        return "";
    }
}
