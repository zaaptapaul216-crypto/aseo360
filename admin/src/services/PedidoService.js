import api from './api';

export const PedidoService = {

    // Lista todos los pedidos (admin)
    getAll: async () => {
        const response = await api.get('/pedido/listar');
        return response.data;
    },

    // Detalle de los items de un pedido específico
    getDetalles: async (id) => {
        const response = await api.get(`/pedido/listar/detalles/${id}`);
        return response.data;
    },

    // Cambia el estado de un pedido (body: { idPedido, estado })
    updateEstado: async (idPedido, estado) => {
        const response = await api.patch('/pedido/modificar/estado', { idPedido, estado });
        return response.data;
    },

    // Anula un pedido por ID
    anular: async (id) => {
        const response = await api.patch(`/pedido/anular/${id}/pedido`);
        return response.data;
    },
};
