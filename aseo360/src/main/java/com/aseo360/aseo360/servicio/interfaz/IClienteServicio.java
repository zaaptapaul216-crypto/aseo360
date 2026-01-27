package com.aseo360.aseo360.servicio.interfaz;

import com.aseo360.aseo360.dto.ClienteRegistroDTO;
import com.aseo360.aseo360.modelo.Cliente;

import java.util.List;

public interface IClienteServicio {
    public List<Cliente> listarClientes();
    public Cliente registrarCliente(ClienteRegistroDTO clienteRegistro) throws Exception;
    public Cliente buscarPorId(Long id) throws Exception;
    public void eliminarPorId(Long id);
}
