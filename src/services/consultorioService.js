import api from './api';

// Servicios para operaciones de consultorios
const consultorioService = {
    // Obtener todos los consultorios
    async getAll() {
        const res = await api.get('/consultorios');
        return res.data.data || [];
    },

    // Obtener consultorios por área
    async getByArea(idArea) {
        const res = await api.get(`/consultorios/area/${idArea}`);
        return res.data.data; // { area, consultorios }
    },

    // Obtener consultorios disponibles
    async getDisponibles() {
        const res = await api.get('/consultorios/disponibles');
        return res.data.data || [];
    },

    // Crear consultorio
    async create({ numero_consultorio, id_area }) {
        const res = await api.post('/consultorios', { numero_consultorio, id_area });
        return res.data.data;
    },

    // Actualizar consultorio
    async update(id, payload) {
        const res = await api.put(`/consultorios/${id}`, payload);
        return res.data.data;
    },

    // Eliminar consultorio
    async remove(id) {
        const res = await api.delete(`/consultorios/${id}`);
        return res.data.data;
    },

    // Estadísticas por consultorio
    async getEstadisticas(id) {
        const res = await api.get(`/consultorios/${id}/estadisticas`);
        return res.data.data;
    }
};

export default consultorioService;


