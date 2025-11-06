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

export default adminTurnsTutorialSteps;
