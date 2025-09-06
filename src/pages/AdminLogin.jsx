import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // Validaciones básicas
    if (!formData.email || !formData.password) {
      setLocalError('Por favor, complete todos los campos');
      return;
    }

    if (!formData.email.includes('@')) {
      setLocalError('Por favor, ingrese un email válido');
      return;
    }

    setIsLoading(true);
    setLocalError(null);

    try {
      const result = await login(formData.email, formData.password);

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
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>🏥 MediQueue</h1>
            <h2>Panel de Administración</h2>
            <p>Ingrese sus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="administrador@mediqueue.com"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            {currentError && (
              <div className="error-message">
                <span>❌ {currentError}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-footer">
            <p>Sistema Turnomático v1.0.0</p>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AdminLogin;
