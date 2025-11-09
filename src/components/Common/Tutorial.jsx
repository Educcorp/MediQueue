import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import '../../styles/Tutorial.css';

/**
 * Tutorial Component - Sistema de tutorial interactivo con tooltips flotantes
 * @param {Array} steps - Array de pasos del tutorial, cada uno con: { target, title, content, position }
 * @param {Function} onComplete - Callback cuando se completa el tutorial
 * @param {Function} onSkip - Callback cuando se salta el tutorial
 * @param {boolean} show - Controla si el tutorial debe mostrarse
 */
const Tutorial = ({ steps = [], onComplete, onSkip, show = false }) => {
    const { t } = useTranslation(['tutorial']);
    const [currentStep, setCurrentStep] = useState(0);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [arrowPosition, setArrowPosition] = useState('top');

    useEffect(() => {
        if (show && steps.length > 0) {
            updateTooltipPosition();
            // Agregar scroll listener para actualizar la posición si se desplaza la página
            window.addEventListener('scroll', updateTooltipPosition);
            window.addEventListener('resize', updateTooltipPosition);

            return () => {
                window.removeEventListener('scroll', updateTooltipPosition);
                window.removeEventListener('resize', updateTooltipPosition);
            };
        }
    }, [currentStep, show, steps]);

    const updateTooltipPosition = () => {
        if (!steps[currentStep]) return;

        const targetSelector = steps[currentStep].target;
        const targetElement = document.querySelector(targetSelector);

        if (!targetElement) {
            console.warn(`Tutorial: No se encontró el elemento ${targetSelector}`);
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const tooltipWidth = 380;
        const tooltipHeight = 280; // Altura aumentada para acomodar los dots debajo
        const offset = 20;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let top = 0;
        let left = 0;
        let position = steps[currentStep].position || 'bottom';

        // Calcular posición basada en la preferencia
        switch (position) {
            case 'top':
                top = rect.top + window.scrollY - tooltipHeight - offset;
                left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'bottom':
                top = rect.bottom + window.scrollY + offset;
                left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
                left = rect.left + window.scrollX - tooltipWidth - offset;
                break;
            case 'right':
                top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
                left = rect.right + window.scrollX + offset;
                break;
            default:
                top = rect.bottom + window.scrollY + offset;
                left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
        }

        // Ajustar horizontalmente si se sale de la pantalla
        if (left < 10) {
            left = 10;
        }
        if (left + tooltipWidth > viewportWidth - 10) {
            left = viewportWidth - tooltipWidth - 10;
        }

        // Ajustar verticalmente si se sale de la pantalla
        const tooltipBottom = top - window.scrollY + tooltipHeight;

        if (top - window.scrollY < 10) {
            // Si está muy arriba, moverlo abajo del elemento
            top = rect.bottom + window.scrollY + offset;
            position = 'bottom';
        } else if (tooltipBottom > viewportHeight - 10) {
            // Si el tooltip se sale por abajo, moverlo arriba del elemento
            top = rect.top + window.scrollY - tooltipHeight - offset;
            position = 'top';

            // Si aún así se sale por arriba, centrarlo verticalmente en el viewport
            if (top - window.scrollY < 10) {
                top = window.scrollY + Math.max(10, (viewportHeight / 2) - (tooltipHeight / 2));
                position = 'bottom'; // Usar flecha bottom como default
            }
        }

        // Asegurar que el tooltip nunca esté fuera del viewport verticalmente
        const finalTop = Math.max(window.scrollY + 10, Math.min(top, window.scrollY + viewportHeight - tooltipHeight - 10));

        setTooltipPosition({ top: finalTop, left });
        setArrowPosition(position);

        // Agregar clase de highlight al elemento target
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        targetElement.classList.add('tutorial-highlight');

        // Hacer scroll al elemento si no está visible de manera suave
        const elementTop = rect.top + window.scrollY;
        const elementBottom = rect.bottom + window.scrollY;
        const viewportTop = window.scrollY;
        const viewportBottom = window.scrollY + viewportHeight;

        // Verificar si el elemento está completamente visible
        if (elementTop < viewportTop || elementBottom > viewportBottom) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        // Remover highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        if (onComplete) onComplete();
    };

    const handleSkip = () => {
        // Remover highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        if (onSkip) onSkip();
    };

    if (!show || steps.length === 0) return null;

    const step = steps[currentStep];

    return (
        <>
            {/* Overlay oscuro - No se cierra al hacer clic para evitar cierres accidentales */}
            <div className="tutorial-overlay" />

            {/* Tooltip flotante */}
            <div
                className={`tutorial-tooltip tutorial-tooltip-${arrowPosition}`}
                style={{
                    top: `${tooltipPosition.top}px`,
                    left: `${tooltipPosition.left}px`,
                }}
            >
                {/* Botón cerrar */}
                <button className="tutorial-close" onClick={handleSkip} title={t('tutorial:common.skipTutorial')}>
                    <FaTimes />
                </button>

                {/* Contenido */}
                <div className="tutorial-content">
                    <div className="tutorial-header">
                        <h3 className="tutorial-title">{step.title}</h3>
                        <span className="tutorial-step-counter">
                            {t('tutorial:common.stepCounter', { current: currentStep + 1, total: steps.length })}
                        </span>
                    </div>

                    <div className="tutorial-body">
                        <p className="tutorial-text">{step.content}</p>
                    </div>

                    {/* Navegación */}
                    <div className="tutorial-footer">
                        <button
                            className="tutorial-btn tutorial-btn-secondary"
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                        >
                            <FaChevronLeft /> {t('tutorial:common.previous')}
                        </button>

                        <button
                            className="tutorial-btn tutorial-btn-primary"
                            onClick={handleNext}
                        >
                            {currentStep < steps.length - 1 ? (
                                <>
                                    {t('tutorial:common.next')} <FaChevronRight />
                                </>
                            ) : (
                                <>
                                    {t('tutorial:common.finish')} <FaChevronRight />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Indicadores de progreso debajo */}
                    <div className="tutorial-dots">
                        {steps.map((_, index) => (
                            <span
                                key={index}
                                className={`tutorial-dot ${index === currentStep ? 'active' : ''}`}
                                onClick={() => setCurrentStep(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Tutorial;
