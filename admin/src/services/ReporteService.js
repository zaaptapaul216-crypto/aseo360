import api from './api';

class ReporteService {
    async obtenerDashboard(fechaInicio, fechaFin) {
        const params = {};
        if (fechaInicio) params.fechaInicio = fechaInicio;
        if (fechaFin) params.fechaFin = fechaFin;

        const response = await api.get(`/reportes/dashboard`, {
            params
        });
        return response;
    }
}

export default new ReporteService();
