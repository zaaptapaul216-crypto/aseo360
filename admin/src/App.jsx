import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Configuracion from './pages/sistema/Configuracion';

import Pedidos from './pages/tienda/Pedidos';
import PagosGastos from './pages/tienda/PagosGastos';
import Clientes from './pages/venta/Clientes';
import PuntoVenta from './pages/venta/PuntoVenta';
import Ventas from './pages/venta/Ventas';
import Inventario from './pages/gestion/Inventario';
import GuiaRemision from './pages/gestion/GuiaRemision';
import Comprobantes from './pages/comprobantes/Comprobantes';
import Cotizacion from './pages/seguimiento/Cotizacion';
import Asistencia from './pages/sistema/Asistencia';
import ControlAsistencia from './pages/sistema/ControlAsistencia';
import Empleados from './pages/sistema/Empleados';
import Login from './pages/auth/Login';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

// New Pages
import NotaCredito from './pages/comprobantes/NotaCredito';
import NotaDebito from './pages/comprobantes/NotaDebito';
import Boleta from './pages/comprobantes/Boleta';
import Factura from './pages/comprobantes/Factura';
import Requerimiento from './pages/adquisicion/Requerimiento';

// Logística y Gestión
import Producto from './pages/gestion/Producto';
import InventarioProductos from './pages/gestion/InventarioProductos';
import MovimientoInventario from './pages/gestion/MovimientoInventario';
import Transferencia from './pages/gestion/Transferencia';
import Kardex from './pages/gestion/Kardex';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="p-5 text-center">Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Role-Based Route Component
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div className="p-5 text-center">Verificando permisos...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const userRole = user?.roleName || 'Empleado';

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Tienda */}
          <Route index element={<Dashboard />} />
          <Route path="pedidos" element={<RoleRoute allowedRoles={['Administrador', 'Vendedor']}><Pedidos /></RoleRoute>} />
          <Route path="pagos-gastos" element={<RoleRoute allowedRoles={['Administrador', 'Vendedor']}><PagosGastos /></RoleRoute>} />

          {/* Venta */}
          <Route path="clientes" element={<RoleRoute allowedRoles={['Administrador', 'Vendedor']}><Clientes /></RoleRoute>} />
          <Route path="puntoventa" element={<RoleRoute allowedRoles={['Administrador', 'Vendedor']}><PuntoVenta /></RoleRoute>} />
          <Route path="ventas" element={<RoleRoute allowedRoles={['Administrador', 'Vendedor']}><Ventas /></RoleRoute>} />

          {/* Gestión */}
          <Route path="producto" element={<RoleRoute allowedRoles={['Administrador', 'Almacenero']}><Producto /></RoleRoute>} />
          <Route path="inventario" element={<RoleRoute allowedRoles={['Administrador', 'Almacenero']}><Inventario /></RoleRoute>} />
          <Route path="inventario/productos/:id" element={<RoleRoute allowedRoles={['Administrador', 'Almacenero']}><InventarioProductos /></RoleRoute>} />
          <Route path="kardex" element={<RoleRoute allowedRoles={['Administrador', 'Almacenero']}><Kardex /></RoleRoute>} />
          <Route path="movimientos" element={<RoleRoute allowedRoles={['Administrador', 'Almacenero']}><MovimientoInventario /></RoleRoute>} />
          <Route path="transferencia" element={<RoleRoute allowedRoles={['Administrador', 'Almacenero']}><Transferencia /></RoleRoute>} />
          <Route path="guia-remision" element={<RoleRoute allowedRoles={['Administrador', 'Almacenero']}><GuiaRemision /></RoleRoute>} />

          {/* Comprobante */}
          <Route path="comprobantes" element={<RoleRoute allowedRoles={['Administrador', 'Vendedor']}><Comprobantes /></RoleRoute>} />
          <Route path="boleta" element={<RoleRoute allowedRoles={['Administrador', 'Vendedor']}><Boleta /></RoleRoute>} />
          <Route path="factura" element={<RoleRoute allowedRoles={['Administrador', 'Vendedor']}><Factura /></RoleRoute>} />

          {/* Seguimiento */}
          <Route path="cotizacion" element={<RoleRoute allowedRoles={['Administrador', 'Vendedor']}><Cotizacion /></RoleRoute>} />
          <Route path="requerimiento" element={<RoleRoute allowedRoles={['Administrador', 'Vendedor', 'Almacenero']}><Requerimiento /></RoleRoute>} />


          {/* Sistema */}
          <Route path="asistencia" element={<Asistencia />} />
          <Route path="control-asistencia" element={<RoleRoute allowedRoles={['Administrador']}><ControlAsistencia /></RoleRoute>} />
          <Route path="empleados" element={<RoleRoute allowedRoles={['Administrador']}><Empleados /></RoleRoute>} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
