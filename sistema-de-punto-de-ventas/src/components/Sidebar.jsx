import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartPie,
    faCashRegister,
    faBoxes,
    faFileInvoiceDollar,
    faTruck,
    faUsersCog,
    faSignOutAlt,
    faBars
} from '@fortawesome/free-solid-svg-icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const { user, logout } = useData();
    const userRole = user?.role;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`sidebar glass-panel d-flex flex-column h-100 ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header p-3 d-flex align-items-center justify-content-between">
                <h4 className="m-0 fw-bold text-primary">ASEO360</h4>
                <button className="btn btn-sm d-md-none" onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
            </div>

            <div className="sidebar-menu flex-grow-1 overflow-auto py-3">
                <p className="text-uppercase small text-muted px-3 fw-bold mb-2">Rol: {userRole || 'Invitado'}</p>

                {/* ADMIN & VENDEDOR Links */}
                {(userRole === 'admin' || userRole === 'vendedor') && (
                    <>
                        <p className="text-uppercase small text-muted px-3 fw-bold mb-2">Ventas</p>
                        <NavLink to="/pos" className="nav-link px-3 py-2 d-block">
                            <FontAwesomeIcon icon={faCashRegister} className="me-2" width="20" /> Punto de Venta
                        </NavLink>
                        <NavLink to="/clients" className="nav-link px-3 py-2 d-block">
                            <FontAwesomeIcon icon={faUsersCog} className="me-2" width="20" /> Clientes
                        </NavLink>
                    </>
                )}

                {/* ADMIN ONLY Links */}
                {userRole === 'admin' && (
                    <>
                        <NavLink to="/admin" className={({ isActive }) => `nav-link px-3 py-2 d-block ${isActive ? 'active' : ''}`}>
                            <FontAwesomeIcon icon={faChartPie} className="me-2" width="20" /> Dashboard
                        </NavLink>

                        <p className="text-uppercase small text-muted px-3 fw-bold mb-2 mt-3">Gestión</p>
                        <NavLink to="/sales-history" className="nav-link px-3 py-2 d-block">
                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" width="20" /> Ventas & Facturas
                        </NavLink>
                        <NavLink to="/admin/expenses" className="nav-link px-3 py-2 d-block">
                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" width="20" /> Compras y Gastos
                        </NavLink>
                        <NavLink to="/admin/fiscal-documents" className="nav-link px-3 py-2 d-block">
                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" width="20" /> Retenciones/Percep.
                        </NavLink>
                        <NavLink to="/sunat/invoices" className="nav-link px-3 py-2 d-block">
                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" width="20" /> Facturas / Boletas
                        </NavLink>
                    </>
                )}

                {/* ADMIN & ALMACENERO Links */}
                {(userRole === 'admin' || userRole === 'almacenero') && (
                    <>
                        <p className="text-uppercase small text-muted px-3 fw-bold mb-2 mt-3">Inventario</p>
                        <NavLink to="/inventory" className="nav-link px-3 py-2 d-block">
                            <FontAwesomeIcon icon={faBoxes} className="me-2" width="20" /> Inventario
                        </NavLink>
                        <NavLink to="/sunat/guides" className="nav-link px-3 py-2 d-block">
                            <FontAwesomeIcon icon={faTruck} className="me-2" width="20" /> Guías de Remisión
                        </NavLink>
                    </>
                )}

                {/* System Links */}
                {(userRole === 'admin' || userRole === 'vendedor' || userRole === 'almacenero') && (
                    <>
                        <p className="text-uppercase small text-muted px-3 fw-bold mb-2 mt-3">Sistema</p>
                        {userRole === 'admin' && (
                            <NavLink to="/users" className="nav-link px-3 py-2 d-block">
                                <FontAwesomeIcon icon={faUsersCog} className="me-2" width="20" /> Usuarios
                            </NavLink>
                        )}
                        <NavLink to="/attendance" className="nav-link px-3 py-2 d-block">
                            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" width="20" /> Asistencia
                        </NavLink>
                    </>
                )}
            </div>

            <div className="sidebar-footer p-3 border-top">
                <button onClick={handleLogout} className="btn btn-danger w-100 btn-sm">
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
