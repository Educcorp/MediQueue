import axios from 'axios';

// URL base del backend
const API_BASE_URL = 'http://localhost:3000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para incluir token en requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Si el token expiró, limpiar localStorage y redirigir
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // Solo redirigir si estamos en una ruta protegida
            if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
                window.location.href = '/admin';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
