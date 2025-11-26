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
  const { t } = useTranslation(['admin', 'common']);
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
  const [chartPeriod, setChartPeriod] = useState('day'); // 'day', 'month', 'year'
  const [chartData, setChartData] = useState({
    labels: [],
    data: []
  });

  useEffect(() => {
    // Mostrar spinner brevemente para mejor UX
    setLoading(true);
    setTimeout(() => {
      loadStatistics();
    }, 800);
  }, []);

  // Auto-refresh para el día actual cada 30 segundos
  useEffect(() => {
    if (chartPeriod === 'day') {
      const interval = setInterval(() => {
        loadChartData('day');
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [chartPeriod]);

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

      // Cargar datos iniciales de la gráfica
      loadChartData(chartPeriod);
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

  const loadChartData = async (period) => {
    try {
      const now = new Date();
      let labels = [];
      let data = [];

      // Intentar usar el nuevo endpoint, si falla usar el método de respaldo
      let chartStats = null;
      let usingBackupMethod = false;

      try {
        chartStats = await turnService.getChartStatistics(period);
        console.log('📊 Estadísticas de gráfica recibidas del nuevo endpoint:', chartStats);
      } catch (backendError) {
        console.warn('⚠️ Endpoint nuevo no disponible, usando método de respaldo:', backendError.message);
        usingBackupMethod = true;
      }

      if (period === 'day') {
        // Datos por hora del día actual (0-23)
        if (usingBackupMethod) {
          const todayStr = now.toISOString().split('T')[0];
          const todayTurns = await turnService.getTurnsByDateRange(todayStr, todayStr).catch(() => []) || [];

          // Agrupar por hora
          const turnosPorHora = new Map();
          todayTurns.forEach(turno => {
            // Parsear hora del campo t_hora (formato HH:MM:SS)
            const hora = turno.t_hora ? parseInt(turno.t_hora.split(':')[0]) : 0;
            turnosPorHora.set(hora, (turnosPorHora.get(hora) || 0) + 1);
          });

          for (let i = 0; i < 24; i++) {
            labels.push(`${i.toString().padStart(2, '0')}:00`);
            data.push(turnosPorHora.get(i) || 0);
          }

          console.log('✅ Vista DÍA (Respaldo) - Total turnos:', todayTurns.length);
        } else {
          const horasConDatos = new Map(chartStats.datos.map(d => [d.periodo, d.total]));
          for (let i = 0; i < 24; i++) {
            labels.push(`${i.toString().padStart(2, '0')}:00`);
            data.push(horasConDatos.get(i) || 0);
          }
          console.log('✅ Vista DÍA - Total turnos:', data.reduce((a, b) => a + b, 0));
        }
      } else if (period === 'month') {
        // Datos por día del mes actual
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        if (usingBackupMethod) {
          const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
          const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
          const monthTurns = await turnService.getTurnsByDateRange(startOfMonth, endOfMonth).catch(() => []) || [];

          // Agrupar por día
          const turnosPorDia = new Map();
          monthTurns.forEach(turno => {
            // Parsear día del campo d_fecha (formato YYYY-MM-DD)
            const dia = turno.d_fecha ? parseInt(turno.d_fecha.split('-')[2]) : 0;
            turnosPorDia.set(dia, (turnosPorDia.get(dia) || 0) + 1);
          });

          for (let day = 1; day <= daysInMonth; day++) {
            labels.push(day.toString());
            data.push(turnosPorDia.get(day) || 0);
          }

          console.log('✅ Vista MES (Respaldo) - Total turnos:', monthTurns.length);
        } else {
          const diasConDatos = new Map(chartStats.datos.map(d => [d.periodo, d.total]));
          for (let day = 1; day <= daysInMonth; day++) {
            labels.push(day.toString());
            data.push(diasConDatos.get(day) || 0);
          }
          console.log('✅ Vista MES - Total turnos:', data.reduce((a, b) => a + b, 0));
        }
      } else if (period === 'year') {
        // Datos por mes del año actual
        const year = now.getFullYear();
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        if (usingBackupMethod) {
          const startOfYear = `${year}-01-01`;
          const endOfYear = `${year}-12-31`;
          const yearTurns = await turnService.getTurnsByDateRange(startOfYear, endOfYear).catch(() => []) || [];

          // Agrupar por mes
          const turnosPorMes = new Map();
          yearTurns.forEach(turno => {
            // Parsear mes del campo d_fecha (formato YYYY-MM-DD)
            const mes = turno.d_fecha ? parseInt(turno.d_fecha.split('-')[1]) : 0;
            turnosPorMes.set(mes, (turnosPorMes.get(mes) || 0) + 1);
          });

          for (let month = 1; month <= 12; month++) {
            labels.push(monthNames[month - 1]);
            data.push(turnosPorMes.get(month) || 0);
          }

          console.log('✅ Vista AÑO (Respaldo) - Total turnos:', yearTurns.length);
        } else {
          const mesesConDatos = new Map(chartStats.datos.map(d => [d.periodo, d.total]));
          for (let month = 1; month <= 12; month++) {
            labels.push(monthNames[month - 1]);
            data.push(mesesConDatos.get(month) || 0);
          }
          console.log('✅ Vista AÑO - Total turnos:', data.reduce((a, b) => a + b, 0));
        }
      }

      setChartData({ labels, data });
    } catch (error) {
      console.error('❌ Error cargando datos de gráfica:', error);
      // En caso de error, mostrar estructura vacía pero válida
      const now = new Date();
      if (period === 'day') {
        setChartData({
          labels: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
          data: Array(24).fill(0)
        });
      } else if (period === 'month') {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        setChartData({
          labels: Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
          data: Array(daysInMonth).fill(0)
        });
      } else if (period === 'year') {
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        setChartData({
          labels: monthNames,
          data: Array(12).fill(0)
        });
      }
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

  const handlePeriodChange = (period) => {
    setChartPeriod(period);
    loadChartData(period);
  };

  const exportData = () => {
    // Implementar exportación de datos
    alert('Función de exportación pendiente de implementar');
  };

  if (loading) {
    return <TestSpinner message={t('admin:statistics.loading')} />;
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
            <h1 className="page-title">{t('admin:statistics.title')}</h1>
            <p className="page-subtitle">
              {t('admin:statistics.subtitle')}
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={refreshData}>
              <FaSync /> {t('admin:statistics.refresh')}
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
                  {t('admin:statistics.totalAppointments')}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('admin:statistics.today')}: {stats.turns.today}
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
                  {t('admin:statistics.totalPatients')}
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
          marginBottom: '32px'
        }}
          className="stats-content-grid">
          {/* Columna izquierda - Turnos por Estado y Distribución */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Turns by Status Chart */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">
                  <FaChartPie />
                  {t('admin:statistics.appointmentsByStatus')}
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
                    <h3>{t('admin:statistics.noAppointmentsData')}</h3>
                    <p>{t('admin:statistics.noAppointmentsInfo')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Circular Chart - Distribución de Estados */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">
                  <FaChartPie />
                  {t('admin:statistics.appointmentsByStatus')}
                </h3>
                <div className="card-actions">
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="card-content" style={{ padding: '24px' }}>
                {Object.keys(stats.turns.byStatus).length > 0 && stats.turns.today > 0 ? (
                  <div style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* Gráfica Circular SVG */}
                    <div style={{ position: 'relative', width: '300px', height: '300px', flexShrink: 0 }}>
                      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                        {(() => {
                          console.log('🎨 Renderizando gráfica circular:', stats.turns.byStatus);

                          const colors = {
                            'En espera': '#17a2b8',
                            'Atendido': '#28a745',
                            'Cancelado': '#dc3545',
                            'En atención': '#ffc107',
                            'No presente': '#6c757d'
                          };

                          const centerX = 100;
                          const centerY = 100;
                          const radius = 70;
                          const strokeWidth = 35;
                          const total = stats.turns.today;

                          let cumulativePercent = 0;

                          return Object.entries(stats.turns.byStatus).map(([status, count]) => {
                            if (count === 0) return null;

                            const percentage = (count / total);
                            const color = colors[status] || '#2f97d1';

                            console.log(`Estado: ${status}, Count: ${count}, Color: ${color}, Percentage: ${percentage * 100}%`);

                            const circumference = 2 * Math.PI * radius;
                            const segmentLength = circumference * percentage;
                            const offset = -cumulativePercent * circumference;

                            cumulativePercent += percentage;

                            return (
                              <circle
                                key={status}
                                cx={centerX}
                                cy={centerY}
                                r={radius}
                                fill="none"
                                stroke={color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${segmentLength} ${circumference}`}
                                strokeDashoffset={offset}
                                transform={`rotate(-90 ${centerX} ${centerY})`}
                                style={{
                                  cursor: 'pointer',
                                  transition: 'opacity 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                              >
                                <title>{`${status}: ${count} turnos (${(percentage * 100).toFixed(1)}%)`}</title>
                              </circle>
                            );
                          });
                        })()}

                        {/* Texto central */}
                        <text
                          x="100"
                          y="95"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{
                            fontSize: '40px',
                            fontWeight: '900',
                            fill: 'var(--text-primary)',
                            pointerEvents: 'none'
                          }}
                        >
                          {stats.turns.today}
                        </text>
                        <text
                          x="100"
                          y="120"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fill: 'var(--text-muted)',
                            pointerEvents: 'none'
                          }}
                        >
                          {t('common:navigation.turns')}
                        </text>
                      </svg>
                    </div>

                    {/* Leyenda */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minWidth: '250px' }}>
                      {Object.entries(stats.turns.byStatus).map(([status, count]) => {
                        if (count === 0) return null;

                        const percentage = stats.turns.today > 0 ? (count / stats.turns.today * 100).toFixed(1) : 0;
                        const colors = {
                          'En espera': '#17a2b8',
                          'Atendido': '#28a745',
                          'Cancelado': '#dc3545',
                          'En atención': '#ffc107',
                          'No presente': '#6c757d'
                        };
                        const color = colors[status] || '#2f97d1';

                        return (
                          <div key={status} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 18px',
                            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                            borderRadius: '12px',
                            border: `2px solid ${color}30`,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateX(4px)';
                              e.currentTarget.style.borderColor = color;
                              e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateX(0)';
                              e.currentTarget.style.borderColor = `${color}30`;
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              backgroundColor: color,
                              flexShrink: 0,
                              boxShadow: `0 2px 8px ${color}50`
                            }}></div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                  {status}
                                </span>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                  {percentage}%
                                </span>
                              </div>
                              <div style={{ fontSize: '22px', fontWeight: '900', color: color }}>
                                {count}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <FaChartPie style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{t('admin:statistics.noAppointmentsData')}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('admin:statistics.noAppointmentsInfo')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaChartBar />
                {t('admin:statistics.quickSummary')}
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
                      <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('admin:statistics.yearAppointments')}</span>
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
                      <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('admin:statistics.monthAppointments')}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#28a745', marginBottom: '4px', position: 'relative' }}>
                    {stats.turns.thisMonth || 0}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    📆 {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
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
                      <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('admin:statistics.dayAppointments')}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#17a2b8', marginBottom: '4px', position: 'relative' }}>
                    {stats.turns.today || 0}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    🗓️ {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Chart */}
        <div className="content-card" style={{ marginBottom: '32px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <FaChartLine />
              {t('admin:statistics.charts.turnsByDay')}
            </h3>
            <div className="card-actions" style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn ${chartPeriod === 'day' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handlePeriodChange('day')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: chartPeriod === 'day' ? '2px solid var(--primary-medical)' : '2px solid var(--border-color)',
                  background: chartPeriod === 'day' ? 'var(--primary-medical)' : 'transparent',
                  color: chartPeriod === 'day' ? 'white' : 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaCalendarDay style={{ marginRight: '6px' }} />
                {t('admin:statistics.periods.day')}
              </button>
              <button
                className={`btn ${chartPeriod === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handlePeriodChange('month')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: chartPeriod === 'month' ? '2px solid var(--primary-medical)' : '2px solid var(--border-color)',
                  background: chartPeriod === 'month' ? 'var(--primary-medical)' : 'transparent',
                  color: chartPeriod === 'month' ? 'white' : 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaCalendarCheck style={{ marginRight: '6px' }} />
                {t('admin:statistics.periods.month')}
              </button>
              <button
                className={`btn ${chartPeriod === 'year' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handlePeriodChange('year')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: chartPeriod === 'year' ? '2px solid var(--primary-medical)' : '2px solid var(--border-color)',
                  background: chartPeriod === 'year' ? 'var(--primary-medical)' : 'transparent',
                  color: chartPeriod === 'year' ? 'white' : 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaChartBar style={{ marginRight: '6px' }} />
                {t('admin:statistics.periods.year')}
              </button>
            </div>
          </div>
          <div className="card-content" style={{ padding: '24px' }}>
            <div style={{ position: 'relative', height: '320px' }}>
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Título del período */}
                <div style={{
                  marginBottom: '20px',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, rgba(47, 151, 209, 0.1) 0%, rgba(47, 151, 209, 0.05) 100%)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid rgba(47, 151, 209, 0.2)'
                }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--primary-medical)' }}>
                    {chartPeriod === 'day' && `Turnos por Hora - ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
                    {chartPeriod === 'month' && `Turnos por Día - ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`}
                    {chartPeriod === 'year' && `Turnos por Mes - ${new Date().getFullYear()}`}
                    {chartPeriod === 'day' && <span style={{ marginLeft: '12px', fontSize: '12px', fontWeight: '500', color: 'var(--success-color)' }}>●  Actualizándose automáticamente</span>}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Total: {chartData.data.reduce((a, b) => a + b, 0)} turnos
                  </p>
                </div>

                {/* Gráfica de barras */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: chartPeriod === 'day' ? '4px' : chartPeriod === 'month' ? '3px' : '8px',
                  padding: '0 10px 30px 10px',
                  position: 'relative',
                  minHeight: '200px'
                }}>
                  {/* Líneas de referencia horizontales */}
                  <div style={{ position: 'absolute', top: 0, left: 10, right: 10, bottom: 30 }}>
                    {[0, 25, 50, 75, 100].map(percent => (
                      <div key={percent} style={{
                        position: 'absolute',
                        bottom: `${percent}%`,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'var(--border-color)',
                        opacity: 0.3
                      }}></div>
                    ))}
                  </div>

                  {chartData.data.map((value, index) => {
                    const maxValue = Math.max(...chartData.data, 1);
                    const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;

                    return (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          position: 'relative',
                          zIndex: 1,
                          minWidth: chartPeriod === 'day' ? '8px' : chartPeriod === 'month' ? '6px' : '15px'
                        }}
                        title={`${chartData.labels[index]}: ${value} turnos`}
                      >
                        {/* Contenedor de barra con altura fija */}
                        <div style={{
                          width: '100%',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          {/* Barra */}
                          <div
                            style={{
                              width: '100%',
                              height: value > 0 ? `${Math.max(heightPercent, 5)}%` : '2px',
                              background: value > 0
                                ? 'linear-gradient(to top, var(--primary-medical), var(--accent-medical))'
                                : 'rgba(226, 232, 240, 0.5)',
                              borderRadius: '4px 4px 0 0',
                              transition: 'all 0.3s ease',
                              cursor: value > 0 ? 'pointer' : 'default',
                              boxShadow: value > 0 ? '0 2px 8px rgba(47, 151, 209, 0.3)' : 'none',
                              position: 'relative',
                              transformOrigin: 'bottom'
                            }}
                            onMouseEnter={(e) => {
                              if (value > 0) {
                                e.currentTarget.style.opacity = '0.8';
                                e.currentTarget.style.transform = 'scaleY(1.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (value > 0) {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'scaleY(1)';
                              }
                            }}
                          >
                            {/* Valor encima de la barra */}
                            {value > 0 && (
                              <div style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: 'var(--primary-medical)',
                                whiteSpace: 'nowrap'
                              }}>
                                {value}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Etiqueta */}
                        <div style={{
                          marginTop: '8px',
                          fontSize: chartPeriod === 'day' ? '9px' : chartPeriod === 'month' ? '10px' : '11px',
                          color: 'var(--text-muted)',
                          fontWeight: '600',
                          transform: chartPeriod === 'day' ? 'rotate(-45deg)' : 'none',
                          transformOrigin: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          {chartData.labels[index]}
                        </div>
                      </div>
                    );
                  })}
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
                {t('admin:statistics.officesByMedicalArea')}
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