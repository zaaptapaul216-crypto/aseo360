import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Clientes.css';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { ClienteService } from '../../services/ClienteService';
import { ClienteTiendaService } from '../../services/ClienteTiendaService';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const elementosPorPagina = 6;

    // Modales
    const [mostrarModalFormulario, setMostrarModalFormulario] = useState(false);
    const [mostrarModalContrasena, setMostrarModalContrasena] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [formulario, setFormulario] = useState({
        nombreCompleto: '',
        dni: '',
        correo: '',
        numeroCelular: '',
        direccion: '',
        origen: 'pos'
    });

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            const [onlineData, posData] = await Promise.all([
                ClienteService.getAll().catch(() => []),
                ClienteTiendaService.getAll().catch(() => [])
            ]);

            const clientesOnlineFormateados = (onlineData || []).map(c => ({
                ...c,
                origen: c.origen || 'tienda'
            }));

            const clientesPosFormateados = (posData || []).map(c => ({
                id: c.idClienteTienda,
                nombreCompleto: c.nombreCompleto,
                dni: c.dni,
                correo: c.correo,
                numeroCelular: null,
                direccion: c.direccion,
                origen: 'pos'
            }));

            setClientes([...clientesOnlineFormateados, ...clientesPosFormateados]);
        } catch (error) {
            setClientes([]);
        }
    };

    // --- ACCIONES ---

    const handleEditar = (cliente) => {
        setClienteSeleccionado(cliente);
        setFormulario({ ...cliente });
        setMostrarModalFormulario(true);
    };

    const handleEditarContrasena = (cliente) => {
        setClienteSeleccionado(cliente);
        setNuevaContrasena('');
        setMostrarModalContrasena(true);
    };

    const handleEliminar = async (cliente) => {
        const r = await Swal.fire({ title: '¿Eliminar este cliente?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí', cancelButtonText: 'No' });
        if (r.isConfirmed) {
            try {
                if (cliente.origen === 'pos') {
                    await ClienteTiendaService.delete(cliente.id);
                } else {
                    await ClienteService.delete(cliente.id);
                }
                cargarClientes();
                toast.success('Cliente eliminado correctamente');
            } catch (error) {
                toast.error('Ocurrió un error al eliminar el cliente.');
            }
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();

        // Validación de longitud (8 para DNI o 11 para RUC)
        const docLength = formulario.dni?.trim().length;
        if (docLength !== 8 && docLength !== 11) {
            toast.warning('El documento debe ser un DNI (8 dígitos) o RUC (11 dígitos).');
            return;
        }

        try {
            if (clienteSeleccionado) {
                if (clienteSeleccionado.origen === 'pos') {
                    await ClienteTiendaService.update({
                        idClienteTienda: clienteSeleccionado.id,
                        nombreCompleto: formulario.nombreCompleto,
                        dni: formulario.dni,
                        correo: formulario.correo || null,
                        direccion: formulario.direccion || null
                    });
                } else {
                    await ClienteService.update(clienteSeleccionado.id, formulario);
                }
            } else {
                await ClienteService.create(formulario);
            }
            setMostrarModalFormulario(false);
            cargarClientes();
            toast.success('Cliente guardado correctamente');
        } catch (error) {
            toast.error(error.message || 'Se produjo un error al intentar guardar el cliente. Verifique los datos.');
        }
    };

    const handleGuardarContrasena = async (e) => {
        e.preventDefault();
        try {
            if (clienteSeleccionado) {
                await ClienteService.update(clienteSeleccionado.id, { password: nuevaContrasena });
                toast.success('Contraseña actualizada correctamente.');
            }
            setMostrarModalContrasena(false);
            cargarClientes();
        } catch (error) {
            toast.error('Ocurrió un error al actualizar la contraseña.');
        }
    };

    // --- EXPORTACIÓN ---

    const handleExportarExcel = () => {
        const datos = clientesFiltrados.map(c => ({
            ID: c.id,
            Nombre: c.nombreCompleto,
            DNI: c.dni,
            Correo: c.correo,
            Dirección: c.direccion,
            Origen: c.origen.toUpperCase()
        }));
        const ws = XLSX.utils.json_to_sheet(datos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Clientes");
        XLSX.writeFile(wb, "Reporte_Clientes.xlsx");
    };

    const handleExportarPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Clientes", 14, 15);
        doc.autoTable({
            head: [['ID', 'Nombre', 'DNI/RUC', 'Correo', 'Origen']],
            body: clientesFiltrados.map(c => [c.id, c.nombreCompleto, c.dni, c.correo || '-', c.origen.toUpperCase()]),
            startY: 20
        });
        doc.save("Reporte_Clientes.pdf");
    };

    // --- FILTRADO Y PAGINACIÓN ---

    const clientesFiltrados = clientes.filter(c => {
        const coincideFiltro = filtro === 'todos' || c.origen === filtro;
        const coincideBusqueda = c.nombreCompleto.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            c.dni.includes(terminoBusqueda);
        return coincideFiltro && coincideBusqueda;
    });

    const totalPaginas = Math.ceil(clientesFiltrados.length / elementosPorPagina);
    const elementosActuales = clientesFiltrados.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina);

    const obtenerBadgeOrigen = (origen) => {
        return origen === 'tienda'
            ? <span className="badge bg-primary"><i className="fas fa-globe me-1"></i>Online</span>
            : <span className="badge" style={{ backgroundColor: '#B6E300', color: '#000' }}><i className="fas fa-store me-1"></i>Tienda</span>;
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <h2 style={{ color: '#094e8a', fontWeight: '800' }}>
                    <i className="fas fa-users me-2"></i>GESTIÓN DE CLIENTES
                </h2>
                {/* Botón "Nuevo Cliente" eliminado según solicitud del usuario */}
                <div className="btn-group shadow-sm">
                    <button className={`btn ${filtro === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setFiltro('todos'); setPaginaActual(1); }}>Todos</button>
                    <button className={`btn ${filtro === 'tienda' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setFiltro('tienda'); setPaginaActual(1); }}>Online</button>
                    <button className={`btn ${filtro === 'pos' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setFiltro('pos'); setPaginaActual(1); }}>Tienda</button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="card shadow-sm border-0 mb-4 no-print">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Buscar por nombre o DNI..."
                                    value={terminoBusqueda}
                                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            <button className="btn btn-outline-success me-2" onClick={handleExportarExcel} title="Excel">
                                <i className="fas fa-file-excel"></i>
                            </button>
                            <button className="btn btn-outline-danger me-2" onClick={handleExportarPDF} title="PDF">
                                <i className="fas fa-file-pdf"></i>
                            </button>
                            <button className="btn btn-outline-dark" onClick={() => window.print()} title="Imprimir">
                                <i className="fas fa-print"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th className="ps-4">Cliente</th>
                                    <th>DNI/RUC</th>
                                    <th>Correo</th>
                                    <th>Dirección</th>
                                    <th>Origen</th>
                                    <th className="text-center pe-4 no-print">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {elementosActuales.map((cliente) => (
                                    <tr key={cliente.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                {cliente.fotoPerfil ? (
                                                    <img src={cliente.fotoPerfil} alt="" className="rounded-circle me-3 shadow-sm" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="rounded-circle me-3 bg-light d-flex align-items-center justify-content-center border shadow-sm" style={{ width: '40px', height: '40px' }}>
                                                        <i className="fas fa-user text-secondary"></i>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="fw-bold">{cliente.nombreCompleto}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{cliente.dni}</td>
                                        <td>
                                            <span><i className="fas fa-envelope me-1 text-muted"></i>{cliente.correo || '-'}</span>
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: '200px' }} title={cliente.direccion}>
                                            {cliente.direccion || '-'}
                                        </td>
                                        <td>{obtenerBadgeOrigen(cliente.origen)}</td>
                                        <td className="text-center pe-4 no-print">
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-primary" onClick={() => handleEditar(cliente)} title="Editar Información">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                {cliente.origen === 'tienda' && (
                                                    <button className="btn btn-outline-warning" onClick={() => handleEditarContrasena(cliente)} title="Cambiar Contraseña">
                                                        <i className="fas fa-key"></i>
                                                    </button>
                                                )}
                                                <button className="btn btn-outline-danger" onClick={() => handleEliminar(cliente)} title="Eliminar">
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card-footer bg-white py-3">
                    <div className="row align-items-center">
                        <div className="col-md-6 text-muted small">
                            Mostrando {elementosActuales.length} de {clientesFiltrados.length} clientes
                        </div>
                        <div className="col-md-6">
                            <nav className="no-print d-flex justify-content-end">
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setPaginaActual(paginaActual - 1)}>Ant.</button>
                                    </li>
                                    {[...Array(totalPaginas)].map((_, i) => (
                                        <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setPaginaActual(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setPaginaActual(paginaActual + 1)}>Sig.</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Formulario (Editar) */}
            {mostrarModalFormulario && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <form onSubmit={handleGuardar}>
                                <div className="modal-header bg-dark text-white">
                                    <h5 className="modal-title">Editar Información del Cliente</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModalFormulario(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Nombre Completo</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={formulario.nombreCompleto}
                                            onChange={(e) => setFormulario({ ...formulario, nombreCompleto: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">DNI / RUC</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            minLength="8"
                                            maxLength="11"
                                            value={formulario.dni}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, ''); // Solo números
                                                setFormulario({ ...formulario, dni: val });
                                            }}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formulario.correo}
                                            onChange={(e) => setFormulario({ ...formulario, correo: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Dirección</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={formulario.direccion}
                                            onChange={(e) => setFormulario({ ...formulario, direccion: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setMostrarModalFormulario(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary px-4">Guardar Cambios</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Cambiar Contraseña */}
            {mostrarModalContrasena && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <form onSubmit={handleGuardarContrasena}>
                                <div className="modal-header bg-warning text-dark">
                                    <h5 className="modal-title"><i className="fas fa-key me-2"></i>Cambiar Contraseña</h5>
                                    <button type="button" className="btn-close" onClick={() => setMostrarModalContrasena(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Nueva Contraseña para {clienteSeleccionado?.nombreCompleto}</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            autoFocus
                                            value={nuevaContrasena}
                                            onChange={(e) => setNuevaContrasena(e.target.value)}
                                            placeholder="Ingrese la nueva contraseña"
                                        />
                                    </div>
                                    <p className="text-muted small">
                                        <i className="fas fa-info-circle me-1"></i> Asegúrese de comunicar la nueva contraseña al cliente.
                                    </p>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setMostrarModalContrasena(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-warning px-4 fw-bold">Actualizar Contraseña</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clientes;
