
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardReportes from '../reportes/DashboardReportes';

const Dashboard = () => {
    const { user } = useAuth();
    const rolUsuario = (user?.roleName || 'Empleado').toUpperCase();

    if (rolUsuario === 'ADMINISTRADOR' || rolUsuario === 'VENDEDOR') {
        return <DashboardReportes />;
    }

    // Datos de ejemplo para el panel de control
    const todasLasEstadisticas = [
        { titulo: 'Ventas del Día', valor: 'S/ 1,250.00', icono: 'fas fa-dollar-sign', color: 'primary', roles: ['ADMINISTRADOR', 'VENDEDOR'] },
        { titulo: 'Pedidos Pendientes', valor: '12', icono: 'fas fa-clock', color: 'warning', roles: ['ADMINISTRADOR', 'VENDEDOR'] },
        { titulo: 'Productos Bajos', valor: '5', icono: 'fas fa-exclamation-triangle', color: 'danger', roles: ['ADMINISTRADOR', 'ALMACENERO'] },
        { titulo: 'Nuevos Clientes', valor: '3', icono: 'fas fa-user-plus', color: 'success', roles: ['ADMINISTRADOR', 'VENDEDOR'] },
    ];

    const estadisticas = todasLasEstadisticas.filter(e => e.roles.includes(rolUsuario));

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold" style={{ color: '#094e8a' }}>Panel de Control</h2>

                <Link to="/asistencia" className="btn btn-success shadow-sm">
                    <i className="fas fa-calendar-check me-2"></i>Marcar Asistencia
                </Link>
            </div>

            <div className="row g-4 mb-4">
                {estadisticas.length > 0 ? (
                    estadisticas.map((estadistica, indice) => (
                        <div className="col-12 col-md-6 col-xl-3" key={indice}>
                            <div className="card h-100 border-start border-4" style={{
                                borderColor: estadistica.color === 'primary' ? '#0D63A5' :
                                    estadistica.color === 'success' ? '#B6E300' :
                                        `var(--bs-${estadistica.color})`
                            }}>
                                <div className="card-body d-flex align-items-center">
                                    <div className={`rounded-circle p-3 me-3 text-white`} style={{
                                        backgroundColor: estadistica.color === 'primary' ? '#0D63A5' :
                                            estadistica.color === 'success' ? '#B6E300' :
                                                `var(--bs-${estadistica.color})`
                                    }}>
                                        <i className={`${estadistica.icono} fa-lg`}></i>
                                    </div>
                                    <div>
                                        <h6 className="card-subtitle text-muted mb-1">{estadistica.titulo}</h6>
                                        <h3 className="card-title mb-0 fw-bold">{estadistica.valor}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="alert alert-info">
                            Bienvenido al sistema. Usa el menú lateral para navegar.
                        </div>
                    </div>
                )}
            </div>

            <div className="row">
                {/* Tabla de Pedidos solo para Ventas/Admin */}
                {(rolUsuario === 'ADMINISTRADOR' || rolUsuario === 'VENDEDOR') && (
                    <div className="col-12 col-lg-8 mb-4">
                        <div className="card h-100">
                            <div className="card-header bg-white py-3">
                                <h5 className="card-title mb-0">Últimos Pedidos</h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Cliente</th>
                                                <th>Fecha</th>
                                                <th>Estado</th>
                                                <th>Total</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>#PED-001</td>
                                                <td>Juan Pérez</td>
                                                <td>06/02/2026</td>
                                                <td><span className="badge bg-warning text-dark">Pendiente</span></td>
                                                <td>S/ 150.00</td>
                                                <td><button className="btn btn-sm btn-outline-primary"><i className="fas fa-eye"></i></button></td>
                                            </tr>
                                            <tr>
                                                <td>#PED-002</td>
                                                <td>Maria Garcia</td>
                                                <td>06/02/2026</td>
                                                <td><span className="badge bg-success">Completado</span></td>
                                                <td>S/ 85.50</td>
                                                <td><button className="btn btn-sm btn-outline-primary"><i className="fas fa-eye"></i></button></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alertas de Stock solo para Almacén/Admin */}
                {(rolUsuario === 'ADMINISTRADOR' || rolUsuario === 'ALMACENERO') && (
                    <div className={rolUsuario === 'ADMINISTRADOR' ? "col-12 col-lg-4 mb-4" : "col-12 mb-4"}>
                        <div className="card h-100">
                            <div className="card-header bg-white py-3">
                                <h5 className="card-title mb-0">Alertas de Stock</h5>
                            </div>
                            <div className="card-body">
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Detergente X (5L)
                                        <span className="badge bg-danger rounded-pill">2 un.</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Limpiador Multiusos
                                        <span className="badge bg-warning text-dark rounded-pill">5 un.</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Guantes Industriales
                                        <span className="badge bg-warning text-dark rounded-pill">8 un.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
