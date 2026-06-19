import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { InventarioService } from '../../services/InventarioService';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const InventarioProductos = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener los datos del inventario de forma segura desde el estado del router
    const [inventario, setInventario] = useState(location.state?.inventario || {
        idInventario: id,
        nombre: 'Cargando...',
        tipo: 'ALMACEN',
        sede: { nombre: 'General' }
    });

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargandoProductos, setCargandoProductos] = useState(true);
    const [sincronizando, setSincronizando] = useState(false);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    useEffect(() => {
        cargarDetalles();
    }, [id]);

    const cargarDetalles = async () => {
        try {
            setCargandoProductos(true);

            // Si el nombre no vino en el state (ej. acceso directo a URL), lo intentamos obtener
            if (!location.state?.inventario) {
                // Recuperar el nombre del inventario pidiendo la lista
                const invList = await InventarioService.getInventariosList();
                const currentInv = invList.find(i => i.idInventario == id);
                if (currentInv) setInventario(currentInv);
            }

            const [resProd, resCat] = await Promise.all([
                InventarioService.getProductosPorInventario(id),
                InventarioService.getAttributes('categoria')
            ]);

            setProductos(resProd || []);
            setCategorias(resCat?.content || (Array.isArray(resCat) ? resCat : []));
        } catch (error) {
        } finally {
            setCargandoProductos(false);
        }
    };

    const volverAInventarios = () => {
        navigate('/inventario');
    };

    const handleSincronizar = async () => {
        const result = await Swal.fire({
            title: '¿Sincronizar catálogo?',
            text: 'Se añadirán los productos faltantes con stock 0.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, sincronizar',
            cancelButtonText: 'Cancelar'
        });
        if (!result.isConfirmed) return;

        try {
            setSincronizando(true);
            await InventarioService.sincronizarCatalogo(id);
            toast.success('Sincronización completada exitosamente.');
            await cargarDetalles();
        } catch (error) {
            toast.error('Error al sincronizar el catálogo.');
        } finally {
            setSincronizando(false);
        }
    };

    const obtenerInsigniaStock = (cantidad) => {
        if (cantidad <= 0) return 'bg-danger';
        if (cantidad <= 10) return 'bg-warning text-dark';
        return 'bg-success';
    };

    const productosFiltrados = productos.filter(ip =>
        ip.producto?.nombre?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        ip.producto?.idProducto?.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button className="btn btn-sm btn-secondary mb-2 rounded-pill px-3 shadow-sm" onClick={volverAInventarios}>
                        <i className="fas fa-arrow-left me-2"></i>Volver a mis Inventarios
                    </button>
                    <h2 className="text-primary mb-0 fw-bold d-flex align-items-center mt-2">
                        <i className={`fas ${inventario.tipo === 'TIENDA' ? 'fa-store' : 'fa-building'} me-3 display-6`}></i>
                        <div>
                            Existencias de {inventario.nombre}
                            <div className="fs-6 text-muted fw-normal mt-1">Listado físico de la sede: {inventario.sede?.nombre || 'General'}</div>
                        </div>
                    </h2>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <button className="btn btn-outline-success" onClick={handleSincronizar} disabled={cargandoProductos || sincronizando}>
                        <i className={`fas fa-cloud-download-alt me-2 ${sincronizando ? 'fa-beat' : ''}`}></i> Sincronizar Catálogo
                    </button>
                    <button className="btn btn-outline-primary" onClick={cargarDetalles} disabled={cargandoProductos || sincronizando}>
                        <i className={`fas fa-sync-alt me-2 ${cargandoProductos && !sincronizando ? 'fa-spin' : ''}`}></i> Actualizar
                    </button>
                </div>
            </div>

            <div className="card shadow-sm border-0 mb-4 bg-light">
                <div className="card-body">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0"><i className="fas fa-search text-muted"></i></span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Buscar producto en este inventario por nombre o código SKU..."
                            value={terminoBusqueda}
                            onChange={e => setTerminoBusqueda(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {cargandoProductos ? (
                    <div className="col-12 text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : productosFiltrados.length > 0 ? (
                    productosFiltrados.map(ip => (
                        <div className="col-12 col-md-6 col-lg-4" key={`${ip.producto.idProducto}`}>
                            <div className="card shadow-sm border-0 h-100 transition-hover" style={{ borderRadius: '12px', borderTop: `4px solid ${ip.stock <= 0 ? '#dc3545' : ip.stock <= 10 ? '#ffc107' : '#198754'}` }}>
                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h5 className="fw-bold mb-1 text-dark" style={{ lineHeight: '1.2' }}>{ip.producto.nombre}</h5>
                                            <span className="text-muted small fw-semibold">SKU: {ip.producto.idProducto}</span>
                                        </div>
                                        <div className="text-end">
                                            <span className={`badge ${obtenerInsigniaStock(ip.stock)} rounded-pill fs-6 shadow-sm`} style={{ minWidth: '50px' }}>
                                                {ip.stock}
                                            </span>
                                            <div className="small text-muted fw-bold mt-1">
                                                {ip.stock <= 0 ? 'Agotado' : 'Disp.'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3 d-flex flex-wrap gap-2">
                                        <span className="badge bg-light text-dark border px-2 py-1">
                                            <i className="fas fa-tag me-1 text-secondary"></i>
                                            {categorias.find(c => c.id == ip.producto.idCategoriaProducto)?.nombre || ip.producto.categoria || 'General'}
                                        </span>
                                        {ip.producto.peso && (
                                            <span className="badge bg-light text-dark border px-2 py-1">
                                                <i className="fas fa-weight-hanging me-1 text-secondary"></i>
                                                {ip.producto.peso}
                                            </span>
                                        )}
                                        {ip.producto.presentacion && (
                                            <span className="badge bg-light text-dark border px-2 py-1">
                                                <i className="fas fa-box me-1 text-secondary"></i>
                                                {ip.producto.presentacion}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-3 border-top">
                                        <div className="row g-2 text-center">
                                            <div className="col-4 border-end">
                                                <div className="small text-muted mb-1" style={{ fontSize: '0.75rem' }}>P. Compra</div>
                                                <div className="fw-bold text-dark">S/ {ip.producto.precioCompra?.toFixed(2) || '0.00'}</div>
                                            </div>
                                            <div className="col-4 border-end">
                                                <div className="small text-muted mb-1" style={{ fontSize: '0.75rem' }}>P. Venta</div>
                                                <div className="fw-bold text-success">S/ {ip.producto.precioVenta?.toFixed(2) || '0.00'}</div>
                                            </div>
                                            <div className="col-4">
                                                <div className="small text-muted mb-1" style={{ fontSize: '0.75rem' }}>P. Mayor</div>
                                                <div className="fw-bold text-primary">S/ {ip.producto.precioPorMayor?.toFixed(2) || '0.00'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <i className="fas fa-box-open fa-3x text-muted mb-3 opacity-50"></i>
                        <h4 className="text-muted fw-bold">Inventario Vacío o sin coincidencias</h4>
                        <p className="text-secondary">No hay productos que mostrar bajo estos criterios en {inventario.nombre}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventarioProductos;
