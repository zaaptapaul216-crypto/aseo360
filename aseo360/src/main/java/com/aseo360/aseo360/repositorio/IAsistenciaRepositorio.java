package com.aseo360.aseo360.repositorio;

import com.aseo360.aseo360.modelo.Asistencia;
import com.aseo360.aseo360.modelo.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IAsistenciaRepositorio extends JpaRepository<Asistencia, Long> {
    public List<Asistencia> findByEmpleado(Empleado empleado);
}
