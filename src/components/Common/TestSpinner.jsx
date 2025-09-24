import React, { useState, useEffect } from 'react';

const TestSpinner = ({ message = "Cargando..." }) => {
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: isDarkMode ? 'rgba(26, 32, 44, 0.95)' : 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        textAlign: 'center',
        color: isDarkMode ? '#a0aec0' : '#718096'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `5px solid ${isDarkMode ? '#2d3748' : '#e2e8f0'}`,
          borderTop: '5px solid #77b8ce',
          borderRadius: '50%',
          animation: 'testSpinAnimation 1s linear infinite',
          margin: '0 auto 20px auto'
        }}></div>
        <p style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '500',
          color: isDarkMode ? '#ffffff' : '#2d3748'
        }}>{message}</p>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes testSpinAnimation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default TestSpinner;