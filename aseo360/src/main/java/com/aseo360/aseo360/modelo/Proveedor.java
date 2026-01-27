package com.aseo360.aseo360.modelo;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "proveedores")
public class Proveedor {
    @Id
    private String ruc;

    private String nombre;
}
