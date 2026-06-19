import api from './api';

export const GastoService = {

    // Lista todos los gastos registrados
    getAll: async () => {
        const response = await api.get('/gasto/listar');
        return response.data;
    },

    // Busca un gasto por su ID
    getById: async (id) => {
        const response = await api.get(`/gasto/buscar/${id}`);
        return response.data;
    },

    // Registra un nuevo gasto (body: GastoRegistroDTO)
    create: async (gasto) => {
        const response = await api.post('/gasto/registrar', gasto);
        return response.data;
    },

    // Modifica un gasto existente (id en URL, body: GastoRegistroDTO)
    update: async (id, gasto) => {
        const response = await api.put(`/gasto/modificar/${id}`, gasto);
        return response.data;
    },

    // Elimina un gasto por su ID
    delete: async (id) => {
        const response = await api.delete(`/gasto/eliminar/${id}`);
        return response.data;
    },
};
