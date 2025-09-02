import api from './api';

// Servicios para operaciones de turnos
const turnService = {
    // Obtener todos los turnos
    async getAllTurns() {
        try {
            const response = await api.get('/turnos');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo turnos:', error);
            throw error;
        }
    },

    // Obtener turno por ID
    async getTurnById(id) {
        try {
            const response = await api.get(`/turnos/${id}`);
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

    // Actualizar turno
    async updateTurn(id, turnData) {
        try {
            const response = await api.put(`/turnos/${id}`, turnData);
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando turno:', error);
            throw error;
        }
    },

    // Eliminar turno
    async deleteTurn(id) {
        try {
            const response = await api.delete(`/turnos/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error eliminando turno:', error);
            throw error;
        }
    },

    // Obtener turnos por fecha
    async getTurnsByDate(date) {
        try {
            const response = await api.get(`/turnos/fecha/${date}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo turnos por fecha:', error);
            throw error;
        }
    },

    // Obtener turnos por estado
    async getTurnsByStatus(status) {
        try {
            const response = await api.get(`/turnos/estado/${status}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo turnos por estado:', error);
            throw error;
        }
    },

    // Cambiar estado de turno
    async changeTurnStatus(id, newStatus) {
        try {
            const response = await api.patch(`/turnos/${id}/estado`, { estado: newStatus });
            return response.data.data;
        } catch (error) {
            console.error('Error cambiando estado de turno:', error);
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
    }
};

export default turnService;