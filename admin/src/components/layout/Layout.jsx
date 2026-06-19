
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState } from 'react';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation(); // <- Nuevo hook para leer la ruta

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="admin-layout">
            <Navbar toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} />
            <main className={`main-content ${!sidebarOpen ? 'full-width' : ''}`}>
                <div className="container-fluid d-flex flex-column flex-grow-1 p-3 p-lg-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
