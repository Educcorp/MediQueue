// Constantes de la aplicación

// Estados de turnos
export const TURN_STATUS = {
    EN_ESPERA: 'EN_ESPERA',
    LLAMANDO: 'LLAMANDO',
    ATENDIDO: 'ATENDIDO',
    CANCELADO: 'CANCELADO',
    NO_PRESENTE: 'NO_PRESENTE'
};

// Etiquetas de estados de turnos
export const TURN_STATUS_LABELS = {
    [TURN_STATUS.EN_ESPERA]: 'En espera',
    [TURN_STATUS.LLAMANDO]: 'Llamando',
    [TURN_STATUS.ATENDIDO]: 'Atendido',
    [TURN_STATUS.CANCELADO]: 'Cancelado',
    [TURN_STATUS.NO_PRESENTE]: 'No presente'
};

// Colores de estados de turnos
export const TURN_STATUS_COLORS = {
    [TURN_STATUS.EN_ESPERA]: '#4299e1',
    [TURN_STATUS.LLAMANDO]: '#805ad5',
    [TURN_STATUS.ATENDIDO]: '#48bb78',
    [TURN_STATUS.CANCELADO]: '#e53e3e',
    [TURN_STATUS.NO_PRESENTE]: '#a0aec0'
};

// Tipos de usuario
export const USER_TYPES = {
    ADMIN: 1,
    SUPERVISOR: 2
};

// Etiquetas de tipos de usuario
export const USER_TYPE_LABELS = {
    [USER_TYPES.ADMIN]: 'Administrador',
    [USER_TYPES.SUPERVISOR]: 'Supervisor'
};

// Estados de registros
export const RECORD_STATUS = {
    ACTIVO: 'ACTIVO',
    INACTIVO: 'INACTIVO'
};

// Etiquetas de estados de registros
export const RECORD_STATUS_LABELS = {
    [RECORD_STATUS.ACTIVO]: 'Activo',
    [RECORD_STATUS.INACTIVO]: 'Inactivo'
};

// Rutas de la aplicación
export const ROUTES = {
    HOME: '/',
    TAKE_TURN: '/take-turn',
    TURN_STATUS: '/turn-status',
    ADMIN_LOGIN: '/admin',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_TURNS: '/admin/turns',
    ADMIN_USERS: '/admin/users',
    ADMIN_AREAS: '/admin/areas',
    ADMIN_CONSULTORIOS: '/admin/consultorios',
    ADMIN_STATISTICS: '/admin/statistics',
    ADMIN_SETTINGS: '/admin/settings'
};

// Permisos del sistema
export const PERMISSIONS = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    MANAGE_USERS: 'manage_users',
    MANAGE_TURNS: 'manage_turns',
    VIEW_STATISTICS: 'view_statistics',
    MANAGE_AREAS: 'manage_areas',
    MANAGE_CONSULTORIOS: 'manage_consultorios',
    MANAGE_SETTINGS: 'manage_settings'
};

// Configuración de paginación
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

// Configuración de actualización automática
export const AUTO_REFRESH = {
    TURNS: 5000, // 5 segundos
    STATISTICS: 30000, // 30 segundos
    DASHBOARD: 10000 // 10 segundos
};

// Configuración de validación
export const VALIDATION = {
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MIN_PHONE_LENGTH: 10,
    MAX_PHONE_LENGTH: 15,
    MAX_EMAIL_LENGTH: 100,
    MAX_OBSERVATIONS_LENGTH: 500
};

// Configuración de archivos
export const FILE_CONFIG = {
    MAX_SIZE_MB: 5,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALLOWED_SPREADSHEET_TYPES: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
};

// Mensajes del sistema
export const MESSAGES = {
    SUCCESS: {
        TURN_CREATED: 'Turno creado exitosamente',
        TURN_UPDATED: 'Turno actualizado exitosamente',
        TURN_DELETED: 'Turno eliminado exitosamente',
        USER_CREATED: 'Usuario creado exitosamente',
        USER_UPDATED: 'Usuario actualizado exitosamente',
        USER_DELETED: 'Usuario eliminado exitosamente',
        LOGIN_SUCCESS: 'Inicio de sesión exitoso',
        LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
        PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
        PROFILE_UPDATED: 'Perfil actualizado exitosamente'
    },
    ERROR: {
        NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
        SERVER_ERROR: 'Error del servidor. Inténtalo más tarde.',
        VALIDATION_ERROR: 'Error de validación en los datos proporcionados',
        AUTH_ERROR: 'Error de autenticación. Verifica tus credenciales.',
        PERMISSION_ERROR: 'No tienes permisos para realizar esta acción.',
        NOT_FOUND: 'Recurso no encontrado.',
        CONFLICT: 'El recurso ya existe.',
        GENERIC_ERROR: 'Ha ocurrido un error inesperado.'
    },
    INFO: {
        LOADING: 'Cargando...',
        NO_DATA: 'No hay datos disponibles',
        SELECT_OPTION: 'Selecciona una opción',
        REQUIRED_FIELD: 'Este campo es requerido',
        OPTIONAL_FIELD: 'Este campo es opcional'
    }
};

// Configuración de notificaciones
export const NOTIFICATION = {
    DURATION: {
        SUCCESS: 3000,
        ERROR: 5000,
        INFO: 4000,
        WARNING: 4000
    },
    POSITION: {
        TOP_RIGHT: 'top-right',
        TOP_LEFT: 'top-left',
        BOTTOM_RIGHT: 'bottom-right',
        BOTTOM_LEFT: 'bottom-left'
    }
};

// Configuración de temas
export const THEME = {
    COLORS: {
        PRIMARY: '#667eea',
        SECONDARY: '#764ba2',
        SUCCESS: '#48bb78',
        WARNING: '#ed8936',
        ERROR: '#e53e3e',
        INFO: '#4299e1',
        LIGHT: '#f7fafc',
        DARK: '#2d3748',
        GRAY: '#718096'
    },
    BREAKPOINTS: {
        MOBILE: '768px',
        TABLET: '1024px',
        DESKTOP: '1280px'
    }
};

// Configuración de API
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// Configuración de localStorage
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    AUTH_USER: 'auth_user',
    AUTH_REMEMBER: 'auth_remember',
    THEME: 'theme',
    LANGUAGE: 'language',
    SETTINGS: 'settings'
};

// Configuración de idiomas
export const LANGUAGES = {
    ES: 'es',
    EN: 'en'
};

// Etiquetas de idiomas
export const LANGUAGE_LABELS = {
    [LANGUAGES.ES]: 'Español',
    [LANGUAGES.EN]: 'English'
};

// Configuración de fechas
export const DATE_FORMATS = {
    SHORT: 'DD/MM/YYYY',
    LONG: 'DD [de] MMMM [de] YYYY',
    TIME: 'HH:mm',
    DATETIME: 'DD/MM/YYYY HH:mm',
    ISO: 'YYYY-MM-DD'
};

// Configuración de turnos
export const TURN_CONFIG = {
    MAX_TURNS_PER_DAY: 1000,
    MAX_TURNS_PER_CONSULTORIO: 100,
    TURN_EXPIRY_HOURS: 24,
    AUTO_CANCEL_HOURS: 2
};

// Configuración de consultorios
export const CONSULTORIO_CONFIG = {
    MIN_NUMBER: 1,
    MAX_NUMBER: 999,
    MAX_PER_AREA: 50
};

// Configuración de áreas
export const AREA_CONFIG = {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MAX_AREAS: 50
};

// Configuración de pacientes
export const PATIENT_CONFIG = {
    MIN_AGE: 0,
    MAX_AGE: 120,
    REQUIRED_FIELDS: ['s_nombre', 's_apellido', 'c_telefono'],
    OPTIONAL_FIELDS: ['s_email', 'd_fecha_nacimiento']
};

// Configuración de administradores
export const ADMIN_CONFIG = {
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 50,
    REQUIRED_FIELDS: ['s_nombre', 's_apellido', 's_email', 's_usuario', 's_password'],
    OPTIONAL_FIELDS: ['c_telefono']
};

// Estados de carga
export const LOADING_STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Configuración de exportación
export const EXPORT_CONFIG = {
    FORMATS: {
        CSV: 'csv',
        EXCEL: 'xlsx',
        PDF: 'pdf'
    },
    MAX_RECORDS: 10000
};

// Configuración de búsqueda
export const SEARCH_CONFIG = {
    MIN_TERM_LENGTH: 2,
    MAX_TERM_LENGTH: 100,
    DEBOUNCE_DELAY: 300
};

// Configuración de validación de formularios
export const FORM_VALIDATION = {
    DEBOUNCE_DELAY: 500,
    SHOW_ERRORS_AFTER: 'blur', // 'blur', 'change', 'submit'
    VALIDATE_ON_MOUNT: false
};

// Configuración de animaciones
export const ANIMATION = {
    DURATION: {
        FAST: 200,
        NORMAL: 300,
        SLOW: 500
    },
    EASING: {
        EASE: 'ease',
        EASE_IN: 'ease-in',
        EASE_OUT: 'ease-out',
        EASE_IN_OUT: 'ease-in-out'
    }
};

// Configuración de modales
export const MODAL_CONFIG = {
    BACKDROP_CLOSABLE: true,
    ESC_CLOSABLE: true,
    FOCUS_TRAP: true,
    RESTORE_FOCUS: true
};

// Configuración de tablas
export const TABLE_CONFIG = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
    SORT_DIRECTIONS: {
        ASC: 'asc',
        DESC: 'desc'
    }
};

// Configuración de gráficos
export const CHART_CONFIG = {
    COLORS: [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
    ],
    DEFAULT_HEIGHT: 300,
    ANIMATION_DURATION: 1000
};