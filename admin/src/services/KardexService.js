import api from './api';

// KardexService — conectado al backend real
// El backend registra los movimientos automáticamente al procesar ingresos/salidas
// Este servicio solo consulta el historial
export const KardexService = {

    // Lista todos los movimientos de todas las sedes (kardex global)
    getAll: async (page = 0, size = 15) => {
        const response = await api.get('/inventarios/kardex/global', {
            params: { page, size }
        });
        return response.data;
    },

    // Lista los movimientos de un inventario específico
    listarPorInventario: async (idInventario, page = 0, size = 15) => {
        const response = await api.get(`/inventarios/${idInventario}/kardex`, {
            params: { page, size }
        });
        return response.data;
    },
};
