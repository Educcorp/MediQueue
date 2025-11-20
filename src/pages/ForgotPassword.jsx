import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/ForgotPassword.css';
import { FaEnvelope, FaArrowLeft, FaUserCheck } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ForgotPassword = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { quickLogin } = useAuth();
  const [step, setStep] = useState(1); // 1: Ingreso de email, 2: Confirmación
  const [email, setEmail] = useState('');
  const [adminData, setAdminData] = useState(null);
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
      console.log('Verificando correo:', email);
      const response = await axios.post(`${API_URL}/auth/verify-email-exists`, {
        s_email: email
      });

      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        // Guardar datos del admin y pasar al paso 2
        setAdminData(response.data.data);
        setStep(2);
      }
    } catch (err) {
      console.error('Error al verificar correo:', err);
      if (err.response?.status === 404) {
        setLocalError('El correo electrónico no está registrado');
      } else if (err.response?.status === 403) {
        setLocalError(err.response.data.message || 'Debe verificar su correo electrónico primero');
      } else {
        setLocalError(err.response?.data?.message || 'Ha ocurrido un error. Por favor, intente nuevamente más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmIdentity = async () => {
    setIsLoading(true);
    setLocalError(null);

    try {
      console.log('Confirmando identidad para:', email);
      const response = await axios.post(`${API_URL}/auth/confirm-identity`, {
        s_email: email
      });

      console.log('Respuesta de confirmación:', response.data);
      
      if (response.data.success) {
        // Guardar token y datos del usuario usando el AuthContext
        const authData = response.data.data;
        
        // Usar quickLogin para manejar correctamente el contexto y localStorage
        const loginResult = quickLogin(authData, true);
        
        if (loginResult.success) {
          console.log('✅ Acceso concedido, redirigiendo al dashboard');
          
          // Redirigir al dashboard
          navigate('/admin/dashboard');
        } else {
          setLocalError(loginResult.message || 'Error al iniciar sesión');
        }
      }
    } catch (err) {
      console.error('Error al confirmar identidad:', err);
      setLocalError(err.response?.data?.message || 'Ha ocurrido un error. Por favor, intente nuevamente más tarde.');
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
            {step === 1 ? 'Acceso Rápido' : '¿En verdad eres tú?'}
          </h2>
          <p className="welcome-text">
            {step === 1 
              ? 'Ingrese su correo electrónico de administrador' 
              : `Hola ${adminData?.nombre} ${adminData?.apellido}`}
          </p>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="error-message">
            {localError}
          </div>
        )}

        {/* PASO 1: Ingreso de Email */}
        {step === 1 && (
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
                {isLoading ? 'Verificando...' : 'Continuar'}
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

        {/* PASO 2: Confirmación de Identidad */}
        {step === 2 && (
          <>
            <div className="confirmation-message">
              <FaUserCheck className="confirmation-icon" />
              <p className="confirmation-text">
                Confirma que eres tú para acceder al panel de administración
              </p>
              <div className="admin-info">
                <p><strong>Correo:</strong> {adminData?.email}</p>
              </div>
            </div>

            <div className="confirmation-buttons">
              <button
                onClick={handleConfirmIdentity}
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                {isLoading ? 'Ingresando...' : 'Sí, soy yo'}
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setEmail('');
                  setAdminData(null);
                  setLocalError(null);
                }}
                className="cancel-button"
                disabled={isLoading}
              >
                No, regresar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

