import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import AdminFooter from '../components/Common/AdminFooter';
import Chatbot from '../components/Common/Chatbot';
import TestSpinner from '../components/Common/TestSpinner';
import turnService from '../services/turnService';
import patientService from '../services/patientService';
import consultorioService from '../services/consultorioService';
import areaService from '../services/areaService';
import adminService from '../services/adminService';
import { TURN_STATUS_LABELS, RECORD_STATUS_LABELS } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/helpers';
import '../styles/UnifiedAdminPages.css';

// React Icons
import {
  FaChartLine,
  FaCalendarCheck,
  FaCalendarDay,
  FaUsers,
  FaHospital,
  FaBuilding,
  FaUserShield,
  FaSync,
  FaDownload,
  FaFilter,
  FaEye,
  FaExclamationTriangle,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaUserCheck,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaUserMd,
  FaChartPie,
  FaChartBar,
  FaHeartbeat,
  FaBaby,
  FaFemale,
  FaTooth,
  FaChild,
  FaWalking,
  FaStethoscope,
  FaBone,
  FaBrain,
  FaMale,
  FaFlask,
  FaProcedures,
  FaDoorOpen,
  FaAmbulance,
  FaSyringe,
  FaPrescriptionBottle,
  FaXRay,
  FaMicroscope,
  FaLungs,
  FaHandHoldingHeart,
  FaWheelchair,
  FaCrutch,
  FaThermometer,
  FaHeadSideCough,
  FaVials
} from 'react-icons/fa';

// Función helper para obtener el ícono correcto
const getIconComponent = (iconName) => {
  const iconMap = {
    'FaHeartbeat': FaHeartbeat,
    'FaHospital': FaHospital,
    'FaBaby': FaBaby,
    'FaFemale': FaFemale,
    'FaTooth': FaTooth,
    'FaChild': FaChild,
    'FaWalking': FaWalking,
    'FaUserMd': FaUserMd,
    'FaStethoscope': FaStethoscope,
    'FaBone': FaBone,
    'FaBrain': FaBrain,
    'FaMale': FaMale,
    'FaFlask': FaFlask,
    'FaProcedures': FaProcedures,
    'FaDoorOpen': FaDoorOpen,
    'FaAmbulance': FaAmbulance,
    'FaSyringe': FaSyringe,
    'FaPrescriptionBottle': FaPrescriptionBottle,
    'FaXRay': FaXRay,
    'FaMicroscope': FaMicroscope,
    'FaLungs': FaLungs,
    'FaHandHoldingHeart': FaHandHoldingHeart,
    'FaWheelchair': FaWheelchair,
    'FaCrutch': FaCrutch,
    'FaThermometer': FaThermometer,
    'FaHeadSideCough': FaHeadSideCough,
    'FaVials': FaVials,
    'FaBuilding': FaBuilding
  };
  return iconMap[iconName] || FaHospital;
};

const StatisticsPage = () => {
  const { t, i18n } = useTranslation('admin');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Detectar tema actual
  const [theme, setTheme] = useState(() => localStorage.getItem('mq-theme') || 'light');
  const isDarkMode = theme === 'dark';

  // Escuchar cambios de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      if (currentTheme !== theme) {
        setTheme(currentTheme);
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      observer.disconnect();
    };
  }, [theme]);

  const [stats, setStats] = useState({
    turns: {
      total: 0,
      byStatus: {},
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    },
    patients: {
      total: 0,
      active: 0,
      withEmail: 0,
      newThisMonth: 0
    },
    consultorios: {
      total: 0,
      active: 0,
      byArea: {},
      areasInfo: {}
    },
    areas: {
      total: 0,
      active: 0
    },
    admins: {
      total: 0,
      byType: {}
    }
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [recentTurns, setRecentTurns] = useState([]);

  useEffect(() => {
    // Mostrar spinner brevemente para mejor UX
    setLoading(true);
    setTimeout(() => {
      loadStatistics();
    }, 800);
  }, []);

  const loadStatistics = async () => {
    try {
      setError(null);

      // Calcular fechas para obtener turnos del año y mes
      const now = new Date();
      const startOfYear = `${now.getFullYear()}-01-01`;
      const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const today = now.toISOString().split('T')[0];
      
      const [
        todayTurns,
        turnosDelAnioData,
        turnosDelMesData,
        patientsData,
        consultoriosData,
        areasData,
        adminsData,
        recentTurnsData
      ] = await Promise.all([
        turnService.getAllTurns().catch(() => []), // Esto trae los de hoy por defecto
        turnService.getTurnsByDateRange?.(startOfYear, today).catch(() => []) || [], // Todos del año
        turnService.getTurnsByDateRange?.(startOfMonth, today).catch(() => []) || [], // Todos del mes
        patientService.getAllPatients().catch(() => []),
        consultorioService.getAll().catch(() => []),
        areaService.getAll().catch(() => []),
        adminService.getAllAdmins().catch(() => []),
        turnService.getTurnsByDateRange?.(dateRange.start, dateRange.end).catch(() => []) || []
      ]);
      
      const allTurns = todayTurns; // Para el conteo general y por estado

      // Procesar estadísticas de turnos - contar directamente desde los datos
      const turnsByStatus = {
        'waiting': 0,
        'attended': 0,
        'cancelled': 0,
      };

      // Contar turnos por estado
      allTurns.forEach(turn => {
        const estado = turn.s_estado;
        if (estado === 'EN_ESPERA') {
          turnsByStatus['waiting']++;
        } else if (estado === 'ATENDIDO') {
          turnsByStatus['attended']++;
        } else if (estado === 'CANCELADO') {
          turnsByStatus['cancelled']++;
        }
      });

      // Calcular el total de turnos
      const totalTurnos = allTurns.length;

      // Calcular turnos del día, mes y año usando los datos obtenidos
      const turnosDelDia = todayTurns.length;
      const turnosDelMes = turnosDelMesData.length;
      const turnosDelAnio = turnosDelAnioData.length;

      // Procesar estadísticas de consultorios por área
      const consultoriosByArea = {};
      const areasInfo = {}; // Guardar info completa de las áreas
      areasData.forEach(area => {
        const count = consultoriosData.filter(c => c.uk_area === area.uk_area).length;
        consultoriosByArea[area.s_nombre_area] = count;
        areasInfo[area.s_nombre_area] = {
          color: area.s_color || '#2f97d1',
          icono: area.s_icono || 'FaHospital',
          letra: area.s_letra || area.s_nombre_area.charAt(0),
          count: count
        };
      });

      // Procesar estadísticas de administradores por tipo
      const adminsByType = {};
      adminsData.forEach(admin => {
        const type = admin.tipo_usuario === 1 ? 'Administrador' : 'Supervisor';
        adminsByType[type] = (adminsByType[type] || 0) + 1;
      });

      setStats({
        turns: {
          total: totalTurnos,
          byStatus: turnsByStatus,
          today: turnosDelDia,
          thisWeek: 0,
          thisMonth: turnosDelMes,
          thisYear: turnosDelAnio
        },
        patients: {
          total: patientsData.length,
          active: patientsData.filter(p => p.ck_estado === 'ACTIVO').length,
          withEmail: patientsData.filter(p => p.s_email).length,
          newThisMonth: 0 // Se puede calcular con más datos
        },
        consultorios: {
          total: consultoriosData.length,
          active: consultoriosData.filter(c => c.ck_estado === 'ACTIVO').length,
          byArea: consultoriosByArea,
          areasInfo: areasInfo
        },
        areas: {
          total: areasData.length,
          active: areasData.filter(a => a.ck_estado === 'ACTIVO').length
        },
        admins: {
          total: adminsData.length,
          byType: adminsByType
        }
      });

      setRecentTurns(recentTurnsData.slice(0, 10));
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setError(t('statistics.errorLoading'));
    } finally {
      // Delay mínimo para transición suave del spinner
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const refreshData = () => {
    loadStatistics();
  };

  const exportData = () => {
    // Implementar exportación de datos
    alert('Función de exportación pendiente de implementar');
  };

  if (loading) {
    return <TestSpinner message={t('statistics.loading')} />;
  }

  return (
    <div className="admin-page-unified">
      <AdminHeader />

      <div className="admin-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-icon">
            <FaChartLine />
          </div>
          <div className="page-header-content">
            <h1 className="page-title">{t('statistics.title')}</h1>
            <p className="page-subtitle">
              {t('statistics.subtitle')}
            </p>
          </div>
          <div className="page-actions">
                        <button className="btn btn-primary" onClick={refreshData}>
              <FaSync /> {t('statistics.refresh')}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              <FaTimes />
            </button>
          </div>
        )}

        {/* Main Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div className="content-card">
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'linear-gradient(135deg, var(--primary-medical), var(--accent-medical))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <FaCalendarCheck />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {stats.turns.total}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {t('statistics.totalAppointments')}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('statistics.today')}: {stats.turns.today}
                </p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'linear-gradient(135deg, var(--success-color), #20c997)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <FaUsers />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {stats.patients.total}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {t('statistics.totalPatients')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '24px', 
          marginBottom: '32px',
          alignItems: 'start'
        }}
        className="stats-content-grid">
          {/* Turns by Status Chart */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaChartPie />
                {t('statistics.appointmentsByStatus')}
              </h3>
              <div className="card-actions">
              </div>
            </div>
            <div className="card-content" style={{ padding: '18px 24px' }}>
              {Object.keys(stats.turns.byStatus).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(stats.turns.byStatus).map(([status, count]) => {
                    const percentage = stats.turns.total > 0 ? (count / stats.turns.total * 100).toFixed(1) : 0;
                    const colors = {
                      'waiting': 'var(--info-color)',
                      'attended': 'var(--success-color)',
                      'cancelled': 'var(--danger-color)',
                    };
                    const color = colors[status] || 'var(--primary-medical)';

                    return (
                      <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: color
                        }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                              {t(`statistics.statuses.${status}`)}
                            </span>
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '6px',
                            backgroundColor: 'var(--border-color)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: color,
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <FaChartPie />
                  <h3>{t('statistics.noAppointmentsData')}</h3>
                  <p>{t('statistics.noAppointmentsInfo')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaChartBar />
                {t('statistics.quickSummary')}
              </h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Turnos del Año */}
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(47, 151, 209, 0.15) 0%, rgba(47, 151, 209, 0.05) 100%)',
                  borderRadius: '12px',
                  border: '2px solid rgba(47, 151, 209, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(47, 151, 209, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(47, 151, 209, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(47, 151, 209, 0.3)';
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '-20px', 
                    right: '-20px', 
                    width: '100px', 
                    height: '100px', 
                    background: 'rgba(47, 151, 209, 0.1)', 
                    borderRadius: '50%',
                    filter: 'blur(30px)'
                  }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #2f97d1 0%, #1e6fa0 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(47, 151, 209, 0.3)'
                      }}>
                        <FaChartLine style={{ color: 'white', fontSize: '18px' }} />
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('statistics.yearAppointments')}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#2f97d1', marginBottom: '4px', position: 'relative' }}>
                    {stats.turns.thisYear || 0}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    📅 {new Date().getFullYear()}
                  </div>
                </div>

                {/* Turnos del Mes */}
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.15) 0%, rgba(40, 167, 69, 0.05) 100%)',
                  borderRadius: '12px',
                  border: '2px solid rgba(40, 167, 69, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(40, 167, 69, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(40, 167, 69, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(40, 167, 69, 0.3)';
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '-20px', 
                    right: '-20px', 
                    width: '100px', 
                    height: '100px', 
                    background: 'rgba(40, 167, 69, 0.1)', 
                    borderRadius: '50%',
                    filter: 'blur(30px)'
                  }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
                      }}>
                        <FaCalendarCheck style={{ color: 'white', fontSize: '18px' }} />
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('statistics.monthAppointments')}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#28a745', marginBottom: '4px', position: 'relative' }}>
                    {stats.turns.thisMonth || 0}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    📆 {new Date().toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Turnos del Día */}
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(23, 162, 184, 0.15) 0%, rgba(23, 162, 184, 0.05) 100%)',
                  borderRadius: '12px',
                  border: '2px solid rgba(23, 162, 184, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(23, 162, 184, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(23, 162, 184, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(23, 162, 184, 0.3)';
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '-20px', 
                    right: '-20px', 
                    width: '100px', 
                    height: '100px', 
                    background: 'rgba(23, 162, 184, 0.1)', 
                    borderRadius: '50%',
                    filter: 'blur(30px)'
                  }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #17a2b8 0%, #117a8b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)'
                      }}>
                        <FaCalendarDay style={{ color: 'white', fontSize: '18px' }} />
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('statistics.dayAppointments')}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#17a2b8', marginBottom: '4px', position: 'relative' }}>
                    {stats.turns.today || 0}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    🗓️ {new Date().toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultorios by Area */}
        {Object.keys(stats.consultorios.byArea).length > 0 && (
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaHospital />
                {t('statistics.officesByMedicalArea')}
              </h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {Object.entries(stats.consultorios.byArea).map(([area, count]) => {
                  const areaInfo = stats.consultorios.areasInfo[area] || {};
                  const color = areaInfo.color || '#2f97d1';
                  const IconComponent = getIconComponent(areaInfo.icono);
                  
                  return (
                    <div 
                      key={area} 
                      style={{
                        padding: '16px',
                        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                        borderRadius: '12px',
                        border: `2px solid ${color}40`,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = `0 6px 16px ${color}40`;
                        e.currentTarget.style.borderColor = color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = `${color}40`;
                      }}>
                      <div style={{ 
                        position: 'absolute', 
                        top: '-20px', 
                        right: '-20px', 
                        width: '100px', 
                        height: '100px', 
                        background: `${color}15`, 
                        borderRadius: '50%',
                        filter: 'blur(30px)'
                      }}></div>
                      
                      {/* Contenido izquierdo: Nombre y Número */}
                      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: '700', 
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                          lineHeight: '1.2'
                        }}>
                          {area}
                        </div>
                        <div style={{ 
                          fontSize: '40px', 
                          fontWeight: '900', 
                          color: color,
                          lineHeight: '1',
                          margin: '0'
                        }}>
                          {count}
                        </div>
                      </div>
                      
                      {/* Ícono grande a la derecha */}
                      <div style={{
                        minWidth: '60px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 6px 16px ${color}50`,
                        position: 'relative',
                        zIndex: 1,
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        <IconComponent style={{ 
                          color: 'white', 
                          fontSize: '28px',
                          display: 'block',
                          verticalAlign: 'middle'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>     
              
      <AdminFooter isDarkMode={isDarkMode} />
      <Chatbot />
    </div>
  );
};

export default StatisticsPage;