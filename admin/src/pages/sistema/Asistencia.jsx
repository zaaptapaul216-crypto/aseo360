import React, { useState, useEffect, useRef } from 'react';
import './Asistencia.css';
import { AsistenciaService } from '../../services/AsistenciaService';
import { EmpleadoService } from '../../services/EmpleadoService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const Asistencia = () => {
    const { user } = useAuth();
    const [horaActual, setHoraActual] = useState(new Date());
    const [empleados, setEmpleados] = useState([]);
    const [registros, setRegistros] = useState([]);
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [procesandoReloj, setProcesandoReloj] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const refRegistroHoy = useRef(null);
    const [horaEntradaConfig, setHoraEntradaConfig] = useState(null);
    const [horaSalidaConfig, setHoraSalidaConfig] = useState(null);

    const esAdministrador = user?.roleName?.toLowerCase().includes('admin');

    // Reloj en tiempo real
    useEffect(() => {
        const temporizador = setInterval(() => setHoraActual(new Date()), 1000);
        return () => clearInterval(temporizador);
    }, []);

    // Carga inicial de datos
    useEffect(() => {
        if (user) cargarDatos();
    }, [user]);

    const cargarDatos = async () => {
        try {
            setCargandoDatos(true);

            // Cargar configuración de horarios (solo admin tiene acceso, ignorar error para otros roles)
            try {
                const cfgEntrada = await AsistenciaService.getConfiguracion('ASISTENCIA_HORA_ENTRADA');
                const cfgSalida = await AsistenciaService.getConfiguracion('ASISTENCIA_HORA_SALIDA');
                setHoraEntradaConfig(cfgEntrada?.valor || null);
                setHoraSalidaConfig(cfgSalida?.valor || null);
            } catch { /* sin acceso a config */ }

            // Cargar asistencia propia
            if (user) {
                const misAsistencias = await AsistenciaService.listarPorEmpleado();
                const ahora = new Date();
                const fechaHoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
                const asistenciaHoy = misAsistencias.find(r => {
                    const fechaRegistro = Array.isArray(r.fecha)
                        ? `${r.fecha[0]}-${String(r.fecha[1]).padStart(2, '0')}-${String(r.fecha[2]).padStart(2, '0')}`
                        : r.fecha;
                    return fechaRegistro === fechaHoy;
                });
                setRegistros(misAsistencias);
                setRegistroDeHoy(asistenciaHoy || null);
                refRegistroHoy.current = asistenciaHoy || null;
            }
        } catch (error) {
        } finally {
            setCargandoDatos(false);
        }
    };

    // Calcular si los botones deben estar habilitados
    const calcularDisponibilidad = () => {
        const ahora = horaActual;
        const hh = ahora.getHours();
        const mm = ahora.getMinutes();
        const minutosActuales = hh * 60 + mm;

        let entradaHabilitada = true;
        let salidaHabilitada = true;
        let msgEntrada = '';
        let msgSalida = '';

        if (horaEntradaConfig) {
            const [eh, em] = horaEntradaConfig.split(':').map(Number);
            const minEntrada = eh * 60 + em;
            const minActivacion = minEntrada - 15;
            if (minutosActuales < minActivacion) {
                entradaHabilitada = false;
                const diffMin = minActivacion - minutosActuales;
                const h = Math.floor(diffMin / 60);
                const m = diffMin % 60;
                msgEntrada = `Se activa en ${h > 0 ? h + 'h ' : ''}${m}min (${horaEntradaConfig})`;
            }
        }

        if (horaSalidaConfig) {
            const [sh, sm] = horaSalidaConfig.split(':').map(Number);
            const minSalida = sh * 60 + sm;
            if (minutosActuales < minSalida) {
                salidaHabilitada = false;
                const diffMin = minSalida - minutosActuales;
                const h = Math.floor(diffMin / 60);
                const m = diffMin % 60;
                msgSalida = `Se activa en ${h > 0 ? h + 'h ' : ''}${m}min (${horaSalidaConfig})`;
            }
        }

        return { entradaHabilitada, salidaHabilitada, msgEntrada, msgSalida };
    };

    const { entradaHabilitada, salidaHabilitada, msgEntrada, msgSalida } = calcularDisponibilidad();

    // Registrar entrada
    const handleMarcarEntrada = async () => {
        if (registroDeHoy) return;
        setProcesandoReloj(true);
        try {
            const registro = await AsistenciaService.registrarEntrada();
            toast.success(`Entrada registrada: ${registro.horaEntrada}`);
            const registroHoy = {
                idAsistencia: registro.idAsistencia,
                fecha: registro.fecha,
                horaEntrada: registro.horaEntrada,
                horaSalida: registro.horaSalida || null,
                estado: registro.estado
            };
            setRegistroDeHoy(registroHoy);
            refRegistroHoy.current = registroHoy;
            await cargarDatos();
        } catch (error) {
            toast.error('Error al registrar entrada: ' + (error.response?.data || error.message));
        } finally {
            setProcesandoReloj(false);
        }
    };

    // Registrar salida
    const handleMarcarSalida = async () => {
        if (!registroDeHoy || registroDeHoy.horaSalida) return;
        setProcesandoReloj(true);
        try {
            await AsistenciaService.registrarSalida(registroDeHoy.idAsistencia);
            toast.success('Salida registrada correctamente.');
            const registroActualizado = { ...registroDeHoy, horaSalida: new Date().toLocaleTimeString('es-PE', { hour12: false }) };
            setRegistroDeHoy(registroActualizado);
            refRegistroHoy.current = registroActualizado;
            await cargarDatos();
        } catch (error) {
            toast.error('Error al registrar salida: ' + (error.response?.data || error.message));
        } finally {
            setProcesandoReloj(false);
        }
    };

    const formatearHora = (fecha) => fecha.toLocaleTimeString('es-PE', { hour12: false });
    const formatearFecha = (fecha) => fecha.toLocaleDateString('es-PE', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const obtenerClaseBadgeEstado = (estado) => {
        if (!estado) return 'badge bg-secondary';
        const estadoMinusculas = estado.toLowerCase();
        if (estadoMinusculas === 'presente') return 'badge bg-success';
        if (estadoMinusculas === 'tardanza') return 'badge bg-warning text-dark';
        if (estadoMinusculas === 'ausente') return 'badge bg-danger';
        return 'badge bg-secondary';
    };

    if (cargandoDatos) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2">Cargando asistencia...</p>
            </div>
        );
    }

    return (
        <div className="asistencia-container">
            <h2 className="mb-4 text-primary fw-bold">
                <i className="fas fa-calendar-check me-2"></i>Control de Asistencia
            </h2>

            <div className="row g-4">
                {/* Panel de Marcado */}
                <div className="col-lg-5">
                    <div className="card attendance-card h-100">
                        <div className="card-body d-flex flex-column align-items-center justify-content-center">
                            <div className="clock-display">
                                <div className="digital-clock">{formatearHora(horaActual)}</div>
                                <div className="date-display text-capitalize">{formatearFecha(horaActual)}</div>
                            </div>

                            <div className="d-flex flex-column align-items-center gap-4 mt-4 w-100">
                                {!registroDeHoy ? (
                                    <div className="w-100 text-center">
                                        <button
                                            className="btn btn-clock btn-clock-in"
                                            onClick={handleMarcarEntrada}
                                            disabled={procesandoReloj || !entradaHabilitada}
                                            style={!entradaHabilitada ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                        >
                                            {procesandoReloj
                                                ? <span className="spinner-border spinner-border-sm me-2"></span>
                                                : <i className="fas fa-sign-in-alt"></i>
                                            }
                                            MARCAR ENTRADA
                                        </button>
                                        {!entradaHabilitada && msgEntrada && (
                                            <div className="mt-2">
                                                <small className="text-muted"><i className="fas fa-lock me-1"></i>{msgEntrada}</small>
                                            </div>
                                        )}
                                    </div>
                                ) : !registroDeHoy.horaSalida ? (
                                    <div className="w-100 text-center">
                                        <div className="badge status-ontime mb-4 py-2 px-3 h5">
                                            ENTRADA: {registroDeHoy.horaEntrada}
                                        </div>
                                        <button
                                            className="btn btn-clock btn-clock-out mx-auto"
                                            onClick={handleMarcarSalida}
                                            disabled={procesandoReloj || !salidaHabilitada}
                                            style={!salidaHabilitada ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                        >
                                            {procesandoReloj
                                                ? <span className="spinner-border spinner-border-sm me-2"></span>
                                                : <i className="fas fa-sign-out-alt"></i>
                                            }
                                            MARCAR SALIDA
                                        </button>
                                        {!salidaHabilitada && msgSalida && (
                                            <div className="mt-2">
                                                <small className="text-muted"><i className="fas fa-lock me-1"></i>{msgSalida}</small>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="fas fa-check-circle text-success fa-4x mb-3"></i>
                                        <h4 className="fw-bold">Jornada Completada</h4>
                                        <p className="text-muted">¡Buen trabajo por hoy!</p>
                                        <div className="small text-muted">
                                            {registroDeHoy.horaEntrada} - {registroDeHoy.horaSalida}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historial y Configuración */}
                <div className="col-lg-7">
                    <div className="card attendance-card mb-4">
                        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Mis Asistencias</h5>
                            <button className="btn btn-sm btn-outline-primary" onClick={cargarDatos}>
                                <i className="fas fa-sync-alt"></i>
                            </button>
                        </div>
                        <div className="table-responsive p-0" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-3">Fecha</th>
                                        <th>Entrada</th>
                                        <th>Salida</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!registroDeHoy ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">
                                                Aún no has marcado asistencia el día de hoy
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td className="ps-3">{registroDeHoy.fecha}</td>
                                            <td>{registroDeHoy.horaEntrada || '--:--'}</td>
                                            <td>{registroDeHoy.horaSalida || '--:--'}</td>
                                            <td>
                                                <span className={obtenerClaseBadgeEstado(registroDeHoy.estado)}>
                                                    {registroDeHoy.estado || 'Pendiente'}
                                                </span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Asistencia;
