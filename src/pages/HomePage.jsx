import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import turnService from '../services/turnService';
import '../styles/HomePage.css';

const HomePage = () => {
  const [nextTurn, setNextTurn] = useState(null);
  const [activeTurns, setActiveTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHeader] = useState(true);
  const navigate = useNavigate();

  // Cargar datos al montar el componente
  useEffect(() => {
    loadTurnsData();

    // Configurar actualización automática cada 30 segundos
    const interval = setInterval(loadTurnsData, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadTurnsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar próximo turno y turnos activos en paralelo
      const [nextTurnData, activeTurnsData] = await Promise.all([
        turnService.getNextTurn().catch(err => {
          console.warn('Error cargando próximo turno:', err);
          return null;
        }),
        turnService.getActiveTurns().catch(err => {
          console.warn('Error cargando turnos activos:', err);
          return [];
        })
      ]);

      setNextTurn(nextTurnData);
      setActiveTurns(activeTurnsData || []);
    } catch (error) {
      console.error('Error cargando datos de turnos:', error);
      setError('Error cargando información de turnos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTurnsData();
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'EN_ESPERA': 'En espera',
      'LLAMANDO': 'Llamando',
      'ATENDIDO': 'Atendido',
      'CANCELADO': 'Cancelado',
      'NO_PRESENTE': 'No presente'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'LLAMANDO':
        return 'status-calling';
      case 'EN_ESPERA':
        return 'status-waiting';
      case 'ATENDIDO':
        return 'status-attended';
      case 'CANCELADO':
        return 'status-cancelled';
      case 'NO_PRESENTE':
        return 'status-no-show';
      default:
        return 'status-waiting';
    }
  };

  return (
    <div className="main-outer-container">
      {/* Barra de marca */}
      {showHeader && (
        <div className="brand-bar">
          <div className="brand-inner">
            <div className="brand-left">
              <div className="brand-logo">
                <img src="/images/mediqueue_logo.png" alt="MediQueue Logo" className="brand-logo-image" />
              </div>
              <div className="brand-title">
                <span className="brand-name">MediQueue</span>
                <span className="brand-tag">
                  <i className="mdi mdi-clock-outline"></i>
                  Tu turno, sin filas
                </span>
              </div>
            </div>
            <div className="brand-right">
              <button
                onClick={() => navigate('/about')}
                className="about-button"
                title="Conoce nuestro equipo"
              >
                <i className="fas fa-users"></i>
                Equipo
              </button>
              <button
                onClick={handleRefresh}
                className="refresh-button"
                disabled={loading}
                title="Actualizar información"
              >
                <i className="fas fa-sync-alt"></i>
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={handleRefresh} className="retry-button">
            Reintentar
          </button>
        </div>
      )}

      <div className="turns-homepage">
        <div className="main-turn">
          <div className="current-card">
            <div className="current-header">
              <span className="pill">
                <i className="fas fa-arrow-right"></i>
                Siguiente turno
              </span>
            </div>
            {loading ? (
              <div className="main-loading">
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid #77b8ce',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 10px auto'
                }}></div>
                <span className="main-loading-text">Cargando...</span>
              </div>
            ) : nextTurn ? (
              <>
                <div className="turn-id-big">{nextTurn.id}</div>
                <div className="turn-room-big">
                  <i className="mdi mdi-hospital-building"></i>
                  Consultorio {nextTurn.consultorio}
                </div>
                {nextTurn.area && (
                  <div className="turn-area-big">
                    <i className="mdi mdi-domain"></i>
                    {nextTurn.area}
                  </div>
                )}
              </>
            ) : (
              <div className="main-no-turn">
                <i className="mdi mdi-calendar-clock"></i>
                No hay turno siguiente
              </div>
            )}
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">
            <i className="fas fa-list-ul"></i>
            Turnos Activos
            <button
              onClick={handleRefresh}
              className="sidebar-refresh"
              disabled={loading}
              title="Actualizar lista"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
          <div className="sidebar-list">
            {loading ? (
              <div className="sidebar-loading">
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid #77b8ce',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 10px auto'
                }}></div>
                <span className="sidebar-loading-text">Cargando...</span>
              </div>
            ) : activeTurns.length > 0 ? (
              activeTurns.map((turn) => (
                <div className="sidebar-turn" key={turn.id}>
                  <div className="turn-info">
                    <span className="turn-id">#{turn.id}</span>
                    <span className="turn-room">
                      <i className="mdi mdi-hospital-building"></i>
                      Consultorio {turn.consultorio}
                    </span>
                    {turn.area && (
                      <span className="turn-area">
                        <i className="mdi mdi-domain"></i>
                        {turn.area}
                      </span>
                    )}
                  </div>
                  <div className="turn-status">
                    <span className={`status-badge ${getStatusClass(turn.estado)}`}>
                      {getStatusLabel(turn.estado)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="sidebar-empty">
                <i className="mdi mdi-calendar-remove"></i>
                No hay turnos activos
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .error-banner {
          background: #fed7d7;
          color: #c53030;
          padding: 15px 20px;
          margin: 10px 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(197, 48, 48, 0.1);
        }

        .retry-button {
          background: #c53030;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          background: #9c2626;
          transform: translateY(-1px);
        }

        .refresh-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .refresh-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .about-button {
          background: linear-gradient(135deg, #77b8ce 0%, #544e52 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-right: 12px;
        }

        .about-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(119, 184, 206, 0.3);
        }

        .brand-right {
          display: flex;
          align-items: center;
        }

        .sidebar-refresh {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          color: #4a5568;
          transition: all 0.3s ease;
          margin-left: auto;
        }

        .sidebar-refresh:hover:not(:disabled) {
          background: #edf2f7;
          color: #2d3748;
        }

        .sidebar-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .turn-area-big {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #718096;
          font-size: 0.9em;
          margin-top: 8px;
        }

        .turn-area {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #718096;
          font-size: 0.8em;
        }

        .status-attended {
          background: #48bb78;
          color: white;
        }

        .status-cancelled {
          background: #e53e3e;
          color: white;
        }

        .status-no-show {
          background: #a0aec0;
          color: white;
        }

        .main-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 40px 20px;
          color: #718096;
        }

        .sidebar-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px;
          color: #718096;
        }

        .sidebar-title {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 20px;
          background: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
          font-weight: 600;
          color: #4a5568;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;