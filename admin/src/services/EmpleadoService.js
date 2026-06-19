import api from './api';

export const EmpleadoService = {

    // --- EMPLEADOS ---
    getAll: async () => {
        const response = await api.get('/empleados');
        return response.data;
    },

    create: async (empleado) => {
        const response = await api.post('/empleados/registrar', empleado);
        return response.data;
    },

    update: async (empleado) => {
        // El backend recibe el id dentro del body (PUT /api/empleados/modificar)
        const response = await api.put('/empleados/modificar', empleado);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/empleados/eliminar/${id}`);
        return response.data;
    },

    // --- ROLES ---
    getRoles: async () => {
        const response = await api.get('/roles');
        return response.data;
    },
};
