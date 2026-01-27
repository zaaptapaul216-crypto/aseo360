package com.aseo360.aseo360.servicio.implementacion;

import com.aseo360.aseo360.modelo.CategoriaProducto;
import com.aseo360.aseo360.repositorio.ICategoriaProductoRepositorio;
import com.aseo360.aseo360.servicio.interfaz.ICategoriaProductoServicio;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaProductoServicio implements ICategoriaProductoServicio {

    private final ICategoriaProductoRepositorio categoriaProductoRepositorio;

    public CategoriaProductoServicio(ICategoriaProductoRepositorio categoriaProductoRepositorio){
        this.categoriaProductoRepositorio = categoriaProductoRepositorio;
    }

    @Override
    public List<CategoriaProducto> listarCategoriaProducto() {
        return this.categoriaProductoRepositorio.findAll();
    }

    @Override
    public CategoriaProducto registrarCatProducto(CategoriaProducto categoriaProducto) {
        return this.categoriaProductoRepositorio.save(categoriaProducto);
    }

    @Override
    public CategoriaProducto buscarCatProductoPorId(Long id) throws Exception {
        return this.categoriaProductoRepositorio.findById(id).orElseThrow(()->new Exception("Error: categoria no encontrado"));
    }

    @Override
    public CategoriaProducto modificarCatProducto(CategoriaProducto categoriaProducto)throws Exception {
        if (categoriaProducto.getIdCategoria() == null || categoriaProducto.getIdCategoria()<0){
            throw new Exception("Error: El id de la categoría es obligatorio");
        }
        return this.categoriaProductoRepositorio.save(categoriaProducto);
    }

    @Override
    public void eliminarCatProductoPorId(Long id) {
        this.categoriaProductoRepositorio.deleteById(id);
    }
}
