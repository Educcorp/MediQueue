import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import AdminFooter from '../components/Common/AdminFooter';
import Chatbot from '../components/Common/Chatbot';
import QuickActions from '../components/Dashboard/QuickActions';
import StatsWidgets from '../components/Dashboard/StatsWidgets';
import turnService from '../services/turnService';
import patientService from '../services/patientService';
import consultorioService from '../services/consultorioService';
import areaService from '../services/areaService';
import adminService from '../services/adminService';
import '../styles/AdminDashboardEnhanced.css';
import '../styles/QuickActions.css';
import '../styles/StatsWidgets.css';

// React Icons imports
import {
  FaCalendarCheck,
  FaUserInjured,
  FaHospital,
  FaUsersCog,
  FaChartLine,
  FaCog,
  FaClock,
  FaUserCheck,
  FaBuilding,
  FaChartBar,
  FaUserShield,
  FaArrowRight,
  FaTachometerAlt,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';

import {
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';

import {
  MdToday
} from 'react-icons/md';

import {
  LuTrendingUp
} from 'react-icons/lu';

const AdminDashboard = () => {
  const { t } = useTranslation(['admin', 'common']);
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
      setError(t('admin:dashboard.loadError'));
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
      <div className="admin-dashboard">
        <AdminHeader />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          <div style={{
            textAlign: 'center',
            color: '#718096'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #77b8ce',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}></div>
            <p>{t('admin:dashboard.loading')}</p>
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        
        {/* FOOTER TEMPORAL TAMBIÉN EN LOADING */}
        <div style={{
          backgroundColor: '#ff0000',
          color: 'white',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          🚨 FOOTER DE PRUEBA EN LOADING - ¿PUEDES VER ESTO? 🚨
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminHeader />
      
      {/* FOOTER TEMPORAL - DEBERÍA SER VISIBLE AQUÍ */}
      <div style={{
        backgroundColor: '#ff0000',
        color: 'white',
        padding: '1rem',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        zIndex: 9999,
        position: 'relative'
      }}>
        🚨 FOOTER DE PRUEBA - ¿PUEDES VER ESTO? 🚨
      </div>
      
      <div className="dashboard-content-wrapper">

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={refreshData} className="retry-btn">
              {t('common:buttons.retry')}
            </button>
          </div>
        )}

        <main className="dashboard-content">
          {/* Estadísticas generales */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FaCalendarCheck />
              </div>
              <div className="stat-content">
                <h3>{stats.totalTurns}</h3>
                <p>{t('admin:dashboard.stats.totalTurns')}</p>
                <div className="stat-trend">
                  <LuTrendingUp />
                  <span>{t('admin:dashboard.stats.thisMonth', { percentage: '+1%' })}</span>
                </div>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-content">
                <h3>{stats.activeTurns}</h3>
                <p>{t('admin:dashboard.stats.activeTurns')}</p>
                <div className="stat-trend">
                  <FaCheckCircle />
                  <span>{t('admin:dashboard.stats.realTime')}</span>
                </div>
              </div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">
                <FaUserInjured />
              </div>
              <div className="stat-content">
                <h3>{stats.totalPatients}</h3>
                <p>{t('admin:dashboard.stats.patients')}</p>
                <div className="stat-trend">
                  <LuTrendingUp />
                  <span>{t('admin:dashboard.stats.thisMonth', { percentage: '+8%' })}</span>
                </div>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">
                <FaHospital />
              </div>
              <div className="stat-content">
                <h3>{stats.totalConsultorios}</h3>
                <p>{t('admin:dashboard.stats.offices')}</p>
                <div className="stat-trend">
                  <FaCheckCircle />
                  <span>{t('admin:dashboard.stats.available')}</span>
                </div>
              </div>
            </div>
            <div className="stat-card secondary">
              <div className="stat-icon">
                <FaBuilding />
              </div>
              <div className="stat-content">
                <h3>{stats.totalAreas}</h3>
                <p>{t('admin:dashboard.stats.areas')}</p>
                <div className="stat-trend">
                  <FaCheckCircle />
                  <span>{t('admin:dashboard.stats.configured')}</span>
                </div>
              </div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">
                <FaUserShield />
              </div>
              <div className="stat-content">
                <h3>{stats.totalAdmins}</h3>
                <p>{t('admin:dashboard.stats.admins')}</p>
                <div className="stat-trend">
                  <FaCheckCircle />
                  <span>{t('admin:dashboard.stats.active')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Widgets de estadísticas en tiempo real */}
          <StatsWidgets stats={stats} loading={loading} />

          {/* Tarjetas de gestión */}
          <div className="dashboard-cards">
            <div className="dashboard-card turns-card">
              <div className="card-header">
                <div className="card-icon">
                  <FaCalendarCheck />
                </div>
                <div className="card-title">
                  <h2>{t('admin:dashboard.cards.turns.title')}</h2>
                  <p>{t('admin:dashboard.cards.turns.description')}</p>
                </div>
              </div>
              <div className="card-stats">
                <div className="stat-item">
                  <FaClock />
                  <span>{stats.activeTurns} {t('admin:dashboard.cards.turns.active')}</span>
                </div>
                <div className="stat-item">
                  <MdToday />
                  <span>{stats.todayTurns} {t('admin:dashboard.cards.turns.today')}</span>
                </div>
              </div>
              <Link to="/admin/turns" className="dashboard-link">
                <FaArrowRight />
                {t('admin:dashboard.cards.turns.viewButton')}
              </Link>
            </div>

            <div className="dashboard-card patients-card">
              <div className="card-header">
                <div className="card-icon">
                  <FaUserInjured />
                </div>
                <div className="card-title">
                  <h2>{t('admin:dashboard.cards.patients.title')}</h2>
                  <p>{t('admin:dashboard.cards.patients.description')}</p>
                </div>
              </div>
              <div className="card-stats">
                <div className="stat-item">
                  <FaUserCheck />
                  <span>{stats.totalPatients} {t('admin:dashboard.cards.patients.registered')}</span>
                </div>
              </div>
              <Link to="/admin/patients" className="dashboard-link">
                <FaArrowRight />
                {t('admin:dashboard.cards.patients.viewButton')}
              </Link>
            </div>

            <div className="dashboard-card consultorios-card">
              <div className="card-header">
                <div className="card-icon">
                  <FaHospital />
                </div>
                <div className="card-title">
                  <h2>{t('admin:dashboard.cards.offices.title')}</h2>
                  <p>{t('admin:dashboard.cards.offices.description')}</p>
                </div>
              </div>
              <div className="card-stats">
                <div className="stat-item">
                  <FaBuilding />
                  <span>{stats.totalConsultorios} {t('admin:dashboard.cards.offices.officesCount')}</span>
                </div>
                <div className="stat-item">
                  <HiOutlineOfficeBuilding />
                  <span>{stats.totalAreas} {t('admin:dashboard.cards.offices.areas')}</span>
                </div>
              </div>
              <Link to="/admin/consultorios" className="dashboard-link">
                <FaArrowRight />
                {t('admin:dashboard.cards.offices.viewButton')}
              </Link>
            </div>

            <div className="dashboard-card users-card">
              <div className="card-header">
                <div className="card-icon">
                  <FaUsersCog />
                </div>
                <div className="card-title">
                  <h2>{t('admin:dashboard.cards.users.title')}</h2>
                  <p>{t('admin:dashboard.cards.users.description')}</p>
                </div>
              </div>
              <div className="card-stats">
                <div className="stat-item">
                  <FaUserShield />
                  <span>{stats.totalAdmins} {t('admin:dashboard.cards.users.admins')}</span>
                </div>
              </div>
              <Link to="/admin/users" className="dashboard-link">
                <FaArrowRight />
                {t('admin:dashboard.cards.users.viewButton')}
              </Link>
            </div>

            <div className="dashboard-card statistics-card">
              <div className="card-header">
                <div className="card-icon">
                  <FaChartLine />
                </div>
                <div className="card-title">
                  <h2>{t('admin:dashboard.cards.statistics.title')}</h2>
                  <p>{t('admin:dashboard.cards.statistics.description')}</p>
                </div>
              </div>
              <div className="card-stats">
                <div className="stat-item">
                  <FaCheckCircle />
                  <span>{stats.completedTurns} {t('admin:dashboard.cards.statistics.completed')}</span>
                </div>
              </div>
              <Link to="/admin/statistics" className="dashboard-link">
                <FaArrowRight />
                {t('admin:dashboard.cards.statistics.viewButton')}
              </Link>
            </div>

            <div className="dashboard-card settings-card">
              <div className="card-header">
                <div className="card-icon">
                  <FaCog />
                </div>
                <div className="card-title">
                  <h2>{t('admin:dashboard.cards.settings.title')}</h2>
                  <p>{t('admin:dashboard.cards.settings.description')}</p>
                </div>
              </div>
              <div className="card-stats">
                <div className="stat-item">
                  <FaCog />
                  <span>{t('admin:dashboard.cards.settings.system')}</span>
                </div>
              </div>
              <Link to="/admin/settings" className="dashboard-link">
                <FaArrowRight />
                {t('admin:dashboard.cards.settings.configureButton')}
              </Link>
            </div>
          </div>

          {/* Acciones rápidas */}
          <QuickActions />

          {/* Información adicional */}
          <div className="system-info-section">
            <div className="system-info-card">
              <div className="info-header">
                <h3>
                  <FaInfoCircle />
                  {t('admin:dashboard.systemInfo.title')}
                </h3>
              </div>
              <div className="info-content">
                <div className="info-item">
                  <span className="info-label">{t('admin:dashboard.systemInfo.version')}:</span>
                  <span className="info-value">2.0.0</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('admin:dashboard.systemInfo.lastUpdate')}:</span>
                  <span className="info-value">{new Date().toLocaleDateString('es-ES')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('admin:dashboard.systemInfo.status')}:</span>
                  <span className="info-value status-active">
                    <FaCheckCircle />
                    {t('admin:dashboard.systemInfo.active')}
                  </span>
                </div>
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
      
      {/* Footer temporal para prueba */}
      <div style={{
        backgroundColor: '#1a202c',
        color: 'white',
        padding: '2rem 0',
        textAlign: 'center',
        marginTop: '0'
      }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>© 2024 MediQueue - Sistema de Gestión de Turnos Médicos</p>
        <p style={{ margin: '0' }}>Desarrollado con ❤️ para mejorar la atención médica</p>
      </div>
      <Chatbot />
    </div>
  );
};

export default AdminDashboard;