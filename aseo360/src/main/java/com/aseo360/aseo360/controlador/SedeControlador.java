package com.aseo360.aseo360.controlador;

import com.aseo360.aseo360.modelo.Sede;
import com.aseo360.aseo360.servicio.interfaz.ISedeServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/sede")
public class SedeControlador{
    private final ISedeServicio sedeServicio;

    @Autowired
    public SedeControlador(ISedeServicio sedeServicio){
        this.sedeServicio = sedeServicio;
    }

    @GetMapping("/listar")
    public ResponseEntity<?> listarSedes(){
        try {
            return ResponseEntity.ok(this.sedeServicio.listarSedes());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarSede(@RequestBody Sede sede){
        try {
            return ResponseEntity.ok(this.sedeServicio.registrarSede(sede));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarSede(@PathVariable Long id){
        try {
            this.sedeServicio.eliminarSedePorId(id);
            return ResponseEntity.ok("Sede eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
