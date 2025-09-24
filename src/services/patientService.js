import api from './api';

// Servicios para operaciones de pacientes
const patientService = {
    // Obtener todos los pacientes activos
    async getAllPatients() {
        try {
            const response = await api.get('/pacientes');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo pacientes:', error);
            throw error;
        }
    },

    // Obtener todos los pacientes (incluyendo inactivos)
    async getAllPatientsWithInactive() {
        try {
            const response = await api.get('/pacientes/all');
            return response.data.data || [];
        } catch (error) {
            console.error('Error obteniendo pacientes:', error);
            throw error;
        }
    },

    // Obtener paciente por UUID
    async getPatientById(uk_paciente) {
        try {
            const response = await api.get(`/pacientes/${uk_paciente}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo paciente:', error);
            throw error;
        }
    },

    // Obtener paciente por teléfono
    async getPatientByTelefono(c_telefono) {
        try {
            const response = await api.get(`/pacientes/telefono/${c_telefono}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo paciente por teléfono:', error);
            throw error;
        }
    },

    // Obtener paciente por email
    async getPatientByEmail(s_email) {
        try {
            const response = await api.get(`/pacientes/email/${s_email}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo paciente por email:', error);
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

    // Crear o buscar paciente (para turnos públicos)
    async createOrFindPatient(patientData) {
        try {
            const response = await api.post('/pacientes/create-or-find', patientData);
            return response.data.data;
        } catch (error) {
            console.error('Error creando/buscando paciente:', error);
            throw error;
        }
    },

    // Actualizar paciente
    async updatePatient(uk_paciente, patientData) {
        try {
            const response = await api.put(`/pacientes/${uk_paciente}`, patientData);
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando paciente:', error);
            throw error;
        }
    },

    // Cambiar contraseña del paciente
    async changePassword(uk_paciente, passwordActual, passwordNuevo) {
        try {
            const response = await api.put(`/pacientes/${uk_paciente}/change-password`, {
                s_password_actual: passwordActual,
                s_password_nuevo: passwordNuevo
            });
            return response.data.data;
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            throw error;
        }
    },

    // Desactivar paciente (soft delete)
    async softDeletePatient(uk_paciente) {
        try {
            const response = await api.put(`/pacientes/${uk_paciente}/soft-delete`);
            return response.data.data;
        } catch (error) {
            console.error('Error desactivando paciente:', error);
            throw error;
        }
    },

    // Eliminar paciente (hard delete)
    async deletePatient(uk_paciente) {
        try {
            const response = await api.delete(`/pacientes/${uk_paciente}`);
            return response.data.data;
        } catch (error) {
            console.error('Error eliminando paciente:', error);
            throw error;
        }
    },

    // Buscar pacientes
    async searchPatients(term) {
        try {
            const response = await api.get(`/pacientes/search?term=${encodeURIComponent(term)}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error buscando pacientes:', error);
            throw error;
        }
    },

    // Obtener información pública del paciente
    async getPatientPublico(c_telefono, s_nombre) {
        try {
            const params = new URLSearchParams();
            if (c_telefono) params.append('c_telefono', c_telefono);
            if (s_nombre) params.append('s_nombre', s_nombre);

            const response = await api.get(`/pacientes/publico?${params.toString()}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo información pública del paciente:', error);
            throw error;
        }
    },

    // Obtener historial de turnos del paciente
    async getPatientHistory(uk_paciente) {
        try {
            const response = await api.get(`/pacientes/${uk_paciente}/historial`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo historial del paciente:', error);
            throw error;
        }
    },

    // Obtener estadísticas del paciente
    async getPatientStatistics(uk_paciente) {
        try {
            const response = await api.get(`/pacientes/${uk_paciente}/estadisticas`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas del paciente:', error);
            throw error;
        }
    },

    // Login de paciente
    async loginPatient(c_telefono, s_password) {
        try {
            const response = await api.post('/pacientes/login', {
                c_telefono,
                s_password
            });
            return response.data.data;
        } catch (error) {
            console.error('Error en login de paciente:', error);
            throw error;
        }
    },

    // Mapear datos de paciente para el frontend (compatibilidad)
    mapPatientData(patient) {
        return {
            id: patient.uk_paciente,
            nombre: patient.s_nombre,
            apellido: patient.s_apellido,
            telefono: patient.c_telefono,
            email: patient.s_email,
            fecha_nacimiento: patient.d_fecha_nacimiento,
            edad: patient.edad,
            estado: patient.ck_estado,
            fecha_creacion: patient.d_fecha_creacion
        };
    },

    // Mapear datos de paciente público para el frontend
    mapPublicPatientData(patient) {
        return {
            id: patient.uk_paciente,
            nombre_completo: patient.s_nombre_completo,
            telefono: patient.c_telefono,
            email: patient.s_email,
            edad: patient.edad,
            historial_turnos: patient.historial_turnos || []
        };
    },

    // Validar datos de paciente antes de enviar
    validatePatientData(patientData) {
        const errors = [];

        if (!patientData.s_nombre || patientData.s_nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!patientData.s_apellido || patientData.s_apellido.trim().length < 2) {
            errors.push('El apellido debe tener al menos 2 caracteres');
        }

        if (!patientData.c_telefono || !/^\+?[\d\s\-\(\)]{10,15}$/.test(patientData.c_telefono)) {
            errors.push('El teléfono debe tener un formato válido');
        }

        if (patientData.s_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.s_email)) {
            errors.push('El email debe tener un formato válido');
        }

        if (patientData.d_fecha_nacimiento) {
            const fecha = new Date(patientData.d_fecha_nacimiento);
            const hoy = new Date();
            if (fecha > hoy) {
                errors.push('La fecha de nacimiento no puede ser futura');
            }
            const edad = hoy.getFullYear() - fecha.getFullYear();
            if (edad > 120) {
                errors.push('La edad no puede ser mayor a 120 años');
            }
        }

        return errors;
    }
};

export default patientService;