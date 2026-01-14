import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [clients, setClients] = useState([]);

    // ======================
    // AGREGAR CLIENTE
    // ======================
    const addClient = (client) => {
        const newClient = {
            id: Date.now(),
            type: client.type,
            docNumber: client.docNumber,
            name: client.name,
            phone: client.phone,
            email: client.email,
            address: client.address,
            items: client.items || [],
            grandTotal: client.grandTotal || 0
        };

        setClients(prev => [...prev, newClient]);
    };

    // ======================
    // ACTUALIZAR CLIENTE
    // ======================
    const updateClient = (updatedClient) => {
        setClients(prev =>
            prev.map(client =>
                client.id === updatedClient.id
                    ? {
                        ...client,
                        ...updatedClient,
                        items: updatedClient.items || [],
                        grandTotal: updatedClient.grandTotal || 0
                    }
                    : client
            )
        );
    };

    // ======================
    // ELIMINAR CLIENTE
    // ======================
    const deleteClient = (id) => {
        setClients(prev => prev.filter(client => client.id !== id));
    };

    // ======================
    // AUTH
    // ======================
    const [user, setUser] = useState(null);

    const login = (role) => {
        setUser({ role, name: role === 'admin' ? 'Administrador' : 'Vendedor' });
    };

    const logout = () => {
        setUser(null);
    };

    // ======================
    // PRODUCTOS (MOCK)
    // ======================
    const [products, setProducts] = useState([
        { id: 1, code: 'PROD001', name: 'Detergente Líquido 5L', price: 25.00, cost: 18.00, stock: 50, category: 'Limpieza' },
        { id: 2, code: 'PROD002', name: 'Lejía Concentrada', price: 8.50, cost: 6.00, stock: 100, category: 'Desinfección' },
        { id: 3, code: 'PROD003', name: 'Papel Toalla Interfoliado', price: 4.50, cost: 3.00, stock: 200, category: 'Papelería' },
        { id: 4, code: 'PROD004', name: 'Jabón Líquido Antibacterial', price: 12.00, cost: 8.50, stock: 80, category: 'Higiene' },
        { id: 5, code: 'PROD005', name: 'Desengrasante Industrial', price: 35.00, cost: 25.00, stock: 30, category: 'Industrial' },
        { id: 6, code: 'PROD006', name: 'Guantes de Latex Caja', price: 15.00, cost: 10.00, stock: 150, category: 'Seguridad' },
    ]);

    // ======================
    // VENTAS
    // ======================
    const [sales, setSales] = useState([]);

    const addSale = (sale) => {
        const newSale = {
            ...sale,
            id: Date.now(), // Simple ID generation
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
        };
        setSales(prev => [...prev, newSale]);
        return newSale;
    };

    const addProduct = (product) => {
        setProducts(prev => [...prev, { ...product, id: Date.now() }]);
    };

    const updateProduct = (updatedProduct) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    // ======================
    // PROVEEDORES
    // ======================
    const [suppliers, setSuppliers] = useState([
        { id: 1, ruc: '20100100100', name: 'Distribuidora Limpieza Total', phone: '999888777', email: 'contacto@limpiezatotal.com', address: 'Av. Industrial 123' }
    ]);

    const addSupplier = (supplier) => {
        setSuppliers(prev => [...prev, { ...supplier, id: Date.now() }]);
    };

    const updateSupplier = (updatedSupplier) => {
        setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    };

    const deleteSupplier = (id) => {
        setSuppliers(prev => prev.filter(s => s.id !== id));
    };

    return (
        <DataContext.Provider
            value={{
                clients,
                addClient,
                updateClient,
                deleteClient,
                user,
                login,
                logout,
                products,
                sales,
                addSale,
                addProduct,
                updateProduct,
                deleteProduct,
                suppliers,
                addSupplier,
                updateSupplier,
                deleteSupplier
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
