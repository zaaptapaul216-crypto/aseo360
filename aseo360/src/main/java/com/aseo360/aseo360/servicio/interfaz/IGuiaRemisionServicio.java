package com.aseo360.aseo360.servicio.interfaz;

import com.aseo360.aseo360.modelo.GuiaRemision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IGuiaRemisionServicio {
    Page<GuiaRemision> listarGuiasRemision(Pageable pageable);
}
