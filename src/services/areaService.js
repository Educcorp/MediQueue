import api from './api';

// Servicios para operaciones de áreas
const areaService = {
    // Obtener todas las áreas activas
    async getAll() {
        try {
            const response = await api.get('/areas');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo áreas:', error);
            throw error;
        }
    },

    // Obtener todas las áreas (incluyendo inactivas)
    async getAllWithInactive() {
        try {
            const response = await api.get('/areas/all');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo áreas:', error);
            throw error;
        }
    },

    // Obtener áreas básicas (UUID y nombre)
    async getBasics() {
        try {
            const response = await api.get('/areas/basicas');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo áreas básicas:', error);
            throw error;
        }
    },

    // Obtener área por UUID
    async getById(uk_area) {
        try {
            const response = await api.get(`/areas/${uk_area}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo área:', error);
            throw error;
        }
    },

    // Obtener área por nombre
    async getByNombre(s_nombre_area) {
        try {
            const response = await api.get(`/areas/nombre/${s_nombre_area}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo área por nombre:', error);
            throw error;
        }
    },

    // Obtener un área junto a sus consultorios
    async getWithConsultorios(uk_area) {
        try {
            const response = await api.get(`/areas/${uk_area}/consultorios`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo área con consultorios:', error);
            throw error;
        }
    },

    // Buscar áreas por nombre
    async search(term) {
        try {
            const response = await api.get(`/areas/search?term=${encodeURIComponent(term)}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error buscando áreas:', error);
            throw error;
        }
    },

    // Obtener áreas con conteo de consultorios
    async getWithCount() {
        try {
            const response = await api.get('/areas/with-count');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo áreas con conteo:', error);
            throw error;
        }
    },

    // Crear nueva área
    async create(areaData) {
        try {
            const response = await api.post('/areas', {
                s_nombre_area: areaData.s_nombre_area
            });
            return response.data.data;
        } catch (error) {
            console.error('Error creando área:', error);
            throw error;
        }
    },

    // Actualizar área
    async update(uk_area, areaData) {
        try {
            const response = await api.put(`/areas/${uk_area}`, {
                s_nombre_area: areaData.s_nombre_area
            });
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando área:', error);
            throw error;
        }
    },

    // Desactivar área (soft delete)
    async softDelete(uk_area) {
        try {
            const response = await api.put(`/areas/${uk_area}/soft-delete`);
            return response.data.data;
        } catch (error) {
            console.error('Error desactivando área:', error);
            throw error;
        }
    },

    // Eliminar área (hard delete)
    async remove(uk_area) {
        try {
            const response = await api.delete(`/areas/${uk_area}`);
            return response.data.data;
        } catch (error) {
            console.error('Error eliminando área:', error);
            throw error;
        }
    },

    // Obtener estadísticas de turnos por área
    async getTurnStatistics() {
        try {
            const response = await api.get('/areas/estadisticas');
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas de áreas:', error);
            throw error;
        }
    },

    // Obtener estadísticas de turnos por área en rango de fechas
    async getTurnStatisticsByDateRange(fecha_inicio, fecha_fin) {
        try {
            const response = await api.get('/areas/estadisticas-por-fecha', {
                params: { fecha_inicio, fecha_fin }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas de áreas por fecha:', error);
            throw error;
        }
    },

    // Mapear datos de área para el frontend (compatibilidad)
    mapAreaData(area) {
        return {
            id: area.uk_area,
            nombre: area.s_nombre_area,
            estado: area.ck_estado,
            fecha_creacion: area.d_fecha_creacion,
            consultorios: area.consultorios || []
        };
    },

    // Mapear datos de área básica para el frontend
    mapBasicAreaData(area) {
        return {
            id: area.uk_area,
            nombre: area.s_nombre_area
        };
    },

    // Validar datos de área antes de enviar
    validateAreaData(areaData) {
        const errors = [];

        if (!areaData.s_nombre_area || areaData.s_nombre_area.trim().length < 2) {
            errors.push('El nombre del área debe tener al menos 2 caracteres');
        }

        if (areaData.s_nombre_area && areaData.s_nombre_area.length > 100) {
            errors.push('El nombre del área no puede exceder 100 caracteres');
        }

        if (areaData.s_nombre_area && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-()]+$/.test(areaData.s_nombre_area)) {
            errors.push('El nombre del área solo puede contener letras, espacios, guiones y paréntesis');
        }

        return errors;
    }
};

export default areaService;