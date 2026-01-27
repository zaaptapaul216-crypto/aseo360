package com.aseo360.aseo360.servicio.implementacion;

import com.aseo360.aseo360.dto.ClienteRegistroDTO;
import com.aseo360.aseo360.modelo.Cliente;
import com.aseo360.aseo360.repositorio.IClienteRepositorio;
import com.aseo360.aseo360.servicio.interfaz.IClienteServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class ClienteServicio implements IClienteServicio {
    private final IClienteRepositorio clienteRepositorio;
    private final PasswordEncoder passwordEncoder;
    @Autowired
    public ClienteServicio(IClienteRepositorio clienteRepositorio, PasswordEncoder passwordEncoder){
        this.clienteRepositorio = clienteRepositorio;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<Cliente> listarClientes() {
        return this.clienteRepositorio.findAll();
    }

    @Override
    public Cliente registrarCliente(ClienteRegistroDTO clienteRegistro) throws Exception {
        Cliente newCliente = new Cliente();
        if (clienteRegistro.getPassword() == null || clienteRegistro.getPassword().isEmpty()){
            throw new Exception("¡Ingrese una contraseña!");
        }
        newCliente.setNombreCompleto(clienteRegistro.getNombreCompleto());
        newCliente.setFotoPerfil(clienteRegistro.getFotoPerfil());
        newCliente.setCorreo(clienteRegistro.getCorreo());
        newCliente.setDni(clienteRegistro.getDni());
        newCliente.setDireccion(clienteRegistro.getDireccion());
        newCliente.setNumeroCelular(clienteRegistro.getNumeroCelular());

        newCliente.setPassword(this.passwordEncoder.encode(clienteRegistro.getPassword()));
        newCliente.setFechaRegistro(LocalDate.now());
        newCliente.setEstado("PENDIENTE");

        return this.clienteRepositorio.save(newCliente);
    }

    @Override
    public Cliente buscarPorId(Long id) throws Exception {
        return this.clienteRepositorio.findById(id)
                .orElseThrow(()-> new Exception("No se encontro cliente con id: " + id));
    }

    @Override
    public void eliminarPorId(Long id) {
        this.clienteRepositorio.deleteById(id);
    }
}
