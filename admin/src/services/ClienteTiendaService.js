import api from './api';

export const ClienteTiendaService = {

    // Lista todos los clientes de tienda registrados
    getAll: async () => {
        const response = await api.get('/clientetienda/listar');
        return response.data;
    },

    // Crea un nuevo cliente de tienda
    create: async (cliente) => {
        const response = await api.post('/clientetienda/registrar', cliente);
        return response.data;
    },

    // Elimina un cliente de tienda por ID
    delete: async (id) => {
        const response = await api.delete(`/clientetienda/eliminar/${id}`);
        return response.data;
    },

    // Actualiza los datos de un cliente de tienda
    update: async (clienteData) => {
        const response = await api.put(`/clientetienda/modificar`, clienteData);
        return response.data;
    },

    // Busca un cliente por DNI
    buscarPorDni: async (dni) => {
        const response = await api.get(`/clientetienda/buscar/${dni}/dni`);
        return response.data;
    }
};
