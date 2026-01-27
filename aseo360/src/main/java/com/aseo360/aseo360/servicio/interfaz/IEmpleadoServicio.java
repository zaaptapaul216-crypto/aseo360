package com.aseo360.aseo360.servicio.interfaz;

import com.aseo360.aseo360.dto.EmpleadoRegistroDTO;
import com.aseo360.aseo360.modelo.Empleado;

import java.util.List;

public interface IEmpleadoServicio {
    public List<Empleado> listarEmpleados();
    public Empleado registrarEmpleado(EmpleadoRegistroDTO empleadoRegistro) throws Exception;
    public Empleado buscarPorId(Long id) throws Exception;
    public void eliminarPorId(Long id);
}
