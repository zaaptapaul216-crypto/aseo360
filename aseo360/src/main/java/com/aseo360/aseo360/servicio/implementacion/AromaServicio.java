package com.aseo360.aseo360.servicio.implementacion;

import com.aseo360.aseo360.modelo.Aroma;
import com.aseo360.aseo360.repositorio.IAromaRepositorio;
import com.aseo360.aseo360.servicio.interfaz.IAromaServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AromaServicio implements IAromaServicio {
    private final IAromaRepositorio aromaRepositorio;

    @Autowired
    public AromaServicio(IAromaRepositorio aromaRepositorio){
        this.aromaRepositorio = aromaRepositorio;
    }

    @Override
    public List<Aroma> listarAromas() throws Exception {
        return this.aromaRepositorio.findAll();
    }

    @Override
    public Aroma registrarAroma(Aroma aroma) throws Exception {
        if (aroma.getNombre() == null || aroma.getNombre().isEmpty()){
            throw new Exception("Error : El nombre del aroma es obligatorio");
        }
        return this.aromaRepositorio.save(aroma);
    }

    @Override
    public Aroma buscarAromaPorId(Long id) throws Exception {
        return this.aromaRepositorio.findById(id).orElseThrow(()-> new Exception("Error : Aroma con ID: "+ id + "No encontrado"));
    }

    @Override
    public void eliminarAromaPorId(Long id) throws Exception {
        this.aromaRepositorio.deleteById(id);
    }
}
