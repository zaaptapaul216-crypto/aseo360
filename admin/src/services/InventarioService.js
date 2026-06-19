import api from './api';

export const InventarioService = {

    // --- PRODUCTOS ---
    getAll: async () => {
        const response = await api.get('/producto/listar');
        return response.data;
    },

    create: async (producto) => {
        const response = await api.post('/producto/registrar', producto);
        return response.data;
    },

    getInventarioById: async (id) => {
        const response = await api.get(`/inventarios/${id}`);
        return response.data;
    },

    // Sincronizar catálogo para inicializar en cero los productos faltantes del maestro
    sincronizarCatalogo: async (idInventario) => {
        const response = await api.post(`/inventarios/${idInventario}/sincronizar`);
        return response.data;
    },

    getInventariosList: async () => {
        const response = await api.get('/inventarios/listar');
        return response.data;
    },

    getProductosPorInventario: async (idInventario) => {
        const response = await api.get(`/inventarios/${idInventario}/productos`);
        return response.data;
    },

    getProductosDisponiblesPorInventario: async (idInventario) => {
        const response = await api.get(`/inventarios/${idInventario}/productos/disponibles`);
        return response.data;
    },

    // Modifica un producto existente (body: ProductoRegistroDTO con idProducto incluido)
    update: async (producto) => {
        const response = await api.put('/producto/modificar', producto);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/producto/eliminar/${id}`);
        return response.data;
    },

    // --- ATRIBUTOS GENÉRICOS (Categoría, Aroma, Proveedor, Sede) ---
    // entity: 'categoria' | 'aroma' | 'proveedor' | 'sede'
    getAttributes: async (entity) => {
        const endpointMap = {
            categoria: '/categoria/listar',
            aroma: '/aroma/listar',
            proveedor: '/proveedor/listar',
            sede: '/sede/listar',
        };
        const url = endpointMap[entity] || `/${entity}/listar`;
        const response = await api.get(url);

        let data = response.data?.content || (Array.isArray(response.data) ? response.data : []);

        // Normalizar los IDs del backend a un campo genérico `id` para usar en las tablas
        return data.map(item => ({
            ...item,
            id: item.idCategoria || item.idAroma || item.idSede || item.ruc || item.idInventario || item.id
        }));
    },

    createAttribute: async (entity, data) => {
        const endpointMap = {
            categoria: '/categoria/registrar',
            aroma: '/aroma/registrar',
            proveedor: '/proveedor/registrar',
            sede: '/sede/registrar',
        };
        const url = endpointMap[entity] || `/${entity}/registrar`;
        const response = await api.post(url, data);
        return response.data;
    },

    updateAttribute: async (entity, data) => {
        const endpointMap = {
            proveedor: '/proveedor/modificar',
        };
        const url = endpointMap[entity] || `/${entity}/modificar`;
        const response = await api.put(url, data);
        return response.data;
    },

    deleteAttribute: async (entity, id) => {
        const endpointMap = {
            categoria: `/categoria/eliminar/${id}`,
            aroma: `/aroma/eliminar/${id}`,
            proveedor: `/proveedor/eliminar/${id}`,
            sede: `/sede/eliminar/${id}`,
        };
        const url = endpointMap[entity] || `/${entity}/eliminar/${id}`;
        const response = await api.delete(url);
        return response.data;
    },

    // --- TRANSFERENCIA DE STOCK Y MATRICES ---
    registrarIngreso: async (payload) => {
        const response = await api.post('/inventarios/ingreso', payload);
        return response.data;
    },

    registrarSalida: async (payload) => {
        const response = await api.post('/inventarios/salida', payload);
        return response.data;
    },

    // --- TRASLADOS DE INVENTARIO ---
    registrarTraslado: async (payload) => {
        const response = await api.post('/inventarios/traslado', payload);
        return response.data;
    },

    listarTraslados: async () => {
        const response = await api.get('/inventarios/traslados');
        return response.data;
    },

    cambiarEstadoTraslado: async (id, estado, usuario) => {
        const response = await api.put(`/inventarios/traslados/${id}/estado`, { estado, usuario });
        return response.data;
    },

    cambiarEstadoSede: async (id) => {
        const response = await api.patch(`/sede/cambiar-estado/${id}`);
        return response.data;
    }
};
