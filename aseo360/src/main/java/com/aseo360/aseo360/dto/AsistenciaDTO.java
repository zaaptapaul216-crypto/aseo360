package com.aseo360.aseo360.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Time;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsistenciaDTO {
    private Long idAsistencia;
    private String nombreEmpleado;
    private String correoEmpleado;
    private String dni;
    private String numeroCelular;
    private LocalDate fecha;
    private Time horaEntrada;
    private Time horaSalida;
    private String estado;
    private String Comentario;
}
