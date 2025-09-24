import { useState, useEffect } from 'react';

/**
 * Hook simplificado para manejar cookies - acepta automáticamente todas las cookies
 * Simplificado para cumplir con la política de aceptación automática
 */
export const useCookies = () => {
    const [hasConsent, setHasConsent] = useState(false);

    // Clave para localStorage
    const CONSENT_KEY = 'mediqueue-cookie-consent';

    // Verificar consentimiento al inicializar
    useEffect(() => {
        checkCookieConsent();
    }, []);

    /**
     * Verificar si ya se ha dado consentimiento
     */
    const checkCookieConsent = () => {
        try {
            const consent = localStorage.getItem(CONSENT_KEY);
            if (consent) {
                setHasConsent(true);
            }
        } catch (error) {
            console.error('Error verificando consentimiento de cookies:', error);
        }
    };

    /**
     * Aceptar todas las cookies automáticamente
     */
    const acceptAllCookies = () => {
        try {
            const consentData = {
                accepted: true,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
            setHasConsent(true);

            // Aplicar todas las cookies
            setCookie('mediqueue-essential', 'true', 365);
            setCookie('mediqueue-analytics', 'true', 365);
            setCookie('mediqueue-functionality', 'true', 365);

            return true;
        } catch (error) {
            console.error('Error guardando consentimiento de cookies:', error);
            return false;
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

    return {
        // Estado
        hasConsent,
        // Función principal
        acceptAllCookies
    };
};

export default useCookies;
