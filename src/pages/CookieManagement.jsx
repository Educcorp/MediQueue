import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCookie, FaCheck, FaTimes, FaShieldAlt, FaEye, FaChartBar, FaCog, FaTrash, FaSave } from 'react-icons/fa';
import { useCookies } from '../hooks/useCookies';
import '../styles/CookieManagement.css';

const CookieManagement = () => {
    const [hasChanges, setHasChanges] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const {
        cookiePreferences,
        saveCookiePreferences,
        updatePreference,
        resetToDefaults,
        clearAllPreferences,
        getAllMediQueueCookies
    } = useCookies();

    const togglePreference = (type) => {
        if (type === 'essential') return; // No se puede desactivar

        updatePreference(type, !cookiePreferences[type]);
        setHasChanges(true);
    };

    const savePreferences = () => {
        saveCookiePreferences(cookiePreferences);
        setHasChanges(false);
        setShowSuccess(true);

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleResetToDefaults = () => {
        resetToDefaults();
        setHasChanges(true);
    };

    const clearAllCookies = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar todas las cookies? Esto puede afectar la funcionalidad del sitio.')) {
            clearAllPreferences();
            setHasChanges(false);
        }
    };

    const getCurrentCookies = () => {
        return getAllMediQueueCookies();
    };

    return (
        <div className="cookie-management">
            <div className="cookie-management-container">
                {/* Header */}
                <div className="cookie-management-header">
                    <div className="cookie-management-header-content">
                        <div className="cookie-management-icon">
                            <FaCookie />
                        </div>
                        <div className="cookie-management-title-section">
                            <h1>Configuración de Cookies</h1>
                            <p className="cookie-management-subtitle">
                                Gestiona tus preferencias de cookies y controla tu privacidad
                            </p>
                            <div className="cookie-management-meta">
                                <span className="cookie-management-date">
                                    Última actualización: {new Date().toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="cookie-success-message">
                        <FaCheck />
                        <span>¡Preferencias guardadas exitosamente!</span>
                    </div>
                )}

                {/* Content */}
                <div className="cookie-management-content">
                    {/* Introduction */}
                    <section className="cookie-management-section">
                        <div className="cookie-management-intro">
                            <h2>🍪 ¿Qué son las Cookies?</h2>
                            <p>
                                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo
                                cuando visitas nuestro sitio web. Nos ayudan a recordar tus preferencias,
                                mejorar tu experiencia y analizar cómo utilizas nuestro servicio.
                            </p>
                            <div className="cookie-management-highlight">
                                <FaShieldAlt />
                                <span>Puedes cambiar tus preferencias en cualquier momento. Tus datos están seguros con nosotros.</span>
                            </div>
                        </div>
                    </section>

                    {/* Current Status */}
                    <section className="cookie-management-section">
                        <h2>📊 Estado Actual de las Cookies</h2>

                        <div className="cookie-status-grid">
                            <div className="cookie-status-card">
                                <div className="cookie-status-header">
                                    <FaShieldAlt className="cookie-status-icon essential" />
                                    <h3>Cookies Esenciales</h3>
                                    <div className="cookie-status-badge active">Activas</div>
                                </div>
                                <p>Necesarias para el funcionamiento básico del sitio web</p>
                                <div className="cookie-status-details">
                                    <span>• Sesión de usuario</span>
                                    <span>• Autenticación</span>
                                    <span>• Seguridad</span>
                                </div>
                            </div>

                            <div className="cookie-status-card">
                                <div className="cookie-status-header">
                                    <FaChartBar className="cookie-status-icon analytics" />
                                    <h3>Cookies Analíticas</h3>
                                    <div className={`cookie-status-badge ${cookiePreferences.analytics ? 'active' : 'inactive'}`}>
                                        {cookiePreferences.analytics ? 'Activas' : 'Inactivas'}
                                    </div>
                                </div>
                                <p>Nos ayudan a entender cómo utilizas nuestro sitio</p>
                                <div className="cookie-status-details">
                                    <span>• Análisis de uso</span>
                                    <span>• Estadísticas de rendimiento</span>
                                    <span>• Identificación de problemas</span>
                                </div>
                            </div>

                            <div className="cookie-status-card">
                                <div className="cookie-status-header">
                                    <FaEye className="cookie-status-icon functionality" />
                                    <h3>Cookies de Funcionalidad</h3>
                                    <div className={`cookie-status-badge ${cookiePreferences.functionality ? 'active' : 'inactive'}`}>
                                        {cookiePreferences.functionality ? 'Activas' : 'Inactivas'}
                                    </div>
                                </div>
                                <p>Mejoran tu experiencia personalizando el sitio</p>
                                <div className="cookie-status-details">
                                    <span>• Preferencias de usuario</span>
                                    <span>• Configuraciones</span>
                                    <span>• Personalización</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cookie Settings */}
                    <section className="cookie-management-section">
                        <h2>⚙️ Configurar Preferencias</h2>

                        <div className="cookie-settings-panel">
                            {/* Essential Cookies */}
                            <div className="cookie-setting-item">
                                <div className="cookie-setting-info">
                                    <h3>
                                        <FaShieldAlt className="cookie-setting-icon essential" />
                                        Cookies Esenciales
                                    </h3>
                                    <p>
                                        Estas cookies son necesarias para el funcionamiento básico del sitio web.
                                        Incluyen cookies de sesión, autenticación y seguridad. No se pueden desactivar.
                                    </p>
                                    <div className="cookie-setting-details">
                                        <span>• Mantienen tu sesión activa</span>
                                        <span>• Protegen contra ataques de seguridad</span>
                                        <span>• Permiten la autenticación de usuarios</span>
                                    </div>
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
                                    <h3>
                                        <FaChartBar className="cookie-setting-icon analytics" />
                                        Cookies Analíticas
                                    </h3>
                                    <p>
                                        Nos ayudan a entender cómo los visitantes interactúan con el sitio web,
                                        recopilando información de forma anónima para mejorar nuestros servicios.
                                    </p>
                                    <div className="cookie-setting-details">
                                        <span>• Análisis de páginas visitadas</span>
                                        <span>• Tiempo de permanencia en el sitio</span>
                                        <span>• Identificación de errores técnicos</span>
                                        <span>• Estadísticas de uso general</span>
                                    </div>
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
                                    <h3>
                                        <FaEye className="cookie-setting-icon functionality" />
                                        Cookies de Funcionalidad
                                    </h3>
                                    <p>
                                        Permiten que el sitio web recuerde las elecciones que haces y
                                        proporcione características mejoradas y más personales.
                                    </p>
                                    <div className="cookie-setting-details">
                                        <span>• Recordar preferencias de idioma</span>
                                        <span>• Configuraciones de interfaz</span>
                                        <span>• Personalización de contenido</span>
                                        <span>• Recordar configuraciones de cookies</span>
                                    </div>
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
                    </section>

                    {/* Current Cookies */}
                    <section className="cookie-management-section">
                        <h2>🔍 Cookies Actuales en tu Navegador</h2>

                        <div className="cookie-list-panel">
                            <div className="cookie-list-header">
                                <h3>Cookies de MediQueue</h3>
                                <button
                                    className="cookie-clear-btn"
                                    onClick={clearAllCookies}
                                >
                                    <FaTrash />
                                    Limpiar Todas
                                </button>
                            </div>

                            <div className="cookie-list">
                                {getCurrentCookies().length > 0 ? (
                                    getCurrentCookies().map((cookie, index) => (
                                        <div key={index} className="cookie-item">
                                            <div className="cookie-item-info">
                                                <span className="cookie-name">{cookie.name}</span>
                                                <span className="cookie-value">{cookie.value}</span>
                                            </div>
                                            <div className="cookie-item-status">
                                                <span className="cookie-status-indicator active"></span>
                                                <span>Activa</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="cookie-empty">
                                        <FaCookie />
                                        <p>No hay cookies de MediQueue almacenadas en tu navegador</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <section className="cookie-management-section">
                        <div className="cookie-actions-panel">
                            <div className="cookie-actions-info">
                                <h3>💾 Guardar Cambios</h3>
                                <p>
                                    {hasChanges
                                        ? 'Tienes cambios sin guardar. Haz clic en "Guardar Preferencias" para aplicar los cambios.'
                                        : 'Tus preferencias están actualizadas y guardadas.'
                                    }
                                </p>
                            </div>

                            <div className="cookie-actions-buttons">
                                <button
                                    className="cookie-btn cookie-btn-outline"
                                    onClick={handleResetToDefaults}
                                >
                                    <FaTimes />
                                    Restablecer
                                </button>

                                <button
                                    className="cookie-btn cookie-btn-primary"
                                    onClick={savePreferences}
                                    disabled={!hasChanges}
                                >
                                    <FaSave />
                                    Guardar Preferencias
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="cookie-management-footer">
                        <div className="cookie-management-footer-content">
                            <p>
                                Para más información sobre cómo utilizamos las cookies, consulta nuestra
                                <Link to="/privacy-policy" className="cookie-footer-link"> Política de Privacidad</Link>.
                            </p>
                            <div className="cookie-management-footer-actions">
                                <Link to="/" className="btn btn-primary">
                                    Volver al Inicio
                                </Link>
                                <Link to="/privacy-policy" className="btn btn-secondary">
                                    Política de Privacidad
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieManagement;
