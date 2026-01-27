package com.aseo360.aseo360.modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "empleados", uniqueConstraints = {
        @UniqueConstraint(columnNames = "correo"),
        @UniqueConstraint(columnNames = "numeroCelular"),
        @UniqueConstraint(columnNames = "dni")
})
public class Empleado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEmpleado;

    @Column(nullable = false)
    private String nombreCompleto;

    @Column(nullable = false)
    private String fotoPerfil;

    @Column(nullable = false)
    private String correo;

    @Column(nullable = false)
    private String dni;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String numeroCelular;

    @ManyToOne
    @JoinColumn(name = "rol_id", referencedColumnName = "idRol")
    private Rol rol;

    private LocalDate fechaRegistro;

    private String estado;
}
