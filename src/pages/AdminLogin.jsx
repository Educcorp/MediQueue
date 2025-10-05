import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/Common/LoadingScreen';
import '../styles/AdminLogin.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminLogin = () => {
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
      setLocalError('Por favor, complete todos los campos');
      return;
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Por favor, ingrese un email válido');
      return;
    }

    setIsLoading(true);
    setLocalError(null);

    try {
      const result = await login(formData.email, formData.password, false);

      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setLocalError(result.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setLocalError('Error de conexión. Verifique que el servidor esté funcionando.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentError = localError || error;

  // Mostrar pantalla de carga minimalista durante la autenticación
  if (isLoading) {
    return (
      <LoadingScreen
        message="Autenticando usuario"
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
            <h1 className="main-title">MediQueue</h1>
          </div>
          <p className="subtitle">
            Tu plataforma de gestión de turnos comienza aquí. <br />
            Inicia sesión.
            <br />
          </p>
        </div>
        <div className="sidebar-menu">
          <div className="menu-item">Gestionar Turnos</div>
          <div className="menu-item">Gestión de consultorios</div>
          <div className="menu-item">Gestión de pacientes</div>
          <div className="menu-item">Gestión de estadísticas del sistema</div>
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
          <h2 className="admin-title">Panel de Administración</h2>
          <p className="welcome-text">El Sistema les da la Bienvenida</p>
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
                placeholder="Correo"
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
                placeholder="Contraseña"
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
            {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;