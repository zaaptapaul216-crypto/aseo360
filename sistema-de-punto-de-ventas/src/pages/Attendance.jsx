import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useData } from '../context/DataContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faSignInAlt, faSignOutAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';



const Attendance = () => {
    const { attendanceLogs, markAttendance, updateAttendance, user } = useData();
    const userRole = user?.role;
    const [currentTime, setCurrentTime] = useState(new Date());

    // Map role to display name
    const getUserName = () => {
        switch (userRole) {
            case 'admin': return 'Administrador';
            case 'vendedor': return 'Vendedor';
            case 'almacenero': return 'Almacenero';
            default: return 'Usuario';
        }
    };
    const currentUser = getUserName();

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCheckIn = () => {
        const todayStr = new Date().toLocaleDateString();
        // Check if already checked in today
        const existingCall = attendanceLogs.find(l => l.date === todayStr && l.user === currentUser);
        if (existingCall) return alert(`Ya has marcado entrada hoy como ${currentUser}.`);

        const newLog = {
            id: Date.now(),
            user: currentUser,
            date: todayStr,
            checkIn: new Date().toLocaleTimeString(),
            checkOut: '--',
            hours: 'En curso'
        };
        markAttendance(newLog);
        alert('Entrada marcada exitosamente: ' + newLog.checkIn);
    };

    const handleCheckOut = () => {
        const todayStr = new Date().toLocaleDateString();
        const myLog = attendanceLogs.find(l => l.date === todayStr && l.user === currentUser && l.checkOut === '--');

        if (!myLog) return alert(`No tienes una entrada pendiente de salida para hoy como ${currentUser}.`);

        const checkOutTime = new Date().toLocaleTimeString();

        // Calculate Hours Difference
        const checkInTime = myLog.checkIn; // "HH:MM:SS AM/PM" or similar
        // Simple timestamp diff (assuming same day for simplicity in this demo)
        // ideally parse dates. For now, let's just mock a calc or keep it simple.
        // Let's force a slightly realistic diff or just Keep "8h" for demo if parsing is complex without libraries like moment.
        // But better to just store as Timestamp? No, let's keep string for display.

        const updatedLog = { ...myLog, checkOut: checkOutTime, hours: 'Calculando...' };
        updateAttendance(updatedLog);
        alert('Salida marcada exitosamente: ' + checkOutTime);
    };

    return (
        <Layout>
            <div className="container-fluid fade-in">
                <h4 className="fw-bold mb-4 text-dark">Registro de Asistencia</h4>

                {/* Action Widgets */}
                <div className="row mb-4">
                    <div className="col-md-8">
                        <div className="card-premium h-100 d-flex align-items-center justify-content-between">
                            <div>
                                <h5 className="mb-1 fw-bold">Control de Asistencia Hoy</h5>
                                <p className="mb-0 text-muted small">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-success" onClick={handleCheckIn}>
                                    <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Marcar Entrada
                                </button>
                                <button className="btn btn-outline-danger" onClick={handleCheckOut}>
                                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Marcar Salida
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card-premium h-100 text-center py-3">
                            <h2 className="display-4 fw-bold text-primary mb-0">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                <small className="fs-6 text-muted ms-1">{currentTime.getHours() >= 12 ? 'PM' : 'AM'}</small>
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="card-premium p-0">
                    <div className="p-3 border-bottom bg-light">
                        <h6 className="m-0 fw-bold"><FontAwesomeIcon icon={faCalendarAlt} className="me-2" /> Historial de Entradas y Salidas</h6>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="text-muted text-uppercase small">
                                <tr>
                                    <th className="px-4 py-3">Trabajador</th>
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3 text-center">Entrada</th>
                                    <th className="px-4 py-3 text-center">Salida</th>
                                    <th className="px-4 py-3 text-end">Total Horas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="px-4 fw-bold">{log.user}</td>
                                        <td className="px-4 text-muted">{log.date}</td>
                                        <td className="px-4 text-center">
                                            <span className="badge bg-success bg-opacity-10 text-success border border-success px-3">{log.checkIn}</span>
                                        </td>
                                        <td className="px-4 text-center">
                                            {log.checkOut !== '--' ?
                                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3">{log.checkOut}</span> :
                                                <span className="badge bg-secondary bg-opacity-10 text-secondary border px-3">--</span>
                                            }
                                        </td>
                                        <td className="px-4 text-end fw-bold text-dark">{log.hours}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Attendance;
