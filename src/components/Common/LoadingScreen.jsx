import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({
    message = "Cargando dashboard...",
    showProgress = false
}) => {
    const [progress, setProgress] = useState(0);
    const [dots, setDots] = useState('');
    
    // Detectar tema actual
    const [theme, setTheme] = useState(() => localStorage.getItem('mq-theme') || 'light');
    const isDarkMode = theme === 'dark';

    // Escuchar cambios de tema
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            if (currentTheme !== theme) {
                setTheme(currentTheme);
            }
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => {
            observer.disconnect();
        };
    }, [theme]);

    useEffect(() => {
        if (showProgress) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) return 100;
                    return prev + Math.random() * 10;
                });
            }, 300);
            return () => clearInterval(interval);
        }
    }, [showProgress]);

    // Animación de puntos
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="minimal-loading-screen" style={{
            backgroundColor: isDarkMode ? '#1a202c' : 'inherit'
        }}>
            <div className="minimal-loading-container">
                {/* Logo médico simple */}
                <div className="minimal-medical-icon">
                    <div className="medical-cross-simple">
                        <div className="cross-h"></div>
                        <div className="cross-v"></div>
                    </div>
                </div>

                {/* Título */}
                <div className="minimal-title">MediQueue</div>

                {/* Spinner minimalista */}
                <div className="minimal-spinner">
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: `4px solid ${isDarkMode ? '#2d3748' : '#e2e8f0'}`,
                        borderTop: '4px solid #77b8ce',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                </div>

                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>

                {/* Mensaje */}
                <div className="minimal-message">
                    {message}{dots}
                </div>

                {/* Barra de progreso opcional */}
                {showProgress && (
                    <div className="minimal-progress">
                        <div className="progress-bar-minimal">
                            <div
                                className="progress-fill-minimal"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>
                        <div className="progress-percentage">{Math.round(Math.min(progress, 100))}%</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingScreen;