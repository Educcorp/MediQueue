import api from './api';

// Servicios para operaciones de turnos
const turnService = {
    // Obtener todos los turnos
    async getAllTurns(filters = {}) {
        try {
            const response = await api.get('/turnos', { params: filters });
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo turnos:', error);
            throw error;
        }
    },

    // Obtener turno por UUID
    async getTurnById(uk_turno) {
        try {
            const response = await api.get(`/turnos/${uk_turno}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo turno:', error);
            throw error;
        }
    },

    // Crear nuevo turno
    async createTurn(turnData) {
        try {
            const response = await api.post('/turnos', turnData);
            return response.data.data;
        } catch (error) {
            console.error('Error creando turno:', error);
            throw error;
        }
    },

    // Crear turno con paciente
    async createTurnWithPaciente(turnData) {
        try {
            const response = await api.post('/turnos/with-paciente', turnData);
            return response.data.data;
        } catch (error) {
            console.error('Error creando turno con paciente:', error);
            throw error;
        }
    },

    // Crear turno público
    async createTurnPublico(turnData) {
        try {
            const response = await api.post('/turnos/publico', turnData);
            return response.data.data;
        } catch (error) {
            console.error('Error creando turno público:', error);
            throw error;
        }
    },

    // Crear turno público con asignación automática de consultorio
    async createTurnPublicoAuto(turnData) {
        try {
            const response = await api.post('/turnos/publico/auto', turnData);
            return response.data.data;
        } catch (error) {
            console.error('Error creando turno público automático:', error);
            throw error;
        }
    },

    // Actualizar estado de turno
    async updateTurnStatus(uk_turno, s_estado) {
        try {
            const response = await api.put(`/turnos/${uk_turno}/estado`, { s_estado });
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando estado de turno:', error);
            throw error;
        }
    },

    // Actualizar observaciones de turno
    async updateTurnObservations(uk_turno, s_observaciones) {
        try {
            const response = await api.put(`/turnos/${uk_turno}/observaciones`, { s_observaciones });
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando observaciones:', error);
            throw error;
        }
    },

    // Cancelar turno
    async cancelTurn(uk_turno) {
        try {
            const response = await api.put(`/turnos/${uk_turno}/cancelar`);
            return response.data.data;
        } catch (error) {
            console.error('Error cancelando turno:', error);
            throw error;
        }
    },

    // Marcar turno como atendido
    async markTurnAsAttended(uk_turno) {
        try {
            const response = await api.put(`/turnos/${uk_turno}/atender`);
            return response.data.data;
        } catch (error) {
            console.error('Error marcando turno como atendido:', error);
            throw error;
        }
    },

    // Marcar turno como no presente
    async markTurnAsNoShow(uk_turno) {
        try {
            const response = await api.put(`/turnos/${uk_turno}/no-presente`);
            return response.data.data;
        } catch (error) {
            console.error('Error marcando turno como no presente:', error);
            throw error;
        }
    },

    // Eliminar turno
    async deleteTurn(uk_turno) {
        try {
            const response = await api.delete(`/turnos/${uk_turno}`);
            return response.data.data;
        } catch (error) {
            console.error('Error eliminando turno:', error);
            throw error;
        }
    },

    // Obtener turnos por fecha
    async getTurnsByDate(date, filters = {}) {
        try {
            const response = await api.get(`/turnos/fecha/${date}`, { params: filters });
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo turnos por fecha:', error);
            throw error;
        }
    },

    // Obtener turnos por estado
    async getTurnsByStatus(status, filters = {}) {
        try {
            const response = await api.get(`/turnos/estado/${status}`, { params: filters });
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo turnos por estado:', error);
            throw error;
        }
    },

    // Obtener turnos por rango de fechas
    async getTurnsByDateRange(fecha_inicio, fecha_fin, filters = {}) {
        try {
            const response = await api.get('/turnos/rango-fechas', {
                params: { fecha_inicio, fecha_fin, ...filters }
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo turnos por rango de fechas:', error);
            throw error;
        }
    },

    // Obtener turnos por paciente
    async getTurnsByPaciente(uk_paciente) {
        try {
            const response = await api.get(`/turnos/paciente/${uk_paciente}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo turnos por paciente:', error);
            throw error;
        }
    },

    // Llamar siguiente turno en consultorio
    async callNextTurn(uk_consultorio) {
        try {
            const response = await api.post(`/turnos/consultorio/${uk_consultorio}/siguiente`);
            return response.data.data;
        } catch (error) {
            console.error('Error llamando siguiente turno:', error);
            throw error;
        }
    },

    // Obtener estadísticas de turnos
    async getTurnStatistics() {
        try {
            const response = await api.get('/turnos/estadisticas');
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    },

    // Obtener el próximo turno (público)
    async getNextTurn() {
        try {
            const response = await api.get('/turnos/proximo');
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo próximo turno:', error);
            throw error;
        }
    },

    // Obtener los últimos turnos (público)
    async getLastTurns(limit = 6) {
        try {
            const response = await api.get(`/turnos/ultimos?limit=${limit}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo últimos turnos:', error);
            throw error;
        }
    },

    // Obtener turnos activos (En espera y Llamando) - público
    async getActiveTurns() {
        try {
            const response = await api.get('/turnos/publicos');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo turnos activos:', error);
            throw error;
        }
    },

    // Mapear datos de turno para el frontend (compatibilidad)
    mapTurnData(turn) {
        return {
            id: turn.uk_turno,
            numero_turno: turn.i_numero_turno,
            estado: turn.s_estado,
            fecha: turn.d_fecha,
            hora: turn.t_hora,
            paciente: turn.uk_paciente ? {
                id: turn.uk_paciente,
                nombre: turn.s_nombre_paciente,
                apellido: turn.s_apellido_paciente,
                telefono: turn.c_telefono_paciente
            } : null,
            consultorio: {
                id: turn.uk_consultorio,
                numero: turn.i_numero_consultorio,
                area: turn.s_nombre_area
            },
            administrador: turn.uk_administrador ? {
                id: turn.uk_administrador,
                nombre: turn.s_nombre_administrador
            } : null,
            observaciones: turn.s_observaciones,
            fecha_atencion: turn.d_fecha_atencion,
            fecha_cancelacion: turn.d_fecha_cancelacion
        };
    },

    // Mapear datos de turno público para el frontend
    mapPublicTurnData(turn) {
        return {
            id: turn.i_numero_turno,
            consultorio: turn.i_numero_consultorio,
            estado: turn.s_estado
        };
    }
};

export default turnService;