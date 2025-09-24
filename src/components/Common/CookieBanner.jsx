import React, { useState, useEffect } from 'react';
import { FaCookie, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCookies } from '../../hooks/useCookies';
import './CookieBanner.css';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { hasConsent, acceptAllCookies } = useCookies();

    useEffect(() => {
        // Verificar si el usuario ya ha aceptado las cookies
        if (!hasConsent) {
            // Mostrar banner después de un pequeño delay para mejor UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [hasConsent, acceptAllCookies]);

    const handleClose = () => {
        acceptAllCookies();
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-alert-banner">
            <div className="cookie-alert-content">
                <div className="cookie-alert-icon">
                    <FaCookie />
                </div>
                <div className="cookie-alert-text">
                    <p>
                        Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestro uso de cookies.
                    </p>
                </div>
                <div className="cookie-alert-link">
                    <Link to="/privacy-policy" className="privacy-link">
                        Política de Privacidad
                    </Link>
                </div>
            </div>
            <button className="cookie-alert-close" onClick={handleClose} title="Cerrar">
                <FaTimes />
            </button>
        </div>
    );
};

export default CookieBanner;
