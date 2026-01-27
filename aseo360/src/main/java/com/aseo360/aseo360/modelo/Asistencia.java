package com.aseo360.aseo360.modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Time;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "asistencias")
public class Asistencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAsistencia;

    @ManyToOne
    @JoinColumn(name = "empleado_id", referencedColumnName = "idEmpleado")
    private Empleado empleado;

    private LocalDate fecha;
    private Time horaEntrada;
    private Time horaSalida;
    private String estado;
    private String comentarios;
}
