import api from './api';

// Servicios para operaciones de pacientes
const patientService = {
    // Obtener todos los pacientes
    async getAllPatients() {
        try {
            const response = await api.get('/pacientes');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo pacientes:', error);
            throw error;
        }
    },

    // Obtener paciente por ID
    async getPatientById(id) {
        try {
            const response = await api.get(`/pacientes/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo paciente:', error);
            throw error;
        }
    },

    // Crear nuevo paciente
    async createPatient(patientData) {
        try {
            const response = await api.post('/pacientes', patientData);
            return response.data.data;
        } catch (error) {
            console.error('Error creando paciente:', error);
            throw error;
        }
    },

    // Actualizar paciente
    async updatePatient(id, patientData) {
        try {
            const response = await api.put(`/pacientes/${id}`, patientData);
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando paciente:', error);
            throw error;
        }
    },

    // Eliminar paciente
    async deletePatient(id) {
        try {
            const response = await api.delete(`/pacientes/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error eliminando paciente:', error);
            throw error;
        }
    },

    // Buscar pacientes por nombre
    async searchPatientsByName(name) {
        try {
            const response = await api.get(`/pacientes/buscar?nombre=${encodeURIComponent(name)}`);
            return response.data;
        } catch (error) {
            console.error('Error buscando pacientes:', error);
            throw error;
        }
    }
};

export default patientService;