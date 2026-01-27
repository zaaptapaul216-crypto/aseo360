package com.aseo360.aseo360.controlador;

import com.aseo360.aseo360.dto.ClienteRegistroDTO;
import com.aseo360.aseo360.servicio.interfaz.IClienteServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/cliente")
public class ClienteControlador {

    private final IClienteServicio clienteservicio;

    @Autowired
    public ClienteControlador(IClienteServicio customerServicio){
        this.clienteservicio = customerServicio;
    }

    @GetMapping
    public ResponseEntity<?> listCustomer(){
        return ResponseEntity.ok(this.clienteservicio.listarClientes());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@RequestBody ClienteRegistroDTO customerRegister) throws Exception {
        return ResponseEntity.ok(this.clienteservicio.registrarCliente(customerRegister));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id){
        try{
            this.clienteservicio.eliminarPorId(id);
            return ResponseEntity.ok("Eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
