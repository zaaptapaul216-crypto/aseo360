package com.aseo360.aseo360.servicio.interfaz;

import com.aseo360.aseo360.modelo.Aroma;

import java.util.List;

public interface IAromaServicio {
    public List<Aroma> listarAromas()throws Exception;
    public Aroma registrarAroma(Aroma aroma)throws Exception;
    public Aroma buscarAromaPorId(Long id) throws Exception;
    public void eliminarAromaPorId(Long id) throws Exception;
}
