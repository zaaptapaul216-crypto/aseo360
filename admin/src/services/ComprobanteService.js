import api from './api';

export const ComprobanteService = {
    emitirComprobante: async (data) => {
        const response = await api.post('/comprobante/emitir', data);
        return response.data;
    },

    enviarGuiaRemision: async (data) => {
        const response = await api.post('/comprobante/enviar-guia', data);
        return response.data;
    },

    listarGuiasRemision: async (page = 0, size = 15) => {
        const response = await api.get(`/guia-remision/listar?page=${page}&size=${size}`);
        return response.data;
    },

    listar: async (page = 0, size = 15) => {
        const response = await api.get(`/comprobante/listar?page=${page}&size=${size}`);
        return response.data;
    },

    anular: async (id) => {
        const response = await api.put(`/comprobante/anular/${id}`);
        return response.data;
    },

    consultarEstado: async (id) => {
        const response = await api.post(`/comprobante/consultar-estado/${id}`);
        return response.data;
    },

    obtenerSiguienteNumero: async (tipoDocumento, serie) => {
        const response = await api.get(`/comprobante/siguiente-numero?tipoDocumento=${tipoDocumento}&serie=${serie}`);
        return response.data;
    },

    obtenerSiguienteNumeroGuia: async (serie) => {
        const response = await api.get(`/comprobante/siguiente-numero-guia?serie=${serie}`);
        return response.data;
    }
};
