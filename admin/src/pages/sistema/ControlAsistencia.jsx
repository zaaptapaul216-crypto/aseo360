import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { AsistenciaService } from '../../services/AsistenciaService';
import { EmpleadoService } from '../../services/EmpleadoService';

const hoy = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

const ESTADOS = ['Presente', 'Tardanza', 'Falta'];
const colorEstado = { Presente: '#198754', Tardanza: '#fd7e14', Falta: '#dc3545' };
const iconEstado = { Presente: 'fa-check-circle', Tardanza: 'fa-clock', Falta: 'fa-times-circle' };

const fmtHora = (h) => {
    if (!h) return '—';
    return String(h).substring(0, 5);
};

const ControlAsistencia = () => {
    const [empleados, setEmpleados] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [fecha, setFecha] = useState(hoy());
    const [cargando, setCargando] = useState(false);
    const [modal, setModal] = useState(null); // { emp, asistencia }
    const [formEstado, setFormEstado] = useState('Falta');
    const [formComentario, setFormComentario] = useState('');
    const [formHoraEntrada, setFormHoraEntrada] = useState('');
    const [formHoraSalida, setFormHoraSalida] = useState('');

    useEffect(() => { cargar(); }, [fecha]);

    const cargar = async () => {
        setCargando(true);
        let emps = [], asis = [];
        try { const r = await EmpleadoService.getAll(); emps = Array.isArray(r) ? r : []; } catch { toast.error('Error al cargar empleados'); }
        try { const r = await AsistenciaService.listarPorFecha(fecha); asis = Array.isArray(r) ? r : []; } catch { toast.error('Error al cargar asistencias'); }
        setEmpleados(emps);
        setAsistencias(asis);
        setCargando(false);
    };

    const empleadosActivos = empleados.filter(e => (e.estado || '').toLowerCase() === 'activo');
    const merged = empleadosActivos.map(emp => {
        const asist = asistencias.find(a => a.empleado?.idEmpleado === emp.idEmpleado);
        return { ...emp, asistencia: asist || null, estadoHoy: asist ? asist.estado : 'Sin Marcar' };
    });

    const presentes = merged.filter(m => m.estadoHoy === 'Presente').length;
    const tardanzas = merged.filter(m => m.estadoHoy === 'Tardanza').length;
    const faltas = merged.filter(m => m.estadoHoy === 'Falta').length;
    const sinMarcar = merged.filter(m => m.estadoHoy === 'Sin Marcar').length;

    const cambiarDia = (delta) => {
        const d = new Date(fecha + 'T00:00:00');
        d.setDate(d.getDate() + delta);
        setFecha(d.toLocaleDateString('en-CA'));
    };

    const exportarExcel = async () => {
        const ahora = new Date();
        const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
        const { value: mesSeleccionado } = await Swal.fire({
            title: 'Exportar Asistencia',
            html: '<label class="form-label fw-bold">Seleccione el mes:</label>',
            input: 'month',
            inputValue: mesActual,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-file-excel me-1"></i>Exportar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#198754',
        });
        if (!mesSeleccionado) return;
        const [anio, mes] = mesSeleccionado.split('-').map(Number);
        try {
            toast.info('Generando Excel...');
            const data = await AsistenciaService.listarPorMes(anio, mes);
            if (!data || data.length === 0) {
                toast.warning('No hay registros de asistencia para este mes');
                return;
            }
            const rows = data.map(a => ({
                'Empleado': a.nombreEmpleado || '',
                'DNI': a.dni || '',
                'Fecha': a.fecha || '',
                'Hora Entrada': a.horaEntrada ? String(a.horaEntrada).substring(0, 5) : '',
                'Hora Salida': a.horaSalida ? String(a.horaSalida).substring(0, 5) : '',
                'Estado': a.estado || '',
                'Comentario': a.comentario || '',
            }));
            const ws = XLSX.utils.json_to_sheet(rows);
            ws['!cols'] = [
                { wch: 30 }, { wch: 12 }, { wch: 12 },
                { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 35 },
            ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
            XLSX.writeFile(wb, `Asistencia_${mesSeleccionado}.xlsx`);
            toast.success('Excel exportado correctamente');
        } catch (err) {
            toast.error('Error al exportar: ' + (err.response?.data || err.message));
        }
    };

    const fmtTimeInput = (t) => {
        if (!t) return '';
        return String(t).substring(0, 5); // "08:43:04" -> "08:43"
    };

    const abrirModal = (m) => {
        setModal(m);
        if (m.asistencia) {
            setFormEstado(m.asistencia.estado || 'Presente');
            setFormComentario(m.asistencia.comentarios || '');
            setFormHoraEntrada(fmtTimeInput(m.asistencia.horaEntrada));
            setFormHoraSalida(fmtTimeInput(m.asistencia.horaSalida));
        } else {
            setFormEstado('Falta');
            setFormComentario('');
            setFormHoraEntrada('00:00');
            setFormHoraSalida('00:00');
        }
    };

    const handleEstadoChange = (nuevoEstado) => {
        setFormEstado(nuevoEstado);
        if (nuevoEstado === 'Falta') {
            setFormHoraEntrada('00:00');
            setFormHoraSalida('00:00');
        }
    };

    const guardarAsistencia = async () => {
        if (!modal) return;
        const horaE = formHoraEntrada ? formHoraEntrada + ':00' : '00:00:00';
        const horaS = formHoraSalida ? formHoraSalida + ':00' : '00:00:00';
        try {
            if (modal.asistencia) {
                await AsistenciaService.modificarAsistencia({
                    idAsistencia: modal.asistencia.idAsistencia,
                    fecha: modal.asistencia.fecha,
                    horaEntrada: horaE,
                    horaSalida: horaS,
                    estado: formEstado,
                    comentario: formComentario,
                });
                toast.success('Asistencia actualizada');
            } else {
                await AsistenciaService.registrarAdmin({
                    correoEmpleado: modal.correo,
                    fecha: fecha,
                    horaEntrada: horaE,
                    horaSalida: horaS,
                    estado: formEstado,
                    comentario: formComentario,
                });
                toast.success('Asistencia registrada');
            }
            setModal(null);
            await cargar();
        } catch (err) {
            const msg = err.response?.data || 'Error al guardar';
            toast.error(typeof msg === 'string' ? msg : 'Error al guardar');
        }
    };

    const eliminarAsistencia = async () => {
        if (!modal?.asistencia) return;
        const r = await Swal.fire({ title: '¿Eliminar este registro?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí', cancelButtonText: 'No' });
        if (!r.isConfirmed) return;
        try {
            await AsistenciaService.modificarAsistencia({
                idAsistencia: modal.asistencia.idAsistencia,
                fecha: modal.asistencia.fecha,
                horaEntrada: modal.asistencia.horaEntrada,
                horaSalida: modal.asistencia.horaSalida,
                estado: 'Eliminado',
                comentario: 'Eliminado por administrador',
            });
            toast.success('Registro eliminado');
            setModal(null);
            await cargar();
        } catch { toast.error('Error'); }
    };

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: '#094e8a', fontWeight: '800' }}>
                    <i className="fas fa-calendar-check me-2"></i>CONTROL DE ASISTENCIA
                </h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-success shadow-sm" onClick={exportarExcel}><i className="fas fa-file-excel me-1"></i>Exportar Excel</button>
                    <button className="btn btn-outline-primary shadow-sm" onClick={cargar}><i className="fas fa-sync-alt me-1"></i>Actualizar</button>
                </div>
            </div>

            {/* Date picker + stats */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
                        <div className="card-body d-flex align-items-center justify-content-between">
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => cambiarDia(-1)}><i className="fas fa-chevron-left"></i></button>
                            <div className="text-center">
                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Fecha</small>
                                <input type="date" className="form-control border-0 text-center fw-bold fs-5 p-0" value={fecha} onChange={e => setFecha(e.target.value)} />
                            </div>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => cambiarDia(1)}><i className="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card border-0 shadow-sm text-center" style={{ borderRadius: 12, borderLeft: '4px solid #198754' }}>
                        <div className="card-body py-2">
                            <small className="text-muted">Presentes</small>
                            <h3 className="fw-bold mb-0" style={{ color: '#198754' }}>{presentes}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card border-0 shadow-sm text-center" style={{ borderRadius: 12, borderLeft: '4px solid #fd7e14' }}>
                        <div className="card-body py-2">
                            <small className="text-muted">Tardanzas</small>
                            <h3 className="fw-bold mb-0" style={{ color: '#fd7e14' }}>{tardanzas}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card border-0 shadow-sm text-center" style={{ borderRadius: 12, borderLeft: '4px solid #dc3545' }}>
                        <div className="card-body py-2">
                            <small className="text-muted">Faltas</small>
                            <h3 className="fw-bold mb-0" style={{ color: '#dc3545' }}>{faltas}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card border-0 shadow-sm text-center" style={{ borderRadius: 12, borderLeft: '4px solid #6c757d' }}>
                        <div className="card-body py-2">
                            <small className="text-muted">Sin Marcar</small>
                            <h3 className="fw-bold mb-0" style={{ color: '#6c757d' }}>{sinMarcar}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee cards grid */}
            {cargando ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : merged.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <i className="fas fa-users fa-3x d-block mb-3 opacity-25"></i>
                    <h5>No hay empleados activos</h5>
                </div>
            ) : (
                <div className="row g-3">
                    {merged.map(m => {
                        const est = m.estadoHoy;
                        const color = colorEstado[est] || '#6c757d';
                        const icon = iconEstado[est] || 'fa-question-circle';
                        const marcado = m.asistencia != null;
                        return (
                            <div key={m.idEmpleado} className="col-sm-6 col-lg-4 col-xl-3">
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12, borderLeft: `5px solid ${color}`, cursor: 'pointer', transition: 'transform 0.2s' }}
                                    onClick={() => abrirModal(m)}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                                    <div className="card-body py-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                style={{ width: 48, height: 48, backgroundColor: `${color}15`, flexShrink: 0 }}>
                                                <i className="fas fa-user" style={{ color, fontSize: '1.2rem' }}></i>
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <h6 className="fw-bold mb-0 text-truncate">{m.nombreCompleto}</h6>
                                                <small className="text-muted">{m.rol?.nombre || '—'}</small>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                            <span className="badge" style={{ backgroundColor: color, fontSize: '0.75rem' }}>
                                                <i className={`fas ${icon} me-1`}></i>{est}
                                            </span>
                                            {marcado ? (
                                                <div className="text-end">
                                                    <small className="text-muted d-block">
                                                        <i className="fas fa-sign-in-alt text-success me-1"></i>{fmtHora(m.asistencia.horaEntrada)}
                                                    </small>
                                                    <small className="text-muted d-block">
                                                        <i className="fas fa-sign-out-alt text-danger me-1"></i>{fmtHora(m.asistencia.horaSalida)}
                                                    </small>
                                                </div>
                                            ) : (
                                                <small className="text-primary fw-bold"><i className="fas fa-edit me-1"></i>Marcar</small>
                                            )}
                                        </div>

                                        {m.asistencia?.comentarios && (
                                            <div className="mt-2 p-2 rounded bg-light">
                                                <small className="text-muted"><i className="fas fa-comment me-1"></i>{m.asistencia.comentarios}</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ====== MODAL EDITAR / MARCAR ====== */}
            {modal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setModal(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14, overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ background: `linear-gradient(135deg, ${colorEstado[formEstado] || '#6c757d'}, ${colorEstado[formEstado] || '#6c757d'}99)`, padding: '20px 24px', color: '#fff', transition: 'background 0.3s' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="fw-bold mb-1">{modal.nombreCompleto}</h5>
                                        <small><i className="fas fa-id-card me-1"></i>{modal.rol?.nombre || '—'} • {modal.correo}</small>
                                    </div>
                                    <button className="btn btn-sm btn-outline-light border-0" onClick={() => setModal(null)}><i className="fas fa-times fs-5"></i></button>
                                </div>
                            </div>

                            <div className="modal-body p-4">
                                {!modal.asistencia && (
                                    <div className="alert alert-info py-2 small mb-3">
                                        <i className="fas fa-info-circle me-1"></i>Este empleado no ha marcado asistencia para el <strong>{fecha}</strong>.
                                    </div>
                                )}

                                {/* Estado */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Estado</label>
                                    <div className="d-flex gap-2">
                                        {ESTADOS.map(e => (
                                            <button key={e} type="button"
                                                className={`btn flex-fill ${formEstado === e ? '' : 'btn-outline-secondary'}`}
                                                style={formEstado === e ? { backgroundColor: colorEstado[e], color: '#fff', borderColor: colorEstado[e] } : {}}
                                                onClick={() => handleEstadoChange(e)}>
                                                <i className={`fas ${iconEstado[e]} me-1`}></i>{e}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Hora Entrada / Salida */}
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="form-label fw-bold small">Hora Entrada</label>
                                        <input type="time" className="form-control" value={formHoraEntrada}
                                            onChange={e => setFormHoraEntrada(e.target.value)}
                                            disabled={formEstado === 'Falta'} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold small">Hora Salida</label>
                                        <input type="time" className="form-control" value={formHoraSalida}
                                            onChange={e => setFormHoraSalida(e.target.value)}
                                            disabled={formEstado === 'Falta'} />
                                    </div>
                                    {formEstado === 'Falta' && (
                                        <div className="col-12">
                                            <small className="text-muted"><i className="fas fa-info-circle me-1"></i>Las horas se establecen en 00:00 para faltas.</small>
                                        </div>
                                    )}
                                </div>

                                {/* Comentario */}
                                <div className="mb-0">
                                    <label className="form-label fw-bold">Comentario</label>
                                    <textarea className="form-control" rows="3" placeholder="Agregar comentario u observación..."
                                        value={formComentario} onChange={e => setFormComentario(e.target.value)}></textarea>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="modal-footer border-0 d-flex justify-content-between">
                                <div>
                                    {modal.asistencia && (
                                        <button className="btn btn-sm btn-outline-danger" onClick={eliminarAsistencia}>
                                            <i className="fas fa-trash-alt me-1"></i>Eliminar
                                        </button>
                                    )}
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-light" onClick={() => setModal(null)}>Cancelar</button>
                                    <button className="btn btn-primary px-4" onClick={guardarAsistencia}>
                                        <i className="fas fa-save me-2"></i>{modal.asistencia ? 'Actualizar' : 'Registrar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ControlAsistencia;
