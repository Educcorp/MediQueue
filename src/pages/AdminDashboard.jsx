import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import turnService from '../services/turnService';
import patientService from '../services/patientService';
import consultorioService from '../services/consultorioService';
import areaService from '../services/areaService';
import adminService from '../services/adminService';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout, getEstadisticas } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTurns: 0,
    activeTurns: 0,
    totalPatients: 0,
    totalConsultorios: 0,
    totalAreas: 0,
    totalAdmins: 0,
    todayTurns: 0,
    completedTurns: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas en paralelo
      const [
        turnsStats,
        patientsData,
        consultoriosData,
        areasData,
        adminsData,
        todayTurns,
        activeTurns
      ] = await Promise.all([
        turnService.getTurnStatistics().catch(() => null),
        patientService.getAllPatients().catch(() => []),
        consultorioService.getAll().catch(() => []),
        areaService.getAll().catch(() => []),
        adminService.getAllAdmins().catch(() => []),
        turnService.getTurnsByDate(new Date().toISOString().split('T')[0]).catch(() => []),
        turnService.getActiveTurns().catch(() => [])
      ]);

      setStats({
        totalTurns: turnsStats?.total_turnos || 0,
        activeTurns: activeTurns.length,
        totalPatients: patientsData.length,
        totalConsultorios: consultoriosData.length,
        totalAreas: areasData.length,
        totalAdmins: adminsData.length,
        todayTurns: todayTurns.length,
        completedTurns: turnsStats?.turnos_atendidos || 0
      });
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      setError('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const refreshData = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

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
          <div className="admin-info">
            <span className="admin-name">
              <i className="fas fa-user-shield"></i>
              {user?.s_nombre || 'Administrador'}
            </span>
            <span className="admin-role">
              {user?.tipo_usuario === 1 ? 'Administrador' : 'Supervisor'}
            </span>
          </div>
          <button onClick={refreshData} className="refresh-btn" title="Actualizar datos">
            <i className="fas fa-sync-alt"></i>
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={refreshData} className="retry-btn">
            Reintentar
          </button>
        </div>
      )}

      <main className="dashboard-content">
        {/* Estadísticas generales */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="mdi mdi-calendar-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalTurns}</h3>
              <p>Total Turnos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="mdi mdi-clock-outline"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.activeTurns}</h3>
              <p>Turnos Activos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="mdi mdi-account-group"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalPatients}</h3>
              <p>Pacientes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="mdi mdi-hospital-building"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalConsultorios}</h3>
              <p>Consultorios</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="mdi mdi-domain"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalAreas}</h3>
              <p>Áreas</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="mdi mdi-account-supervisor"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalAdmins}</h3>
              <p>Administradores</p>
            </div>
          </div>
        </div>

        {/* Tarjetas de gestión */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-header">
              <i className="mdi mdi-calendar-clock"></i>
              <h2>Gestionar Turnos</h2>
            </div>
            <p>Administrar el sistema de turnos médicos</p>
            <div className="card-stats">
              <span className="stat-item">
                <i className="mdi mdi-clock-outline"></i>
                {stats.activeTurns} activos
              </span>
              <span className="stat-item">
                <i className="mdi mdi-calendar-today"></i>
                {stats.todayTurns} hoy
              </span>
            </div>
            <Link to="/admin/turns" className="dashboard-link">
              <i className="fas fa-arrow-right"></i>
              Ver Turnos
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <i className="mdi mdi-account-group"></i>
              <h2>Gestionar Pacientes</h2>
            </div>
            <p>Administrar información de pacientes</p>
            <div className="card-stats">
              <span className="stat-item">
                <i className="mdi mdi-account"></i>
                {stats.totalPatients} registrados
              </span>
            </div>
            <Link to="/admin/patients" className="dashboard-link">
              <i className="fas fa-arrow-right"></i>
              Ver Pacientes
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <i className="mdi mdi-hospital-building"></i>
              <h2>Consultorios</h2>
            </div>
            <p>Gestión de consultorios y áreas médicas</p>
            <div className="card-stats">
              <span className="stat-item">
                <i className="mdi mdi-hospital"></i>
                {stats.totalConsultorios} consultorios
              </span>
              <span className="stat-item">
                <i className="mdi mdi-domain"></i>
                {stats.totalAreas} áreas
              </span>
            </div>
            <Link to="/admin/consultorios" className="dashboard-link">
              <i className="fas fa-arrow-right"></i>
              Ver Consultorios
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <i className="fas fa-users-cog"></i>
              <h2>Gestionar Usuarios</h2>
            </div>
            <p>Crear, editar y eliminar usuarios administradores</p>
            <div className="card-stats">
              <span className="stat-item">
                <i className="mdi mdi-account-supervisor"></i>
                {stats.totalAdmins} administradores
              </span>
            </div>
            <Link to="/admin/users" className="dashboard-link">
              <i className="fas fa-arrow-right"></i>
              Ver Usuarios
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <i className="fas fa-chart-line"></i>
              <h2>Estadísticas</h2>
            </div>
            <p>Reportes y análisis del sistema de turnos</p>
            <div className="card-stats">
              <span className="stat-item">
                <i className="mdi mdi-check-circle"></i>
                {stats.completedTurns} atendidos
              </span>
            </div>
            <Link to="/admin/statistics" className="dashboard-link">
              <i className="fas fa-arrow-right"></i>
              Ver Estadísticas
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <i className="fas fa-cog"></i>
              <h2>Configuración</h2>
            </div>
            <p>Configuración del sistema y preferencias</p>
            <div className="card-stats">
              <span className="stat-item">
                <i className="mdi mdi-settings"></i>
                Sistema
              </span>
            </div>
            <Link to="/admin/settings" className="dashboard-link">
              <i className="fas fa-arrow-right"></i>
              Configurar
            </Link>
          </div>
        </div>

        {/* Información adicional */}
        <div className="dashboard-info">
          <div className="info-card">
            <h3>
              <i className="fas fa-info-circle"></i>
              Información del Sistema
            </h3>
            <div className="info-content">
              <p>
                <strong>Versión:</strong> 2.0.0
              </p>
              <p>
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
              </p>
              <p>
                <strong>Estado:</strong> <span className="status-active">Activo</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .admin-dashboard.loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }

        .loading-container {
          text-align: center;
          color: #718096;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-banner {
          background: #fed7d7;
          color: #c53030;
          padding: 15px 20px;
          margin: 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(197, 48, 48, 0.1);
        }

        .retry-btn {
          background: #c53030;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          background: #9c2626;
          transform: translateY(-1px);
        }

        .admin-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-right: 15px;
        }

        .admin-role {
          font-size: 0.8em;
          color: #718096;
          font-weight: 500;
        }

        .refresh-btn {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          color: #4a5568;
          margin-right: 10px;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          background: #edf2f7;
          color: #2d3748;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5em;
          color: white;
        }

        .stat-card:nth-child(1) .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .stat-card:nth-child(2) .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .stat-card:nth-child(3) .stat-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .stat-card:nth-child(4) .stat-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .stat-card:nth-child(5) .stat-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        .stat-card:nth-child(6) .stat-icon { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }

        .stat-content h3 {
          margin: 0;
          font-size: 2em;
          font-weight: 700;
          color: #2d3748;
        }

        .stat-content p {
          margin: 0;
          color: #718096;
          font-weight: 500;
        }

        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin: 20px;
        }

        .card-stats {
          display: flex;
          gap: 15px;
          margin: 10px 0;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.9em;
          color: #718096;
        }

        .stat-item i {
          font-size: 1.1em;
        }

        .dashboard-info {
          margin: 20px;
        }

        .info-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .info-card h3 {
          margin: 0 0 15px 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .info-content p {
          margin: 8px 0;
          color: #4a5568;
        }

        .status-active {
          color: #48bb78;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-cards {
            grid-template-columns: 1fr;
          }

          .header-right {
            flex-direction: column;
            gap: 10px;
          }

          .admin-info {
            align-items: center;
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;