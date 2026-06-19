import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import reporteService from '../../services/ReporteService';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

// Paletas de colores
const COLORES_METODO = ['#0d6efd', '#198754', '#6f42c1', '#fd7e14', '#dc3545', '#20c997'];
const COLORES_PRODUCTO = ['#ff6b6b', '#ffa502', '#2ed573', '#1e90ff', '#a55eea', '#ff4757', '#eccc68', '#7bed9f', '#70a1ff', '#5352ed'];
const COLORES_GASTO = ['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0d6efd', '#6f42c1', '#20c997'];

const DashboardReportes = () => {
    const { user } = useAuth();
    const esAdmin = (user?.roleName || '').toUpperCase() === 'ADMINISTRADOR';
    const [loading, setLoading] = useState(true);
    const [datos, setDatos] = useState(null);

    const getLimaDateString = (dateObj) => {
        const options = { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' };
        const formatter = new Intl.DateTimeFormat('en-CA', options);
        return formatter.format(dateObj);
    };

    const today = getLimaDateString(new Date());
    const thirtyDaysAgoDate = new Date();
    thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);
    const thirtyDaysAgo = getLimaDateString(thirtyDaysAgoDate);

    const [fechaInicio, setFechaInicio] = useState(thirtyDaysAgo);
    const [fechaFin, setFechaFin] = useState(today);

    const cargarDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await reporteService.obtenerDashboard(fechaInicio, fechaFin);
            setDatos(data);
        } catch (error) {
            toast.error('Ocurrió un error al cargar el dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDashboard();
    }, []);

    const fmt = (monto) => `S/ ${parseFloat(monto || 0).toFixed(2)}`;

    // Tooltip personalizado para pie charts
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '8px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                    <p className="mb-0 fw-bold" style={{ color: payload[0].payload.fill || '#333' }}>{payload[0].name}</p>
                    <p className="mb-0 small text-muted">{fmt(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    // Label personalizado dentro del pie
    const renderLabel = ({ name, percent, x, y, midAngle }) => {
        if (percent < 0.05) return null;
        return (
            <text x={x} y={y} textAnchor={midAngle > 180 ? 'end' : 'start'} dominantBaseline="central" style={{ fontSize: '0.65rem', fill: '#555' }}>
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Componente pie chart reutilizable
    const MiniPieChart = ({ data, colores, height = 220 }) => {
        if (!data || data.length === 0) {
            return <div className="text-center text-muted py-4"><i className="fas fa-chart-pie opacity-25 d-block fs-3 mb-2"></i>Sin datos</div>;
        }
        return (
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        label={renderLabel}
                        labelLine={false}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={colores[i % colores.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        );
    };

    if (loading && !datos) {
        return <div className="p-5 text-center"><div className="spinner-border text-primary"></div><p className="mt-2">Cargando métricas...</p></div>;
    }

    // Preparar datos para gráficos
    const metodosDiarioData = (datos?.metodosDiario || []).map(m => ({ name: m.metodo || 'No definido', value: parseFloat(m.total || 0) }));
    const metodosSemanalData = (datos?.metodosSemanal || []).map(m => ({ name: m.metodo || 'No definido', value: parseFloat(m.total || 0) }));
    const metodosMensualData = (datos?.metodosMensual || []).map(m => ({ name: m.metodo || 'No definido', value: parseFloat(m.total || 0) }));

    const productosData = (datos?.topProductos || []).map(p => ({
        name: p.nombre?.length > 15 ? p.nombre.substring(0, 15) + '…' : p.nombre,
        fullName: p.nombre,
        cantidad: p.cantidadVendida,
        ingresos: parseFloat(p.ingresos || 0),
    }));

    const tiposGastoData = (datos?.topTiposGasto || []).map(t => ({
        name: t.tipoGasto,
        value: parseFloat(t.totalGastado || 0),
        cantidad: t.cantidadGastos,
    }));

    const clientesData = (datos?.topClientes || []).map(c => ({
        name: c.nombre?.length > 12 ? c.nombre.substring(0, 12) + '…' : (c.nombre || 'Público'),
        fullName: c.nombre || 'Público General',
        ventas: c.cantidadVentas,
        total: parseFloat(c.totalComprado || 0),
    }));

    return (
        <div className="container-fluid py-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold"><i className="fas fa-chart-line me-2"></i> Dashboard Analítico</h2>
                <Link to="/asistencia" className="btn btn-success shadow-sm">
                    <i className="fas fa-calendar-check me-2"></i>Marcar Asistencia
                </Link>
            </div>

            {/* ===== TOTALES GENERALES ===== */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Recaudación Hoy', value: datos?.totalDiario, color: '#0d6efd', icon: 'fa-calendar-day', sub: 'Ventas del día' },
                    { label: 'Esta Semana', value: datos?.totalSemanal, color: '#198754', icon: 'fa-calendar-week', sub: 'Lunes a hoy' },
                    { label: 'Este Mes', value: datos?.totalMensual, color: '#0dcaf0', icon: 'fa-calendar-alt', sub: 'Día 1 a hoy' },
                ].map((card, i) => (
                    <div key={i} className="col-md-4">
                        <div className="card border-0 shadow h-100" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)` }}>
                            <div className="card-body text-white">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="text-uppercase opacity-75 small mb-1">{card.label}</h6>
                                        <h2 className="display-6 fw-bold mb-0">{fmt(card.value)}</h2>
                                    </div>
                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                        <i className={`fas ${card.icon} fs-4`}></i>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer bg-transparent border-0 text-white opacity-75 small">{card.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== MÉTODOS DE PAGO - 3 PIE CHARTS ===== */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white pb-0 border-0 pt-4">
                    <h5 className="mb-0 fw-bold text-secondary"><i className="fas fa-wallet me-2"></i>Ventas por Método de Pago</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 text-center">
                            <h6 className="text-primary mb-2 fw-bold">Hoy</h6>
                            <MiniPieChart data={metodosDiarioData} colores={COLORES_METODO} height={200} />
                        </div>
                        <div className="col-md-4 text-center border-start border-end">
                            <h6 className="text-success mb-2 fw-bold">Esta Semana</h6>
                            <MiniPieChart data={metodosSemanalData} colores={COLORES_METODO} height={200} />
                        </div>
                        <div className="col-md-4 text-center">
                            <h6 className="text-info mb-2 fw-bold">Este Mes</h6>
                            <MiniPieChart data={metodosMensualData} colores={COLORES_METODO} height={200} />
                        </div>
                    </div>
                </div>
            </div>

            <hr className="my-4" />

            {/* ===== SECCIÓN FILTRADA ===== */}
            <h4 className="text-secondary fw-bold mb-3"><i className="fas fa-filter me-2"></i>Rankings por Período</h4>

            <div className="card shadow-sm border-0 bg-light mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Fecha Inicio</label>
                            <input type="date" className="form-control form-control-lg border-0 shadow-sm" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Fecha Fin</label>
                            <input type="date" className="form-control form-control-lg border-0 shadow-sm" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                            <button className="btn btn-primary btn-lg w-100 shadow-sm fw-bold" onClick={cargarDashboard} disabled={loading}>
                                {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Calculando...</> : <><i className="fas fa-search me-2"></i>Filtrar Período</>}
                            </button>
                        </div>
                    </div>
                    {datos?.totalRangoSeleccionado !== undefined && (
                        <div className="mt-3 text-end">
                            <span className="badge bg-dark px-3 py-2 fs-6 shadow-sm">
                                Ingresos en el rango: {fmt(datos.totalRangoSeleccionado)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="row g-4">
                {/* ===== TOP PRODUCTOS - BAR CHART ===== */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4">
                            <h6 className="fw-bold mb-0 text-dark"><i className="fas fa-boxes text-warning me-2"></i>Top 10 Productos Más Vendidos</h6>
                        </div>
                        <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
                            {productosData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={productosData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" tickFormatter={(v) => `S/${v}`} style={{ fontSize: '0.7rem' }} />
                                        <YAxis type="category" dataKey="name" width={100} style={{ fontSize: '0.7rem' }} />
                                        <Tooltip
                                            formatter={(value, name) => [fmt(value), 'Ingresos']}
                                            labelFormatter={(label) => {
                                                const item = productosData.find(p => p.name === label);
                                                return item?.fullName || label;
                                            }}
                                        />
                                        <Bar dataKey="ingresos" radius={[0, 6, 6, 0]}>
                                            {productosData.map((_, i) => (
                                                <Cell key={i} fill={COLORES_PRODUCTO[i % COLORES_PRODUCTO.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <i className="fas fa-box-open opacity-25 d-block fs-3 mb-2"></i>
                                    No hay ventas en este periodo
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== TOP CLIENTES - BAR CHART ===== */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4">
                            <h6 className="fw-bold mb-0 text-dark"><i className="fas fa-users text-primary me-2"></i>Top 5 Clientes Frecuentes</h6>
                        </div>
                        <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
                            {clientesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={clientesData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" style={{ fontSize: '0.7rem' }} />
                                        <YAxis tickFormatter={(v) => `S/${v}`} style={{ fontSize: '0.7rem' }} />
                                        <Tooltip
                                            formatter={(value, name) => [name === 'total' ? fmt(value) : value, name === 'total' ? 'Total Comprado' : 'Compras']}
                                            labelFormatter={(label) => {
                                                const item = clientesData.find(c => c.name === label);
                                                return item?.fullName || label;
                                            }}
                                        />
                                        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                            {clientesData.map((_, i) => (
                                                <Cell key={i} fill={COLORES_METODO[i % COLORES_METODO.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <i className="fas fa-users-slash opacity-25 d-block fs-3 mb-2"></i>
                                    No hay compras en este periodo
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== TIPOS DE GASTO - PIE/DONUT ===== */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4">
                            <h6 className="fw-bold mb-0 text-dark"><i className="fas fa-receipt text-danger me-2"></i>Top 5 Tipos de Gasto</h6>
                        </div>
                        <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
                            {tiposGastoData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={tiposGastoData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={renderLabel}
                                            labelLine={false}
                                        >
                                            {tiposGastoData.map((_, i) => (
                                                <Cell key={i} fill={COLORES_GASTO[i % COLORES_GASTO.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <i className="fas fa-chart-pie opacity-25 d-block fs-3 mb-2"></i>
                                    No hay gastos en este periodo
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== TOP EMPLEADOS PUNTUALES (solo admin) ===== */}
                {esAdmin && <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100 bg-light">
                        <div className="card-header bg-transparent border-bottom-0 pt-4">
                            <h6 className="fw-bold mb-0 text-dark"><i className="fas fa-medal text-warning me-2"></i>Top 5 Empleados Puntuales</h6>
                        </div>
                        <div className="card-body">
                            {datos?.topEmpleados?.length > 0 ? (
                                <ul className="list-group list-group-flush bg-transparent">
                                    {datos.topEmpleados.map((e, i) => (
                                        <li key={i} className="list-group-item bg-transparent d-flex justify-content-between align-items-center mb-2 rounded border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-3" style={{ width: 35, height: 35, background: `linear-gradient(135deg, ${COLORES_METODO[i]}, ${COLORES_METODO[i]}aa)` }}>
                                                    <span className="fw-bold">{i + 1}</span>
                                                </div>
                                                <span className="fw-bold text-dark">{e.nombre}</span>
                                            </div>
                                            <span className="badge bg-success rounded-pill px-3 py-2"><i className="fas fa-check-circle me-1"></i> {e.asistenciasPuntuales} Días</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <i className="fas fa-users-slash d-block fs-3 mb-2 opacity-50"></i>
                                    No hay registros de asistencia en este periodo
                                </div>
                            )}
                        </div>
                    </div>
                </div>}

            </div>

        </div>
    );
};

export default DashboardReportes;
