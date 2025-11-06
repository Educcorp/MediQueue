import React, { useState } from 'react';
import Tutorial from '../Common/Tutorial';
import '../../styles/Tutorial.css';

/**
 * Componente de demostración del sistema de tutoriales
 * Muestra un ejemplo visual de cómo funciona el tutorial
 */
const TutorialDemo = () => {
    const [showTutorial, setShowTutorial] = useState(false);

    const demoSteps = [
        {
            target: '.demo-header',
            title: 'Bienvenido al Tutorial Demo',
            content: 'Este es un ejemplo de cómo funcionan los tutoriales interactivos en MediQueue. Haz clic en "Siguiente" para continuar.',
            position: 'bottom'
        },
        {
            target: '.demo-card-1',
            title: 'Primera Característica',
            content: 'Los tutoriales destacan elementos específicos de la interfaz con un efecto de resaltado y te guían paso a paso.',
            position: 'right'
        },
        {
            target: '.demo-card-2',
            title: 'Segunda Característica',
            content: 'Puedes navegar entre pasos usando los botones "Anterior" y "Siguiente", o haciendo clic en los puntos indicadores.',
            position: 'left'
        },
        {
            target: '.demo-button',
            title: 'Acciones Disponibles',
            content: 'En cualquier momento puedes cerrar el tutorial haciendo clic en la X o en el overlay oscuro del fondo.',
            position: 'top'
        }
    ];

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="demo-header" style={{
                background: 'var(--color-light-blue)',
                padding: '32px',
                borderRadius: '12px',
                marginBottom: '32px',
                textAlign: 'center'
            }}>
                <h1 style={{ margin: '0 0 16px 0', color: 'var(--color-dark-gray)' }}>
                    Tutorial Demo - MediQueue
                </h1>
                <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)' }}>
                    Prueba el sistema de tutoriales interactivos
                </p>
                <button
                    onClick={() => setShowTutorial(true)}
                    style={{
                        background: 'var(--color-medium-blue)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 32px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'var(--color-dark-gray)';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'var(--color-medium-blue)';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    Iniciar Tutorial Demo
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <div className="demo-card-1" style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '2px solid var(--color-light-blue)'
                }}>
                    <h3 style={{ color: 'var(--color-dark-gray)', marginTop: 0 }}>
                        Característica 1
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Este elemento será destacado en el segundo paso del tutorial.
                    </p>
                </div>

                <div className="demo-card-2" style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '2px solid var(--color-light-pink)'
                }}>
                    <h3 style={{ color: 'var(--color-dark-gray)', marginTop: 0 }}>
                        Característica 2
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Este elemento será destacado en el tercer paso del tutorial.
                    </p>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <button
                    className="demo-button"
                    style={{
                        background: 'var(--color-coral)',
                        color: 'white',
                        border: 'none',
                        padding: '16px 48px',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Botón de Ejemplo
                </button>
            </div>

            <Tutorial
                steps={demoSteps}
                show={showTutorial}
                onComplete={() => {
                    setShowTutorial(false);
                    alert('Tutorial completado');
                }}
                onSkip={() => {
                    setShowTutorial(false);
                    alert('Tutorial cerrado');
                }}
            />
        </div>
    );
};

export default TutorialDemo;
