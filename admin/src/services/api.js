import axios from 'axios';

// Cliente Axios centralizado con interceptor JWT para el panel admin
const api = axios.create({
    baseURL: 'https://aseo360-api.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de petición: agrega el token JWT en cada llamada
api.interceptors.request.use(
    (config) => {
        const userData = localStorage.getItem('aseo360_auth_user');
        if (userData) {
            const user = JSON.parse(userData);
            if (user.token) {
                config.headers['Authorization'] = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuesta: redirige al login en caso de sesión expirada
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401) {
            // Evitamos la redirección forzada y el borrado si el error proviene del endpoint de Login.
            if (!originalRequest.url.includes('/auth/login')) {
                localStorage.removeItem('aseo360_auth_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
