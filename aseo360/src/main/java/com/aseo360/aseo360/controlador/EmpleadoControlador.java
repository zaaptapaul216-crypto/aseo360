package com.aseo360.aseo360.controlador;

import com.aseo360.aseo360.dto.EmpleadoRegistroDTO;
import com.aseo360.aseo360.servicio.interfaz.IEmpleadoServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/admin")
public class EmpleadoControlador {
    private final IEmpleadoServicio empleadoServicio;

    @Autowired
    public EmpleadoControlador(IEmpleadoServicio employeeServicio){
        this.empleadoServicio = employeeServicio;
    }

    @GetMapping
    public ResponseEntity<?> listEmployees(){
        return ResponseEntity.ok(this.empleadoServicio.listarEmpleados());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerEmployee(@RequestBody EmpleadoRegistroDTO employeeRegister) throws Exception {
        return ResponseEntity.ok(this.empleadoServicio.registrarEmpleado(employeeRegister));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id){
        try{
            this.empleadoServicio.eliminarPorId(id);
            return ResponseEntity.ok("Rol eliminado correctamete");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
