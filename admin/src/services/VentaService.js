import api from './api';

export const VentaService = {
    registrarVenta: async (ventaData) => {
        const response = await api.post('/venta/registrar', ventaData);
        return response.data;
    },

    getAll: async (page = 0, size = 15) => {
        const response = await api.get(`/venta/listar?page=${page}&size=${size}`);
        return response.data;
    },

    anularVenta: async (id) => {
        const response = await api.patch(`/venta/anular/${id}/venta`);
        return response.data;
    },

    getDetallesPorVentaId: async (id) => {
        const response = await api.get(`/venta/listar/detalles/${id}`);
        return response.data;
    }
};
