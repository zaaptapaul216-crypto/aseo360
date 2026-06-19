import api from './api';

export const ConfiguracionService = {

    getAll: async () => {
        const response = await api.get('/configuracion/listar');
        return response.data;
    },

    getByKey: async (clave) => {
        const response = await api.get(`/configuracion/${clave}`);
        return response.data;
    },

    // Determina dinámicamente si debe registrar o actualizar evaluando si ya se le asignó un ID
    saveOrUpdate: async (idConfiguracion, clave, valor, descripcion) => {
        const payload = { idConfiguracion, clave, valor, descripcion };

        if (idConfiguracion) {
            // Existe en BD -> Modificar
            const response = await api.put('/configuracion/modificar', payload);
            return response.data;
        } else {
            // No existe -> Registrar
            const response = await api.post('/configuracion/registrar', payload);
            return response.data;
        }
    }
};
