import React, { useState } from 'react';
import LoadingScreen from './LoadingScreen';

// Demo simple de la pantalla de carga minimalista
const SimpleDemo = () => {
    const [showLoading, setShowLoading] = useState(false);
    const [showLoadingWithProgress, setShowLoadingWithProgress] = useState(false);

    const handleShowLoading = () => {
        setShowLoading(true);
        setTimeout(() => setShowLoading(false), 3000);
    };

    const handleShowLoadingWithProgress = () => {
        setShowLoadingWithProgress(true);
        setTimeout(() => setShowLoadingWithProgress(false), 5000);
    };

    if (showLoading) {
        return <LoadingScreen message="Processing information" />;
    }

    if (showLoadingWithProgress) {
        return <LoadingScreen message="Loading dashboard" showProgress={true} />;
    }

    return (
        <div style={{
            padding: '40px',
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.3)'
            }}>
                <h2 style={{
                    marginBottom: '30px',
                    color: '#2c3e50',
                    fontSize: '24px',
                    fontWeight: '700'
                }}>
                    🎯 Minimalist Loading Screen
                </h2>

                <div style={{
                    display: 'flex',
                    gap: '20px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginBottom: '30px'
                }}>
                    <button
                        onClick={handleShowLoading}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #77b8ce, #6c757d)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            boxShadow: '0 4px 15px rgba(119, 184, 206, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(119, 184, 206, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(119, 184, 206, 0.3)';
                        }}
                    >
                        🔄 Carga Simple
                    </button>

                    <button
                        onClick={handleShowLoadingWithProgress}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #495057, #343a40)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            boxShadow: '0 4px 15px rgba(73, 80, 87, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(73, 80, 87, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(73, 80, 87, 0.3)';
                        }}
                    >
                        📊 Con Progreso
                    </button>
                </div>

                <div style={{
                    padding: '20px',
                    background: 'rgba(119, 184, 206, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(119, 184, 206, 0.2)',
                    textAlign: 'left'
                }}>
                    <h4 style={{ color: '#2c3e50', marginBottom: '15px', textAlign: 'center' }}>
                        ✨ Características Minimalistas:
                    </h4>
                    <ul style={{ color: '#495057', lineHeight: '1.8', paddingLeft: '20px' }}>
                        <li><strong>Diseño limpio</strong> - Interfaz simple y elegante</li>
                        <li><strong>Glassmorphism sutil</strong> - Efectos de cristal minimalistas</li>
                        <li><strong>Animaciones suaves</strong> - Transiciones fluidas</li>
                        <li><strong>Cruz médica simple</strong> - Icono temático discreto</li>
                        <li><strong>Spinner elegante</strong> - Indicador de carga limpio</li>
                        <li><strong>Responsive</strong> - Perfecto en cualquier dispositivo</li>
                        <li><strong>Colores coherentes</strong> - Integrado con tu paleta</li>
                        <li><strong>Progreso opcional</strong> - Barra cuando se necesite</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SimpleDemo;
