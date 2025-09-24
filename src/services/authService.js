import api from './api';

class AuthService {
    // Iniciar sesión
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error en el login');
            }
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    // Cerrar sesión
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error en logout:', error);
            // No lanzar error para permitir logout local
        }
    }

    // Verificar token
    async verifyToken() {
        try {
            const response = await api.get('/auth/verify');
            return response.data.success;
        } catch (error) {
            console.error('Error verificando token:', error);
            return false;
        }
    }

    // Obtener perfil del usuario
    async getProfile() {
        try {
            const response = await api.get('/auth/profile');
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo perfil');
            }
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            throw error;
        }
    }

    // Actualizar perfil
    async updateProfile(userData) {
        try {
            const response = await api.put('/auth/profile', userData);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error actualizando perfil');
            }
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            throw error;
        }
    }

    // Crear primer administrador (si no existe ninguno)
    async createFirstAdmin(adminData) {
        try {
            const response = await api.post('/auth/first-admin', adminData);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error creando administrador');
            }
        } catch (error) {
            console.error('Error creando primer admin:', error);
            throw error;
        }
    }
}

const authService = new AuthService();
export default authService;
