import axios from 'axios';

// Configuración base de Axios
const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Ajusta el puerto si tu backend corre en otro puerto
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para errores (opcional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const clientService = {
    getAll: () => api.get('/clients'),
    create: (client) => api.post('/clients', client),
    update: (id, client) => api.put(`/clients/${id}`, client),
    delete: (id) => api.delete(`/clients/${id}`),
    validateDocument: (docNumber) => api.get(`/external/validate/${docNumber}`),
};

export const productService = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (product) => api.post('/products', product),
    update: (id, product) => api.put(`/products/${id}`, product),
    delete: (id) => api.delete(`/products/${id}`),
    updateStock: (id, quantity) => api.patch(`/products/${id}/stock`, { quantity }),
};

export default api;
