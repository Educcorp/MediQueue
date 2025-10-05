// Funciones auxiliares para el frontend

/**
 * Valida formato de teléfono
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} - true si es válido
 */
export const isValidPhone = (phone) => {
    if (!phone) return false;

    // Remover espacios y caracteres especiales para validación
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Patrones válidos:
    // - Números de 10-15 dígitos
    // - Puede empezar con + (código de país)
    const phoneRegex = /^\+?[\d]{10,15}$/;

    return phoneRegex.test(cleanPhone);
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const isValidEmail = (email) => {
    if (!email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida formato de UUID
 * @param {string} uuid - UUID a validar
 * @returns {boolean} - true si es válido
 */
export const isValidUUID = (uuid) => {
    if (!uuid) return false;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

/**
 * Formatea un número de teléfono para mostrar
 * @param {string} phone - Número de teléfono
 * @returns {string} - Teléfono formateado
 */
export const formatPhone = (phone) => {
    if (!phone) return '';

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Si tiene código de país (+57), formatear diferente
    if (cleanPhone.startsWith('+57') && cleanPhone.length === 12) {
        return `+57 ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 9)} ${cleanPhone.slice(9)}`;
    }

    // Si es número colombiano de 10 dígitos
    if (cleanPhone.length === 10) {
        return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
    }

    // Si es número con código de país de 11 dígitos
    if (cleanPhone.length === 11) {
        return `+${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
    }

    return phone; // Retornar original si no coincide con patrones conocidos
};

/**
 * Formatea una fecha para mostrar
 * @param {string|Date} date - Fecha a formatear
 * @param {string} format - Formato deseado ('short', 'long', 'time')
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, format = 'short') => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const options = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' }
    };

    return dateObj.toLocaleDateString('es-ES', options[format] || options.short);
};

/**
 * Formatea una fecha y hora para mostrar
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha y hora formateada
 */
export const formatDateTime = (date) => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    return dateObj.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param {string|Date} birthDate - Fecha de nacimiento
 * @returns {number} - Edad en años
 */
export const calculateAge = (birthDate) => {
    if (!birthDate) return 0;

    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();

    if (isNaN(birth.getTime())) return 0;

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

/**
 * Genera un color aleatorio para avatares
 * @param {string} text - Texto para generar color consistente
 * @returns {string} - Color hexadecimal
 */
export const generateAvatarColor = (text) => {
    if (!text) return '#667eea';

    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
        '#d299c2', '#fef9d7', '#667eea', '#764ba2'
    ];

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

/**
 * Genera las iniciales de un nombre
 * @param {string} firstName - Primer nombre
 * @param {string} lastName - Apellido
 * @returns {string} - Iniciales
 */
export const generateInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
};

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeText = (text) => {
    if (!text) return '';

    return text
        .replace(/[<>]/g, '') // Remover < y >
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/on\w+=/gi, '') // Remover event handlers
        .trim();
};

/**
 * Debounce function para optimizar llamadas
 * @param {Function} func - Función a debounce
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} - Función debounced
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function para limitar llamadas
 * @param {Function} func - Función a throttle
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function} - Función throttled
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} - true si se copió exitosamente
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Error copiando al portapapeles:', err);
        return false;
    }
};

/**
 * Descarga un archivo
 * @param {string} content - Contenido del archivo
 * @param {string} filename - Nombre del archivo
 * @param {string} type - Tipo MIME
 */
export const downloadFile = (content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Genera un ID único
 * @returns {string} - ID único
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Verifica si un objeto está vacío
 * @param {Object} obj - Objeto a verificar
 * @returns {boolean} - true si está vacío
 */
export const isEmpty = (obj) => {
    if (obj == null) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} - Texto capitalizado
 */
export const capitalizeWords = (text) => {
    if (!text) return '';

    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Trunca texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo para texto truncado
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + suffix;
};

/**
 * Convierte bytes a formato legible
 * @param {number} bytes - Bytes a convertir
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} - Tamaño formateado
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Valida si una URL es válida
 * @param {string} url - URL a validar
 * @returns {boolean} - true si es válida
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Obtiene el tipo de archivo basado en la extensión
 * @param {string} filename - Nombre del archivo
 * @returns {string} - Tipo de archivo
 */
export const getFileType = (filename) => {
    if (!filename) return 'unknown';

    const extension = filename.split('.').pop().toLowerCase();

    const types = {
        // Imágenes
        'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'webp': 'image', 'svg': 'image',
        // Documentos
        'pdf': 'document', 'doc': 'document', 'docx': 'document', 'txt': 'document',
        // Hojas de cálculo
        'xls': 'spreadsheet', 'xlsx': 'spreadsheet', 'csv': 'spreadsheet',
        // Presentaciones
        'ppt': 'presentation', 'pptx': 'presentation',
        // Archivos comprimidos
        'zip': 'archive', 'rar': 'archive', '7z': 'archive',
        // Audio
        'mp3': 'audio', 'wav': 'audio', 'ogg': 'audio',
        // Video
        'mp4': 'video', 'avi': 'video', 'mov': 'video', 'wmv': 'video'
    };

    return types[extension] || 'unknown';
};