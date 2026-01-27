package com.aseo360.aseo360.servicio.interfaz;

import com.aseo360.aseo360.modelo.Rol;

import java.util.List;

public interface IRolServicio {
    public List<Rol> listarRoles();
    public Rol registrarRol(Rol rol);
    public Rol buscarPorId(Long id) throws Exception;
    public void eliminarPorId(Long id) throws Exception;
}
