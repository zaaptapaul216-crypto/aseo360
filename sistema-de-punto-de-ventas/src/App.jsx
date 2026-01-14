import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/administrador/AdminDashboard';
import POS from './pages/vendedor/POS';
import Inventory from './pages/almacenero/Inventory';
import SalesHistory from './pages/administrador/SalesHistory';
import Users from './pages/administrador/Users';
import Attendance from './pages/Attendance';
import Suppliers from './pages/almacenero/Suppliers';
import Guides from './pages/almacenero/Guides';
import Clients from './pages/vendedor/Clients';
import Expenses from './pages/administrador/Expenses';
import FiscalDocuments from './pages/administrador/FiscalDocuments';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales-history" element={<SalesHistory />} />
        <Route path="/sunat/invoices" element={<SalesHistory />} />
        <Route path="/sunat/guides" element={<Guides />} />
        <Route path="/admin/expenses" element={<Expenses />} />
        <Route path="/admin/fiscal-documents" element={<FiscalDocuments />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/users" element={<Users />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
