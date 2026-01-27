package com.aseo360.aseo360.servicio.implementacion;

import com.aseo360.aseo360.dto.EmpleadoRegistroDTO;
import com.aseo360.aseo360.modelo.Empleado;
import com.aseo360.aseo360.modelo.Rol;
import com.aseo360.aseo360.repositorio.IEmpleadoRepositorio;
import com.aseo360.aseo360.repositorio.IRolRepositorio;
import com.aseo360.aseo360.servicio.interfaz.IEmpleadoServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmpleadoServicio implements IEmpleadoServicio {
    private final IEmpleadoRepositorio empleadoRepositorio;
    private final IRolRepositorio rolRepositorio;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public EmpleadoServicio(IEmpleadoRepositorio empleadoRepositorio, PasswordEncoder passwordEncoder, IRolRepositorio rolRepositorio){
        this.empleadoRepositorio = empleadoRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.rolRepositorio = rolRepositorio;
    }

    @Override
    public List<Empleado> listarEmpleados() {
        return this.empleadoRepositorio.findAll();
    }

    @Override
    public Empleado registrarEmpleado(EmpleadoRegistroDTO empleadoRegistro) throws Exception {
        Empleado newEmpleado = new Empleado();
        if (empleadoRegistro.getDni() == null ||empleadoRegistro.getDni().isEmpty()){
            throw new Exception("Error: el dni no puede estar vacío");
        }
        if (empleadoRegistro.getRolId() == null || empleadoRegistro.getRolId()<1){
            throw new Exception("Error: no existe el id del rol");
        }
        Rol rol = this.rolRepositorio.findById(empleadoRegistro.getRolId()).orElseThrow(()->new Exception("Rol con id " + empleadoRegistro.getRolId() + " no encontrado"));
        newEmpleado.setNombreCompleto(empleadoRegistro.getNombreCompleto());
        newEmpleado.setFotoPerfil(empleadoRegistro.getFotoPerfil());
        newEmpleado.setRol(rol);
        newEmpleado.setDni(empleadoRegistro.getDni());
        newEmpleado.setNumeroCelular(empleadoRegistro.getNumeroCelular());
        newEmpleado.setPassword(this.passwordEncoder.encode(empleadoRegistro.getPassword()));
        newEmpleado.setCorreo("ES"+empleadoRegistro.getDni()+"@gmail.com");
        newEmpleado.setFechaRegistro(LocalDate.now());
        newEmpleado.setEstado("PENDIENTE");
        return this.empleadoRepositorio.save(newEmpleado);
    }

    @Override
    public Empleado buscarPorId(Long id) throws Exception{
        return this.empleadoRepositorio.findById(id).orElseThrow(()->new Exception("Empleado con id " + id + " no encontrado"));
    }

    @Override
    public void eliminarPorId(Long id) {
        this.empleadoRepositorio.deleteById(id);
    }
}
