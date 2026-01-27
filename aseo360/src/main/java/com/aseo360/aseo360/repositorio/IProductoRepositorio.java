package com.aseo360.aseo360.repositorio;

import com.aseo360.aseo360.modelo.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IProductoRepositorio extends JpaRepository<Producto, String> {
    public List<Producto> findAllByEstado(String estado);
}
