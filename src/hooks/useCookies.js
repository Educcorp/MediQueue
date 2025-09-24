import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar cookies y preferencias de usuario
 * Centraliza toda la lógica de cookies y localStorage
 */
export const useCookies = () => {
    const [cookiePreferences, setCookiePreferences] = useState({
        essential: true, // Siempre activas
        analytics: false,
        functionality: false
    });
    const [hasConsent, setHasConsent] = useState(false);

    // Claves para localStorage
    const CONSENT_KEY = 'mediqueue-cookie-consent';
    const PREFERENCES_KEY = 'mediqueue-cookie-preferences';

    // Cargar preferencias al inicializar
    useEffect(() => {
        loadCookiePreferences();
    }, []);

    /**
     * Cargar preferencias de cookies desde localStorage
     */
    const loadCookiePreferences = () => {
        try {
            const consent = localStorage.getItem(CONSENT_KEY);
            const preferences = localStorage.getItem(PREFERENCES_KEY);

            if (consent) {
                const parsedConsent = JSON.parse(consent);
                setHasConsent(true);

                if (preferences) {
                    const parsedPreferences = JSON.parse(preferences);
                    setCookiePreferences({
                        essential: true, // Siempre activas
                        analytics: parsedPreferences.analytics || false,
                        functionality: parsedPreferences.functionality || false
                    });
                }
            }
        } catch (error) {
            console.error('Error cargando preferencias de cookies:', error);
        }
    };

    /**
     * Guardar preferencias de cookies
     */
    const saveCookiePreferences = (preferences) => {
        try {
            const preferencesToSave = {
                ...preferences,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem(CONSENT_KEY, JSON.stringify(preferencesToSave));
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferencesToSave));

            setCookiePreferences(preferencesToSave);
            setHasConsent(true);

            // Aplicar cookies según las preferencias
            applyCookies(preferencesToSave);

            return true;
        } catch (error) {
            console.error('Error guardando preferencias de cookies:', error);
            return false;
        }
    };

    /**
     * Aplicar cookies según las preferencias
     */
    const applyCookies = (preferences) => {
        // Limpiar cookies existentes
        clearAllCookies();

        // Cookies esenciales (siempre aplicadas)
        setCookie('mediqueue-essential', 'true', 365);

        if (preferences.analytics) {
            setCookie('mediqueue-analytics', 'true', 365);
            console.log('🍪 Cookies analíticas activadas');
        }

        if (preferences.functionality) {
            setCookie('mediqueue-functionality', 'true', 365);
            console.log('🍪 Cookies de funcionalidad activadas');
        }
    };

    /**
     * Establecer una cookie
     */
    const setCookie = (name, value, days) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

        document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
    };

    /**
     * Obtener una cookie
     */
    const getCookie = (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    /**
     * Eliminar una cookie
     */
    const deleteCookie = (name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    };

    /**
     * Limpiar todas las cookies de MediQueue
     */
    const clearAllCookies = () => {
        deleteCookie('mediqueue-essential');
        deleteCookie('mediqueue-analytics');
        deleteCookie('mediqueue-functionality');
    };

    /**
     * Obtener todas las cookies de MediQueue
     */
    const getAllMediQueueCookies = () => {
        const cookies = document.cookie.split(';');
        return cookies.filter(cookie =>
            cookie.trim().startsWith('mediqueue-')
        ).map(cookie => {
            const [name, value] = cookie.trim().split('=');
            return { name, value };
        });
    };

    /**
     * Aceptar todas las cookies
     */
    const acceptAllCookies = () => {
        const preferences = {
            essential: true,
            analytics: true,
            functionality: true
        };
        return saveCookiePreferences(preferences);
    };

    /**
     * Rechazar todas las cookies (excepto esenciales)
     */
    const rejectAllCookies = () => {
        const preferences = {
            essential: true,
            analytics: false,
            functionality: false
        };
        return saveCookiePreferences(preferences);
    };

    /**
     * Actualizar una preferencia específica
     */
    const updatePreference = (type, value) => {
        if (type === 'essential') return; // No se puede cambiar

        const newPreferences = {
            ...cookiePreferences,
            [type]: value
        };

        return saveCookiePreferences(newPreferences);
    };

    /**
     * Resetear a valores por defecto
     */
    const resetToDefaults = () => {
        const defaultPreferences = {
            essential: true,
            analytics: false,
            functionality: false
        };
        return saveCookiePreferences(defaultPreferences);
    };

    /**
     * Eliminar todas las preferencias y cookies
     */
    const clearAllPreferences = () => {
        try {
            localStorage.removeItem(CONSENT_KEY);
            localStorage.removeItem(PREFERENCES_KEY);
            clearAllCookies();

            setCookiePreferences({
                essential: true,
                analytics: false,
                functionality: false
            });
            setHasConsent(false);

            return true;
        } catch (error) {
            console.error('Error eliminando preferencias:', error);
            return false;
        }
    };

    /**
     * Verificar si una cookie específica está activa
     */
    const isCookieActive = (type) => {
        switch (type) {
            case 'essential':
                return true; // Siempre activa
            case 'analytics':
                return cookiePreferences.analytics && getCookie('mediqueue-analytics') !== null;
            case 'functionality':
                return cookiePreferences.functionality && getCookie('mediqueue-functionality') !== null;
            default:
                return false;
        }
    };

    /**
     * Obtener estadísticas de cookies
     */
    const getCookieStats = () => {
        const allCookies = getAllMediQueueCookies();
        return {
            total: allCookies.length,
            essential: allCookies.filter(c => c.name === 'mediqueue-essential').length,
            analytics: allCookies.filter(c => c.name === 'mediqueue-analytics').length,
            functionality: allCookies.filter(c => c.name === 'mediqueue-functionality').length
        };
    };

    return {
        // Estado
        cookiePreferences,
        hasConsent,

        // Acciones principales
        saveCookiePreferences,
        acceptAllCookies,
        rejectAllCookies,
        updatePreference,
        resetToDefaults,
        clearAllPreferences,

        // Utilidades
        getCookie,
        setCookie,
        deleteCookie,
        getAllMediQueueCookies,
        isCookieActive,
        getCookieStats,

        // Estado de preferencias
        isAnalyticsEnabled: cookiePreferences.analytics,
        isFunctionalityEnabled: cookiePreferences.functionality,
        isEssentialEnabled: cookiePreferences.essential
    };
};

export default useCookies;
