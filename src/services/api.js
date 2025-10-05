import axios from 'axios';
import { API_CONFIG } from '../utils/constants';

// Crear instancia de axios con configuración base
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para incluir token en requests
api.interceptors.request.use(
    (config) => {
        // Buscar token en localStorage primero, luego en sessionStorage
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
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
        // Si el token expiró, limpiar ambos storages y redirigir
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_remember');
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_user');
            // Solo redirigir si estamos en una ruta protegida
            if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
                window.location.href = '/admin';
            }
        }
        return Promise.reject(error);
    }
);

// Función para manejar errores de API de forma consistente
export const handleApiError = (error) => {
    if (error.response) {
        // El servidor respondió con un código de error
        const { status, data } = error.response;

        switch (status) {
            case 400:
                return {
                    type: 'validation',
                    message: data.message || 'Datos inválidos',
                    errors: data.errors || []
                };
            case 401:
                return {
                    type: 'auth',
                    message: 'No autorizado. Por favor, inicia sesión nuevamente.',
                    errors: []
                };
            case 403:
                return {
                    type: 'permission',
                    message: 'No tienes permisos para realizar esta acción.',
                    errors: []
                };
            case 404:
                return {
                    type: 'not_found',
                    message: 'Recurso no encontrado.',
                    errors: []
                };
            case 409:
                return {
                    type: 'conflict',
                    message: data.message || 'Conflicto: el recurso ya existe.',
                    errors: []
                };
            case 422:
                return {
                    type: 'validation',
                    message: 'Error de validación en los datos.',
                    errors: data.errors || []
                };
            case 500:
                return {
                    type: 'server',
                    message: 'Error interno del servidor. Inténtalo más tarde.',
                    errors: []
                };
            default:
                return {
                    type: 'unknown',
                    message: data.message || 'Error desconocido',
                    errors: []
                };
        }
    } else if (error.request) {
        // La petición se hizo pero no se recibió respuesta
        return {
            type: 'network',
            message: 'Error de conexión. Verifica tu conexión a internet.',
            errors: []
        };
    } else {
        // Algo pasó al configurar la petición
        return {
            type: 'request',
            message: 'Error al procesar la petición.',
            errors: []
        };
    }
};

// Función para mostrar notificaciones de error
export const showErrorNotification = (error, showNotification) => {
    const errorInfo = handleApiError(error);

    if (showNotification) {
        showNotification({
            type: 'error',
            title: 'Error',
            message: errorInfo.message,
            details: errorInfo.errors.length > 0 ? errorInfo.errors : null
        });
    }

    return errorInfo;
};

export default api;