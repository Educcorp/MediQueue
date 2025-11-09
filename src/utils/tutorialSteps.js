import i18n from '../i18n/config';

/**
 * Pasos del tutorial para el módulo de gestión de turnos (Admin)
 */
export const getAdminTurnsTutorialSteps = () => {
    const t = i18n.t.bind(i18n);
    
    return [
        {
            target: '.page-header',
            title: t('tutorial:turns.welcome.title'),
            content: t('tutorial:turns.welcome.content'),
            position: 'bottom'
        },
        {
            target: '.filters-section',
            title: t('tutorial:turns.filters.title'),
            content: t('tutorial:turns.filters.content'),
            position: 'bottom'
        },
        {
            target: '.date-range-filter',
            title: t('tutorial:turns.dateFilter.title'),
            content: t('tutorial:turns.dateFilter.content'),
            position: 'bottom'
        },
        {
            target: '.custom-status-select',
            title: t('tutorial:turns.statusFilter.title'),
            content: t('tutorial:turns.statusFilter.content'),
            position: 'bottom'
        },
        {
            target: '.custom-area-select',
            title: t('tutorial:turns.areaFilter.title'),
            content: t('tutorial:turns.areaFilter.content'),
            position: 'bottom'
        },
        {
            target: '.turns-table',
            title: t('tutorial:turns.table.title'),
            content: t('tutorial:turns.table.content'),
            position: 'top'
        },
        {
            target: '.turns-table tbody tr:first-child',
            title: t('tutorial:turns.turnInfo.title'),
            content: t('tutorial:turns.turnInfo.content'),
            position: 'top'
        },
        {
            target: '.turns-table tbody tr:first-child .turn-actions',
            title: t('tutorial:turns.actions.title'),
            content: t('tutorial:turns.actions.content'),
            position: 'left'
        },
        {
            target: '.turns-table tbody tr:first-child .status-badge',
            title: t('tutorial:turns.statusBadge.title'),
            content: t('tutorial:turns.statusBadge.content'),
            position: 'top'
        },
        {
            target: '.pagination-controls',
            title: t('tutorial:turns.pagination.title'),
            content: t('tutorial:turns.pagination.content'),
            position: 'top'
        },
        {
            target: '.page-actions button:first-child',
            title: t('tutorial:turns.history.title'),
            content: t('tutorial:turns.history.content'),
            position: 'bottom'
        },
        {
            target: '.page-actions button:last-child',
            title: t('tutorial:turns.refresh.title'),
            content: t('tutorial:turns.refresh.content'),
            position: 'bottom'
        }
    ];
};

/**
 * Función para obtener los pasos del tutorial filtrando los que no tienen elemento target disponible
 * Esto es útil cuando algunos elementos pueden no estar presentes (por ejemplo, si no hay turnos)
 */
export const getAvailableTutorialSteps = () => {
    const steps = getAdminTurnsTutorialSteps();
    return steps.filter(step => {
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
export const getAdminConsultoriosTutorialSteps = () => {
    const t = i18n.t.bind(i18n);
    
    return [
        {
            target: '.page-header',
            title: t('tutorial:consultorios.welcome.title'),
            content: t('tutorial:consultorios.welcome.content'),
            position: 'bottom'
        },
        {
            target: '.page-actions',
            title: t('tutorial:consultorios.actions.title'),
            content: t('tutorial:consultorios.actions.content'),
            position: 'bottom'
        },
        {
            target: '.search-filter-section',
            title: t('tutorial:consultorios.search.title'),
            content: t('tutorial:consultorios.search.content'),
            position: 'bottom'
        },
        {
            target: '.areas-grid',
            title: t('tutorial:consultorios.areasGrid.title'),
            content: t('tutorial:consultorios.areasGrid.content'),
            position: 'top'
        },
        {
            target: '.area-card:first-child',
            title: t('tutorial:consultorios.areaCard.title'),
            content: t('tutorial:consultorios.areaCard.content'),
            position: 'right'
        },
        {
            target: '.area-card:first-child .area-header',
            title: t('tutorial:consultorios.areaHeader.title'),
            content: t('tutorial:consultorios.areaHeader.content'),
            position: 'bottom'
        },
        {
            target: '.area-card:first-child .consultorios-list',
            title: t('tutorial:consultorios.consultoriosList.title'),
            content: t('tutorial:consultorios.consultoriosList.content'),
            position: 'bottom'
        },
        {
            target: '.area-card:first-child .consultorio-item:first-child',
            title: t('tutorial:consultorios.consultorioItem.title'),
            content: t('tutorial:consultorios.consultorioItem.content'),
            position: 'right'
        },
        {
            target: '.area-card:first-child .area-actions',
            title: t('tutorial:consultorios.areaActions.title'),
            content: t('tutorial:consultorios.areaActions.content'),
            position: 'left'
        },
        {
            target: '.area-card:first-child .btn-add-consultorio',
            title: t('tutorial:consultorios.addConsultorio.title'),
            content: t('tutorial:consultorios.addConsultorio.content'),
            position: 'bottom'
        }
    ];
};

/**
 * Función para obtener los pasos del tutorial de consultorios filtrando los que no tienen elemento target disponible
 */
export const getAvailableConsultoriosTutorialSteps = () => {
    const steps = getAdminConsultoriosTutorialSteps();
    return steps.filter(step => {
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
export const getAdminPatientsTutorialSteps = () => {
    const t = i18n.t.bind(i18n);
    
    return [
        {
            target: '.page-header',
            title: t('tutorial:patients.welcome.title'),
            content: t('tutorial:patients.welcome.content'),
            position: 'bottom'
        },
        {
            target: '.page-actions',
            title: t('tutorial:patients.actions.title'),
            content: t('tutorial:patients.actions.content'),
            position: 'bottom'
        },
        {
            target: '.stats-cards',
            title: t('tutorial:patients.stats.title'),
            content: t('tutorial:patients.stats.content'),
            position: 'bottom'
        },
        {
            target: '.filters-section',
            title: t('tutorial:patients.filters.title'),
            content: t('tutorial:patients.filters.content'),
            position: 'bottom'
        },
        {
            target: '.filters-section input[type="text"]',
            title: t('tutorial:patients.searchInput.title'),
            content: t('tutorial:patients.searchInput.content'),
            position: 'bottom'
        },
        {
            target: '.filters-section select',
            title: t('tutorial:patients.statusSelect.title'),
            content: t('tutorial:patients.statusSelect.content'),
            position: 'bottom'
        },
        {
            target: '.patients-table',
            title: t('tutorial:patients.table.title'),
            content: t('tutorial:patients.table.content'),
            position: 'top'
        },
        {
            target: '.patients-table tbody tr:first-child',
            title: t('tutorial:patients.patientInfo.title'),
            content: t('tutorial:patients.patientInfo.content'),
            position: 'top'
        },
        {
            target: '.patients-table tbody tr:first-child .status-badge',
            title: t('tutorial:patients.statusBadge.title'),
            content: t('tutorial:patients.statusBadge.content'),
            position: 'top'
        },
        {
            target: '.patients-table tbody tr:first-child .patient-actions',
            title: t('tutorial:patients.patientActions.title'),
            content: t('tutorial:patients.patientActions.content'),
            position: 'left'
        }
    ];
};

/**
 * Función para obtener los pasos del tutorial de pacientes filtrando los que no tienen elemento target disponible
 */
export const getAvailablePatientsTutorialSteps = () => {
    const steps = getAdminPatientsTutorialSteps();
    return steps.filter(step => {
        // Si es el paso de la primera fila de la tabla, verificar que exista al menos un paciente
        if (step.target.includes('tbody tr:first-child')) {
            const tableRows = document.querySelectorAll('.patients-table tbody tr');
            return tableRows.length > 0 && !tableRows[0].classList.contains('no-data-row');
        }
        return true;
    });
};

/**
 * Pasos del tutorial para el módulo de gestión de usuarios administrativos (Admin)
 */
export const getAdminUsersTutorialSteps = () => {
    const t = i18n.t.bind(i18n);
    
    return [
        {
            target: '.page-header',
            title: t('tutorial:users.welcome.title'),
            content: t('tutorial:users.welcome.content'),
            position: 'bottom'
        },
        {
            target: '.page-actions',
            title: t('tutorial:users.actions.title'),
            content: t('tutorial:users.actions.content'),
            position: 'bottom'
        },
        {
            target: '.stats-cards',
            title: t('tutorial:users.stats.title'),
            content: t('tutorial:users.stats.content'),
            position: 'bottom'
        },
        {
            target: '.filters-section',
            title: t('tutorial:users.filters.title'),
            content: t('tutorial:users.filters.content'),
            position: 'bottom'
        },
        {
            target: '.filters-section input[type="text"]',
            title: t('tutorial:users.searchInput.title'),
            content: t('tutorial:users.searchInput.content'),
            position: 'bottom'
        },
        {
            target: '.users-table',
            title: t('tutorial:users.table.title'),
            content: t('tutorial:users.table.content'),
            position: 'top'
        },
        {
            target: '.users-table tbody tr:first-child',
            title: t('tutorial:users.userInfo.title'),
            content: t('tutorial:users.userInfo.content'),
            position: 'top'
        },
        {
            target: '.users-table tbody tr:first-child .status-badge',
            title: t('tutorial:users.statusBadge.title'),
            content: t('tutorial:users.statusBadge.content'),
            position: 'top'
        },
        {
            target: '.users-table tbody tr:first-child .user-actions',
            title: t('tutorial:users.userActions.title'),
            content: t('tutorial:users.userActions.content'),
            position: 'left'
        }
    ];
};

/**
 * Función para obtener los pasos del tutorial de usuarios filtrando los que no tienen elemento target disponible
 */
export const getAvailableUsersTutorialSteps = () => {
    const steps = getAdminUsersTutorialSteps();
    return steps.filter(step => {
        // Si es el paso de la primera fila de la tabla, verificar que exista al menos un usuario
        if (step.target.includes('tbody tr:first-child')) {
            const tableRows = document.querySelectorAll('.users-table tbody tr');
            return tableRows.length > 0 && !tableRows[0].classList.contains('no-data-row');
        }
        return true;
    });
};

/**
 * Pasos del tutorial para el módulo de historial de turnos (Admin)
 */
export const getHistorialTurnosTutorialSteps = () => {
    const t = i18n.t.bind(i18n);
    
    return [
        {
            target: '.page-header',
            title: t('tutorial:historial.welcome.title'),
            content: t('tutorial:historial.welcome.content'),
            position: 'bottom'
        },
        {
            target: '.page-actions',
            title: t('tutorial:historial.actions.title'),
            content: t('tutorial:historial.actions.content'),
            position: 'bottom'
        },
        {
            target: '.filters-section',
            title: t('tutorial:historial.filters.title'),
            content: t('tutorial:historial.filters.content'),
            position: 'bottom'
        },
        {
            target: '.date-range-filter',
            title: t('tutorial:historial.dateRange.title'),
            content: t('tutorial:historial.dateRange.content'),
            position: 'bottom'
        },
        {
            target: '.custom-status-select',
            title: t('tutorial:historial.statusFilter.title'),
            content: t('tutorial:historial.statusFilter.content'),
            position: 'bottom'
        },
        {
            target: '.custom-area-select',
            title: t('tutorial:historial.areaFilter.title'),
            content: t('tutorial:historial.areaFilter.content'),
            position: 'bottom'
        },
        {
            target: '.history-cards',
            title: t('tutorial:historial.cards.title'),
            content: t('tutorial:historial.cards.content'),
            position: 'top'
        },
        {
            target: '.history-cards > div:first-child',
            title: t('tutorial:historial.cardInfo.title'),
            content: t('tutorial:historial.cardInfo.content'),
            position: 'top'
        },
        {
            target: '.pagination-controls',
            title: t('tutorial:historial.pagination.title'),
            content: t('tutorial:historial.pagination.content'),
            position: 'top'
        }
    ];
};

/**
 * Función para obtener los pasos del tutorial de historial filtrando los que no tienen elemento target disponible
 */
export const getAvailableHistorialTutorialSteps = () => {
    const steps = getHistorialTurnosTutorialSteps();
    return steps.filter(step => {
        // Si es el paso de la primera tarjeta, verificar que exista al menos un turno
        if (step.target.includes('.history-cards > div:first-child')) {
            const cards = document.querySelectorAll('.history-cards > div');
            return cards.length > 0;
        }
        return true;
    });
};

// Exportar por defecto la función de tutoriales de turnos
export default getAdminTurnsTutorialSteps;
