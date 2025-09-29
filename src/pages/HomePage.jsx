import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import turnService from '../services/turnService';
import areaService from '../services/areaService';
import consultorioService from '../services/consultorioService';
import Footer from '../components/Footer';
import '../styles/HomePage.css';
import '../styles/UnifiedAdminPages.css';

// React Icons imports
import {
  FaStethoscope, FaBaby, FaHeartbeat, FaUserMd, FaFemale, FaEye, 
  FaBone, FaBrain, FaMale, FaFlask, FaProcedures, FaDoorOpen,
  FaHospital, FaAmbulance, FaSyringe, FaPrescriptionBottle, 
  FaXRay, FaMicroscope, FaLungs, FaTooth, FaHandHoldingHeart,
  FaWheelchair, FaCrutch, FaThermometer, FaHeadSideCough, FaVials
} from 'react-icons/fa';

const HomePage = () => {
  const [nextTurn, setNextTurn] = useState(null);
  const [activeTurns, setActiveTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHeader] = useState(true);
  const navigate = useNavigate();
  const SHOW_TURNS_ON_HOME = false;
  const [areas, setAreas] = useState([]);
  const [areasLoading, setAreasLoading] = useState(true);
  const [areasError, setAreasError] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [consultoriosArea, setConsultoriosArea] = useState([]);

  // Función para mapear nombres de React Icons a componentes
  const getIconComponent = (iconName) => {
    const iconMap = {
      'FaStethoscope': FaStethoscope,
      'FaBaby': FaBaby,
      'FaHeartbeat': FaHeartbeat,
      'FaUserMd': FaUserMd,
      'FaFemale': FaFemale,
      'FaEye': FaEye,
      'FaBone': FaBone,
      'FaBrain': FaBrain,
      'FaMale': FaMale,
      'FaFlask': FaFlask,
      'FaProcedures': FaProcedures,
      'FaDoorOpen': FaDoorOpen,
      'FaHospital': FaHospital,
      'FaAmbulance': FaAmbulance,
      'FaSyringe': FaSyringe,
      'FaPrescriptionBottle': FaPrescriptionBottle,
      'FaXRay': FaXRay,
      'FaMicroscope': FaMicroscope,
      'FaLungs': FaLungs,
      'FaTooth': FaTooth,
      'FaHandHoldingHeart': FaHandHoldingHeart,
      'FaWheelchair': FaWheelchair,
      'FaCrutch': FaCrutch,
      'FaThermometer': FaThermometer,
      'FaHeadSideCough': FaHeadSideCough,
      'FaVials': FaVials
    };
    return iconMap[iconName] || FaHospital; // Fallback a hospital si no se encuentra
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (!SHOW_TURNS_ON_HOME) {
      return;
    }
    loadTurnsData();

    // Configurar actualización automática cada 30 segundos
    const interval = setInterval(loadTurnsData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Cargar áreas para selección en homepage
  useEffect(() => {
    const loadAreas = async () => {
      try {
        setAreasLoading(true);
        setAreasError('');
        // Usar endpoint público para evitar 401
        const data = await areaService.getBasics();
        setAreas(data || []);
        if ((data || []).length > 0) {
          const firstId = data[0].uk_area || data[0].id;
          setSelectedArea(firstId);
        }
      } catch (e) {
        console.warn('Error cargando áreas:', e);
        setAreasError('No se pudieron cargar las áreas');
      } finally {
        setAreasLoading(false);
      }
    };
    loadAreas();
  }, []);

  // Cargar consultorios de la área seleccionada (público)
  useEffect(() => {
    const loadConsultoriosByArea = async () => {
      if (!selectedArea) return;
      try {
        const data = await consultorioService.getBasicsByArea(selectedArea);
        setConsultoriosArea(data || []);
      } catch (e) {
        console.warn('Error cargando consultorios por área:', e);
        setConsultoriosArea([]);
      }
    };
    loadConsultoriosByArea();
  }, [selectedArea]);

  // Cargar turnos públicos activos de forma periódica, independiente del layout clásico
  useEffect(() => {
    const loadPublicTurns = async () => {
      try {
        const data = await turnService.getActiveTurns();
        setActiveTurns(data || []);
      } catch (_) { }
    };
    loadPublicTurns();
    const interval = setInterval(loadPublicTurns, 30000);
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
        <div className="admin-container" style={{ marginTop: 20 }}>
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="page-header-icon"><i className="mdi mdi-hospital-building"></i></div>
              <div className="page-header-content">
                <h1 className="page-title">MediQueue</h1>
                <p className="page-subtitle">Tu turno, sin filas</p>
              </div>
            </div>
            <div className="page-actions">
              <button onClick={handleRefresh} className="btn btn-primary" disabled={loading} title="Actualizar información">
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

      {/* Pestañas de áreas modernas con iconos y colores dinámicos */}
      <div className="areas-section">
        <div className="modern-areas-grid" style={{ '--areas-count': areas.length > 0 ? areas.length : 7 }}>
          {areasLoading ? (
            Array.from({ length: 7 }).map((_, idx) => (
              <div key={`sk-${idx}`} className="area-card skeleton">
                <div className="area-card-icon skeleton-icon"></div>
                <div className="area-card-content">
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text-sm"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              {areas.map((area) => {
                const isActive = (area.uk_area || area.id) === selectedArea;
                const areaColor = area.s_color || '#4A90E2';
                const areaIcon = area.s_icono || 'FaHospital';
                const areaLetter = area.s_letra || area.s_nombre_area?.charAt(0) || 'A';
                
                // Obtener el componente de icono
                const IconComponent = getIconComponent(areaIcon);
                
                return (
                  <button
                    key={area.uk_area || area.id}
                    className={`modern-area-card${isActive ? ' active' : ''}`}
                    onClick={() => setSelectedArea(area.uk_area || area.id)}
                    title={`Ver consultorios de ${area.s_nombre_area || area.nombre}`}
                    style={{
                      '--area-color': areaColor,
                      '--area-color-light': areaColor + '20',
                      '--area-color-hover': areaColor + '10'
                    }}
                  >
                    <div className="area-card-icon" style={{ 
                      background: isActive 
                        ? `linear-gradient(135deg, ${areaColor}, ${areaColor}dd)` 
                        : `linear-gradient(135deg, ${areaColor}33, ${areaColor}20)`,
                      color: isActive ? 'white' : areaColor,
                      boxShadow: isActive ? `0 8px 20px ${areaColor}40` : 'none'
                    }}>
                      <IconComponent />
                      <div className="area-letter">{areaLetter}</div>
                    </div>
                    <div className="area-card-content">
                      <h3 style={{ color: isActive ? areaColor : '#2D3748' }}>
                        {area.s_nombre_area || area.nombre}
                      </h3>
                      <p className="area-status">
                        <i className="mdi mdi-circle-outline"></i>
                        Consultorios activos
                      </p>
                    </div>
                    <div className="area-card-badge" style={{ 
                      background: areaColor,
                      opacity: isActive ? 1 : 0.7 
                    }}>
                      {areaLetter}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
        {selectedArea && (
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-secondary" onClick={() => setSelectedArea(null)}>
              <i className="mdi mdi-arrow-left"></i>
              Volver
            </button>
          </div>
        )}
        {areasError && !areasLoading && (<div className="areas-empty">{areasError}</div>)}
      </div>

      {/* Vista por área seleccionada: próximo turno y lista de turnos del área */}
      {selectedArea && (
        <div className="consultorios-section">
          {(() => {
            const areaObj = (areas || []).find(a => (a.uk_area || a.id) === selectedArea);
            const areaName = areaObj?.s_nombre_area || areaObj?.nombre || '';
            const areaColor = areaObj?.s_color || '#4A90E2';
            const areaIcon = areaObj?.s_icono || 'FaHospital';
            const areaLetter = areaObj?.s_letra || areaName?.charAt(0) || 'A';
            const turnsArea = (activeTurns || []).filter(t => (t.s_nombre_area || t.area) === areaName);
            
            // Obtener el componente de icono para esta área
            const AreaIconComponent = getIconComponent(areaIcon);

            // determinar próximo turno del área: 1) LLAMANDO; 2) EN_ESPERA por número
            const calling = turnsArea.filter(t => (t.s_estado || t.estado) === 'LLAMANDO');
            const waiting = turnsArea.filter(t => (t.s_estado || t.estado) === 'EN_ESPERA');
            const sortByNum = (a, b) => (a.i_numero_turno || a.id || 0) - (b.i_numero_turno || b.id || 0);
            const nextForArea = (calling.sort(sortByNum)[0]) || (waiting.sort(sortByNum)[0]) || null;

            return (
              <div className="modern-panels-grid">
                {/* Panel principal: Próximo turno */}
                <div className="modern-next-turn-card" 
                  style={{ 
                    '--area-color': areaColor,
                    '--area-color-light': areaColor + '20',
                    '--area-color-gradient': `linear-gradient(135deg, ${areaColor}, ${areaColor}dd)`
                  }}>
                  <div className="modern-card-header">
                    <div className="area-info">
                      <div className="area-icon" style={{ 
                        background: `linear-gradient(135deg, ${areaColor}, ${areaColor}dd)`,
                        color: 'white'
                      }}>
                        <AreaIconComponent />
                      </div>
                      <div className="area-details">
                        <h3 style={{ color: areaColor }}>
                          <i className="mdi mdi-arrow-right-bold"></i>
                          {areaName}
                        </h3>
                        <p>Próximo en atención</p>
                      </div>
                    </div>
                    <div className="area-letter-badge" style={{ 
                      background: areaColor,
                      color: 'white'
                    }}>
                      {areaLetter}
                    </div>
                  </div>
                  
                  <div className="modern-card-content">
                    {!nextForArea ? (
                      <div className="modern-empty-state">
                        <div className="empty-icon" style={{ color: areaColor }}>
                          <i className="mdi mdi-clock-outline"></i>
                        </div>
                        <h4>No hay turnos en espera</h4>
                        <p>Todos los turnos han sido atendidos</p>
                      </div>
                    ) : (
                      <div className="modern-next-turn">
                        <div className="turn-number" style={{ 
                          background: `linear-gradient(135deg, ${areaColor}, ${areaColor}dd)`,
                          boxShadow: `0 10px 30px ${areaColor}40`
                        }}>
                          <div className="number">{areaLetter}{nextForArea.i_numero_turno || nextForArea.id}</div>
                          <div className="pulse" style={{ background: areaColor }}></div>
                        </div>
                        <div className="turn-details">
                          <div className="detail-item">
                            <i className="mdi mdi-hospital-building" style={{ color: areaColor }}></i>
                            <span>Consultorio {nextForArea.i_numero_consultorio || nextForArea.consultorio}</span>
                          </div>
                          <div className="detail-item">
                            <i className="mdi mdi-account-outline" style={{ color: areaColor }}></i>
                            <span>Paciente en atención</span>
                          </div>
                          <div className="status-indicator" style={{ 
                            background: (nextForArea.s_estado || nextForArea.estado) === 'LLAMANDO' 
                              ? '#FF6B35' : areaColor,
                            color: 'white'
                          }}>
                            {(nextForArea.s_estado || nextForArea.estado) === 'LLAMANDO' ? 
                              <><i className="mdi mdi-bell-ring"></i> Llamando</> : 
                              <><i className="mdi mdi-clock"></i> En espera</>
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel lateral: Lista de turnos activos */}
                <div className="modern-turns-list-card">
                  <div className="modern-card-header">
                    <h4>
                      <i className="mdi mdi-format-list-bulleted" style={{ color: areaColor }}></i>
                      Turnos Activos
                    </h4>
                    <div className="turns-count" style={{ 
                      background: areaColor + '20',
                      color: areaColor 
                    }}>
                      {turnsArea.length}
                    </div>
                  </div>
                  <div className="modern-card-content">
                    {turnsArea.length === 0 ? (
                      <div className="modern-empty-state-small">
                        <i className="mdi mdi-calendar-check" style={{ color: areaColor }}></i>
                        <p>No hay turnos activos</p>
                      </div>
                    ) : (
                      <div className="modern-turns-list">
                        {turnsArea.sort(sortByNum).map((t, idx) => {
                          const isNext = nextForArea && (nextForArea.i_numero_turno || nextForArea.id) === (t.i_numero_turno || t.id);
                          const isCalling = (t.s_estado || t.estado) === 'LLAMANDO';
                          
                          return (
                            <div 
                              className={`modern-turn-item ${isNext ? 'next' : ''} ${isCalling ? 'calling' : ''}`}
                              key={idx}
                              style={{ 
                                '--area-color': areaColor,
                                borderLeft: isNext ? `4px solid ${areaColor}` : 'none'
                              }}
                            >
                              <div className="turn-number-small" style={{ 
                                background: isNext ? areaColor : areaColor + '20',
                                color: isNext ? 'white' : areaColor
                              }}>
                                {areaLetter}{t.i_numero_turno || t.id}
                              </div>
                              <div className="turn-info-small">
                                <div className="consultorio">
                                  <i className="mdi mdi-hospital-building"></i>
                                  Consultorio {t.i_numero_consultorio || t.consultorio}
                                </div>
                                <div className={`status ${isCalling ? 'calling' : 'waiting'}`}>
                                  {isCalling ? 
                                    <><i className="mdi mdi-bell-ring"></i> Llamando</> : 
                                    <><i className="mdi mdi-clock-outline"></i> En espera</>
                                  }
                                </div>
                              </div>
                              {isCalling && (
                                <div className="calling-animation">
                                  <div className="pulse-ring" style={{ borderColor: '#FF6B35' }}></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {SHOW_TURNS_ON_HOME && (
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
      )}

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
      <style>{`
        .areas-section {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        /* Tabs responsivas en UNA sola línea */
        .areas-tabs {
          display: flex;
          flex-wrap: nowrap;
          gap: 12px;
          padding: 8px 4px 18px 4px;
          width: 100%;
        }
        .area-tab {
          background: #ffffff;
          border: 2px solid #2d3748;
          border-radius: 12px;
          min-height: clamp(42px, calc(90px - (var(--areas-count,7) * 4px)), 90px);
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.2s ease, background 0.2s ease;
          text-align: center;
        }
        .area-tab.active { background: #f0f7fa; border-color: #256b80; }
        .area-tab:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .area-tab.skeleton { background: linear-gradient(90deg, #f2f2f2, #e9e9e9, #f2f2f2); background-size: 200% 100%; animation: shine 1.2s linear infinite; }
        .area-tab-text { font-weight: 600; color: #2d3748; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 6px; }
        @keyframes shine { 0%{background-position: 200% 0} 100%{background-position: -200% 0} }
        .areas-loading, .areas-empty {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #718096;
          padding: 20px;
        }

        /* Paneles de consultorios */
        .consultorios-section { max-width: 1200px; margin: 0 auto; padding: 8px 20px 28px 20px; }
        .big-panel { border: 3px solid #1a202c; border-radius: 32px; min-height: 55vh; padding: 18px; background: #fff; }
        .panels-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .small-panel { border: 3px solid #1a202c; border-radius: 28px; min-height: 42vh; padding: 16px; background: #fff; }
        .panel-header { font-weight: 800; color: #1a202c; margin-bottom: 8px; }
        .panel-body { height: 100%; display: flex; align-items: center; justify-content: center; }
        .turns-list { list-style: none; padding: 0; margin: 0; width: 100%; }
        .turn-item { padding: 10px 12px; border-bottom: 1px dashed #e2e8f0; font-weight: 700; color: #2d3748; }
        .panel-empty { color: #718096; }
      `}</style>
      
      <Footer />
    </div>
  );
};

export default HomePage;