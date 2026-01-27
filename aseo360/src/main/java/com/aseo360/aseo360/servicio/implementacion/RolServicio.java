package com.aseo360.aseo360.servicio.implementacion;

import com.aseo360.aseo360.modelo.Rol;
import com.aseo360.aseo360.repositorio.IRolRepositorio;
import com.aseo360.aseo360.servicio.interfaz.IRolServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RolServicio implements IRolServicio {
    private final IRolRepositorio rolRepository;

    @Autowired
    public RolServicio(IRolRepositorio rolRepository){
        this.rolRepository = rolRepository;
    }

    @Override
    public List<Rol> listarRoles() {
        return this.rolRepository.findAll();
    }

    @Override
    public Rol registrarRol(Rol rol) {
        return this.rolRepository.save(rol);
    }

    @Override
    public Rol buscarPorId(Long id) throws Exception {
        return this.rolRepository.findById(id).orElseThrow(()->new Exception("Rol con id " + id + " no entontrado"));
    }

    @Override
    public void eliminarPorId(Long id) throws Exception {
        this.rolRepository.deleteById(id);
    }
}
