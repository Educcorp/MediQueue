import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/EmailVerification.css';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState({
    loading: true,
    success: false,
    message: '',
    error: null
  });

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationState({
          loading: false,
          success: false,
          message: 'Token de verificación no válido',
          error: 'NO_TOKEN'
        });
        return;
      }

      try {
        // Usar el proxy de Vite configurado en vite.config.js
        const response = await axios.get(`/api/administradores/verify-email/${token}`);

        setVerificationState({
          loading: false,
          success: true,
          message: response.data.message || 'Email verificado exitosamente',
          error: null
        });

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);

      } catch (error) {
        // Silenciar el log del primer intento, es esperado que falle si el token ya se usó
        const errorMessage = error.response?.data?.message || 'Error al verificar el email';

        // Intentar fallback: consultar el estado del token en el backend
        try {
          const fallbackResp = await axios.get(`/api/administradores/verify-status/${token}`);
          // Si el fallback indica que está verificado, mostrar éxito
          if (fallbackResp.data?.success) {
            setVerificationState({
              loading: false,
              success: true,
              message: fallbackResp.data.message || 'Email verificado exitosamente',
              error: null
            });

            setTimeout(() => {
              navigate('/admin/login');
            }, 3000);
            return;
          }
        } catch (fbErr) {
          // Solo loguear si ambos intentos fallaron
          console.error('Error en verificación:', errorMessage);
        }

        setVerificationState({
          loading: false,
          success: false,
          message: errorMessage,
          error: error.response?.status || 'UNKNOWN'
        });
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleGoToLogin = () => {
    navigate('/admin/login');
  };

  if (verificationState.loading) {
    return (
      <div className="email-verification-container">
        <div className="verification-card loading">
          <div className="spinner"></div>
          <h2>Verificando tu correo electrónico...</h2>
          <p>Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (verificationState.success) {
    return (
      <div className="email-verification-container">
        <div className="verification-card success">
          <div className="icon-container">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h1>¡Email Verificado Exitosamente!</h1>
          <p className="success-message">{verificationState.message}</p>
          <p className="redirect-message">
            Serás redirigido al inicio de sesión en unos segundos...
          </p>
          <button className="btn-primary" onClick={handleGoToLogin}>
            Ir al Inicio de Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <div className="verification-card error">
        <div className="icon-container">
          <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="error-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="error-cross" fill="none" d="M16 16 36 36 M36 16 16 36"/>
          </svg>
        </div>
        <h1>Error en la Verificación</h1>
        <p className="error-message">{verificationState.message}</p>
        
        {verificationState.error === 'NO_TOKEN' && (
          <p className="error-description">
            El enlace de verificación no es válido. Por favor, verifica que hayas copiado
            correctamente el enlace completo desde tu correo electrónico.
          </p>
        )}
        
        {(verificationState.error === 400 || verificationState.error === 404) && (
          <div className="error-description">
            <p>Este enlace puede haber expirado o ya fue utilizado.</p>
            <p>Los enlaces de verificación expiran después de 24 horas por seguridad.</p>
          </div>
        )}
        
        <div className="action-buttons">
          <button className="btn-secondary" onClick={handleGoToLogin}>
            Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
