import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gestionar el estado del tutorial
 * @param {string} tutorialKey - Clave única para identificar el tutorial
 * @returns {Object} Estado y funciones para controlar el tutorial
 */
const useTutorial = (tutorialKey) => {
    const STORAGE_KEY = `mediqueue-tutorial-${tutorialKey}`;

    // Verificar si el tutorial ya fue completado
    const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => {
        const completed = localStorage.getItem(STORAGE_KEY);
        return completed === 'true';
    });

    const [showTutorial, setShowTutorial] = useState(false);

    // Iniciar tutorial si no ha sido completado
    useEffect(() => {
        if (!hasCompletedTutorial) {
            // Esperar un momento para que la página cargue completamente
            const timer = setTimeout(() => {
                setShowTutorial(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [hasCompletedTutorial]);

    // Completar tutorial
    const completeTutorial = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setHasCompletedTutorial(true);
        setShowTutorial(false);
    };

    // Saltar tutorial
    const skipTutorial = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setHasCompletedTutorial(true);
        setShowTutorial(false);
    };

    // Reiniciar tutorial (para testing o si el usuario quiere verlo de nuevo)
    const resetTutorial = () => {
        localStorage.removeItem(STORAGE_KEY);
        setHasCompletedTutorial(false);
        setShowTutorial(true);
    };

    // Iniciar tutorial manualmente
    const startTutorial = () => {
        setShowTutorial(true);
    };

    return {
        showTutorial,
        hasCompletedTutorial,
        completeTutorial,
        skipTutorial,
        resetTutorial,
        startTutorial
    };
};

export default useTutorial;
