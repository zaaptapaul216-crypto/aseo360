package com.aseo360.aseo360.modelo;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "aromas", uniqueConstraints = {
        @UniqueConstraint(columnNames = "nombre")
})
public class Aroma {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAroma;
    private String nombre;
}
