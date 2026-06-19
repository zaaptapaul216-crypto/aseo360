import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inventario.css';
import { InventarioService } from '../../services/InventarioService';

const Inventario = () => {
    const navigate = useNavigate();

    // Estado nivel 1: Inventarios (Almacenes)
    const [inventarios, setInventarios] = useState([]);
    const [cargandoInventarios, setCargandoInventarios] = useState(true);

    useEffect(() => {
        cargarInventarios();
    }, []);

    const cargarInventarios = async () => {
        try {
            setCargandoInventarios(true);
            const res = await InventarioService.getInventariosList();
            setInventarios(res || []);
        } catch (error) {
            setInventarios([]);
        } finally {
            setCargandoInventarios(false);
        }
    };

    const verProductosDeInventario = (inventario) => {
        navigate(`/inventario/productos/${inventario.idInventario}`, { state: { inventario } });
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary mb-0 fw-bold"><i className="fas fa-network-wired me-2"></i>Mis Almacenes / Inventarios</h2>
                    <p className="text-muted">Seleccione un inventario para explorar sus existencias físicas</p>
                </div>
                <button className="btn btn-outline-primary" onClick={cargarInventarios} disabled={cargandoInventarios}>
                    <i className={`fas fa-sync-alt me-2 ${cargandoInventarios ? 'fa-spin' : ''}`}></i> Actualizar
                </button>
            </div>

            <div className="row g-4">
                {cargandoInventarios ? (
                    <div className="col-12 text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : inventarios.length > 0 ? (
                    inventarios.map(inv => (
                        <div className="col-12 col-md-6 col-lg-4" key={inv.idInventario}>
                            <div
                                className="card shadow border-0 h-100 transition-hover"
                                style={{ borderRadius: '15px', cursor: 'pointer', overflow: 'hidden' }}
                                onClick={() => verProductosDeInventario(inv)}
                            >
                                <div className={`card-header text-white border-0 py-4 ${inv.tipo === 'TIENDA' ? 'bg-info' : 'bg-primary'}`}>
                                    <div className="d-flex align-items-center">
                                        <i className={`fas ${inv.tipo === 'TIENDA' ? 'fa-store' : 'fa-building'} fa-2x me-3 opacity-75`}></i>
                                        <h4 className="mb-0 fw-bold">{inv.nombre}</h4>
                                    </div>
                                </div>
                                <div className="card-body bg-light">
                                    <div className="mb-2">
                                        <span className="badge bg-secondary mb-2 px-2 py-1">
                                            <i className="fas fa-tag me-1"></i>
                                            Tipo: {inv.tipo}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center mt-3">
                                        <div className="bg-white rounded p-2 me-3 shadow-sm border">
                                            <i className="fas fa-map-marker-alt text-danger"></i>
                                        </div>
                                        <div>
                                            <p className="mb-0 text-muted small fw-bold text-uppercase">Pertenece a la Sede</p>
                                            <p className="mb-0 fw-bold text-dark">{inv.sede?.nombre || 'General'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-white border-top-0 text-center py-3 pb-4">
                                    <span className="text-primary fw-bold" style={{ fontSize: '1.1rem' }}>
                                        Ver Productos <i className="fas fa-arrow-right ms-2"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <i className="fas fa-warehouse fa-3x text-muted mb-3 opacity-50"></i>
                        <h4 className="text-muted fw-bold">No hay almacenes registrados</h4>
                        <p className="text-secondary">Póngase en contacto con un administrador para crear sedes e inventarios.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventario;
