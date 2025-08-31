import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
    };

    return (
        <div className="admin-dashboard">
            {/* Header del Dashboard */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>🏥 MediQueue Admin</h1>
                        <p>Sistema de Gestión Turnomática</p>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-name">👤 {user?.nombre}</span>
                            <span className="user-email">{user?.email}</span>
                        </div>
                        <button onClick={handleLogout} className="logout-button">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="dashboard-main">
                <div className="dashboard-container">
                    <div className="welcome-section">
                        <div className="welcome-card">
                            <h2>¡Bienvenido al Panel de Administración!</h2>
                            <p>Has iniciado sesión exitosamente. El dashboard completo está en desarrollo.</p>
                            <div className="features-preview">
                                <h3>Próximamente disponible:</h3>
                                <ul>
                                    <li>📊 Gestión de turnos en tiempo real</li>
                                    <li>👥 Administración de pacientes</li>
                                    <li>🏨 Configuración de áreas y consultorios</li>
                                    <li>📈 Estadísticas y reportes</li>
                                    <li>⚙️ Gestión de usuarios administradores</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Sección de navegación placeholder */}
                    <div className="navigation-section">
                        <h3>Navegación Rápida</h3>
                        <div className="nav-cards">
                            <div className="nav-card">
                                <h4>👥 Gestión de Administradores</h4>
                                <p>Crear, editar y gestionar usuarios administradores</p>
                                <button
                                    className="nav-button"
                                    onClick={() => navigate('/admin/users')}
                                >
                                    Gestionar Usuarios
                                </button>
                            </div>

                            <div className="nav-card disabled">
                                <h4>📋 Gestión de Turnos</h4>
                                <p>Próximamente disponible</p>
                                <button className="nav-button" disabled>
                                    Próximamente
                                </button>
                            </div>

                            <div className="nav-card disabled">
                                <h4>🏨 Áreas y Consultorios</h4>
                                <p>Próximamente disponible</p>
                                <button className="nav-button" disabled>
                                    Próximamente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .dashboard-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left h1 {
          margin: 0;
          color: #2d3748;
          font-size: 1.8em;
        }

        .header-left p {
          margin: 5px 0 0 0;
          color: #718096;
          font-size: 0.9em;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        .user-name {
          font-weight: 600;
          color: #2d3748;
        }

        .user-email {
          font-size: 0.8em;
          color: #718096;
        }

        .logout-button {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .logout-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(197, 48, 48, 0.3);
        }

        .dashboard-main {
          padding: 40px 20px;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .welcome-section {
          margin-bottom: 40px;
        }

        .welcome-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-left: 5px solid #667eea;
        }

        .welcome-card h2 {
          color: #2d3748;
          margin: 0 0 15px 0;
          font-size: 1.8em;
        }

        .welcome-card > p {
          color: #718096;
          margin: 0 0 30px 0;
          font-size: 1.1em;
        }

        .features-preview h3 {
          color: #4a5568;
          margin: 0 0 15px 0;
        }

        .features-preview ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features-preview li {
          padding: 10px 0;
          color: #718096;
          border-bottom: 1px solid #f1f5f9;
        }

        .features-preview li:last-child {
          border-bottom: none;
        }

        .navigation-section h3 {
          color: #2d3748;
          margin: 0 0 25px 0;
          font-size: 1.4em;
        }

        .nav-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .nav-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .nav-card:not(.disabled):hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .nav-card.disabled {
          opacity: 0.6;
          background: #f8fafc;
        }

        .nav-card h4 {
          margin: 0 0 10px 0;
          color: #2d3748;
        }

        .nav-card p {
          margin: 0 0 20px 0;
          color: #718096;
          font-size: 0.9em;
        }

        .nav-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .nav-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .nav-button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .header-right {
            flex-direction: column;
            gap: 15px;
          }

          .dashboard-main {
            padding: 20px 10px;
          }

          .welcome-card {
            padding: 20px;
          }

          .nav-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default AdminDashboard;
