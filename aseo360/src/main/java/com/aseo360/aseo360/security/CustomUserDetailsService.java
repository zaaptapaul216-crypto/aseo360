package com.aseo360.aseo360.security;

import com.aseo360.aseo360.modelo.Cliente;
import com.aseo360.aseo360.modelo.Empleado;
import com.aseo360.aseo360.repositorio.IClienteRepositorio;
import com.aseo360.aseo360.repositorio.IEmpleadoRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private IEmpleadoRepositorio employeeRepositorio;

    @Autowired
    private IClienteRepositorio clienteRepositorio;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        // 1. Buscamos en Empleados 👷
        var empleado = employeeRepositorio.findByCorreo(correo);
        if (empleado.isPresent()) {
            Empleado emp = empleado.get();
            // Usamos el nombre del Rol de tu entidad y le ponemos ROLE_
            var authority = new SimpleGrantedAuthority("ROLE_" + emp.getRol().getNombre().toUpperCase());
            return new UserLogin(emp.getCorreo(), emp.getPassword(), emp.getEstado(), Collections.singletonList(authority));
        }

        // 2. Buscamos en clientes 👤
        var cliente = clienteRepositorio.findByCorreo(correo);
        if (cliente.isPresent()) {
            Cliente cons = cliente.get();
            // Rol fijo para clientes
            var authority = new SimpleGrantedAuthority("ROLE_CLIENTE");
            return new UserLogin(cons.getCorreo(), cons.getPassword(), cons.getEstado(), Collections.singletonList(authority));
        }

        throw new UsernameNotFoundException("No se encontró el usuario con email: " + correo);
    }
}