package com.aseo360.aseo360.controlador;

import com.aseo360.aseo360.modelo.GuiaRemision;
import com.aseo360.aseo360.servicio.interfaz.IGuiaRemisionServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guia-remision")
public class GuiaRemisionControlador {

    private final IGuiaRemisionServicio guiaRemisionServicio;

    @Autowired
    public GuiaRemisionControlador(IGuiaRemisionServicio guiaRemisionServicio) {
        this.guiaRemisionServicio = guiaRemisionServicio;
    }

    @GetMapping("/listar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<Page<GuiaRemision>> listarGuiasRemision(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<GuiaRemision> guias = guiaRemisionServicio.listarGuiasRemision(PageRequest.of(page, size));
        return ResponseEntity.ok(guias);
    }
}
