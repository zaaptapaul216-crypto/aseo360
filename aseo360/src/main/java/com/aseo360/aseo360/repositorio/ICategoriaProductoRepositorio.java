package com.aseo360.aseo360.repositorio;

import com.aseo360.aseo360.modelo.CategoriaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICategoriaProductoRepositorio extends JpaRepository<CategoriaProducto, Long> {
}
