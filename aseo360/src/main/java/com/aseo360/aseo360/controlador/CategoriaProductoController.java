package com.aseo360.aseo360.controlador;

import com.aseo360.aseo360.modelo.CategoriaProducto;
import com.aseo360.aseo360.servicio.interfaz.ICategoriaProductoServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/categoria")
public class CategoriaProductoController {
    private final ICategoriaProductoServicio categoriaProductoServicio;

    @Autowired
    public CategoriaProductoController(ICategoriaProductoServicio categoriaProductoServicio){
        this.categoriaProductoServicio = categoriaProductoServicio;
    }

    @GetMapping("/listar")
    public ResponseEntity<?> listarCategoriaProducto(){
        try {
            return ResponseEntity.ok(this.categoriaProductoServicio.listarCategoriaProducto());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarCategoriaProducto(@RequestBody CategoriaProducto categoriaProducto){
        try {
            return ResponseEntity.ok(this.categoriaProductoServicio.registrarCatProducto(categoriaProducto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarCategoriaProducto(@PathVariable Long id){
        try {
            this.categoriaProductoServicio.eliminarCatProductoPorId(id);
            return ResponseEntity.ok("Categoria eliminado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
