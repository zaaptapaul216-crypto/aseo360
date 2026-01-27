package com.aseo360.aseo360.servicio.interfaz;

import com.aseo360.aseo360.modelo.Sede;

import java.util.List;

public interface ISedeServicio {
    public List<Sede> listarSedes();
    public Sede registrarSede(Sede sede);
    public Sede buscarSedePorId(Long id) throws Exception;
    public void eliminarSedePorId(Long id);
}
