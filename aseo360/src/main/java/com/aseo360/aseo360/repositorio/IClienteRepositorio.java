package com.aseo360.aseo360.repositorio;

import com.aseo360.aseo360.modelo.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IClienteRepositorio extends JpaRepository<Cliente, Long> {
    public Optional<Cliente> findByCorreo(String correo);
}
