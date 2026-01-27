package com.aseo360.aseo360.servicio.implementacion;

import com.aseo360.aseo360.dto.ProductoRegistroDTO;
import com.aseo360.aseo360.dto.ProductoResponseDTO;
import com.aseo360.aseo360.modelo.*;
import com.aseo360.aseo360.repositorio.*;
import com.aseo360.aseo360.servicio.interfaz.IProductoServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProductoServicio implements IProductoServicio {
    private final IProductoRepositorio productoRepositorio;
    private final IAromaRepositorio aromaRepositorio;
    private final IProveedorRepositorio proveedorRepositorio;
    private final ISedeRepositorio sedeRepositorio;
    private final ICategoriaProductoRepositorio categoriaProductoRepositorio;

    @Autowired
    public ProductoServicio(IProductoRepositorio productoRepositorio, IAromaRepositorio aromaRepositorio,IProveedorRepositorio proveedorRepositorio,ISedeRepositorio sedeRepositorio,ICategoriaProductoRepositorio categoriaProductoRepositorio){
        this.productoRepositorio = productoRepositorio;
        this.aromaRepositorio = aromaRepositorio;
        this.proveedorRepositorio = proveedorRepositorio;
        this.sedeRepositorio = sedeRepositorio;
        this.categoriaProductoRepositorio = categoriaProductoRepositorio;
    }

    @Override
    public List<ProductoResponseDTO> listarProductos() throws Exception{
        List<Producto> productos = this.productoRepositorio.findAll();
        List<ProductoResponseDTO> productoResponseDTOS = productos.stream().map(
                producto -> new ProductoResponseDTO(
                        producto.getIdProducto(),
                        producto.getImagen(),
                        producto.getNombre(),
                        producto.getDescripcion(),
                        producto.getPrecioCompra(),
                        producto.getPrecioVenta(),
                        producto.getCantidad(),
                        producto.getCategoriaProducto().getNombre(),
                        producto.getAroma().getNombre(),
                        producto.getProveedor().getNombre(),
                        producto.getSede().getNombre(),
                        producto.getFechaRegistro(),
                        producto.getEstado()
                )
        ).toList();
        return productoResponseDTOS;
    }

    @Override
    public List<ProductoResponseDTO> listarProductosDisponibles() throws Exception {
        List<Producto> productos = this.productoRepositorio.findAllByEstado("DISPONIBLE");
        List<ProductoResponseDTO> productosDisponibles = productos.stream().map(
                producto -> new ProductoResponseDTO(
                        producto.getIdProducto(),
                        producto.getImagen(),
                        producto.getNombre(),
                        producto.getDescripcion(),
                        producto.getPrecioCompra(),
                        producto.getPrecioVenta(),
                        producto.getCantidad(),
                        producto.getCategoriaProducto().getNombre(),
                        producto.getAroma().getNombre(),
                        producto.getProveedor().getNombre(),
                        producto.getSede().getNombre(),
                        producto.getFechaRegistro(),
                        producto.getEstado()
                )
        ).toList();
        return productosDisponibles;
    }

    @Override
    public Producto registrarProducto(ProductoRegistroDTO productoRegistroDTO)throws Exception {
        LocalDate hoy = LocalDate.now();
        Producto producto = new Producto();
        Aroma aroma = this.aromaRepositorio.findById(productoRegistroDTO.getIdAroma()).orElseThrow(()-> new Exception("Error: Aroma no encontrado"));
        Proveedor proveedor = this.proveedorRepositorio.findById(productoRegistroDTO.getIdProveedor()).orElseThrow(()-> new Exception("Erro: Proveedor no encontrado"));
        Sede sede = this.sedeRepositorio.findById(productoRegistroDTO.getIdSede()).orElseThrow(()->new Exception("Error: Sede no encontrado"));
        CategoriaProducto categoriaProducto = this.categoriaProductoRepositorio.findById(productoRegistroDTO.getIdCategoriaProducto()).orElseThrow(()->new Exception("Error: Categoria no encontrado"));

        if (productoRegistroDTO.getCantidad()<=0){
            throw new Exception("Error: La cantidad no puede ser un numero negativo");
        }
        if (productoRegistroDTO.getNombre() == null || productoRegistroDTO.getNombre().isEmpty()){
            throw new Exception("Error: nombre del producto es obligatorio");
        }

        //Completamos los datos
        producto.setCategoriaProducto(categoriaProducto);
        producto.setAroma(aroma);
        producto.setProveedor(proveedor);
        producto.setSede(sede);
        producto.setNombre(productoRegistroDTO.getNombre());
        producto.setDescripcion(productoRegistroDTO.getDescripcion());
        producto.setImagen(productoRegistroDTO.getImagen());
        producto.setCantidad(productoRegistroDTO.getCantidad());
        producto.setPrecioCompra(productoRegistroDTO.getPrecioCompra());
        producto.setPrecioVenta(productoRegistroDTO.getPrecioVenta());
        producto.setFechaRegistro(hoy);
        producto.setEstado(productoRegistroDTO.getEstado());


        //Guardamos en la bd
        return this.productoRepositorio.save(producto);
    }

    @Override
    public Producto modificarProducto(ProductoRegistroDTO productoRegistroDTO)throws Exception {
        Producto producto = this.productoRepositorio.findById(productoRegistroDTO.getIdProducto()).orElseThrow(()->new Exception("Error: Producto no encontrado"));
        Aroma aroma = this.aromaRepositorio.findById(productoRegistroDTO.getIdAroma()).orElseThrow(()-> new Exception("Error: Aroma no encontrado"));
        Proveedor proveedor = this.proveedorRepositorio.findById(productoRegistroDTO.getIdProveedor()).orElseThrow(()-> new Exception("Erro: Proveedor no encontrado"));
        Sede sede = this.sedeRepositorio.findById(productoRegistroDTO.getIdSede()).orElseThrow(()->new Exception("Error: Sede no encontrado"));
        CategoriaProducto categoriaProducto = this.categoriaProductoRepositorio.findById(productoRegistroDTO.getIdCategoriaProducto()).orElseThrow(()->new Exception("Error: Categoria no encontrado"));

        if (productoRegistroDTO.getCantidad()<=0){
            throw new Exception("Error: La cantidad no puede ser un numero negativo");
        }
        if (productoRegistroDTO.getNombre() == null || productoRegistroDTO.getNombre().isEmpty()){
            throw new Exception("Error: nombre del producto es obligatorio");
        }

        //Completamos los datos
        producto.setCategoriaProducto(categoriaProducto);
        producto.setAroma(aroma);
        producto.setProveedor(proveedor);
        producto.setSede(sede);
        producto.setNombre(productoRegistroDTO.getNombre());
        producto.setDescripcion(productoRegistroDTO.getDescripcion());
        producto.setImagen(productoRegistroDTO.getImagen());
        producto.setCantidad(productoRegistroDTO.getCantidad());
        producto.setPrecioCompra(productoRegistroDTO.getPrecioCompra());
        producto.setPrecioVenta(productoRegistroDTO.getPrecioVenta());
        producto.setEstado(productoRegistroDTO.getEstado());

        return this.productoRepositorio.save(producto);
    }

    @Override
    public Producto buscarPorId(Long id)throws Exception {
        return null;
    }

    @Override
    public void eliminarPorId(Long id)throws Exception {

    }
}
