import React, { useState, useEffect } from 'react';
import './Inventario.css';
import { InventarioService } from '../../services/InventarioService';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { manejarErrorBackend } from '../../utils/manejarErrorBackend';

const Producto = () => {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [errores, setErrores] = useState({});

    // Modal de mantenimiento rápido de atributos
    const [mostrarModalAtributo, setMostrarModalAtributo] = useState(false);
    const [configAtributo, setConfigAtributo] = useState({ entidad: '', etiqueta: '' });
    const [valorNuevoAtributo, setValorNuevoAtributo] = useState('');

    // Valores por defecto del formulario de producto
    const formularioProductoInicial = {
        idProducto: '',
        nombre: '',
        descripcion: '',
        imagen: '',
        idCategoriaProducto: '',
        idAroma: '',
        idProveedor: '',
        idSede: '',
        cantidad: 0,
        precioCompra: 0,
        precioVenta: 0,
        precioMayor: 0,
        peso: '',
        presentacion: '',
        idInventario: '',
        estado: 'DISPONIBLE'
    };

    const [formularioProducto, setFormularioProducto] = useState(formularioProductoInicial);
    const [categorias, setCategorias] = useState([]);
    const [aromas, setAromas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [inventarios, setInventarios] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const productosData = await InventarioService.getAll();
            setProductos(productosData?.content || (Array.isArray(productosData) ? productosData : []));

            const catData = await InventarioService.getAttributes('categoria');
            setCategorias(catData?.content || (Array.isArray(catData) ? catData : []));

            const aromaData = await InventarioService.getAttributes('aroma');
            setAromas(aromaData?.content || (Array.isArray(aromaData) ? aromaData : []));

            const provData = await InventarioService.getAttributes('proveedor');
            setProveedores(provData?.content || (Array.isArray(provData) ? provData : []));

            const invData = await InventarioService.getAttributes('inventarios');
            setInventarios(invData?.content || (Array.isArray(invData) ? invData : []));
        } catch (error) {
        } finally {
            setCargando(false);
        }
    };

    // --- Mantenimiento Rápido de Atributos ---

    const handleAbrirModalAtributo = (entidad, etiqueta) => {
        setConfigAtributo({ entidad, etiqueta });
        setValorNuevoAtributo('');
        setMostrarModalAtributo(true);
    };

    const handleGuardarAtributo = async (e) => {
        e.preventDefault();
        if (!valorNuevoAtributo.trim()) return;

        let payload = { nombre: valorNuevoAtributo.trim() };

        if (configAtributo.entidad === 'proveedor') {
            const ruc = window.prompt("Requisito obligatorio:\nPor favor, ingrese el RUC (11 dígitos, sin letras) del Proveedor:");
            if (!ruc || ruc.replace(/\D/g, '').length !== 11) {
                toast.warning('RUC inválido. Debe proporcionar exactamente 11 números.');
                return;
            }
            payload.ruc = ruc.replace(/\D/g, '');
        }

        try {
            await InventarioService.createAttribute(configAtributo.entidad, payload);
            setMostrarModalAtributo(false);
            cargarDatos();
        } catch (error) {
            toast.error('Error al guardar atributo: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEliminarAtributo = async (entidad, idAtributo, etiqueta) => {
        if (!idAtributo) {
            toast.warning(`Seleccione un ${etiqueta} para poder eliminarlo.`);
            return;
        }
        const result = await Swal.fire({
            title: `¿Eliminar ${etiqueta}?`,
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            await InventarioService.deleteAttribute(entidad, idAtributo);
            toast.success(`${etiqueta} eliminado correctamente`);
            cargarDatos();
        }
    };

    // --- Formulario de Producto ---

    const handleCambioInput = (e) => {
        const { name, value } = e.target;
        setFormularioProducto(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo al escribir
        if (errores[name]) {
            setErrores(prev => { const copia = { ...prev }; delete copia[name]; return copia; });
        }
    };

    const handleAbrirModal = (producto = null) => {
        if (producto) {
            setModoEdicion(true);
            setFormularioProducto({
                idProducto: producto.idProducto || '',
                nombre: producto.nombre || '',
                descripcion: producto.descripcion || '',
                imagen: producto.imagen || '',
                idCategoriaProducto: producto.idCategoriaProducto || '',
                idAroma: producto.idAroma || '',
                idProveedor: producto.idProveedor || '',
                idSede: producto.idSede || '',
                cantidad: producto.cantidad || 0,
                precioCompra: producto.precioCompra || 0,
                precioVenta: producto.precioVenta || 0,
                precioMayor: producto.precioMayor || producto.precioPorMayor || 0,
                peso: producto.peso || '',
                presentacion: producto.presentacion || '',
                idInventario: producto.idInventario || '',
                estado: producto.estado || 'DISPONIBLE'
            });
        } else {
            setModoEdicion(false);
            setFormularioProducto(formularioProductoInicial);
        }
        setErrores({});
        setMostrarModal(true);
    };

    // --- Validación del formulario ---
    const validarFormulario = () => {
        const nuevosErrores = {};
        const f = formularioProducto;

        // Código
        if (!f.idProducto || !f.idProducto.trim()) {
            nuevosErrores.idProducto = 'El código del producto es obligatorio.';
        }
        // Nombre
        if (!f.nombre || !f.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre del producto es obligatorio.';
        } else if (f.nombre.trim().length > 100) {
            nuevosErrores.nombre = 'El nombre no puede exceder 100 caracteres.';
        }
        // Categoría
        if (!f.idCategoriaProducto) {
            nuevosErrores.idCategoriaProducto = 'Debe seleccionar una categoría.';
        }
        // Inventario (solo al crear)
        if (!modoEdicion && !f.idInventario) {
            nuevosErrores.idInventario = 'Debe seleccionar un inventario de destino.';
        }
        // Precio de Compra
        if (f.precioCompra === '' || f.precioCompra === null || f.precioCompra === undefined) {
            nuevosErrores.precioCompra = 'El precio de compra es obligatorio.';
        } else if (Number(f.precioCompra) < 0) {
            nuevosErrores.precioCompra = 'El precio de compra no puede ser negativo.';
        }
        // Precio de Venta
        if (f.precioVenta === '' || f.precioVenta === null || f.precioVenta === undefined) {
            nuevosErrores.precioVenta = 'El precio de venta es obligatorio.';
        } else if (Number(f.precioVenta) < 0) {
            nuevosErrores.precioVenta = 'El precio de venta no puede ser negativo.';
        }
        // Precio por Mayor (opcional, pero si se llena no puede ser negativo)
        if (f.precioMayor !== '' && f.precioMayor !== null && f.precioMayor !== undefined && Number(f.precioMayor) < 0) {
            nuevosErrores.precioMayor = 'El precio por mayor no puede ser negativo.';
        }
        // Proveedor (obligatorio solo al crear con stock > 0)
        if (!modoEdicion && Number(f.cantidad) > 0 && !f.idProveedor) {
            nuevosErrores.idProveedor = 'Debe seleccionar un proveedor si el stock inicial es mayor a 0.';
        }

        setErrores(nuevosErrores);
        return nuevosErrores;
    };

    const handleGuardar = async (e) => {
        e.preventDefault();

        const erroresValidacion = validarFormulario();
        if (Object.keys(erroresValidacion).length > 0) {
            const primerError = Object.values(erroresValidacion)[0];
            toast.warning(primerError);
            return;
        }

        try {
            // Pre-procesar el payload para que los strings vacíos viajen como nulos de JSON
            // y no causen un NumberFormatException en el Backend al parsear un Long.
            const payload = { ...formularioProducto };
            if (payload.idAroma === '') payload.idAroma = null;
            if (payload.idCategoriaProducto === '') payload.idCategoriaProducto = null;
            if (payload.idInventario === '') payload.idInventario = null;
            if (payload.idProveedor === '') payload.idProveedor = null;
            if (payload.peso === '') payload.peso = null;
            if (payload.presentacion === '') payload.presentacion = null;
            if (payload.descripcion === '') payload.descripcion = null;

            if (modoEdicion) {
                await InventarioService.update(payload);
                toast.success('Producto actualizado correctamente');
            } else {
                await InventarioService.create(payload);
                toast.success('Producto registrado correctamente');
            }
            setMostrarModal(false);
            cargarDatos();
        } catch (error) {
            manejarErrorBackend(error, setErrores);
        }
    };

    const handleEliminar = async (idProducto) => {
        const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: 'Se eliminará del catálogo permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            await InventarioService.delete(idProducto);
            toast.success('Producto eliminado correctamente');
            cargarDatos();
        }
    };

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        p.idProducto.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );

    return (
        <div className="inventario-container p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary mb-0 fw-bold"><i className="fas fa-tag me-2"></i>Catálogo de Productos</h2>
                    <p className="text-muted">Gestión avanzada de productos e inventario</p>
                </div>
                <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={() => handleAbrirModal()}>
                    <i className="fas fa-plus me-2"></i> Nuevo Producto
                </button>
            </div>

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-muted"><i className="fas fa-search"></i></span>
                        <input
                            type="text"
                            className="form-control border-start-0 shadow-none"
                            placeholder="Buscar por nombre, código o categoría..."
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th className="ps-4">Imagen</th>
                                <th>ID</th>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Precios (S/)</th>
                                <th>Estado</th>
                                <th className="text-center pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productosFiltrados.map(producto => (
                                <tr key={producto.idProducto}>
                                    <td className="ps-4">
                                        {producto.imagen ? (
                                            <img src={producto.imagen} alt="P" className="rounded border shadow-sm" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="rounded border shadow-sm bg-light d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                                <i className="fas fa-box text-muted"></i>
                                            </div>
                                        )}
                                    </td>
                                    <td className="fw-bold text-muted small">#{producto.idProducto}</td>
                                    <td>
                                        <div className="fw-bold text-dark">{producto.nombre}</div>
                                        <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>{producto.descripcion}</div>
                                    </td>
                                    <td><span className="badge bg-light text-dark border-secondary-subtle px-2 py-1">{producto.categoria || 'N/A'}</span></td>
                                    <td>
                                        <div className="small fw-bold text-success">Venta: S/ {parseFloat(producto.precioVenta || 0).toFixed(2)}</div>
                                        <div className="small text-muted mt-1">Mayor: S/ {parseFloat(producto.precioMayor || 0).toFixed(2)}</div>
                                    </td>
                                    <td>
                                        <span className={`badge rounded-pill ${producto.estado === 'DISPONIBLE'
                                            ? 'bg-success-subtle text-success border border-success'
                                            : 'bg-secondary-subtle text-secondary border border-secondary'
                                            }`}>
                                            {producto.estado}
                                        </span>
                                    </td>
                                    <td className="text-center pe-4">
                                        <div className="btn-group btn-group-sm rounded-pill overflow-hidden border shadow-sm">
                                            <button className="btn btn-white text-primary border-end" onClick={() => handleAbrirModal(producto)} title="Editar"><i className="fas fa-edit"></i></button>
                                            <button className="btn btn-white text-danger" onClick={() => handleEliminar(producto.idProducto)} title="Eliminar"><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {productosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted italic">
                                        No se encontraron productos que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Principal de Producto */}
            {mostrarModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
                            <form onSubmit={handleGuardar}>
                                <div className="modal-header bg-primary text-white py-3 px-4 border-0">
                                    <h5 className="modal-title fw-bold d-flex align-items-center">
                                        <i className={`fas ${modoEdicion ? 'fa-edit' : 'fa-plus-circle'} me-2`}></i>
                                        {modoEdicion ? 'EDITAR PRODUCTO' : 'REGISTRAR NUEVO PRODUCTO'}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setMostrarModal(false)}></button>
                                </div>
                                <div className="modal-body p-4 bg-white" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                    <div className="row g-4">
                                        {/* Cabecera del Formulario */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold text-secondary small uppercase tracking-wider">Código ID <span className="text-danger">*</span></label>
                                            <input type="text" className={`form-control bg-light border-0 py-2 shadow-none font-monospace text-uppercase ${errores.idProducto ? 'is-invalid' : ''}`} name="idProducto" value={formularioProducto.idProducto} onChange={handleCambioInput} disabled={modoEdicion} placeholder="Ej. P001" />
                                            {errores.idProducto && <div className="invalid-feedback d-block">{errores.idProducto}</div>}
                                        </div>
                                        <div className="col-md-8">
                                            <label className="form-label fw-bold text-secondary small uppercase tracking-wider">Nombre del Producto <span className="text-danger">*</span></label>
                                            <input type="text" className={`form-control bg-light border-0 py-2 shadow-none ${errores.nombre ? 'is-invalid' : ''}`} name="nombre" value={formularioProducto.nombre} onChange={handleCambioInput} placeholder="Nombre descriptivo" />
                                            {errores.nombre && <div className="invalid-feedback d-block">{errores.nombre}</div>}
                                        </div>

                                        <div className="col-md-12">
                                            <label className="form-label fw-bold text-secondary small uppercase tracking-wider">Descripción Detallada</label>
                                            <textarea className="form-control bg-light border-0 py-2 shadow-none" name="descripcion" rows="2" value={formularioProducto.descripcion} onChange={handleCambioInput} placeholder="Escriba aquí los detalles del producto..."></textarea>
                                        </div>

                                        {/* Sección de Imagen */}
                                        <div className="col-md-12">
                                            <label className="form-label fw-bold text-secondary small uppercase tracking-wider">Imagen del Producto</label>
                                            <div className="d-flex align-items-center gap-4 border-dashed border-2 p-3 rounded-4 bg-light/50">
                                                <div className="position-relative overflow-hidden group" style={{ width: '100px', height: '100px' }}>
                                                    {formularioProducto.imagen ? (
                                                        <>
                                                            <img src={formularioProducto.imagen} alt="Preview" className="w-100 h-100 object-cover rounded-3 border" />
                                                            <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle m-1" onClick={() => setFormularioProducto(prev => ({ ...prev, imagen: '' }))}>
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white border rounded-3 text-muted">
                                                            <i className="fas fa-image fa-2x mb-1"></i>
                                                            <span className="small">Sin imagen</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <input type="file" className="form-control form-control-sm shadow-none" accept="image/*" onChange={(e) => {
                                                        const archivo = e.target.files[0];
                                                        if (archivo) {
                                                            const lector = new FileReader();
                                                            lector.onloadend = () => setFormularioProducto(prev => ({ ...prev, imagen: lector.result }));
                                                            lector.readAsDataURL(archivo);
                                                        }
                                                    }} />
                                                    <p className="text-muted mb-0 mt-2 extra-small">Recomendado: JPG o PNG cuadrados, max 2MB.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Atributos del Producto */}
                                        <div className="col-12 mt-4">
                                            <div className="row g-4">
                                                <div className="col-md-4">
                                                    <SelectorAtributo
                                                        etiqueta="Categoría"
                                                        nombre="idCategoriaProducto"
                                                        valor={formularioProducto.idCategoriaProducto}
                                                        opciones={categorias}
                                                        onChange={handleCambioInput}
                                                        onAgregar={() => handleAbrirModalAtributo('categoria', 'Categoría')}
                                                        onEliminar={() => handleEliminarAtributo('categoria', formularioProducto.idCategoriaProducto, 'Categoría')}
                                                        requerido
                                                        error={errores.idCategoriaProducto}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <SelectorAtributo
                                                        etiqueta="Aroma / Fragancia"
                                                        nombre="idAroma"
                                                        valor={formularioProducto.idAroma}
                                                        opciones={aromas}
                                                        onChange={handleCambioInput}
                                                        onAgregar={() => handleAbrirModalAtributo('aroma', 'Aroma')}
                                                        onEliminar={() => handleEliminarAtributo('aroma', formularioProducto.idAroma, 'Aroma')}
                                                    />
                                                </div>

                                                {!modoEdicion && (
                                                    <div className="col-md-4">
                                                        <SelectorAtributo
                                                            etiqueta="Proveedor Inicial"
                                                            nombre="idProveedor"
                                                            valor={formularioProducto.idProveedor}
                                                            opciones={proveedores}
                                                            onChange={handleCambioInput}
                                                            onAgregar={() => handleAbrirModalAtributo('proveedor', 'Proveedor')}
                                                            onEliminar={() => handleEliminarAtributo('proveedor', formularioProducto.idProveedor, 'Proveedor')}
                                                            requerido={formularioProducto.cantidad > 0}
                                                            error={errores.idProveedor}
                                                        />
                                                    </div>
                                                )}

                                                {!modoEdicion && (
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold text-secondary small uppercase tracking-wider mb-1">
                                                            Inventario de Destino (Stock) <span className="text-danger">*</span>
                                                        </label>
                                                        <select className={`form-select form-select-sm bg-light border-0 shadow-none py-2 ${errores.idInventario ? 'is-invalid' : ''}`} name="idInventario" value={formularioProducto.idInventario} onChange={handleCambioInput}>
                                                            <option value="">-- Seleccione un Inventario --</option>
                                                            {inventarios.map((inv) => (
                                                                <option key={inv.id} value={inv.id}>
                                                                    {inv.nombre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errores.idInventario && <div className="invalid-feedback d-block">{errores.idInventario}</div>}
                                                    </div>
                                                )}
                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold text-secondary small uppercase tracking-wider mb-1">Peso</label>
                                                    <input type="text" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" name="peso" value={formularioProducto.peso} onChange={handleCambioInput} placeholder="Ej. 1KG" />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold text-secondary small uppercase tracking-wider mb-1">Presentación</label>
                                                    <input type="text" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" name="presentacion" value={formularioProducto.presentacion} onChange={handleCambioInput} placeholder="Ej. Botella, Saco..." />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Precios y Stock */}
                                        <div className="col-12 mt-4 border-top pt-4">
                                            <div className="row g-3">
                                                {!modoEdicion && (
                                                    <div className="col-md-3">
                                                        <label className="form-label fw-bold text-secondary small uppercase tracking-wider">Stock Inicial</label>
                                                        <div className="input-group shadow-sm">
                                                            <span className="input-group-text bg-white border-0"><i className="fas fa-boxes text-muted"></i></span>
                                                            <input type="number" className="form-control border-0 bg-light shadow-none" name="cantidad" value={formularioProducto.cantidad} onChange={handleCambioInput} min="0" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold text-secondary small uppercase tracking-wider">Costo Compra <span className="text-danger">*</span></label>
                                                    <div className={`input-group shadow-sm ${errores.precioCompra ? 'border border-danger rounded-2' : ''}`}>
                                                        <span className="input-group-text bg-white border-0 fw-bold">S/</span>
                                                        <input type="number" step="0.01" className="form-control border-0 bg-light shadow-none" name="precioCompra" value={formularioProducto.precioCompra} onChange={handleCambioInput} min="0" />
                                                    </div>
                                                    {errores.precioCompra && <div className="text-danger small mt-1">{errores.precioCompra}</div>}
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold text-success small uppercase tracking-wider">PV. Regular <span className="text-danger">*</span></label>
                                                    <div className={`input-group shadow-sm border ${errores.precioVenta ? 'border-danger' : 'border-success'} rounded-2 overflow-hidden`}>
                                                        <span className={`input-group-text ${errores.precioVenta ? 'bg-danger' : 'bg-success'} text-white border-0 fw-bold`}>S/</span>
                                                        <input type="number" step="0.01" className="form-control border-0 bg-white shadow-none fw-bold" name="precioVenta" value={formularioProducto.precioVenta} onChange={handleCambioInput} min="0" />
                                                    </div>
                                                    {errores.precioVenta && <div className="text-danger small mt-1">{errores.precioVenta}</div>}
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold text-secondary small uppercase tracking-wider">PV. Mayorista</label>
                                                    <div className="input-group shadow-sm">
                                                        <span className="input-group-text bg-white border-0 fw-bold">S/</span>
                                                        <input type="number" step="0.01" className="form-control border-0 bg-light shadow-none" name="precioMayor" value={formularioProducto.precioMayor} onChange={handleCambioInput} min="0" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Estado */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold text-secondary small uppercase tracking-wider">Estado del Catálogo</label>
                                            <select className="form-select border-0 bg-light shadow-none" name="estado" value={formularioProducto.estado} onChange={handleCambioInput}>
                                                <option value="DISPONIBLE">DISPONIBLE</option>
                                                <option value="NO DISPONIBLE">NO DISPONIBLE</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light px-4 py-3 border-0">
                                    <button type="button" className="btn btn-link text-secondary text-decoration-none fw-bold px-4" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary px-5 py-2 fw-bold shadow-lg rounded-pill">
                                        {modoEdicion ? 'GUARDAR CAMBIOS' : 'REGISTRAR PRODUCTO'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Mantenimiento Rápido de Atributo */}
            {mostrarModalAtributo && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <form onSubmit={handleGuardarAtributo}>
                                <div className="modal-header bg-dark text-white py-2 px-3 border-0">
                                    <h6 className="modal-title d-flex align-items-center"><i className="fas fa-plus-circle me-2"></i>Nuevo {configAtributo.etiqueta}</h6>
                                    <button type="button" className="btn-close btn-close-white btn-sm shadow-none" onClick={() => setMostrarModalAtributo(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted uppercase">Nombre / Descripción</label>
                                        <input
                                            type="text"
                                            className="form-control border-0 border-bottom rounded-0 py-2 shadow-none px-0"
                                            required
                                            autoFocus
                                            value={valorNuevoAtributo}
                                            onChange={(e) => setValorNuevoAtributo(e.target.value)}
                                            placeholder="..."
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0 justify-content-center pb-4">
                                    <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold rounded-pill shadow">Añadir Ahora</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente interno para los selectores de atributos con mantenimiento rápido
const SelectorAtributo = ({ etiqueta, nombre, valor, opciones, onChange, onAgregar, onEliminar, requerido = false, error }) => (
    <div className="attribute-group">
        <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="form-label fw-bold text-secondary small uppercase tracking-wider mb-0">
                {etiqueta} {requerido && <span className="text-danger">*</span>}
            </label>
            <div className="btn-toolbar">
                <button type="button" className="btn btn-link text-success p-0 text-decoration-none me-2" onClick={onAgregar} title="Agregar Nuevo">
                    <i className="fas fa-plus-circle"></i>
                </button>
                <button type="button" className="btn btn-link text-danger p-0 text-decoration-none" onClick={onEliminar} title="Eliminar Seleccionado">
                    <i className="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
        <select className={`form-select border-0 bg-light py-2 shadow-none ${error ? 'is-invalid' : ''}`} name={nombre} value={valor} onChange={onChange}>
            <option value="">Seleccione...</option>
            {opciones.map(opcion => <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>)}
        </select>
        {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
);

export default Producto;
