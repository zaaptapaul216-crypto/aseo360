
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Sidebar.css';
import { AsistenciaService } from '../../services/AsistenciaService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const Sidebar = ({ isOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    // TODO: Implement isUserBlocked in AsistenciaService when ready
    const isBlocked = false;

    const menuGroups = [
        {
            title: 'Principal',
            collapsible: true,
            roles: ['Administrador', 'Vendedor', 'Almacenero'],
            items: [
                { path: '/', icon: 'fas fa-home', label: 'Inicio', roles: ['Administrador', 'Vendedor', 'Almacenero'] },
            ]
        },
        {
            title: 'Ventas',
            collapsible: true,
            roles: ['Administrador', 'Vendedor'],
            items: [
                { path: '/puntoventa', icon: 'fas fa-cash-register', label: 'Nueva Venta', roles: ['Administrador', 'Vendedor'] },
                { path: '/ventas', icon: 'fas fa-receipt', label: 'Ventas', roles: ['Administrador', 'Vendedor'] },
                { path: '/pedidos', icon: 'fas fa-shopping-bag', label: 'Pedidos', roles: ['Administrador', 'Vendedor'] },
                { path: '/clientes', icon: 'fas fa-users', label: 'Clientes', roles: ['Administrador', 'Vendedor'] },
                { path: '/pagos-gastos', icon: 'fas fa-money-bill-wave', label: 'Pagos y Gastos', roles: ['Administrador', 'Vendedor'] },
                { path: '/cotizacion', icon: 'fas fa-file-invoice-dollar', label: 'Cotización', roles: ['Administrador', 'Vendedor'] },
            ]
        },
        {
            title: 'Comprobantes',
            collapsible: true,
            roles: ['Administrador', 'Vendedor'],
            items: [
                { path: '/boleta', icon: 'fas fa-file-invoice', label: 'Nueva Boleta', roles: ['Administrador', 'Vendedor'] },
                { path: '/factura', icon: 'fas fa-file-invoice-dollar', label: 'Nueva Factura', roles: ['Administrador', 'Vendedor'] },
                { path: '/comprobantes', icon: 'fas fa-receipt', label: 'Comprobantes', roles: ['Administrador', 'Vendedor'] },
            ]
        },
        {
            title: 'Almacén',
            collapsible: true,
            roles: ['Administrador', 'Almacenero'],
            items: [
                { path: '/producto', icon: 'fas fa-tag', label: 'Producto', roles: ['Administrador', 'Almacenero'] },
                { path: '/inventario', icon: 'fas fa-boxes', label: 'Inventario', roles: ['Administrador', 'Almacenero'] },
                { path: '/kardex', icon: 'fas fa-history', label: 'Kárdex', roles: ['Administrador', 'Almacenero'] },
                { path: '/movimientos', icon: 'fas fa-exchange-alt', label: 'Movimientos', roles: ['Administrador', 'Almacenero'] },
                { path: '/transferencia', icon: 'fas fa-truck-loading', label: 'Transferencia', roles: ['Administrador', 'Almacenero'] },
                { path: '/guia-remision', icon: 'fas fa-file-alt', label: 'Guía de Remisión', roles: ['Administrador', 'Almacenero'] },
                { path: '/requerimiento', icon: 'fas fa-clipboard-list', label: 'Solicitudes', roles: ['Administrador', 'Almacenero', 'Vendedor'] },
            ]
        },
        {
            title: 'Sistema',
            collapsible: true,
            roles: ['Administrador', 'Vendedor', 'Almacenero'],
            items: [
                { path: '/asistencia', icon: 'fas fa-calendar-check', label: 'Asistencia', roles: ['Administrador', 'Vendedor', 'Almacenero'] },
                { path: '/control-asistencia', icon: 'fas fa-clipboard-check', label: 'Control Asistencia', roles: ['Administrador'] },
                { path: '/empleados', icon: 'fas fa-id-card', label: 'Empleados', roles: ['Administrador'] },
                { path: '/configuracion', icon: 'fas fa-cog', label: 'Configuración', roles: ['Administrador'] }
            ]
        }
    ];

    const [collapsedSections, setCollapsedSections] = useState({
        'Principal': false,
        'Ventas': true,
        'Comprobantes': true,
        'Almacén': true,
        'Sistema': true
    });

    const toggleSection = (sectionTitle) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionTitle]: !prev[sectionTitle]
        }));
    };

    const handleProtectedLink = (e, path) => {
        if (isBlocked && path !== '/asistencia') {
            e.preventDefault();
            toast.warning('Acceso Restringido: Estás bloqueado por tardanza. Debes ir al módulo de Asistencia.');
            navigate('/asistencia');
        }
    };

    const userRole = (user?.roleName || 'VISITANTE').toUpperCase().trim();

    const filteredGroups = menuGroups.filter(group => {
        const hasAccessToGroup = group.roles.some(r => r.toUpperCase().trim() === userRole);
        return hasAccessToGroup;
    }).map(group => {
        const filteredItems = group.items.filter(item => {
            const hasAccessToItem = item.roles.some(r => r.toUpperCase().trim() === userRole);
            return hasAccessToItem;
        });
        return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="d-flex flex-column p-3">
                {filteredGroups.map((group, index) => (
                    <div key={index} className="mb-4">
                        <h6
                            className={`text-uppercase fw-bold mb-2 ps-2 sidebar-group-title d-flex align-items-center ${group.collapsible ? 'cursor-pointer' : ''}`}
                            onClick={() => group.collapsible && toggleSection(group.title)}
                            style={group.collapsible ? { cursor: 'pointer', userSelect: 'none' } : {}}
                        >
                            {group.title}
                            {group.collapsible && (
                                <i className={`fas fa-chevron-${collapsedSections[group.title] ? 'down' : 'up'} ms-auto small`}></i>
                            )}
                        </h6>
                        {!collapsedSections[group.title] && (
                            <ul className="nav nav-pills flex-column">
                                {group.items.map((item) => (
                                    <li className="nav-item mb-1" key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={(e) => handleProtectedLink(e, item.path)}
                                            className={`nav-link text-white d-flex align-items-center sidebar-link ${location.pathname === item.path ? 'active' : ''} ${isBlocked && item.path !== '/asistencia' ? 'opacity-50' : ''}`}
                                        >
                                            <i className={`${item.icon} me-3 sidebar-icon ${isBlocked && item.path !== '/asistencia' ? 'text-danger' : ''}`}></i>
                                            <span className="sidebar-label">{item.label}</span>
                                            {isBlocked && item.path !== '/asistencia' && (
                                                <i className="fas fa-lock ms-auto small text-danger"></i>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}

                {/* Botón de Cerrar Sesión */}
                <div className="mt-auto pt-4 pb-2 border-top border-primary-dark">
                    <button
                        onClick={async () => {
                            const r = await Swal.fire({ title: '¿Cerrar sesión?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'No' });
                            if (r.isConfirmed) {
                                logout();
                                navigate('/login');
                            }
                        }}
                        className="btn btn-link text-white text-decoration-none d-flex align-items-center sidebar-link w-100 border-0"
                        style={{ background: 'rgba(220, 53, 69, 0.2)' }}
                    >
                        <i className="fas fa-sign-out-alt me-3 sidebar-icon text-danger"></i>
                        <span className="sidebar-label fw-bold text-danger">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
