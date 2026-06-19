import api from './api';

// Clave del usuario en localStorage
const STORAGE_KEY_USER = 'aseo360_auth_user';

export const AuthService = {

    // Autenticación con el backend real (JWT)
    login: async (correo, password) => {
        const response = await api.post('/auth/login', { correo, password });
        const data = response.data;

        // Mapear rol del backend (ADMINISTRADOR → Administrador, etc.)
        const roleMap = {
            'ADMINISTRADOR': 'Administrador',
            'VENDEDOR': 'Vendedor',
            'ALMACENERO': 'Almacenero',
        };

        const userData = {
            nombreCompleto: data.nombreCompleto,
            fotoPerfil: data.fotoPerfil,
            correo,
            roleName: roleMap[data.rol] || data.rol,
            tipoUsuario: data.tipoUsuario,
            token: data.token,
        };

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
        return userData;
    },

    // Cierra la sesión eliminando los datos del localStorage
    logout: () => {
        localStorage.removeItem(STORAGE_KEY_USER);
    },

    // Obtiene el usuario actual desde localStorage
    getCurrentUser: () => {
        const userStr = localStorage.getItem(STORAGE_KEY_USER);
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            localStorage.removeItem(STORAGE_KEY_USER);
            return null;
        }
    }
};
