package com.aseo360.aseo360.servicio.implementacion;

import com.aseo360.aseo360.modelo.GuiaRemision;
import com.aseo360.aseo360.repositorio.IGuiaRemisionRepositorio;
import com.aseo360.aseo360.servicio.interfaz.IGuiaRemisionServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class GuiaRemisionServicio implements IGuiaRemisionServicio {

    private final IGuiaRemisionRepositorio guiaRemisionRepositorio;

    @Autowired
    public GuiaRemisionServicio(IGuiaRemisionRepositorio guiaRemisionRepositorio) {
        this.guiaRemisionRepositorio = guiaRemisionRepositorio;
    }

    @Override
    public Page<GuiaRemision> listarGuiasRemision(Pageable pageable) {
        return guiaRemisionRepositorio.findAllByOrderByFechaEmisionDesc(pageable);
    }
}
