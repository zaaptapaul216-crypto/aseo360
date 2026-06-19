import React, { useState, useEffect } from 'react';
import { InventarioService } from '../../services/InventarioService';
import { KardexService } from '../../services/KardexService';

const Kardex = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtro, setFiltro] = useState({ idProducto: '', tipo: '' });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        cargarDatos(page);
    }, [page]);

    const cargarDatos = async (paginaActual = 0) => {
        try {
            setCargando(true);
            const response = await KardexService.getAll(paginaActual, 15);
            const prods = await InventarioService.getAll();

            setMovimientos(response?.content || []);
            setTotalPages(response?.totalPages || 0);

            setProductos(prods?.content || (Array.isArray(prods) ? prods : []));
        } catch (error) {
        } finally {
            setCargando(false);
        }
    };

    const obtenerNombreProducto = (idOProducto) => {
        // Soporta si m.producto viene como objeto desde Backend o como ID local
        if (idOProducto && typeof idOProducto === 'object') return idOProducto.nombre;
        return productos.find(p => p.idProducto === idOProducto)?.nombre || idOProducto;
    };

    const movimientosFiltrados = movimientos.filter(m => {
        const prodMatch = m.producto?.idProducto || m.idProducto;
        return (filtro.idProducto === '' || prodMatch === filtro.idProducto) &&
            (filtro.tipo === '' || m.tipoMovimiento === filtro.tipo);
    });

    const esMovimientoPositivo = (tipo) => {
        if (!tipo) return false;
        const t = tipo.toUpperCase();
        return t.includes('INGRESO') ||
            t.includes('ENTRADA') ||
            t.includes('DEVOLUCION') ||
            t.includes('COMPRA') ||
            t.includes('POSITIVO');
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary mb-0 fw-bold"><i className="fas fa-history me-2"></i>Kárdex de Movimientos</h2>
                    <p className="text-muted">Historial detallado de entradas, salidas y transferencias (Últimos movimientos)</p>
                </div>
                <button className="btn btn-outline-primary shadow-sm" onClick={() => cargarDatos(page)}>
                    <i className="fas fa-sync-alt me-2"></i> Refrescar
                </button>
            </div>

            {/* Filtros */}
            <div className="card shadow-sm border-0 mb-4 bg-light">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-5">
                            <label className="form-label small fw-bold">Filtrar por Producto:</label>
                            <select
                                className="form-select border-0 shadow-none"
                                value={filtro.idProducto}
                                onChange={e => setFiltro({ ...filtro, idProducto: e.target.value })}
                            >
                                <option value="">Todos los productos</option>
                                {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.idProducto} - {p.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Tipo Movimiento:</label>
                            <select
                                className="form-select border-0 shadow-none"
                                value={filtro.tipo}
                                onChange={e => setFiltro({ ...filtro, tipo: e.target.value })}
                            >
                                <option value="">Todos</option>
                                <option value="INGRESO">INGRESO</option>
                                <option value="ENTRADA_INICIAL">ENTRADA INICIAL</option>
                                <option value="SALIDA">SALIDA</option>
                                <option value="TRASLADO_ENTRADA">TRASLADO ENTRADA</option>
                                <option value="TRASLADO_SALIDA">TRASLADO SALIDA</option>
                            </select>
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button className="btn btn-secondary w-100" onClick={() => setFiltro({ idProducto: '', tipo: '' })}>
                                <i className="fas fa-eraser me-2"></i> Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Resultados */}
            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th className="ps-4">Fecha / Hora</th>
                                <th>Producto</th>
                                <th>Tipo</th>
                                <th className="text-center">Cant.</th>
                                <th className="text-center">Stock Ant.</th>
                                <th className="text-center">Stock Actual</th>
                                <th>Referencia</th>
                                <th>Proveedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientosFiltrados.map((m, idx) => (
                                <tr key={m.idKardex || idx}>
                                    <td className="ps-4 small">
                                        {new Date(m.fecha).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td>
                                        <div className="fw-bold">{m.producto?.nombre || obtenerNombreProducto(m.idProducto)}</div>
                                        <div className="extra-small text-muted">ID: {m.producto?.idProducto || m.idProducto}</div>
                                    </td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 py-1 ${esMovimientoPositivo(m.tipoMovimiento) ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}`}>
                                            {m.tipoMovimiento}
                                        </span>
                                    </td>
                                    <td className={`text-center fw-bold ${esMovimientoPositivo(m.tipoMovimiento) ? 'text-success' : 'text-danger'}`}>
                                        {esMovimientoPositivo(m.tipoMovimiento) ? '+' : '-'}{m.cantidad}
                                    </td>
                                    <td className="text-center text-muted">{m.stockAnterior}</td>
                                    <td className="text-center fw-bold text-primary">{m.stockActual}</td>
                                    <td className="small">
                                        <div className="text-muted italic">{m.referencia}</div>
                                    </td>
                                    <td className="small">
                                        <div className="fw-bold text-secondary">{m.proveedor?.nombre || '-'}</div>
                                    </td>
                                </tr>
                            ))}
                            {movimientosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-muted">
                                        <i className="fas fa-search fa-3x mb-3 opacity-25"></i>
                                        <p className="mb-0">No se encontraron movimientos registrados.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Controles de Paginación */}
                {totalPages > 0 && (
                    <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0}>
                            <i className="fas fa-chevron-left me-1"></i> Anterior
                        </button>
                        <span className="text-muted small fw-bold">Página {page + 1} de {totalPages}</span>
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages - 1}>
                            Siguiente <i className="fas fa-chevron-right ms-1"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Kardex;
