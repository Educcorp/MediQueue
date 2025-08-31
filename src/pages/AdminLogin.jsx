import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

            <style jsx>{`
        .admin-login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .login-container {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }

        .login-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h1 {
          font-size: 2.2em;
          margin: 0 0 10px 0;
          color: #4a5568;
        }

        .login-header h2 {
          font-size: 1.3em;
          margin: 0 0 10px 0;
          color: #2d3748;
        }

        .login-header p {
          color: #718096;
          margin: 0;
          font-size: 0.9em;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 8px;
          font-weight: 600;
          color: #4a5568;
          font-size: 0.9em;
        }

        .form-group input {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
          background: #f8fafc;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled {
          background-color: #f1f5f9;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 12px 16px;
          border-radius: 8px;
          border-left: 4px solid #e53e3e;
          font-size: 0.9em;
        }

        .login-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px;
          border: none;
          border-radius: 8px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .login-button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .login-footer {
          margin-top: 30px;
          text-align: center;
          color: #718096;
          font-size: 0.8em;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 10px;
          }
          
          .login-card {
            padding: 20px;
          }
        }
      `}</style>
        </div>
    );
};

export default AdminLogin;
