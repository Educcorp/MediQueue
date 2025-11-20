import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../styles/ResetPassword.css';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ResetPassword = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [randomGif, setRandomGif] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Array de GIFs médicos
  const medicalGifs = [
    'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExanZ4YXRubHRwbHZvd3R1NDB4NjBhYmRmZ242M3BrZWQzNHE5Y2UzOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VewYsVXoAV4WVEhYuk/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cjdqNTBzcDEyM3MzNW44NGFoaTYzdHIwemVhc3NpamxobGxucXBqdiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/fqgf6H21b2we0cu1he/giphy.gif'
  ];

  const navigate = useNavigate();

  // Verificar token al cargar
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLocalError('Token no proporcionado. El enlace es inválido.');
        setIsValidatingToken(false);
        setTokenValid(false);
        return;
      }

      try {
        console.log('Verificando token:', token.substring(0, 10) + '...');
        const response = await axios.get(`${API_URL}/auth/verify-reset-token`, {
          params: { token }
        });

        if (response.data.success) {
          setTokenValid(true);
          setUserEmail(response.data.data.email);
          console.log('Token válido para:', response.data.data.email);
        } else {
          setTokenValid(false);
          setLocalError('El token es inválido o ha expirado');
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
        setTokenValid(false);
        setLocalError(error.response?.data?.message || 'El token es inválido o ha expirado');
      } finally {
        setIsValidatingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  // Seleccionar GIF aleatorio al cargar
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * medicalGifs.length);
    setRandomGif(medicalGifs[randomIndex]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLocalError(null);
    setSuccessMessage(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.password || !formData.confirmPassword) {
      setLocalError('Por favor, complete todos los campos');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      console.log('Enviando solicitud de reset de contraseña...');
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        s_password_nuevo: formData.password
      });

      if (response.data.success) {
        setSuccessMessage('Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...');
        setFormData({ password: '', confirmPassword: '' });
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Error al resetear contraseña:', error);
      setLocalError(error.response?.data?.message || 'Ha ocurrido un error. Por favor, intente nuevamente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/admin/login');
  };

  // Mostrar loading mientras valida el token
  if (isValidatingToken) {
    return (
      <div className="elearning-reset-password">
        <div className="background-image"></div>
        <div className="reset-password-card">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Verificando enlace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si el token no es válido
  if (!tokenValid) {
    return (
      <div className="elearning-reset-password">
        <div className="background-image"></div>
        
        <div className="left-content">
          <div className="title-section">
            <div className="main-title-wrapper">
              <img src="/images/mediqueue_logo.png" alt="MediQueue Logo" className="main-title-logo" />
              <h1 className="main-title">{t('common:appName')}</h1>
            </div>
            <p className="subtitle">
              Recuperación de Contraseña<br />
              Sistema de Administración
            </p>
          </div>
        </div>

        <div className="reset-password-card">
          <div className="error-message">
            {localError || 'El enlace de recuperación es inválido o ha expirado'}
          </div>
          
          <p style={{ textAlign: 'center', marginBottom: '20px', color: '#495057' }}>
            Por favor, solicita un nuevo enlace de recuperación de contraseña.
          </p>

          <div className="back-to-login">
            <button onClick={handleBackToLogin} className="back-button">
              <FaArrowLeft className="back-icon" />
              Volver al Inicio de Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de reset de contraseña
  return (
    <div className="elearning-reset-password">
      <div className="background-image"></div>

      {/* Left Content */}
      <div className="left-content">
        <div className="title-section">
          <div className="main-title-wrapper">
            <img src="/images/mediqueue_logo.png" alt="MediQueue Logo" className="main-title-logo" />
            <h1 className="main-title">{t('common:appName')}</h1>
          </div>
          <p className="subtitle">
            Crear Nueva Contraseña<br />
            Sistema de Administración
          </p>
        </div>
        <div className="sidebar-menu">
          <div className="menu-item">Seguridad de Cuenta</div>
          <div className="menu-item">Contraseña Segura</div>
          <div className="menu-item">Protección de Datos</div>
          <div className="menu-item">Acceso Verificado</div>
        </div>
      </div>

      {/* Reset Password Card */}
      <div className="reset-password-card">
        {/* Avatar with Random Medical GIF */}
        <div className="avatar-container">
          <div className="avatar">
            {randomGif && (
              <img
                src={randomGif}
                alt="Medical Animation"
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            )}
          </div>
        </div>

        {/* Welcome Messages */}
        <div className="welcome-messages">
          <h2 className="reset-password-title">Nueva Contraseña</h2>
          <p className="welcome-text">Ingrese su nueva contraseña para {userEmail}</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {localError && (
          <div className="error-message">
            {localError}
          </div>
        )}

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Nueva contraseña"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle-icon"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirmar contraseña"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle-icon"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isLoading}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="back-to-login">
          <button onClick={handleBackToLogin} className="back-button">
            <FaArrowLeft className="back-icon" />
            Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

