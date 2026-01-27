package com.aseo360.aseo360.servicio.implementacion;

import com.aseo360.aseo360.modelo.Proveedor;
import com.aseo360.aseo360.repositorio.IProveedorRepositorio;
import com.aseo360.aseo360.servicio.interfaz.IProveedorServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProveedorServicio implements IProveedorServicio {

    private final IProveedorRepositorio proveedorRepositorio;

    @Autowired
    public ProveedorServicio(IProveedorRepositorio proveedorRepositorio){
        this.proveedorRepositorio = proveedorRepositorio;
    }

    @Override
    public List<Proveedor> listarProveedores() {
        return this.proveedorRepositorio.findAll();
    }

    @Override
    public Proveedor registrarProveedor(Proveedor proveedor) {
        return this.proveedorRepositorio.save(proveedor);
    }

    @Override
    public Proveedor modificarProveedor(Proveedor proveedor) throws Exception{
        if (proveedor.getRuc() == null || proveedor.getRuc().isEmpty()){
            throw new Exception("Error : El id es obligatorio");
        }
        return this.proveedorRepositorio.save(proveedor);
    }

    @Override
    public Proveedor buscarProveedorPorId(String id) throws Exception{
        return this.proveedorRepositorio.findById(id).orElseThrow(()->new Exception("Error: proveedor no encontrado"));
    }

    @Override
    public void eliminarPorId(String id) {
        this.proveedorRepositorio.deleteById(id);
    }
}
