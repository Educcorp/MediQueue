import React from 'react';

const UnifiedLoadingSpinner = ({ 
  message = "Cargando...", 
  fullScreen = true,
  background = '#f8fafc',
  textColor = '#718096',
  spinnerColor = '#77b8ce',
  spinnerBaseColor = '#e2e8f0'
}) => {
  const containerStyle = fullScreen ? {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: background,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  return (
    <>
      <style>{`
        @keyframes spinLoader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={containerStyle}>
        <div style={{
          textAlign: 'center',
          color: textColor
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `4px solid ${spinnerBaseColor}`,
            borderTop: `4px solid ${spinnerColor}`,
            borderRadius: '50%',
            animation: 'spinLoader 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <p>{message}</p>
        </div>
      </div>
    </>
  );
};

export default UnifiedLoadingSpinner;