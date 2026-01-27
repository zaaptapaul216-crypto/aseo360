package com.aseo360.aseo360.controlador;

import com.aseo360.aseo360.modelo.Rol;
import com.aseo360.aseo360.servicio.interfaz.IRolServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/admin/roles")
public class RolControlador {
    private final IRolServicio rolServicio;

    @Autowired
    public RolControlador(IRolServicio rolServicio){
        this.rolServicio = rolServicio;
    }
    @GetMapping
    public ResponseEntity<?> listRoles(){
        return ResponseEntity.ok(this.rolServicio.listarRoles());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerRol(@RequestBody Rol rol){
        return ResponseEntity.ok(this.rolServicio.registrarRol(rol));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteRol(@PathVariable Long id){
        try{
            this.rolServicio.eliminarPorId(id);
            return ResponseEntity.ok("Eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }



}
