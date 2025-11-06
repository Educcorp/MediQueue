/**
 * Pasos del tutorial para el módulo de gestión de turnos (Admin)
 */
export const adminTurnsTutorialSteps = [
    {
        target: '.page-header',
        title: 'Bienvenido a la Gestión de Turnos',
        content: 'Este módulo te permite gestionar todos los turnos de los pacientes. Aquí podrás ver, filtrar, editar y actualizar el estado de los turnos.',
        position: 'bottom'
    },
    {
        target: '.filters-section',
        title: 'Filtros de Búsqueda',
        content: 'Utiliza estos filtros para encontrar turnos específicos. Puedes filtrar por rango de fechas, estado del turno y área/consultorio.',
        position: 'bottom'
    },
    {
        target: '.date-range-filter',
        title: 'Filtrar por Fechas',
        content: 'Selecciona un rango de fechas para ver los turnos. Por defecto se muestra la fecha actual. Usa el botón de reinicio para volver a hoy.',
        position: 'bottom'
    },
    {
        target: '.custom-status-select',
        title: 'Filtrar por Estado',
        content: 'Filtra los turnos según su estado: En espera, Atendido, Cancelado, etc. Haz clic para ver todas las opciones disponibles.',
        position: 'bottom'
    },
    {
        target: '.custom-area-select',
        title: 'Filtrar por Área o Consultorio',
        content: 'Filtra los turnos por área médica específica (como Pediatría, Cardiología) o por consultorio individual.',
        position: 'bottom'
    },
    {
        target: '.turns-table',
        title: 'Tabla de Turnos',
        content: 'Aquí se muestran todos los turnos que coinciden con tus filtros. Cada fila contiene información del turno, paciente y opciones de gestión.',
        position: 'top'
    },
    {
        target: '.turns-table tbody tr:first-child',
        title: 'Información del Turno',
        content: 'Cada turno muestra el número, paciente, fecha/hora, área, consultorio y estado actual. Puedes ver todos los detalles de un vistazo.',
        position: 'top'
    },
    {
        target: '.turns-table tbody tr:first-child .turn-actions',
        title: 'Acciones del Turno',
        content: 'Usa estos botones para gestionar el turno: actualizar el estado, editar información o cancelar el turno si es necesario.',
        position: 'left'
    },
    {
        target: '.turns-table tbody tr:first-child .status-badge',
        title: 'Estado Visual',
        content: 'El estado del turno se muestra con colores distintivos: amarillo (en espera), verde (atendido), rojo (cancelado), etc.',
        position: 'top'
    },
    {
        target: '.pagination-controls',
        title: 'Navegación de Páginas',
        content: 'Si tienes muchos turnos, usa estos controles para navegar entre páginas. Muestra 5 turnos por página para mejor visualización.',
        position: 'top'
    },
    {
        target: '.page-actions button:first-child',
        title: 'Ver Historial',
        content: 'Haz clic aquí para acceder al historial completo de turnos, donde podrás ver estadísticas y reportes detallados.',
        position: 'bottom'
    },
    {
        target: '.page-actions button:last-child',
        title: 'Actualizar Datos',
        content: 'Usa este botón para recargar la información y asegurarte de que estás viendo los datos más recientes.',
        position: 'bottom'
    }
];

/**
 * Función para obtener los pasos del tutorial filtrando los que no tienen elemento target disponible
 * Esto es útil cuando algunos elementos pueden no estar presentes (por ejemplo, si no hay turnos)
 */
export const getAvailableTutorialSteps = () => {
    return adminTurnsTutorialSteps.filter(step => {
        // Si es el paso de la primera fila de la tabla, verificar que exista al menos un turno
        if (step.target.includes('tbody tr:first-child')) {
            const tableRows = document.querySelectorAll('.turns-table tbody tr');
            return tableRows.length > 0 && !tableRows[0].classList.contains('no-data-row');
        }
        return true;
    });
};

/**
 * Pasos del tutorial para el módulo de gestión de consultorios (Admin)
 */
export const adminConsultoriosTutorialSteps = [
    {
        target: '.page-header',
        title: 'Bienvenido a la Gestión de Consultorios',
        content: 'Este módulo te permite administrar las áreas médicas y sus consultorios. Aquí podrás crear, editar y organizar la estructura de tu centro médico.',
        position: 'bottom'
    },
    {
        target: '.page-actions',
        title: 'Acciones Principales',
        content: 'Usa estos botones para crear nuevas áreas médicas, agregar consultorios, ver el tutorial o actualizar la información.',
        position: 'bottom'
    },
    {
        target: '.search-filter-section',
        title: 'Búsqueda y Filtros',
        content: 'Busca áreas o consultorios específicos escribiendo en el campo de búsqueda. Los resultados se filtran en tiempo real.',
        position: 'bottom'
    },
    {
        target: '.areas-grid',
        title: 'Áreas Médicas',
        content: 'Aquí se muestran todas las áreas médicas de tu centro. Cada tarjeta representa un área con su color, ícono y consultorios asociados.',
        position: 'top'
    },
    {
        target: '.area-card:first-child',
        title: 'Tarjeta de Área',
        content: 'Cada área muestra su nombre, letra identificadora, número de consultorios y opciones para editar, eliminar o activar/desactivar.',
        position: 'right'
    },
    {
        target: '.area-card:first-child .area-header',
        title: 'Encabezado del Área',
        content: 'El encabezado muestra el ícono, color y nombre del área. El color y el ícono ayudan a identificar rápidamente cada especialidad.',
        position: 'bottom'
    },
    {
        target: '.area-card:first-child .consultorios-list',
        title: 'Lista de Consultorios',
        content: 'Aquí se listan todos los consultorios pertenecientes a esta área. Cada consultorio tiene su propio número identificador.',
        position: 'bottom'
    },
    {
        target: '.area-card:first-child .consultorio-item:first-child',
        title: 'Consultorio Individual',
        content: 'Cada consultorio muestra su número y opciones para editar, eliminar o cambiar su estado de activo/inactivo.',
        position: 'right'
    },
    {
        target: '.area-card:first-child .area-actions',
        title: 'Acciones del Área',
        content: 'Usa estos botones para editar el área, eliminar el área completa, o activar/desactivar su disponibilidad.',
        position: 'left'
    },
    {
        target: '.area-card:first-child .btn-add-consultorio',
        title: 'Agregar Consultorio',
        content: 'Haz clic en este botón para agregar un nuevo consultorio a esta área específica.',
        position: 'bottom'
    }
];

/**
 * Función para obtener los pasos del tutorial de consultorios filtrando los que no tienen elemento target disponible
 */
export const getAvailableConsultoriosTutorialSteps = () => {
    return adminConsultoriosTutorialSteps.filter(step => {
        // Si es un paso de área específica, verificar que exista al menos un área
        if (step.target.includes('.area-card:first-child')) {
            const areaCards = document.querySelectorAll('.area-card');
            if (areaCards.length === 0) return false;

            // Si es un paso de consultorio específico, verificar que el área tenga consultorios
            if (step.target.includes('.consultorio-item:first-child')) {
                const consultorios = areaCards[0].querySelectorAll('.consultorio-item');
                return consultorios.length > 0;
            }
        }
        return true;
    });
};

/**
 * Pasos del tutorial para el módulo de gestión de pacientes (Admin)
 */
export const adminPatientsTutorialSteps = [
    {
        target: '.page-header',
        title: 'Bienvenido a la Gestión de Pacientes',
        content: 'Este módulo te permite administrar toda la información de los pacientes. Aquí podrás registrar, editar, buscar y gestionar el estado de cada paciente.',
        position: 'bottom'
    },
    {
        target: '.page-actions',
        title: 'Acciones Principales',
        content: 'Usa estos botones para actualizar la lista de pacientes o agregar un nuevo paciente al sistema.',
        position: 'bottom'
    },
    {
        target: '.stats-cards',
        title: 'Estadísticas de Pacientes',
        content: 'Aquí puedes ver las estadísticas generales: total de pacientes registrados, pacientes activos, inactivos y aquellos con correo electrónico.',
        position: 'bottom'
    },
    {
        target: '.filters-section',
        title: 'Búsqueda y Filtros',
        content: 'Utiliza la barra de búsqueda para encontrar pacientes por nombre, apellido, teléfono o email. También puedes filtrar por estado (activo/inactivo).',
        position: 'bottom'
    },
    {
        target: '.filters-section input[type="text"]',
        title: 'Búsqueda Rápida',
        content: 'Escribe en este campo para buscar pacientes. La búsqueda se realiza en tiempo real y filtra por nombre, apellido, teléfono o email.',
        position: 'bottom'
    },
    {
        target: '.filters-section select',
        title: 'Filtrar por Estado',
        content: 'Usa este selector para filtrar pacientes por su estado: todos, solo activos o solo inactivos.',
        position: 'bottom'
    },
    {
        target: '.patients-table',
        title: 'Tabla de Pacientes',
        content: 'Aquí se muestra la lista completa de pacientes con toda su información: nombre, teléfono, fecha de nacimiento, edad, email, estado y fecha de registro.',
        position: 'top'
    },
    {
        target: '.patients-table tbody tr:first-child',
        title: 'Información del Paciente',
        content: 'Cada fila muestra los datos completos del paciente. Puedes ver su nombre, contacto, edad calculada automáticamente y estado actual.',
        position: 'top'
    },
    {
        target: '.patients-table tbody tr:first-child .status-badge',
        title: 'Estado del Paciente',
        content: 'El estado del paciente se indica con colores: verde para activos y gris para inactivos. Esto te permite identificar rápidamente quiénes pueden recibir atención.',
        position: 'top'
    },
    {
        target: '.patients-table tbody tr:first-child .patient-actions',
        title: 'Acciones del Paciente',
        content: 'Usa estos botones para editar la información del paciente o eliminar su registro del sistema.',
        position: 'left'
    }
];

/**
 * Función para obtener los pasos del tutorial de pacientes filtrando los que no tienen elemento target disponible
 */
export const getAvailablePatientsTutorialSteps = () => {
    return adminPatientsTutorialSteps.filter(step => {
        // Si es el paso de la primera fila de la tabla, verificar que exista al menos un paciente
        if (step.target.includes('tbody tr:first-child')) {
            const tableRows = document.querySelectorAll('.patients-table tbody tr');
            return tableRows.length > 0 && !tableRows[0].classList.contains('no-data-row');
        }
        return true;
    });
};

export default adminTurnsTutorialSteps;
