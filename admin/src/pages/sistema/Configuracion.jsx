import React, { useState, useEffect } from 'react';
import { InventarioService } from '../../services/InventarioService';
import { ConfiguracionService } from '../../services/ConfiguracionService';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import './Configuracion.css';

const Configuracion = () => {
    const [activeTab, setActiveTab] = useState('categoria'); // categoria, aroma, proveedor, sede, unidad, asistencia
    const [items, setItems] = useState([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemRuc, setNewItemRuc] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Estado específico para Asistencia
    const [asistenciaConfig, setAsistenciaConfig] = useState({
        horaEntrada: { idConfiguracion: null, valor: '08:00' },
        horaSalida: { idConfiguracion: null, valor: '18:00' },
        tolerancia: { idConfiguracion: null, valor: '15' }
    });

    const tabs = [
        { id: 'categoria', label: 'Categorías', icon: 'fa-tags' },
        { id: 'aroma', label: 'Aromas', icon: 'fa-wind' },
        { id: 'proveedor', label: 'Proveedores', icon: 'fa-truck' },
        { id: 'sede', label: 'Sedes / Almacenes', icon: 'fa-warehouse' },
        { id: 'asistencia', label: 'Asistencia y Horarios', icon: 'fa-clock' }
    ];

    useEffect(() => {
        loadItems();
    }, [activeTab]);

    const loadItems = async () => {
        setLoading(true);
        if (activeTab === 'asistencia') {
            await cargarConfiguracionAsistencia();
        } else {
            const data = await InventarioService.getAttributes(activeTab);
            setItems(data);
        }
        setLoading(false);
    };

    const cargarConfiguracionAsistencia = async () => {
        try {
            const data = await ConfiguracionService.getAll();
            const configMap = {};
            const contentArray = data?.content || (Array.isArray(data) ? data : []);

            contentArray.forEach(c => { configMap[c.clave] = c; });

            setAsistenciaConfig({
                horaEntrada: {
                    idConfiguracion: configMap['ASISTENCIA_HORA_ENTRADA']?.idConfiguracion || null,
                    valor: configMap['ASISTENCIA_HORA_ENTRADA']?.valor || '08:00'
                },
                horaSalida: {
                    idConfiguracion: configMap['ASISTENCIA_HORA_SALIDA']?.idConfiguracion || null,
                    valor: configMap['ASISTENCIA_HORA_SALIDA']?.valor || '18:00'
                },
                tolerancia: {
                    idConfiguracion: configMap['ASISTENCIA_TOLERANCIA']?.idConfiguracion || null,
                    valor: configMap['ASISTENCIA_TOLERANCIA']?.valor || '15'
                }
            });
        } catch (error) {
        }
    };

    const guardarConfiguracionAsistencia = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await ConfiguracionService.saveOrUpdate(asistenciaConfig.horaEntrada.idConfiguracion, 'ASISTENCIA_HORA_ENTRADA', asistenciaConfig.horaEntrada.valor, 'Hora Oficial de Ingreso');
            await ConfiguracionService.saveOrUpdate(asistenciaConfig.horaSalida.idConfiguracion, 'ASISTENCIA_HORA_SALIDA', asistenciaConfig.horaSalida.valor, 'Hora Oficial de Salida');
            await ConfiguracionService.saveOrUpdate(asistenciaConfig.tolerancia.idConfiguracion, 'ASISTENCIA_TOLERANCIA', asistenciaConfig.tolerancia.valor, 'Minutos de Tolerancia permitidos');
            toast.success('Horarios de asistencia guardados correctamente');
            await loadItems();
        } catch (error) {
            toast.error('Error al guardar horarios: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        if (activeTab === 'proveedor') {
            if (!newItemRuc || newItemRuc.length !== 11) {
                toast.warning('El RUC del Proveedor debe tener exactamente 11 dígitos');
                return;
            }
        }

        try {
            const payload = activeTab === 'proveedor'
                ? { nombre: newItemName, ruc: newItemRuc }
                : { nombre: newItemName };

            await InventarioService.createAttribute(activeTab, payload);
            setNewItemName('');
            setNewItemRuc('');
            setShowAddModal(false);
            loadItems();
        } catch (error) {
            toast.error('Error al registrar: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar este elemento?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            await InventarioService.deleteAttribute(activeTab, id);
            toast.success('Eliminado correctamente');
            loadItems();
        }
    };

    const handleToggleEstadoSede = async (id) => {
        try {
            await InventarioService.cambiarEstadoSede(id);
            toast.success('Estado de sede actualizado');
            loadItems();
        } catch (error) {
            toast.error('Error al cambiar estado: ' + (error.response?.data || error.message));
        }
    };

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 config-title fw-bold" style={{ color: '#094e8a' }}>
                <i className="fas fa-cogs me-2"></i>CONFIGURACIÓN DEL SISTEMA
            </h2>

            <div className="row g-4">
                {/* Sidebar Menu */}
                <div className="col-md-3">
                    <div className="list-group shadow-sm border-0 rounded-3 overflow-hidden">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`list-group-item list-group-item-action border-0 py-3 px-4 d-flex align-items-center ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={`fas ${tab.icon} me-3 fa-fw`}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="col-md-9">
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h5>
                            {activeTab !== 'asistencia' && (
                                <button className="btn btn-primary btn-sm px-3 shadow-sm" onClick={() => setShowAddModal(true)}>
                                    <i className="fas fa-plus me-2"></i>Agregar
                                </button>
                            )}
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                    <p className="mt-2 text-muted">Cargando...</p>
                                </div>
                            ) : activeTab === 'asistencia' ? (
                                <div className="p-4 bg-light">
                                    <form onSubmit={guardarConfiguracionAsistencia} className="row g-4 bg-white p-4 shadow-sm rounded-3 border">

                                        <div className="col-12 mb-2">
                                            <h6 className="fw-bold text-primary border-bottom pb-2">
                                                <i className="fas fa-user-clock me-2"></i>Reglas y Controles de Ingreso
                                            </h6>
                                            <p className="small text-muted mb-0">Esta parametrización definirá cuándo el sistema marca automáticamente una Asistencia como "Tardanza".</p>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-dark small">Hora Estándar de Entrada</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white"><i className="fas fa-sign-in-alt text-success"></i></span>
                                                <input
                                                    type="time"
                                                    className="form-control"
                                                    required
                                                    value={asistenciaConfig.horaEntrada.valor}
                                                    onChange={e => setAsistenciaConfig(prev => ({ ...prev, horaEntrada: { ...prev.horaEntrada, valor: e.target.value } }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-dark small">Hora Estándar de Salida</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white"><i className="fas fa-sign-out-alt text-danger"></i></span>
                                                <input
                                                    type="time"
                                                    className="form-control"
                                                    required
                                                    value={asistenciaConfig.horaSalida.valor}
                                                    onChange={e => setAsistenciaConfig(prev => ({ ...prev, horaSalida: { ...prev.horaSalida, valor: e.target.value } }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6 border-end">
                                            <label className="form-label fw-bold text-dark small">Minutos Extra de Tolerancia</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white"><i className="fas fa-stopwatch text-warning"></i></span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="0"
                                                    step="1"
                                                    required
                                                    value={asistenciaConfig.tolerancia.valor}
                                                    onChange={e => setAsistenciaConfig(prev => ({ ...prev, tolerancia: { ...prev.tolerancia, valor: e.target.value } }))}
                                                />
                                                <span className="input-group-text bg-light text-muted small">Mins</span>
                                            </div>
                                            <div className="form-text small">Tiempo de gracia tras la hora de entrada antes de aplicar tardanza.</div>
                                        </div>

                                        <div className="col-md-6 d-flex align-items-end justify-content-end">
                                            <button type="submit" className="btn btn-primary px-4 py-2 w-100 shadow-sm fw-bold">
                                                <i className="fas fa-save me-2"></i>Guardar Reglas de Asistencia
                                            </button>
                                        </div>

                                    </form>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4" style={{ width: '80px' }}>ID</th>
                                                <th>Nombre / Descripción</th>
                                                {activeTab === 'sede' && <th className="text-center" style={{ width: '120px' }}>Estado</th>}
                                                <th className="text-center pe-4" style={{ width: '120px' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="ps-4 text-muted">#{item.id}</td>
                                                    <td className="fw-medium">{item.nombre}</td>
                                                    {activeTab === 'sede' && (
                                                        <td className="text-center">
                                                            <span className={`badge rounded-pill ${item.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`}>
                                                                {item.estado || 'ACTIVO'}
                                                            </span>
                                                        </td>
                                                    )}
                                                    <td className="text-center pe-4">
                                                        <div className="d-flex gap-1 justify-content-center">
                                                            {activeTab === 'sede' && (
                                                                <button
                                                                    className={`btn btn-sm rounded-pill ${item.estado === 'ACTIVO' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                                    onClick={() => handleToggleEstadoSede(item.id)}
                                                                    title={item.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                                                                >
                                                                    <i className={`fas ${item.estado === 'ACTIVO' ? 'fa-ban' : 'fa-check-circle'}`}></i>
                                                                </button>
                                                            )}
                                                            {activeTab !== 'sede' && (
                                                                <button
                                                                    className="btn btn-outline-danger btn-sm rounded-pill"
                                                                    onClick={() => handleDelete(item.id)}
                                                                    title="Eliminar"
                                                                >
                                                                    <i className="fas fa-trash-alt"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan={activeTab === 'sede' ? 4 : 3} className="text-center py-5 text-muted">
                                                        No hay datos registrados en esta categoría.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para Agregar */}
            {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <form onSubmit={handleAdd}>
                                <div className="modal-header bg-dark text-white">
                                    <h5 className="modal-title">
                                        Agregar Nuevo: {tabs.find(t => t.id === activeTab)?.label}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            {activeTab === 'proveedor' ? 'Nombre o Razón Social' : 'Nombre / Descripción'}
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            autoFocus
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            placeholder="Ingrese el nombre"
                                        />
                                    </div>

                                    {activeTab === 'proveedor' && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">RUC (11 dígitos, sin espacios)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                maxLength="11"
                                                minLength="11"
                                                value={newItemRuc}
                                                // .replace(/\D/g, '') limpia letras y otros caracteres, forzando solo números
                                                onChange={(e) => setNewItemRuc(e.target.value.replace(/\D/g, ''))}
                                                placeholder="Ej. 10123456789"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary px-4">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Configuracion;
