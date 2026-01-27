package com.aseo360.aseo360.controlador;

import com.aseo360.aseo360.dto.AsistenciaDTO;
import com.aseo360.aseo360.modelo.Asistencia;
import com.aseo360.aseo360.security.UserLogin;
import com.aseo360.aseo360.servicio.interfaz.IAsistenciaServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/asistencia")
public class AsistenciaController{
    private final IAsistenciaServicio asistenciaServicio;
    @Autowired
    public AsistenciaController(IAsistenciaServicio asistenciaServicio){
        this.asistenciaServicio = asistenciaServicio;
    }
    @GetMapping("/listar/empleado/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'CAJERO', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<?> listarAsistenciaPorEmpleado(@PathVariable Long id){
        try {
            return ResponseEntity.ok(this.asistenciaServicio.listarAsistenciasPorEmpleado(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/registrar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'CAJERO', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<?> registrarAsistencia(@AuthenticationPrincipal UserLogin userLogin) throws Exception {
        try{
            String correo = userLogin.getUsername();
            if (!userLogin.isEnabled()){
                return ResponseEntity.status(403).body("Usuario no activo");
            }
            Asistencia asistencia = this.asistenciaServicio.registrarAsistencia(correo);
            return ResponseEntity.ok(asistencia);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/registrar/salida/{idAsistencia}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'CAJERO', 'VENDEDOR', 'ALMACENERO')")
    public ResponseEntity<?> registrarSalida(@PathVariable Long idAsistencia){
        try{
            this.asistenciaServicio.registrarSalida(idAsistencia);
            return ResponseEntity.ok("Salida registrado con exito!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/modificar/asistencia")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR')")
    public ResponseEntity<?> modificarAsistencia(@RequestBody AsistenciaDTO asistenciaDTO){
        try{
            this.asistenciaServicio.modificarAsistencia(asistenciaDTO);
            return ResponseEntity.ok("Asistencia modificado exitosamente!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/modificar/comentario")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR')")
    public ResponseEntity<?> modificarComentario(@RequestBody AsistenciaDTO asistenciaDTO){
        try {
            this.asistenciaServicio.modificarComentario(asistenciaDTO);
            return ResponseEntity.ok("Comentario agregado");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/modificar/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR')")
    public ResponseEntity<?> modificarEstado(@RequestBody AsistenciaDTO asistenciaDTO){
        try {
            this.asistenciaServicio.modificarEstado(asistenciaDTO);
            return ResponseEntity.ok("Estado modificado");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
