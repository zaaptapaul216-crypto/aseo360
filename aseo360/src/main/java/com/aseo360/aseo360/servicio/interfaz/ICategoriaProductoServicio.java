package com.aseo360.aseo360.servicio.interfaz;

import com.aseo360.aseo360.modelo.CategoriaProducto;

import java.util.List;

public interface ICategoriaProductoServicio {
    public List<CategoriaProducto> listarCategoriaProducto();
    public CategoriaProducto registrarCatProducto(CategoriaProducto categoriaProducto);
    public CategoriaProducto buscarCatProductoPorId(Long id) throws Exception;
    public CategoriaProducto modificarCatProducto(CategoriaProducto categoriaProducto) throws Exception;
    public void eliminarCatProductoPorId(Long id);
}
