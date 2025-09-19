import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import turnService from '../services/turnService';
import patientService from '../services/patientService';
import consultorioService from '../services/consultorioService';
import areaService from '../services/areaService';
import adminService from '../services/adminService';
import { TURN_STATUS_LABELS, RECORD_STATUS_LABELS } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/helpers';

const StatisticsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        turnsStats,
        patientsData,
        consultoriosData,
        areasData,
        adminsData,
        todayTurns,
        recentTurnsData
      ] = await Promise.all([
        turnService.getTurnStatistics().catch(() => null),
        patientService.getAllPatients().catch(() => []),
        consultorioService.getAll().catch(() => []),
        areaService.getAll().catch(() => []),
        adminService.getAllAdmins().catch(() => []),
        turnService.getTurnsByDate(new Date().toISOString().split('T')[0]).catch(() => []),
        turnService.getTurnsByDateRange(dateRange.start, dateRange.end).catch(() => [])
      ]);

      // Procesar estadísticas de turnos
      const turnsByStatus = {};
      Object.values(TURN_STATUS_LABELS).forEach(status => {
        turnsByStatus[status] = 0;
      });

      if (turnsStats) {
        Object.entries(turnsStats).forEach(([key, value]) => {
          if (key.includes('turnos_')) {
            const status = key.replace('turnos_', '').toUpperCase();
            if (TURN_STATUS_LABELS[status]) {
              turnsByStatus[TURN_STATUS_LABELS[status]] = value || 0;
            }
          }
        });
      }

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
          total: turnsStats?.total_turnos || 0,
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
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
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

  if (loading) {
    return (
      <div className="statistics-page loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <AdminHeader />

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={refreshData} className="retry-btn">
            Reintentar
          </button>
        </div>
      )}

      <main className="management-content">
        {/* Filtros de fecha */}
        <div className="filters-section">
          <div className="date-range-filters">
            <div className="filter-group">
              <label>Fecha Inicio</label>
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateRangeChange}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Fecha Fin</label>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateRangeChange}
                className="filter-input"
              />
            </div>
            <button onClick={refreshData} className="btn primary">
              <i className="fas fa-sync-alt"></i>
              Actualizar
            </button>
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.turns.total}</h3>
              <p>Total Turnos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-calendar-day"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.turns.today}</h3>
              <p>Turnos Hoy</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.patients.total}</h3>
              <p>Total Pacientes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-hospital"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.consultorios.total}</h3>
              <p>Total Consultorios</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-building"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.areas.total}</h3>
              <p>Total Áreas</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.admins.total}</h3>
              <p>Total Administradores</p>
            </div>
          </div>
        </div>

        {/* Gráficos y tablas */}
        <div className="charts-section">
          <div className="chart-card">
            <h3>Turnos por Estado</h3>
            <div className="chart-content">
              {Object.entries(stats.turns.byStatus).map(([status, count]) => (
                <div key={status} className="chart-bar">
                  <div className="bar-label">{status}</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ width: `${(count / stats.turns.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Consultorios por Área</h3>
            <div className="chart-content">
              {Object.entries(stats.consultorios.byArea).map(([area, count]) => (
                <div key={area} className="chart-bar">
                  <div className="bar-label">{area}</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ width: `${(count / stats.consultorios.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Administradores por Tipo</h3>
            <div className="chart-content">
              {Object.entries(stats.admins.byType).map(([type, count]) => (
                <div key={type} className="chart-bar">
                  <div className="bar-label">{type}</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ width: `${(count / stats.admins.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de turnos recientes */}
        <div className="recent-turns-section">
          <h3>Turnos Recientes</h3>
          <div className="turns-table">
            <table>
              <thead>
                <tr>
                  <th># Turno</th>
                  <th>Consultorio</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {recentTurns.map(turn => (
                  <tr key={turn.uk_turno}>
                    <td>#{turn.i_numero_turno}</td>
                    <td>Consultorio {turn.i_numero_consultorio}</td>
                    <td>
                      <span className={`status-badge ${turn.s_estado.toLowerCase().replace('_', '-')}`}>
                        {TURN_STATUS_LABELS[turn.s_estado] || turn.s_estado}
                      </span>
                    </td>
                    <td>{formatDate(turn.d_fecha)}</td>
                    <td>{turn.t_hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentTurns.length === 0 && (
              <div className="empty-state">
                <p>No hay turnos en el rango de fechas seleccionado</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .statistics-page {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .statistics-page.loading {
          display: flex;
          align-items: center;
          justify-content: center;
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

        .management-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-logo-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-logo-image {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .header-logo-text-group {
          display: flex;
          align-items: baseline;
        }

        .header-logo-text {
          font-size: 1.5em;
          font-weight: 700;
          color: #2d3748;
        }

        .header-logo-text2 {
          font-size: 1.5em;
          font-weight: 700;
          color: #667eea;
        }

        .header-subtitle h1 {
          margin: 0;
          color: #2d3748;
          font-size: 1.8em;
        }

        .header-subtitle p {
          margin: 5px 0 0 0;
          color: #718096;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .back-btn {
          background: #f1f5f9;
          border: 1px solid #cbd5e0;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-btn:hover {
          background: #e2e8f0;
        }

        .admin-name {
          color: #4a5568;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logout-btn {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(197, 48, 48, 0.3);
        }

        .management-content {
          padding: 40px 20px;
        }

        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .date-range-filters {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-weight: 600;
          color: #4a5568;
        }

        .filter-input {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
        }

        .filter-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

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

        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .chart-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .chart-card h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
          font-size: 1.2em;
        }

        .chart-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .chart-bar {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .bar-label {
          min-width: 120px;
          font-weight: 500;
          color: #4a5568;
        }

        .bar-container {
          flex: 1;
          height: 20px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .bar-value {
          min-width: 30px;
          text-align: right;
          font-weight: 600;
          color: #2d3748;
        }

        .recent-turns-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .recent-turns-section h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
          font-size: 1.2em;
        }

        .turns-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #f7fafc;
          padding: 15px 20px;
          text-align: left;
          font-weight: 600;
          color: #4a5568;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 15px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        tr:hover {
          background: #f8fafc;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.en-espera {
          background: #bee3f8;
          color: #2a4365;
        }

        .status-badge.llamando {
          background: #e9d8fd;
          color: #553c9a;
        }

        .status-badge.atendido {
          background: #c6f6d5;
          color: #22543d;
        }

        .status-badge.cancelado {
          background: #fed7d7;
          color: #742a2a;
        }

        .status-badge.no-presente {
          background: #f7fafc;
          color: #4a5568;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
        }

        @media (max-width: 768px) {
          .header-left {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }

          .header-right {
            flex-direction: column;
            gap: 10px;
          }

          .date-range-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .charts-section {
            grid-template-columns: 1fr;
          }

          .chart-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .bar-label {
            min-width: auto;
          }

          .bar-value {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default StatisticsPage;

