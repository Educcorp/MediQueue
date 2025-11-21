import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../styles/ForgotPassword.css';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ForgotPassword = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [emailSent, setEmailSent] = useState(false); // true cuando se envió el email
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [randomGif, setRandomGif] = useState('');

  // Array de GIFs médicos
  const medicalGifs = [
    'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExanZ4YXRubHRwbHZvd3R1NDB4NjBhYmRmZ242M3BrZWQzNHE5Y2UzOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VewYsVXoAV4WVEhYuk/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cjdqNTBzcDEyM3MzNW44NGFoaTYzdHIwemVhc3NpamxobGxucXBqdiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/fqgf6H21b2we0cu1he/giphy.gif'
  ];

  const navigate = useNavigate();

  // Seleccionar GIF aleatorio al cargar
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * medicalGifs.length);
    setRandomGif(medicalGifs[randomIndex]);
  }, []);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!email) {
      setLocalError('Por favor, ingrese su correo electrónico');
      return;
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Por favor, ingrese un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    setLocalError(null);

    try {
      console.log('Solicitando recuperación de contraseña para:', email);
      const response = await axios.post(`${API_URL}/auth/request-password-reset`, {
        s_email: email
      });

      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        // Mostrar mensaje de éxito
        setEmailSent(true);
      }
    } catch (err) {
      console.error('Error al solicitar recuperación:', err);
      if (err.response?.status === 403) {
        setLocalError(err.response.data.message || 'Debe verificar su correo electrónico primero');
      } else {
        setLocalError(err.response?.data?.message || 'Ha ocurrido un error. Por favor, intente nuevamente más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/admin/login');
  };

  return (
    <div className="elearning-forgot-password">
      <div className="background-image"></div>

      {/* Left Content */}
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
        <div className="sidebar-menu">
          <div className="menu-item">Seguridad de Cuenta</div>
          <div className="menu-item">Verificación de Identidad</div>
          <div className="menu-item">Recuperación Segura</div>
          <div className="menu-item">Soporte Técnico</div>
        </div>
      </div>

      {/* Forgot Password Card */}
      <div className="forgot-password-card">
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
          <h2 className="forgot-password-title">
            {emailSent ? '¡Correo Enviado!' : 'Recuperar Contraseña'}
          </h2>
          <p className="welcome-text">
            {emailSent 
              ? 'Revisa tu bandeja de entrada' 
              : 'Ingrese su correo electrónico de administrador'}
          </p>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="error-message">
            {localError}
          </div>
        )}

        {/* Formulario de Ingreso de Email */}
        {!emailSent && (
          <>
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="correo@ejemplo.com"
                    disabled={isLoading}
                    required
                  />
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
                {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="back-to-login">
              <button onClick={handleBackToLogin} className="back-button">
                <FaArrowLeft className="back-icon" />
                Volver al Inicio de Sesión
              </button>
            </div>
          </>
        )}

        {/* Mensaje de Éxito */}
        {emailSent && (
          <>
            <div className="confirmation-message">
              <FaCheckCircle className="confirmation-icon" style={{ color: '#4a90a4' }} />
              <p className="confirmation-text">
                Se ha enviado un enlace de recuperación a tu correo electrónico
              </p>
              <div className="admin-info" style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '10px' }}><strong>Correo:</strong> {email}</p>
                <p style={{ fontSize: '14px', color: '#5f6368', lineHeight: '1.6' }}>
                  Por favor, revisa tu bandeja de entrada (y carpeta de spam) para encontrar el correo con las instrucciones para restablecer tu contraseña.
                </p>
                <p style={{ fontSize: '13px', color: '#d93025', marginTop: '15px' }}>
                  ⚠️ El enlace expirará en 1 hora por seguridad.
                </p>
              </div>
            </div>

            <div className="confirmation-buttons">
              <button
                onClick={handleBackToLogin}
                className="submit-button"
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Volver al Inicio de Sesión
              </button>

              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setLocalError(null);
                }}
                className="cancel-button"
              >
                Reenviar correo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

