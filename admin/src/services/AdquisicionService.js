import api from './api';

export const AdquisicionService = {

    getAll: async () => {
        const response = await api.get('/adquisicion/listar');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/adquisicion/buscar/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/adquisicion/registrar', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/adquisicion/modificar/${id}`, data);
        return response.data;
    },

    cambiarEstado: async (id, estado) => {
        const response = await api.patch(`/adquisicion/estado/${id}`, { estado });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/adquisicion/eliminar/${id}`);
        return response.data;
    },
};
