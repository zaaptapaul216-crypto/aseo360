package com.aseo360.aseo360.modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "clientes", uniqueConstraints = {
        @UniqueConstraint(columnNames = "correo"),
        @UniqueConstraint(columnNames = "numeroCelular"),
        @UniqueConstraint(columnNames = "dni")
} )
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCliente;

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
    private String NumeroCelular;

    @Column(nullable = false)
    private String Direccion;

    private LocalDate fechaRegistro;

    private String estado;
}
