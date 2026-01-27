package com.aseo360.aseo360.controlador;

import com.aseo360.aseo360.servicio.interfaz.IProductoServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/producto")
public class ProductoControlador {

    private final IProductoServicio productoServicio;

    @Autowired
    public ProductoControlador(IProductoServicio productoServicio){
        this.productoServicio = productoServicio;
    }

    @GetMapping("/listar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'CAJERO', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<?> listarProductos(){
        try{
            return ResponseEntity.ok(this.productoServicio.listarProductos());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/listar/disponibles")
    public ResponseEntity<?> listarProductoDisponibles(){
        try {
            return ResponseEntity.ok(this.productoServicio.listarProductosDisponibles());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
