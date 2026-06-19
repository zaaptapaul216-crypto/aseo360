import React, { useState, useEffect } from 'react';
import './Empleados.css';
import { EmpleadoService } from '../../services/EmpleadoService';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const Empleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [roles, setRoles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    const formularioInicial = {
        nombreCompleto: '',
        fotoPerfil: '',
        dni: '',
        password: '',
        numeroCelular: '',
        rolId: '',
        estado: 'ACTIVO'
    };

    const [formulario, setFormulario] = useState(formularioInicial);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const empleadosData = await EmpleadoService.getAll();
            const rolesData = await EmpleadoService.getRoles();
            setEmpleados(empleadosData);
            setRoles(rolesData);
        } catch (error) {
        } finally {
            setCargando(false);
        }
    };

    const handleAbrirModal = (empleado = null) => {
        if (empleado) {
            setModoEdicion(true);
            // Configurar datos de edición
            setFormulario({
                ...empleado,
                rolId: empleado.rolId || empleado.rol?.idRol || empleado.rol?.id || '',
                estado: empleado.estado || 'ACTIVO',
                password: ''
            });
        } else {
            setModoEdicion(false);
            setFormulario(formularioInicial);
        }
        setMostrarModal(true);
    };

    const handleCambioInput = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            // Construir payload compatible con EmpleadoRegistroDTO del backend
            const datosEmpleado = {
                id: formulario.id || formulario.idEmpleado || null,
                nombreCompleto: formulario.nombreCompleto,
                fotoPerfil: formulario.fotoPerfil || '',
                dni: formulario.dni,
                password: formulario.password || null,
                numeroCelular: formulario.numeroCelular || '',
                rolId: Number(formulario.rolId),
                estado: formulario.estado || 'ACTIVO',
            };
            if (modoEdicion) {
                await EmpleadoService.update(datosEmpleado);
                toast.success('Empleado actualizado correctamente');
            } else {
                await EmpleadoService.create(datosEmpleado);
                toast.success('Empleado registrado correctamente');
            }
            setMostrarModal(false);
            cargarDatos();
        } catch (error) {
            toast.error('Error al guardar: ' + (error.response?.data || error.message));
        }
    };

    const handleEliminar = async (idEmpleado) => {
        const result = await Swal.fire({
            title: '¿Eliminar empleado?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            await EmpleadoService.delete(idEmpleado);
            toast.success('Empleado eliminado');
            cargarDatos();
        }
    };

    const obtenerNombreRol = (rolId) => {
        // El backend puede devolver idRol o id según el endpoint
        return roles.find(r => r.id == rolId || r.idRol == rolId)?.nombre || 'Sin Rol';
    };

    const obtenerClaseRol = (rolId) => {
        const nombreRol = obtenerNombreRol(rolId).toLowerCase();
        if (nombreRol.includes('admin')) return 'role-admin';
        if (nombreRol.includes('vendedor')) return 'role-vendedor';
        return 'role-almacen';
    };

    const empleadosFiltrados = empleados.filter(e =>
        e.nombreCompleto.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        e.dni.includes(terminoBusqueda)
    );

    return (
        <div className="empleados-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-primary fw-bold mb-0">
                        <i className="fas fa-id-card me-2"></i>Gestión de Empleados
                    </h2>
                    <p className="text-muted">Administra los perfiles y roles del personal</p>
                </div>
                <button className="btn btn-primary px-4 py-2 rounded-pill shadow-sm" onClick={() => handleAbrirModal()}>
                    <i className="fas fa-user-plus me-2"></i>Nuevo Empleado
                </button>
            </div>

            {/* Buscador */}
            <div className="card shadow-sm border-0 mb-4 p-2">
                <div className="card-body">
                    <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
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
            </div>

            {/* Grid de Empleados */}
            {cargando ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <div className="row g-4">
                    {empleadosFiltrados.map(empleado => (
                        <div key={empleado.id || empleado.dni} className="col-md-6 col-lg-4">
                            <div className="card empleado-card shadow-sm h-100">
                                <div className="card-body text-center p-4">
                                    <div className="empleado-avatar-container mb-3">
                                        <img
                                            src={empleado.fotoPerfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(empleado.nombreCompleto)}&background=random`}
                                            alt={empleado.nombreCompleto}
                                            className="empleado-avatar"
                                        />
                                    </div>
                                    <h5 className="fw-bold mb-1">{empleado.nombreCompleto}</h5>
                                    <div className={`badge role-badge ${obtenerClaseRol(empleado.rolId)} mb-3 text-uppercase`}>
                                        {obtenerNombreRol(empleado.rolId)}
                                    </div>
                                    <div className="small text-muted mb-4">
                                        <div><i className="fas fa-id-card-alt me-2"></i>DNI: {empleado.dni}</div>
                                        <div><i className="fas fa-envelope me-2"></i>{empleado.correo || 'Sin correo'}</div>
                                        <div><i className="fas fa-phone me-2"></i>{empleado.numeroCelular}</div>
                                    </div>
                                    <div className="d-flex justify-content-center gap-2">
                                        <button className="btn btn-outline-primary btn-sm px-3" onClick={() => handleAbrirModal(empleado)}>
                                            <i className="fas fa-edit me-1"></i> Editar
                                        </button>
                                        <button className="btn btn-outline-danger btn-sm px-3" onClick={() => handleEliminar(empleado.idEmpleado || empleado.id)}>
                                            <i className="fas fa-trash-alt me-1"></i> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {empleadosFiltrados.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <i className="fas fa-users-slash fa-3x text-light mb-3"></i>
                            <h4 className="text-muted">No se encontraron empleados</h4>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Registro / Edición */}
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content-custom m-auto">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="mb-0 fw-bold">{modoEdicion ? 'Editar Perfil' : 'Registro de Empleado'}</h4>
                            <button className="btn-close" onClick={() => setMostrarModal(false)}></button>
                        </div>

                        <form onSubmit={handleGuardar} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                            <div className="form-section-title">Información Personal</div>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label small fw-bold">Nombre Completo</label>
                                    <input type="text" className="form-control" name="nombreCompleto" value={formulario.nombreCompleto} onChange={handleCambioInput} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">DNI</label>
                                    <input type="text" className="form-control" name="dni" value={formulario.dni} onChange={handleCambioInput} required maxLength="8" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Celular</label>
                                    <input type="text" className="form-control" name="numeroCelular" value={formulario.numeroCelular} onChange={handleCambioInput} />
                                </div>
                            </div>

                            <div className="form-section-title">Seguridad y Rol</div>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Rol en el Sistema</label>
                                    <select className="form-select" name="rolId" value={formulario.rolId} onChange={handleCambioInput} required>
                                        <option value="">Seleccione un rol...</option>
                                        {roles.map(r => <option key={r.id || r.idRol} value={r.id || r.idRol}>{r.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Contraseña</label>
                                    <input type="password" name="password" className="form-control" value={formulario.password} onChange={handleCambioInput} placeholder={modoEdicion ? 'Sin cambio (dejar vacío)' : 'Contraseña inicial'} required={!modoEdicion} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Estado</label>
                                    <select className="form-select" name="estado" value={formulario.estado} onChange={handleCambioInput} required>
                                        <option value="ACTIVO">Activo</option>
                                        <option value="INACTIVO">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-section-title">Multimedia</div>
                            <div className="col-12">
                                <label className="form-label small fw-bold">URL Foto de Perfil</label>
                                <input type="text" className="form-control" name="fotoPerfil" value={formulario.fotoPerfil} onChange={handleCambioInput} placeholder="https://..." />
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-5">
                                <button type="button" className="btn btn-light py-2 px-4 shadow-sm" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary py-2 px-4 shadow-sm">
                                    {modoEdicion ? 'Guardar Cambios' : 'Registrar Ahora'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Empleados;
