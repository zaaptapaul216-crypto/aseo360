import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="d-flex h-100 min-vh-100 overflow-hidden bg-light">
            {/* Sidebar Wrapper */}
            <div className={`sidebar-wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
                style={{ width: isSidebarOpen ? '250px' : '0', transition: 'width 0.3s' }}>
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column h-100 overflow-hidden">
                {/* Navbar */}
                <nav className="navbar navbar-expand-lg navbar-light glass-panel px-4 py-2 mb-3 mx-3 mt-3 rounded-3">
                    <button className="btn btn-link text-dark p-0 me-3" onClick={toggleSidebar}>
                        <FontAwesomeIcon icon={faBars} size="lg" />
                    </button>

                    <h5 className="m-0 fw-bold text-dark">Panel de Administración</h5>

                    <div className="ms-auto d-flex align-items-center">
                        <button className="btn btn-link text-muted me-3 position-relative">
                            <FontAwesomeIcon icon={faBell} size="lg" />
                            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                        </button>
                        <div className="d-flex align-items-center">
                            <span className="me-2 text-end d-none d-md-block line-height-1">
                                <div className="fw-bold small">Admin User</div>
                                <div className="text-muted smaller" style={{ fontSize: '0.75rem' }}>Administrador</div>
                            </span>
                            <FontAwesomeIcon icon={faUserCircle} size="2x" className="text-secondary" />
                        </div>
                    </div>
                </nav>

                {/* Page Content */}
                <main className="flex-grow-1 overflow-auto px-4 pb-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
