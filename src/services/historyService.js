import api from './api';

const historyService = {
    async getHistory(filters = {}) {
        try {
            const params = { 
                all_dates: true,
                ...filters 
            };
            const response = await api.get('/turnos', { params });
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            throw error;
        }
    },

    async getHistoryByArea(uk_area, additionalFilters = {}) {
        try {
            const params = {
                all_dates: true,
                uk_area,
                ...additionalFilters
            };
            const response = await api.get('/turnos', { params });
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo historial por área:', error);
            throw error;
        }
    },

    async getHistoryByConsultorio(uk_consultorio, additionalFilters = {}) {
        try {
            const params = {
                all_dates: true,
                uk_consultorio,
                ...additionalFilters
            };
            const response = await api.get('/turnos', { params });
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo historial por consultorio:', error);
            throw error;
        }
    },

    async getHistoryWithFilters(uk_area = null, uk_consultorio = null, additionalFilters = {}) {
        try {
            const params = {
                all_dates: true,
                ...additionalFilters
            };
            if (uk_area && uk_area !== 'all') {
                params.uk_area = uk_area;
            }
            if (uk_consultorio && uk_consultorio !== 'all') {
                params.uk_consultorio = uk_consultorio;
            }
            const response = await api.get('/turnos', { params });
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo historial con filtros:', error);
            throw error;
        }
    },

    prepareHistoryForExport(history) {
        return history.map(turno => ({
            'Número de Turno': turno.i_numero_turno,
            'Paciente': `${turno.s_nombre_paciente} ${turno.s_apellido_paciente}`,
            'Fecha': new Date(turno.d_fecha).toLocaleDateString('es-ES'),
            'Hora': turno.t_hora,
            'Área Médica': turno.s_nombre_area,
            'Consultorio': `Consultorio ${turno.i_numero_consultorio}`,
            'Estado': turno.s_estado,
            'Administrador': turno.s_nombre_administrador || 'N/A',
            'Observaciones': turno.s_observaciones || 'N/A'
        }));
    },

    formatEstado(estado) {
        const estadosMap = {
            'EN_ESPERA': 'En Espera',
            'LLAMANDO': 'Llamando',
            'ATENDIDO': 'Atendido',
            'CANCELADO': 'Cancelado',
        };
        return estadosMap[estado] || estado;
    },

    getEstadoColor(estado) {
        const coloresMap = {
            'EN_ESPERA': '#FFA500',
            'LLAMANDO': '#2196F3',
            'ATENDIDO': '#4CAF50',
            'CANCELADO': '#F44336',
            'NO_PRESENTE': '#9E9E9E'
        };
        return coloresMap[estado] || '#757575';
    }
};

export default historyService;
