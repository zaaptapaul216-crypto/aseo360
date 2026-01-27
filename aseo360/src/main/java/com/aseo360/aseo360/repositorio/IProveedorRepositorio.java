package com.aseo360.aseo360.repositorio;

import com.aseo360.aseo360.modelo.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IProveedorRepositorio extends JpaRepository<Proveedor, String> {
}
