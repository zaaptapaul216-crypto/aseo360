package com.aseo360.aseo360.repositorio;

import com.aseo360.aseo360.modelo.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IEmpleadoRepositorio extends JpaRepository<Empleado, Long> {
    public Optional<Empleado> findByCorreo(String correo);
}
