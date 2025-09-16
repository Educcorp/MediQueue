import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [randomGif, setRandomGif] = useState('');
  const [loginType, setLoginType] = useState('email'); // 'email' o 'usuario'

  // Referencias para animaciones
  const formRef = useRef(null);
  const buttonRef = useRef(null);

  // Array de GIFs médicos
  const medicalGifs = [
    'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExanZ4YXRubHRwbHZvd3R1NDB4NjBhYmRmZ242M3BrZWQzNHE5Y2UzOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VewYsVXoAV4WVEhYuk/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cjdqNTBzcDEyM3MzNW44NGFoaTYzdHIwemVhc3NpamxobGxucXBqdiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/fqgf6H21b2we0cu1he/giphy.gif'
  ];

  const { login, loginByUsuario, isAuthenticated, error, clearError } = useAuth();
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

  const toggleLoginType = () => {
    setLoginType(prev => prev === 'email' ? 'usuario' : 'email');
    setFormData(prev => ({ ...prev, email: '' }));
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones mejoradas
    if (!formData.email || !formData.password) {
      setLocalError('Por favor, complete todos los campos');
      return;
    }

    // Validar email o username según el tipo
    if (loginType === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setLocalError('Por favor, ingrese un email válido');
        return;
      }
    } else {
      if (formData.email.length < 3) {
        setLocalError('El usuario debe tener al menos 3 caracteres');
        return;
      }
    }

    setIsLoading(true);
    setLocalError(null);

    try {
      let result;
      if (loginType === 'email') {
        result = await login(formData.email, formData.password, formData.remember);
      } else {
        result = await loginByUsuario(formData.email, formData.password, formData.remember);
      }

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

  return (
    <div className="elearning-login">
      <div className="background-image"></div>

      {/* Transparent Header */}
      <div className="transparent-header">
        <div className="header-content">
          <div className="logo-section">
            <img
              src="/images/mediqueue_logo.png"
              alt="MediQueue Logo"
              className="header-logo"
            />
            <span className="logo-text">MediQueue®</span>
          </div>
          <div className="header-nav">
            <div className="nav-item">
              Sistema <span className="dropdown-arrow">▼</span>
            </div>
            <div className="nav-item">
              Soluciones Médicas <span className="dropdown-arrow">▼</span>
            </div>
            <div className="nav-item">Acerca de</div>
            <div className="nav-item">Insights</div>
            <div className="nav-item">Contacto</div>
          </div>
          <div className="header-right">
            <div className="language-selector">ESP</div>
            <div className="login-link">
            </div>
          </div>
        </div>
      </div>

      {/* Left Content */}
      <div className="left-content">
        <div className="title-section">
          <h1 className="main-title">MediQueue</h1>
          <p className="subtitle">
            Tu plataforma de gestión <br /> médica comienza aquí. <br />
            Inicia sesión.
            <br />
          </p>
        </div>
        <div className="sidebar-menu">
          <div className="menu-item">Certificados</div>
          <div className="menu-item">Entrenamientos</div>
          <div className="menu-item">Videos</div>
          <div className="menu-item">Fotos</div>
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

        {/* Login Type Toggle */}
        <div className="login-type-toggle">
          <button
            type="button"
            className={`toggle-btn ${loginType === 'email' ? 'active' : ''}`}
            onClick={() => setLoginType('email')}
          >
            Email
          </button>
          <button
            type="button"
            className={`toggle-btn ${loginType === 'usuario' ? 'active' : ''}`}
            onClick={() => setLoginType('usuario')}
          >
            Usuario
          </button>
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
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder={loginType === 'email' ? "Correo electrónico" : "Nombre de usuario"}
              disabled={isLoading}
              required
            />
          </div>
          <div className="form-group">
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
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className="checkmark"></span>
              Recordarme
            </label>
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

        {/* Footer Links */}
        <div className="login-footer">
          <Link to="/" className="footer-link">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;