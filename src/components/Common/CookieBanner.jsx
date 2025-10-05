import React, { useState, useEffect } from 'react';
import { FaCookie, FaCheck, FaTimes, FaCog, FaShieldAlt, FaEye, FaChartBar } from 'react-icons/fa';
import { useCookies } from '../../hooks/useCookies';
import './CookieBanner.css';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const {
        cookiePreferences,
        hasConsent,
        saveCookiePreferences,
        acceptAllCookies,
        rejectAllCookies,
        updatePreference
    } = useCookies();

    useEffect(() => {
        // Verificar si el usuario ya ha aceptado las cookies
        if (!hasConsent) {
            // Mostrar banner después de un pequeño delay para mejor UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [hasConsent]);

    const handleAcceptAll = () => {
        acceptAllCookies();
        setIsVisible(false);
    };

    const handleAcceptSelected = () => {
        saveCookiePreferences(cookiePreferences);
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleRejectAll = () => {
        rejectAllCookies();
        setIsVisible(false);
    };

    const togglePreference = (type) => {
        if (type === 'essential') return; // No se puede desactivar

        updatePreference(type, !cookiePreferences[type]);
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Overlay */}
            <div className="cookie-overlay" onClick={() => setShowSettings(false)} />

            
            
            {/* Settings Modal */}
            {showSettings && (
                <div className="cookie-settings-modal">
                    <div className="cookie-settings-content">
                        <div className="cookie-settings-header">
                            <h3>⚙️ Configuración de Cookies</h3>
                            <p>Personaliza tus preferencias de cookies</p>
                        </div>

                        <div className="cookie-settings-body">
                            {/* Essential Cookies */}
                            <div className="cookie-setting-item">
                                <div className="cookie-setting-info">
                                    <h4>
                                        <FaShieldAlt className="cookie-setting-icon essential" />
                                        Cookies Esenciales
                                    </h4>
                                    <p>
                                        Estas cookies son necesarias para el funcionamiento básico del sitio web.
                                        Incluyen cookies de sesión, autenticación y seguridad.
                                    </p>
                                </div>
                                <div className="cookie-toggle disabled">
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                        readOnly
                                    />
                                    <span className="cookie-toggle-slider"></span>
                                </div>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="cookie-setting-item">
                                <div className="cookie-setting-info">
                                    <h4>
                                        <FaChartBar className="cookie-setting-icon analytics" />
                                        Cookies Analíticas
                                    </h4>
                                    <p>
                                        Nos ayudan a entender cómo los visitantes interactúan con el sitio web,
                                        recopilando información de forma anónima.
                                    </p>
                                </div>
                                <div className="cookie-toggle">
                                    <input
                                        type="checkbox"
                                        checked={cookiePreferences.analytics}
                                        onChange={() => togglePreference('analytics')}
                                    />
                                    <span className="cookie-toggle-slider"></span>
                                </div>
                            </div>

                            {/* Functionality Cookies */}
                            <div className="cookie-setting-item">
                                <div className="cookie-setting-info">
                                    <h4>
                                        <FaEye className="cookie-setting-icon functionality" />
                                        Cookies de Funcionalidad
                                    </h4>
                                    <p>
                                        Permiten que el sitio web recuerde las elecciones que haces y
                                        proporcione características mejoradas y más personales.
                                    </p>
                                </div>
                                <div className="cookie-toggle">
                                    <input
                                        type="checkbox"
                                        checked={cookiePreferences.functionality}
                                        onChange={() => togglePreference('functionality')}
                                    />
                                    <span className="cookie-toggle-slider"></span>
                                </div>
                            </div>
                        </div>

                        <div className="cookie-settings-footer">
                            <button
                                className="cookie-btn cookie-btn-outline"
                                onClick={() => setShowSettings(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                className="cookie-btn cookie-btn-primary"
                                onClick={handleAcceptSelected}
                            >
                                <FaCheck />
                                Guardar Preferencias
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CookieBanner;
