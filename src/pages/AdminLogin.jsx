import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores al escribir
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

    // Validar email o username (más flexible)
    const isEmail = formData.email.includes('@');
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('Por favor, ingrese un email válido');
      return;
    }

    if (!isEmail && formData.email.length < 3) {
      setLocalError('El usuario debe tener al menos 3 caracteres');
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

  return (
    <div className="elearning-login">
      {/* Background Image */}
      <div className="background-image"></div>

      {/* Transparent Header */}
      <header className="transparent-header">
        <div className="header-content">
          <div className="logo-section">
            <img
              src="/images/mediqueue_logo.png"
              alt="MediQueue"
              className="header-logo"
            />
            <span className="logo-text">MediQueue</span>
          </div>
          <nav className="header-nav">
            <div className="nav-item">Sistema <span className="dropdown-arrow">▼</span></div>
            <div className="nav-item">Soluciones Médicas <span className="dropdown-arrow">▼</span></div>
            <div className="nav-item">Acerca de</div>
            <div className="nav-item">Insights</div>
            <div className="nav-item">Contacto</div>
          </nav>
          <div className="header-right">
            <div className="language-selector">🇺🇸</div>
            <div className="login-link">🔗 MediQueue</div>
          </div>
        </div>
      </header>

      {/* Left side content */}
      <div className="left-content">
        <div className="title-section">
        <br />
        <br />
        <br />
        <br />
     
          <h1 className="main-title">MediQueue</h1>
          <p className="subtitle">
            <br />
            <br />
            Tu plataforma de gestión<br />
            médica comienza aquí.<br />
            Inicia sesión.
          </p>
        </div>
        <nav className="sidebar-menu">
          <div className="menu-item">Certificados</div>
          <div className="menu-item">Entrenamientos</div>
          <div className="menu-item">Videos</div>
          <div className="menu-item">Fotos</div>
        </nav>
      </div>

      {/* Login card */}
      <div className="login-card">
        <div className="avatar-container">
          <div className="avatar">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="white" />
              <path d="M12 14C8.13401 14 5 17.134 5 21V22H19V21C19 17.134 15.866 14 12 14Z" fill="white" />
            </svg>
          </div>
        </div>

        {currentError && (
          <div className="error-message">
            {currentError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="E-Mail"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Password"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="signin-button"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando...' : 'Sign In'}
          </button>

          <div className="recover-link">
            <Link to="/forgot-password">Recover My Account</Link>
          </div>
        </form>

        <div className="membership-notice">
          <div className="notice-title">¿No eres miembro aún?</div>
          <div className="notice-text">
            Debes estar inscrito en un curso para ser<br />
            miembro. Si aún no lo has hecho, consulta<br />
            nuestros servicios médicos.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;