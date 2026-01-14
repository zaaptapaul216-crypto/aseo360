import React from 'react';
import Layout from '../../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faShoppingCart, faUsers, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
    { name: 'Lun', ventas: 4000 },
    { name: 'Mar', ventas: 3000 },
    { name: 'Mie', ventas: 2000 },
    { name: 'Jue', ventas: 2780 },
    { name: 'Vie', ventas: 1890 },
    { name: 'Sab', ventas: 2390 },
    { name: 'Dom', ventas: 3490 },
];

const StatCard = ({ title, value, icon, color }) => (
    <div className="card-premium h-100 d-flex flex-column justify-content-between position-relative overflow-hidden">
        <div className="d-flex justify-content-between align-items-start z-1">
            <div>
                <p className="text-muted small fw-bold text-uppercase mb-1">{title}</p>
                <h3 className="fw-bold mb-0">{value}</h3>
            </div>
            <div className={`rounded-circle p-3 text-white bg-${color} bg-opacity-75 shadow-sm`}>
                <FontAwesomeIcon icon={icon} size="lg" />
            </div>
        </div>
        {/* Decorative circle */}
        <div className={`position-absolute bottom-0 end-0 p-5 rounded-circle bg-${color} opacity-10 translate-middle-y me-n4 mb-n4`}></div>
    </div>
);

const AdminDashboard = () => {
    return (
        <Layout>
            <div className="container-fluid p-0 fade-in">
                <h4 className="fw-bold mb-4">Resumen General</h4>

                {/* Stats Row */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <StatCard title="Ventas del Día" value="S/ 1,240.00" icon={faWallet} color="primary" />
                    </div>
                    <div className="col-md-3">
                        <StatCard title="Comprobantes Emitidos" value="34" icon={faShoppingCart} color="success" />
                    </div>
                    <div className="col-md-3">
                        <StatCard title="Total Clientes" value="156" icon={faUsers} color="info" />
                    </div>
                    <div className="col-md-3">
                        <StatCard title="Alertas Stock" value="5" icon={faBoxOpen} color="warning" />
                    </div>
                </div>

                {/* Charts Row */}
                <div className="row g-4 mb-4">
                    <div className="col-md-8">
                        <div className="card-premium h-100">
                            <h5 className="fw-bold mb-4">Rendimiento de Ventas (Semanal)</h5>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="ventas" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVentas)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card-premium h-100">
                            <h5 className="fw-bold mb-4">Productos Más Vendidos</h5>
                            <ul className="list-group list-group-flush bg-transparent">
                                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center py-3 border-bottom">
                                    <div>
                                        <div className="fw-bold">Detergente Líquido 5L</div>
                                        <small className="text-muted">Aseo / Limpieza</small>
                                    </div>
                                    <span className="badge bg-primary rounded-pill">45 un</span>
                                </li>
                                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center py-3 border-bottom">
                                    <div>
                                        <div className="fw-bold">Lejía Concentrada</div>
                                        <small className="text-muted">Desinfección</small>
                                    </div>
                                    <span className="badge bg-primary rounded-pill">32 un</span>
                                </li>
                                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center py-3">
                                    <div>
                                        <div className="fw-bold">Papel Toalla Ind.</div>
                                        <small className="text-muted">Papelería</small>
                                    </div>
                                    <span className="badge bg-primary rounded-pill">28 un</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default AdminDashboard;
