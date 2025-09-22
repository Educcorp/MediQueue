import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({
    message = "Cargando dashboard...",
    showProgress = false
}) => {
    const [progress, setProgress] = useState(0);
    const [dots, setDots] = useState('');

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
        <div className="minimal-loading-screen">
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
                    <div className="spinner-circle"></div>
                </div>

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