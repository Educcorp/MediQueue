import api from './api';

class AdminService {
    // Obtener todos los administradores
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

    // Obtener administrador por ID
    async getAdminById(id) {
        try {
            const response = await api.get(`/administradores/${id}`);
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

    // Crear nuevo administrador
    async createAdmin(adminData) {
        try {
            const response = await api.post('/administradores', adminData);
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
    async updateAdmin(id, adminData) {
        try {
            const response = await api.put(`/administradores/${id}`, adminData);
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

    // Eliminar administrador
    async deleteAdmin(id) {
        try {
            const response = await api.delete(`/administradores/${id}`);
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
}

const adminService = new AdminService();
export default adminService;
