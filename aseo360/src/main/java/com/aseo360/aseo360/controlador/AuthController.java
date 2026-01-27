package com.aseo360.aseo360.controlador;

import com.aseo360.aseo360.dto.AuthResponse;
import com.aseo360.aseo360.dto.ClienteRegistroDTO;
import com.aseo360.aseo360.dto.EmpleadoRegistroDTO;
import com.aseo360.aseo360.dto.LoginRequest;
import com.aseo360.aseo360.repositorio.IClienteRepositorio;
import com.aseo360.aseo360.repositorio.IEmpleadoRepositorio;
import com.aseo360.aseo360.security.JwtUtils;
import com.aseo360.aseo360.servicio.interfaz.IClienteServicio;
import com.aseo360.aseo360.servicio.interfaz.IEmpleadoServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/auth")
public class AuthController {
    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private IEmpleadoRepositorio empleadoRepositorio;
    @Autowired private IClienteRepositorio clienteRepositorio;
    @Autowired private IClienteServicio clienteServicio;
    @Autowired private IEmpleadoServicio empleadoServicio;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest){
        // Valida contra la base de datos usando tu UserDetailsService
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getCorreo(), loginRequest.getPassword())
        );
        String token = jwtUtils.generateToken(loginRequest.getCorreo());
        // Buscamos datos extras para el Frontend
        var emp = empleadoRepositorio.findByCorreo(loginRequest.getCorreo());
        if (emp.isPresent()) {
            var e = emp.get();
            return ResponseEntity.ok(new AuthResponse(token, e.getNombreCompleto(),e.getFotoPerfil(), e.getRol().getNombre(), "EMPLEADO"));
        }
        var cust = clienteRepositorio.findByCorreo(loginRequest.getCorreo()).get();
        return ResponseEntity.ok(new AuthResponse(token, cust.getNombreCompleto(),cust.getFotoPerfil(), "CLIENTE", "CLIENTE"));
    }
    @PostMapping("/registrar/empleado")
    public ResponseEntity<?> registrarEmpleado(@RequestBody EmpleadoRegistroDTO empleadoRegistro) throws Exception {
        return ResponseEntity.ok(this.empleadoServicio.registrarEmpleado(empleadoRegistro));
    }
    @PostMapping("/registrar/cliente")
    public ResponseEntity<?> registrarCliente(@RequestBody ClienteRegistroDTO clienteRegistro) throws Exception {
        return ResponseEntity.ok(this.clienteServicio.registrarCliente(clienteRegistro));
    }
}
