import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaChartBar
} from 'react-icons/fa';

const StatisticsPage = () => {
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
      byArea: {}
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

      const [
        allTurns,
        patientsData,
        consultoriosData,
        areasData,
        adminsData,
        todayTurns,
        recentTurnsData
      ] = await Promise.all([
        turnService.getAllTurns().catch(() => []),
        patientService.getAllPatients().catch(() => []),
        consultorioService.getAll().catch(() => []),
        areaService.getAll().catch(() => []),
        adminService.getAllAdmins().catch(() => []),
        turnService.getTurnsByDate(new Date().toISOString().split('T')[0]).catch(() => []),
        turnService.getTurnsByDateRange?.(dateRange.start, dateRange.end).catch(() => []) || []
      ]);

      // Procesar estadísticas de turnos - contar directamente desde los datos
      const turnsByStatus = {
        'En espera': 0,
        'Atendido': 0,
        'Cancelado': 0,
      };

      // Contar turnos por estado
      allTurns.forEach(turn => {
        const estado = turn.s_estado;
        if (estado === 'EN_ESPERA') {
          turnsByStatus['En espera']++;
        } else if (estado === 'ATENDIDO') {
          turnsByStatus['Atendido']++;
        } else if (estado === 'CANCELADO') {
          turnsByStatus['Cancelado']++;
        }
      });

      // Calcular el total de turnos
      const totalTurnos = allTurns.length;

      // Procesar estadísticas de consultorios por área
      const consultoriosByArea = {};
      areasData.forEach(area => {
        consultoriosByArea[area.s_nombre_area] = consultoriosData.filter(c => c.uk_area === area.uk_area).length;
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
          today: todayTurns.length,
          thisWeek: 0, // Se puede calcular con más datos
          thisMonth: 0 // Se puede calcular con más datos
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
          byArea: consultoriosByArea
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
      setError('Error cargando estadísticas');
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
    return <TestSpinner message="Cargando estadísticas..." />;
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
            <h1 className="page-title">Estadísticas del Sistema</h1>
            <p className="page-subtitle">
              Análisis y métricas generales del sistema MediQueue
            </p>
          </div>
          <div className="page-actions">
                        <button className="btn btn-primary" onClick={refreshData}>
              <FaSync /> Actualizar
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
                  Total Turnos
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  Hoy: {stats.turns.today}
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
                  Total Pacientes
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  Activos: {stats.patients.active}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Turns by Status Chart */}
          <div className="content-card" style={{ maxHeight: '250px' }}>
            <div className="card-header">
              <h3 className="card-title">
                <FaChartPie />
                Turnos por Estado
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
                      'En espera': 'var(--info-color)',
                      'Atendido': 'var(--success-color)',
                      'Cancelado': 'var(--danger-color)',
                      'En atención': 'var(--warning-color)'
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
                              {status}
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
                  <h3>Sin datos de turnos</h3>
                  <p>No hay información de turnos para mostrar</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaChartBar />
                Resumen Rápido
              </h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '16px',
                  background: 'rgba(var(--primary-medical-rgb, 47, 151, 209), 0.1)',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid rgba(var(--primary-medical-rgb, 47, 151, 209), 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <FaEnvelope style={{ color: 'var(--primary-medical)', fontSize: '14px' }} />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Turnos del Año</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-medical)' }}>
                    {stats.patients.withEmail}
                  </div>                  
                </div>

                <div style={{
                  padding: '16px',
                  background: 'rgba(var(--success-color-rgb, 40, 167, 69), 0.1)',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid rgba(var(--success-color-rgb, 40, 167, 69), 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <FaBuilding style={{ color: 'var(--success-color)', fontSize: '14px' }} />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Turnos del Mes</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success-color)' }}>
                    {stats.areas.total}
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: 'rgba(var(--info-color-rgb, 23, 162, 184), 0.1)',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid rgba(var(--info-color-rgb, 23, 162, 184), 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <FaCalendarDay style={{ color: 'var(--info-color)', fontSize: '14px' }} />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Turnos del Día</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--info-color)' }}>
                    {stats.turns.today}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
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
                Consultorios por Área Médica
              </h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {Object.entries(stats.consultorios.byArea).map(([area, count]) => (
                  <div key={area} style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-medical)', marginBottom: '4px' }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {area}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Date Range Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Fecha Inicio</label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateRangeChange}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>Fecha Fin</label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateRangeChange}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <button className="btn btn-secondary" onClick={refreshData}>
              <FaFilter /> Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Recent Turns */}
        {recentTurns.length > 0 && (
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaClock />
                Actividad Reciente
              </h3>
              <div className="card-actions">
                <button className="card-action" title="Ver todos">
                  <FaEye />
                </button>
              </div>
            </div>
            <div className="card-content" style={{ padding: 0 }}>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th># Turno</th>
                      <th>Consultorio</th>
                      <th>Área</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTurns.map(turn => (
                      <tr key={turn.uk_turno}>
                        <td>
                          <strong>#{turn.i_numero_turno}</strong>
                        </td>
                        <td>{formatDate(turn.d_fecha)}</td>
                        <td>
                          <span className={`status-badge ${turn.s_estado === 'ATENDIDO' ? 'success' :
                              turn.s_estado === 'EN_ESPERA' ? 'info' :
                                turn.s_estado === 'CANCELADO' ? 'danger' : 'warning'
                            }`}>
                            {TURN_STATUS_LABELS?.[turn.s_estado] || turn.s_estado}
                          </span>
                        </td>
                        <td>{turn.paciente_nombre || 'Invitado'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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