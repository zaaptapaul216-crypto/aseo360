package com.aseo360.aseo360.servicio.implementacion;

import com.aseo360.aseo360.modelo.Sede;
import com.aseo360.aseo360.repositorio.ISedeRepositorio;
import com.aseo360.aseo360.servicio.interfaz.ISedeServicio;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

public class SedeServicio implements ISedeServicio {
    private final ISedeRepositorio sedeRepositorio;

    @Autowired
    public SedeServicio(ISedeRepositorio sedeRepositorio){
        this.sedeRepositorio = sedeRepositorio;
    }

    @Override
    public List<Sede> listarSedes() {
        return this.sedeRepositorio.findAll();
    }

    @Override
    public Sede registrarSede(Sede sede) {
        return this.sedeRepositorio.save(sede);
    }

    @Override
    public Sede buscarSedePorId(Long id) throws Exception{
        return this.sedeRepositorio.findById(id).orElseThrow(()->new Exception("Error: sede no encontrado"));
    }

    @Override
    public void eliminarSedePorId(Long id) {
        this.sedeRepositorio.deleteById(id);
    }
}
