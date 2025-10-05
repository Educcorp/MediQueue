import React, { useState, useEffect } from 'react';

const LoadingScreenDark = ({
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
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: isDarkMode 
                    ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)'
                    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                zIndex: 9999
            }}
        >
            <div 
                style={{
                    background: isDarkMode 
                        ? 'rgba(26, 32, 44, 0.8)' 
                        : 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    borderRadius: '24px',
                    padding: '40px 50px',
                    textAlign: 'center',
                    boxShadow: isDarkMode
                        ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'}`,
                    maxWidth: '320px'
                }}
            >
                {/* Logo médico simple */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        margin: '0 auto 20px auto',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: '15px',
                            width: '30px',
                            height: '8px',
                            backgroundColor: '#77b8ce',
                            borderRadius: '4px'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            top: '15px',
                            left: '26px',
                            width: '8px',
                            height: '30px',
                            backgroundColor: '#77b8ce',
                            borderRadius: '4px'
                        }}></div>
                    </div>
                </div>

                {/* Título */}
                <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: isDarkMode ? '#ffffff' : '#2d3748',
                    marginBottom: '16px',
                    letterSpacing: '-0.025em'
                }}>MediQueue</div>

                {/* Mensaje */}
                <div style={{
                    fontSize: '14px',
                    color: isDarkMode ? '#a0aec0' : '#718096',
                    marginBottom: '32px',
                    fontWeight: '400'
                }}>
                    {message}{dots}
                </div>

                {/* Spinner minimalista */}
                <div style={{ marginBottom: '20px' }}>
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

                {/* Barra de progreso opcional */}
                {showProgress && (
                    <div style={{ marginTop: '20px' }}>
                        <div style={{
                            width: '100%',
                            height: '4px',
                            backgroundColor: isDarkMode ? '#2d3748' : '#e2e8f0',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                        }}>
                            <div
                                style={{ 
                                    width: `${Math.min(progress, 100)}%`,
                                    height: '100%',
                                    backgroundColor: '#77b8ce',
                                    transition: 'width 0.3s ease',
                                    borderRadius: '2px'
                                }}
                            ></div>
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: isDarkMode ? '#a0aec0' : '#718096',
                            fontWeight: '500'
                        }}>{Math.round(Math.min(progress, 100))}%</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingScreenDark;