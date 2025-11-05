import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/Common/LoadingScreen';
import '../styles/AdminLogin.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminLogin = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [randomGif, setRandomGif] = useState('');

  // Referencias para animaciones
  const formRef = useRef(null);
  const buttonRef = useRef(null);

  // Array de GIFs médicos
  const medicalGifs = [
    'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExanZ4YXRubHRwbHZvd3R1NDB4NjBhYmRmZ242M3BrZWQzNHE5Y2UzOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VewYsVXoAV4WVEhYuk/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cjdqNTBzcDEyM3MzNW44NGFoaTYzdHIwemVhc3NpamxobGxucXBqdiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/fqgf6H21b2we0cu1he/giphy.gif'
  ];

  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Animaciones de entrada y GIF aleatorio
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.classList.add('login-form-active');
      }
    }, 700);

    // Seleccionar GIF aleatorio al cargar
    const randomIndex = Math.floor(Math.random() * medicalGifs.length);
    setRandomGif(medicalGifs[randomIndex]);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar errores al escribir
    setLocalError(null);
    clearError();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones mejoradas
    if (!formData.email || !formData.password) {
      setLocalError(t('admin:login.errors.fillAllFields'));
      return;
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError(t('admin:login.errors.invalidEmail'));
      return;
    }

    setIsLoading(true);
    setLocalError(null);

    try {
      const result = await login(formData.email, formData.password, false);

      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setLocalError(result.message || t('admin:login.errors.loginFailed'));
      }
    } catch (err) {
      setLocalError(t('admin:login.errors.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  const currentError = localError || error;

  // Mostrar pantalla de carga minimalista durante la autenticación
  if (isLoading) {
    return (
      <LoadingScreen
        message={t('admin:login.authenticating')}
        showProgress={false}
      />
    );
  }

  return (
    <div className="elearning-login">
      <div className="background-image"></div>

      {/* Left Content */}
      <div className="left-content">
        <div className="title-section">
          <div className="main-title-wrapper">
            <img src="/images/mediqueue_logo.png" alt="MediQueue Logo" className="main-title-logo" />
            <h1 className="main-title">{t('common:appName')}</h1>
          </div>
          <p className="subtitle">
            {t('admin:login.subtitle')} <br />
            {t('admin:login.pleaseLogin')}
            <br />
          </p>
        </div>
        <div className="sidebar-menu">
          <div className="menu-item">{t('admin:login.menu.manageTurns')}</div>
          <div className="menu-item">{t('admin:login.menu.manageOffices')}</div>
          <div className="menu-item">{t('admin:login.menu.managePatients')}</div>
          <div className="menu-item">{t('admin:login.menu.manageStats')}</div>
        </div>
      </div>

      {/* Login Card */}
      <div className="login-card">
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
          <h2 className="admin-title">{t('admin:login.title')}</h2>
          <p className="welcome-text">{t('admin:login.welcome')}</p>
        </div>


        {/* Error Message */}
        {currentError && (
          <div className="error-message">
            {currentError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder={t('admin:login.emailPlaceholder')}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder={t('admin:login.passwordPlaceholder')}
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
          <button
            type="submit"
            className={`signin-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            {isLoading ? t('admin:login.loggingIn') : t('admin:login.loginButton')}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;