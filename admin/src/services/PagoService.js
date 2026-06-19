import api from './api';

// PagoService conecta con el módulo de Ventas del backend
// Las ventas del POS son los registros de pago/cobro en el sistema
export const PagoService = {

    // Lista todas las ventas registradas (equivale a los pagos/cobros)
    getAll: async () => {
        const response = await api.get('/venta/listar');
        return response.data;
    },

    // Detalle de items de una venta (pago)
    getDetalles: async (id) => {
        const response = await api.get(`/venta/listar/detalles/${id}`);
        return response.data;
    },

    // Registra una nueva venta (body: VentaRegistroDTO)
    create: async (venta) => {
        const response = await api.post('/venta/registrar', venta);
        return response.data;
    },

    // Anula una venta existente (revierte el stock)
    anular: async (id) => {
        const response = await api.patch(`/venta/anular/${id}/venta`);
        return response.data;
    },
};
