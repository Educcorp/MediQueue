import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="header-logo-section">
            <div className="header-logo-container">
              <img src="/images/mediqueue_logo.png" alt="MediQueue Logo" className="header-logo-image" />
              <div className="header-logo-text-group">
                <span className="header-logo-text">Medi</span>
                <span className="header-logo-text2">Queue</span>
              </div>
            </div>
            <div className="header-subtitle">
              <h1>Panel de Administración</h1>
              <p>Sistema de Gestión Médica</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <span className="admin-name">
            <i className="fas fa-user-shield"></i>
            {user?.nombre || 'Administrador'}
          </span>
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-card">
          <div className="card-header">
            <i className="fas fa-users-cog"></i>
            <h2>Gestionar Usuarios</h2>
          </div>
          <p>Crear, editar y eliminar usuarios administradores</p>
          <Link to="/admin/users" className="dashboard-link">
            <i className="fas fa-arrow-right"></i>
            Ver Usuarios
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <i className="mdi mdi-calendar-clock"></i>
            <h2>Gestionar Turnos</h2>
          </div>
          <p>Administrar el sistema de turnos médicos</p>
          <Link to="/admin/turns" className="dashboard-link">
            <i className="fas fa-arrow-right"></i>
            Ver Turnos
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <i className="mdi mdi-hospital-building"></i>
            <h2>Consultorios</h2>
          </div>
          <p>Gestión de consultorios y áreas médicas</p>
          <Link to="/admin/consultorios" className="dashboard-link">
            <i className="fas fa-arrow-right"></i>
            Ver Consultorios
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <i className="fas fa-chart-line"></i>
            <h2>Estadísticas</h2>
          </div>
          <p>Reportes y análisis del sistema de turnos</p>
          <div className="dashboard-link disabled">
            <i className="fas fa-clock"></i>
            Próximamente
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;