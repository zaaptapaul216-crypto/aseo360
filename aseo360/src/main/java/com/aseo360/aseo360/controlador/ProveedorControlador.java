package com.aseo360.aseo360.controlador;

import com.aseo360.aseo360.modelo.Proveedor;
import com.aseo360.aseo360.servicio.interfaz.IProveedorServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/proveedor")
public class ProveedorControlador {
    private final IProveedorServicio proveedorServicio;

    @Autowired
    public ProveedorControlador(IProveedorServicio proveedorServicio){
        this.proveedorServicio = proveedorServicio;
    }

    @GetMapping("/listar")
    public ResponseEntity<?> listarProveedores(){
        try {
            return ResponseEntity.ok(this.proveedorServicio.listarProveedores());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    @PostMapping("/registrar")
    public ResponseEntity<?> registrarProveedor(@RequestBody Proveedor proveedor){
        try {
            return ResponseEntity.ok(this.proveedorServicio.registrarProveedor(proveedor));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    @PutMapping("/modificar")
    public ResponseEntity<?> modificarProveedor(@RequestBody Proveedor proveedor){
        try{
            return ResponseEntity.ok(this.proveedorServicio.modificarProveedor(proveedor));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarProveedor(@RequestBody String id){
        try {
            this.proveedorServicio.eliminarPorId(id);
            return ResponseEntity.ok("¡Eliminación exitosa!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
