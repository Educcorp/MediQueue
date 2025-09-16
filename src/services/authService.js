import api from './api';

class AuthService {
    // Iniciar sesión por email
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', {
                s_email: email,
                s_password: password
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

    // Iniciar sesión por nombre de usuario
    async loginByUsuario(usuario, password) {
        try {
            const response = await api.post('/auth/login-usuario', {
                s_usuario: usuario,
                s_password: password
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error en el login');
            }
        } catch (error) {
            console.error('Error en login por usuario:', error);
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

    // Cambiar contraseña
    async changePassword(passwordActual, passwordNuevo) {
        try {
            const response = await api.put('/auth/change-password', {
                s_password_actual: passwordActual,
                s_password_nuevo: passwordNuevo
            });
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error cambiando contraseña');
            }
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            throw error;
        }
    }

    // Obtener estadísticas del administrador
    async getEstadisticas() {
        try {
            const response = await api.get('/auth/estadisticas');
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo estadísticas');
            }
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    // Crear primer administrador (si no existe ninguno)
    async createFirstAdmin(adminData) {
        try {
            const response = await api.post('/auth/first-admin', {
                s_nombre: adminData.s_nombre,
                s_apellido: adminData.s_apellido,
                s_email: adminData.s_email,
                s_usuario: adminData.s_usuario,
                s_password: adminData.s_password,
                c_telefono: adminData.c_telefono
            });
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

    // Guardar datos de autenticación en localStorage/sessionStorage
    saveAuthData(authData, remember = false) {
        const storage = remember ? localStorage : sessionStorage;

        storage.setItem('auth_token', authData.token);
        storage.setItem('auth_user', JSON.stringify(authData.user));

        if (remember) {
            localStorage.setItem('auth_remember', 'true');
        } else {
            localStorage.removeItem('auth_remember');
        }
    }

    // Obtener datos de autenticación guardados
    getAuthData() {
        const remember = localStorage.getItem('auth_remember') === 'true';
        const storage = remember ? localStorage : sessionStorage;

        const token = storage.getItem('auth_token');
        const userStr = storage.getItem('auth_user');

        if (token && userStr) {
            try {
                return {
                    token,
                    user: JSON.parse(userStr)
                };
            } catch (error) {
                console.error('Error parseando datos de usuario:', error);
                this.clearAuthData();
                return null;
            }
        }

        return null;
    }

    // Limpiar datos de autenticación
    clearAuthData() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_remember');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        const authData = this.getAuthData();
        return authData && authData.token;
    }

    // Obtener usuario actual
    getCurrentUser() {
        const authData = this.getAuthData();
        return authData ? authData.user : null;
    }

    // Verificar si el usuario es administrador principal
    isSuperAdmin() {
        const user = this.getCurrentUser();
        return user && user.tipo_usuario === 1;
    }

    // Verificar si el usuario es supervisor o administrador
    isSupervisorOrAdmin() {
        const user = this.getCurrentUser();
        return user && [1, 2].includes(user.tipo_usuario);
    }
}

const authService = new AuthService();
export default authService;