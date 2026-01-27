package com.aseo360.aseo360.servicio.interfaz;

import com.aseo360.aseo360.dto.ProductoRegistroDTO;
import com.aseo360.aseo360.dto.ProductoResponseDTO;
import com.aseo360.aseo360.modelo.Producto;

import java.util.List;

public interface IProductoServicio {
    public List<ProductoResponseDTO> listarProductos() throws Exception;
    public List<ProductoResponseDTO> listarProductosDisponibles() throws Exception;
    public Producto registrarProducto(ProductoRegistroDTO productoRegistroDTO) throws Exception;
    public Producto modificarProducto(ProductoRegistroDTO productoRegistroDTO) throws Exception;
    public Producto buscarPorId(Long id) throws Exception;
    public void eliminarPorId(Long id) throws Exception;
}
