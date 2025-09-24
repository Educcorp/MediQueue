import api from './api';

class AdminService {
    // Obtener todos los administradores activos
    async getAllAdmins() {
        try {
            const response = await api.get('/administradores');
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo administradores');
            }
        } catch (error) {
            console.error('Error obteniendo administradores:', error);
            throw error;
        }
    }

    // Obtener todos los administradores (incluyendo inactivos)
    async getAllAdminsWithInactive() {
        try {
            const response = await api.get('/administradores/all');
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo administradores');
            }
        } catch (error) {
            console.error('Error obteniendo administradores:', error);
            throw error;
        }
    }

    // Buscar administradores
    async searchAdmins(term) {
        try {
            const response = await api.get(`/administradores/search?term=${encodeURIComponent(term)}`);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error buscando administradores');
            }
        } catch (error) {
            console.error('Error buscando administradores:', error);
            throw error;
        }
    }

    // Obtener administradores con estadísticas
    async getAdminsWithStats() {
        try {
            const response = await api.get('/administradores/with-stats');
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo administradores con estadísticas');
            }
        } catch (error) {
            console.error('Error obteniendo administradores con estadísticas:', error);
            throw error;
        }
    }

    // Obtener administrador por UUID
    async getAdminById(uk_administrador) {
        try {
            const response = await api.get(`/administradores/${uk_administrador}`);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo administrador');
            }
        } catch (error) {
            console.error('Error obteniendo administrador:', error);
            throw error;
        }
    }

    // Obtener administrador por email
    async getAdminByEmail(s_email) {
        try {
            const response = await api.get(`/administradores/email/${s_email}`);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo administrador');
            }
        } catch (error) {
            console.error('Error obteniendo administrador por email:', error);
            throw error;
        }
    }

    // Obtener administrador por usuario
    async getAdminByUsuario(s_usuario) {
        try {
            const response = await api.get(`/administradores/usuario/${s_usuario}`);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo administrador');
            }
        } catch (error) {
            console.error('Error obteniendo administrador por usuario:', error);
            throw error;
        }
    }

    // Obtener estadísticas del administrador
    async getEstadisticas(uk_administrador) {
        try {
            const response = await api.get(`/administradores/${uk_administrador}/estadisticas`);
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

    // Crear nuevo administrador
    async createAdmin(adminData) {
        try {
            const response = await api.post('/administradores', {
                s_nombre: adminData.s_nombre,
                s_apellido: adminData.s_apellido,
                s_email: adminData.s_email,
                s_usuario: adminData.s_usuario,
                s_password: adminData.s_password,
                c_telefono: adminData.c_telefono,
                tipo_usuario: adminData.tipo_usuario
            });
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error creando administrador');
            }
        } catch (error) {
            console.error('Error creando administrador:', error);
            throw error;
        }
    }

    // Actualizar administrador
    async updateAdmin(uk_administrador, adminData) {
        try {
            const response = await api.put(`/administradores/${uk_administrador}`, {
                s_nombre: adminData.s_nombre,
                s_apellido: adminData.s_apellido,
                s_email: adminData.s_email,
                s_usuario: adminData.s_usuario,
                s_password: adminData.s_password,
                c_telefono: adminData.c_telefono,
                tipo_usuario: adminData.tipo_usuario
            });
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error actualizando administrador');
            }
        } catch (error) {
            console.error('Error actualizando administrador:', error);
            throw error;
        }
    }

    // Cambiar contraseña del administrador
    async changePassword(uk_administrador, passwordActual, passwordNuevo) {
        try {
            const response = await api.put(`/administradores/${uk_administrador}/change-password`, {
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

    // Desactivar administrador (soft delete)
    async softDeleteAdmin(uk_administrador) {
        try {
            const response = await api.put(`/administradores/${uk_administrador}/soft-delete`);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error desactivando administrador');
            }
        } catch (error) {
            console.error('Error desactivando administrador:', error);
            throw error;
        }
    }

    // Eliminar administrador (hard delete)
    async deleteAdmin(uk_administrador) {
        try {
            const response = await api.delete(`/administradores/${uk_administrador}`);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error eliminando administrador');
            }
        } catch (error) {
            console.error('Error eliminando administrador:', error);
            throw error;
        }
    }

    // Mapear datos de administrador para el frontend (compatibilidad)
    mapAdminData(admin) {
        return {
            id: admin.uk_administrador,
            nombre: admin.s_nombre,
            apellido: admin.s_apellido,
            email: admin.s_email,
            usuario: admin.s_usuario,
            telefono: admin.c_telefono,
            tipo_usuario: admin.tipo_usuario,
            estado: admin.ck_estado,
            fecha_creacion: admin.d_fecha_creacion,
            estadisticas: admin.estadisticas
        };
    }

    // Validar datos de administrador antes de enviar
    validateAdminData(adminData) {
        const errors = [];

        if (!adminData.s_nombre || adminData.s_nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!adminData.s_apellido || adminData.s_apellido.trim().length < 2) {
            errors.push('El apellido debe tener al menos 2 caracteres');
        }

        if (!adminData.s_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.s_email)) {
            errors.push('El email debe tener un formato válido');
        }

        if (!adminData.s_usuario || adminData.s_usuario.trim().length < 3) {
            errors.push('El nombre de usuario debe tener al menos 3 caracteres');
        }

        if (adminData.s_password && adminData.s_password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }

        if (adminData.c_telefono && !/^\+?[\d\s\-\(\)]{10,15}$/.test(adminData.c_telefono)) {
            errors.push('El teléfono debe tener un formato válido');
        }

        if (adminData.tipo_usuario && ![1, 2].includes(adminData.tipo_usuario)) {
            errors.push('El tipo de usuario debe ser 1 (Administrador) o 2 (Supervisor)');
        }

        return errors;
    }
}

const adminService = new AdminService();
export default adminService;