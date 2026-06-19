import api from './api';

export const ClienteService = {

    // Lista todos los clientes registrados
    getAll: async () => {
        const response = await api.get('/cliente');
        return response.data;
    },

    // Crea un nuevo cliente
    create: async (cliente) => {
        const response = await api.post('/cliente/register', cliente);
        return response.data;
    },

    // Elimina un cliente por ID
    delete: async (id) => {
        const response = await api.delete(`/cliente/delete/${id}`);
        return response.data;
    },

    // Actualiza los datos de un cliente
    update: async (id, clienteData) => {
        const response = await api.put(`/cliente/update/${id}`, clienteData);
        return response.data;
    }
};
