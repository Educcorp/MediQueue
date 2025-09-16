import api from './api';

// Servicios para operaciones de consultorios
const consultorioService = {
    // Obtener todos los consultorios activos
    async getAll() {
        try {
            const response = await api.get('/consultorios');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo consultorios:', error);
            throw error;
        }
    },

    // Obtener todos los consultorios (incluyendo inactivos)
    async getAllWithInactive() {
        try {
            const response = await api.get('/consultorios/all');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo consultorios:', error);
            throw error;
        }
    },

    // Obtener consultorios básicos
    async getBasics() {
        try {
            const response = await api.get('/consultorios/basicos');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo consultorios básicos:', error);
            throw error;
        }
    },

    // Obtener consultorio por UUID
    async getById(uk_consultorio) {
        try {
            const response = await api.get(`/consultorios/${uk_consultorio}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo consultorio:', error);
            throw error;
        }
    },

    // Obtener consultorios por área
    async getByArea(uk_area) {
        try {
            const response = await api.get(`/consultorios/area/${uk_area}`);
            return response.data.data; // { area, consultorios }
        } catch (error) {
            console.error('Error obteniendo consultorios por área:', error);
            throw error;
        }
    },

    // Obtener consultorios básicos por área
    async getBasicsByArea(uk_area) {
        try {
            const response = await api.get(`/consultorios/area/${uk_area}/basicos`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo consultorios básicos por área:', error);
            throw error;
        }
    },

    // Obtener consultorios disponibles
    async getDisponibles() {
        try {
            const response = await api.get('/consultorios/disponibles');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo consultorios disponibles:', error);
            throw error;
        }
    },

    // Obtener consultorios con estadísticas
    async getWithStats() {
        try {
            const response = await api.get('/consultorios/with-stats');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo consultorios con estadísticas:', error);
            throw error;
        }
    },

    // Verificar si consultorio está disponible
    async isDisponible(uk_consultorio) {
        try {
            const response = await api.get(`/consultorios/${uk_consultorio}/disponible`);
            return response.data.data.disponible;
        } catch (error) {
            console.error('Error verificando disponibilidad:', error);
            throw error;
        }
    },

    // Obtener turno actual del consultorio
    async getTurnoActual(uk_consultorio) {
        try {
            const response = await api.get(`/consultorios/${uk_consultorio}/turno-actual`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo turno actual:', error);
            throw error;
        }
    },

    // Crear consultorio
    async create(consultorioData) {
        try {
            const response = await api.post('/consultorios', {
                i_numero_consultorio: consultorioData.i_numero_consultorio,
                uk_area: consultorioData.uk_area
            });
            return response.data.data;
        } catch (error) {
            console.error('Error creando consultorio:', error);
            throw error;
        }
    },

    // Actualizar consultorio
    async update(uk_consultorio, consultorioData) {
        try {
            const response = await api.put(`/consultorios/${uk_consultorio}`, {
                i_numero_consultorio: consultorioData.i_numero_consultorio,
                uk_area: consultorioData.uk_area
            });
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando consultorio:', error);
            throw error;
        }
    },

    // Desactivar consultorio (soft delete)
    async softDelete(uk_consultorio) {
        try {
            const response = await api.put(`/consultorios/${uk_consultorio}/soft-delete`);
            return response.data.data;
        } catch (error) {
            console.error('Error desactivando consultorio:', error);
            throw error;
        }
    },

    // Eliminar consultorio (hard delete)
    async remove(uk_consultorio) {
        try {
            const response = await api.delete(`/consultorios/${uk_consultorio}`);
            return response.data.data;
        } catch (error) {
            console.error('Error eliminando consultorio:', error);
            throw error;
        }
    },

    // Estadísticas por consultorio
    async getEstadisticas(uk_consultorio) {
        try {
            const response = await api.get(`/consultorios/${uk_consultorio}/estadisticas`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas del consultorio:', error);
            throw error;
        }
    },

    // Estadísticas por consultorio en rango de fechas
    async getEstadisticasPorFecha(uk_consultorio, fecha_inicio, fecha_fin) {
        try {
            const response = await api.get(`/consultorios/${uk_consultorio}/estadisticas-por-fecha`, {
                params: { fecha_inicio, fecha_fin }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas del consultorio por fecha:', error);
            throw error;
        }
    },

    // Llamar siguiente turno en consultorio
    async llamarSiguienteTurno(uk_consultorio) {
        try {
            const response = await api.post(`/consultorios/${uk_consultorio}/siguiente-turno`);
            return response.data.data;
        } catch (error) {
            console.error('Error llamando siguiente turno:', error);
            throw error;
        }
    },

    // Mapear datos de consultorio para el frontend (compatibilidad)
    mapConsultorioData(consultorio) {
        return {
            id: consultorio.uk_consultorio,
            numero: consultorio.i_numero_consultorio,
            area: {
                id: consultorio.uk_area,
                nombre: consultorio.s_nombre_area
            },
            estado: consultorio.ck_estado,
            fecha_creacion: consultorio.d_fecha_creacion,
            estadisticas: consultorio.estadisticas,
            disponible: consultorio.disponible,
            turno_actual: consultorio.turno_actual
        };
    },

    // Mapear datos de consultorio básico para el frontend
    mapBasicConsultorioData(consultorio) {
        return {
            id: consultorio.uk_consultorio,
            numero: consultorio.i_numero_consultorio,
            area: consultorio.s_nombre_area
        };
    },

    // Validar datos de consultorio antes de enviar
    validateConsultorioData(consultorioData) {
        const errors = [];

        if (!consultorioData.i_numero_consultorio || consultorioData.i_numero_consultorio < 1 || consultorioData.i_numero_consultorio > 999) {
            errors.push('El número del consultorio debe ser un entero entre 1 y 999');
        }

        if (!consultorioData.uk_area) {
            errors.push('El área es requerida');
        }

        return errors;
    }
};

export default consultorioService;