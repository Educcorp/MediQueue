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

  // Referencias para animaciones
  const formRef = useRef(null);
  const buttonRef = useRef(null);

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

  // Animaciones de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.classList.add('login-form-active');
      }
    }, 300);

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
      const result = await login(formData.email, formData.password, formData.remember);

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
    <div className="admin-login">
      <div className="login-background-elements">
        <div className="login-circle-1"></div>
        <div className="login-circle-2"></div>
        <div className="login-circle-3"></div>
      </div>

      <main className="login-main-content">
        <div
          ref={formRef}
          className="login-form-container"
        >
          <div className="login-image-section">
            <div className="login-image-overlay">
              <div className="login-logo-row">
                <div className="login-logo-icon">🏥</div>
                <span className="login-logo-text">Medi</span>
                <span className="login-logo-text2">Queue</span>
              </div>
              <p className="login-image-text">
                Tu sistema de gestión de turnos médicos confiable.
                Simplifica la administración y mejora la experiencia del paciente.
              </p>
              <div className="login-image-quote">
                "La eficiencia en la salud comienza con una buena organización." - MediQueue
              </div>
            </div>
          </div>

          <div className="login-form-content">
            <div className="login-header">
              <h1>¡Bienvenido de nuevo!</h1>
              <p>Ingresa tus credenciales para acceder al panel administrativo</p>
            </div>

            {currentError && (
              <div className="login-error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {currentError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label>
                  Email o Usuario
                </label>
                <div className="login-input-wrapper">
                  <i className="fas fa-user login-input-icon"></i>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="login-input-field"
                    placeholder="admin@mediqueue.com"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="login-form-group">
                <label>
                  Contraseña
                </label>
                <div className="login-password-wrapper">
                  <i className="fas fa-lock login-input-icon"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="login-input-field"
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="login-password-toggle"
                  >
                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                  </button>
                </div>
              </div>

              <div className="login-remember-row">
                <label className="login-remember-checkbox">
                  <div className={`login-checkmark ${formData.remember ? 'active' : ''}`}>
                    <i className="fas fa-check" style={{ opacity: formData.remember ? 1 : 0 }}></i>
                  </div>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <span>Recordarme</span>
                </label>
              </div>

              <button
                ref={buttonRef}
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="login-loading-container">
                    <div className="login-spinner"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>Sistema Turnomático MediQueue v1.0.0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
