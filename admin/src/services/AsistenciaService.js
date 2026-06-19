import api from './api';

export const AsistenciaService = {

    // --- Registros de Asistencia ---

    // Lista las asistencias del empleado autenticado
    listarPorEmpleado: async () => {
        const response = await api.get(`/asistencia/listar/mis-asistencias`);
        return response.data;
    },

    listarPorFecha: async (fecha) => {
        const response = await api.get(`/asistencia/listar/por-fecha?fecha=${fecha}`);
        return response.data;
    },

    registrarAdmin: async (dto) => {
        const response = await api.post('/asistencia/registrar/admin', dto);
        return response.data;
    },

    // Registra la entrada del empleado autenticado (usa el JWT para identificarlo)
    registrarEntrada: async () => {
        const response = await api.post('/asistencia/registrar');
        return response.data;
    },

    // Registra la salida dado el ID de la asistencia del día
    registrarSalida: async (idAsistencia) => {
        const response = await api.put(`/asistencia/registrar/salida/${idAsistencia}`);
        return response.data;
    },

    // --- Modificaciones (solo Administrador) ---

    // Modifica los datos de una asistencia (body: AsistenciaDTO)
    modificarAsistencia: async (asistenciaDTO) => {
        const response = await api.put('/asistencia/modificar/asistencia', asistenciaDTO);
        return response.data;
    },

    // Agrega o edita el comentario de una asistencia (body: AsistenciaDTO)
    modificarComentario: async (asistenciaDTO) => {
        const response = await api.put('/asistencia/modificar/comentario', asistenciaDTO);
        return response.data;
    },

    // Modifica el estado de una asistencia (body: AsistenciaDTO)
    modificarEstado: async (asistenciaDTO) => {
        const response = await api.put('/asistencia/modificar/estado', asistenciaDTO);
        return response.data;
    },

    // Lista asistencias de un mes completo (para exportar a Excel)
    listarPorMes: async (anio, mes) => {
        const response = await api.get(`/asistencia/listar/por-mes?anio=${anio}&mes=${mes}`);
        return response.data;
    },

    // --- Configuración del Sistema (horarios) ---

    // Obtiene todas las configuraciones del sistema
    getConfiguraciones: async () => {
        const response = await api.get('/configuracion/listar');
        return response.data;
    },

    // Obtiene una configuración por clave (ej: 'hora_entrada')
    getConfiguracion: async (clave) => {
        const response = await api.get(`/configuracion/${clave}`);
        return response.data;
    },

    // Modifica una configuración existente (body: ConfiguracionSistema)
    modificarConfiguracion: async (configuracion) => {
        const response = await api.put('/configuracion/modificar', configuracion);
        return response.data;
    },
};
