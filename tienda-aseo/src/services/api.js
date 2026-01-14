import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const productService = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    search: (term) => api.get(`/products/search?term=${term}`),
    getByCategory: (category) => api.get(`/products/category/${category}`), // Si implementamos este endpoint
};

export const clientService = {
    register: (client) => api.post('/clients', client),
};

export default api;
