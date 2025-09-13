import api from './api';

// Servicios para operaciones de áreas
const areaService = {
    // Obtener todas las áreas (detalladas)
    async getAll() {
        const res = await api.get('/areas');
        return res.data.data || [];
    },

    // Obtener áreas básicas (id y nombre)
    async getBasics() {
        const res = await api.get('/areas/basicas');
        return res.data.data || [];
    },

    // Obtener un área junto a sus consultorios
    async getWithConsultorios(idArea) {
        const res = await api.get(`/areas/${idArea}/consultorios`);
        return res.data.data;
    },

    // Crear nueva área
    async create(nombre_area) {
        const res = await api.post('/areas', { nombre_area });
        return res.data.data;
    },

    // Eliminar área
    async remove(idArea) {
        const res = await api.delete(`/areas/${idArea}`);
        return res.data.data;
    }
};

export default areaService;


