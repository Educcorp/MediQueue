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
      {/* Header profesional estilo admin panel */}
      <header className="public-header">
        <div className="header-content">
          {/* Logo Section */}
          <div className="header-logo-section">
            <img
              src="/images/mediqueue_logo.png"
              alt="MediQueue Logo"
              className="header-logo-image"
            />
            <span className="header-title">MediQueue®</span>
          </div>

          {/* Area Selector Section */}
          <div className="header-center">
            <div className="area-selector-header">
             
              <div className="area-selector-container">
                {areasLoading ? (
                  <div className="selector-loading">
                    <div className="loading-spinner"></div>
                    <span>Cargando áreas...</span>
                  </div>
                ) : (
                  <select
                    className="area-selector-dropdown"
                    value={selectedArea || ''}
                    onChange={(e) => setSelectedArea(e.target.value || null)}
                  >
                    <option value="">Seleccionar área médica</option>
                    {areas.map((area) => (
                      <option 
                        key={area.uk_area || area.id} 
                        value={area.uk_area || area.id}
                      >
                        {area.s_letra || area.s_nombre_area?.charAt(0) || 'A'} - {area.s_nombre_area || area.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="header-right">
            <div className="hospital-badge">
              <FaHospital className="hospital-icon" />
              <span>Monitor Hospitalario</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mensaje de error */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={handleRefresh} className="retry-button">
            Reintentar
          </button>
        </div>
      )}

      {/* Vista principal de turnos - Diseño para monitor hospitalario */}
      {selectedArea ? (
        <div className="hospital-monitor-display">
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
              <div className="monitor-layout">
                {/* Panel principal expandido */}
                <div className="monitor-main-panel" 
                  style={{ 
                    '--area-color': areaColor,
                    '--area-color-light': areaColor + '20',
                    '--area-color-gradient': `linear-gradient(135deg, ${areaColor}, ${areaColor}dd)`
                  }}>
                  <div className="monitor-header">
                    <div className="area-display">
                      <div className="area-icon-large" style={{ 
                        background: `linear-gradient(135deg, ${areaColor}, ${areaColor}dd)`,
                        color: 'white'
                      }}>
                        <AreaIconComponent />
                      </div>
                      <div className="area-title">
                        <h1 style={{ color: areaColor }}>
                          {areaName}
                        </h1>
                        <p className="area-subtitle">Turnos en tiempo real</p>
                      </div>
                    </div>
                    <div className="monitor-status">
                      <div className="live-indicator">
                        <div className="pulse-dot"></div>
                        <span>EN VIVO</span>
                      </div>
                      <div className="area-badge-large" style={{ 
                        background: areaColor,
                        color: 'white'
                      }}>
                        {areaLetter}
                      </div>
                    </div>
                  </div>
                  
                  <div className="monitor-content">
                    {!nextForArea ? (
                      <div className="monitor-empty-state">
                        <div className="empty-icon-large" style={{ color: areaColor }}>
                          <i className="mdi mdi-clock-outline"></i>
                        </div>
                        <h2>No hay turnos en espera</h2>
                        <p>Todos los turnos han sido atendidos en esta área</p>
                      </div>
                    ) : (
                      <div className="monitor-current-turn">
                        <div className="current-turn-header">
                          <h2>PRÓXIMO TURNO</h2>
                        </div>
                        <div className="turn-display-container">
                          <div className="turn-display-large" style={{ 
                            background: `linear-gradient(135deg, ${areaColor}, ${areaColor}dd)`,
                            boxShadow: `0 20px 40px ${areaColor}40`
                          }}>
                            <div className="turn-number-huge">
                              <span className="area-letter-huge">{areaLetter}</span>
                              <span className="number-huge">{nextForArea.i_numero_turno || nextForArea.id}</span>
                            </div>
                          </div>
                          <div className="turn-info-large">
                            <div className="info-item-large">
                              <i className="mdi mdi-hospital-building" style={{ color: areaColor }}></i>
                              <span>Consultorio {nextForArea.i_numero_consultorio || nextForArea.consultorio}</span>
                            </div>
                            <div className="status-display-large" style={{ 
                              background: (nextForArea.s_estado || nextForArea.estado) === 'LLAMANDO' 
                                ? '#FF6B35' : areaColor,
                              color: 'white'
                            }}>
                              {(nextForArea.s_estado || nextForArea.estado) === 'LLAMANDO' ? 
                                <><i className="mdi mdi-bell-ring"></i> LLAMANDO AHORA</> : 
                                <><i className="mdi mdi-clock"></i> EN ESPERA</>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel lateral mejorado */}
                <div className="monitor-sidebar">
                  <div className="sidebar-header">
                    <h3>
                      <i className="mdi mdi-format-list-bulleted" style={{ color: areaColor }}></i>
                      Cola de Turnos
                    </h3>
                    <div className="turns-counter" style={{ 
                      background: areaColor + '20',
                      color: areaColor 
                    }}>
                      {turnsArea.length} en espera
                    </div>
                  </div>
                  <div className="sidebar-content">
                    {turnsArea.length === 0 ? (
                      <div className="sidebar-empty-state">
                        <i className="mdi mdi-calendar-check" style={{ color: areaColor }}></i>
                        <p>No hay turnos activos</p>
                      </div>
                    ) : (
                      <div className="turns-queue">
                        {turnsArea.sort(sortByNum).map((t, idx) => {
                          const isNext = nextForArea && (nextForArea.i_numero_turno || nextForArea.id) === (t.i_numero_turno || t.id);
                          const isCalling = (t.s_estado || t.estado) === 'LLAMANDO';
                          
                          return (
                            <div 
                              className={`queue-item ${isNext ? 'next' : ''} ${isCalling ? 'calling' : ''}`}
                              key={idx}
                              style={{ 
                                '--area-color': areaColor,
                                borderLeft: isNext ? `6px solid ${areaColor}` : 'none'
                              }}
                            >
                              <div className="queue-number" style={{ 
                                background: isNext ? areaColor : areaColor + '20',
                                color: isNext ? 'white' : areaColor
                              }}>
                                {areaLetter}{t.i_numero_turno || t.id}
                              </div>
                              <div className="queue-info-right">
                                <div className="consultorio-info">
                                  <i className="mdi mdi-hospital-building"></i>
                                  Consultorio {t.i_numero_consultorio || t.consultorio}
                                </div>
                                <div className={`queue-status ${isCalling ? 'calling' : 'waiting'}`}>
                                  {isCalling ? 
                                    <><i className="mdi mdi-bell-ring"></i> Llamando</> : 
                                    <><i className="mdi mdi-clock-outline"></i> En espera</>
                                  }
                                </div>
                              </div>
                              {isCalling && (
                                <div className="calling-indicator">
                                  <div className="pulse-ring-small" style={{ borderColor: '#FF6B35' }}></div>
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
      ) : (
        <div className="area-selection-prompt">
          <div className="prompt-content">
            <FaHospital className="prompt-icon" />
            <h2>Seleccione un área médica</h2>
            <p>Use el selector en el encabezado para ver los turnos de un área específica</p>
          </div>
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
        /* Header profesional estilo admin panel */
        .error-banner {
          background: #fed7d7;
          color: #c53030;
          padding: 15px 20px;
          margin: 100px 20px 10px 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(197, 48, 48, 0.1);
          position: relative;
          z-index: 999;
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

        .public-header {
          background: rgba(255, 255, 255, 0.95);
          color: #4a5568;
          padding: 12px 40px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 80px;
          z-index: 1000;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          box-sizing: border-box;
          display: flex;
          align-items: center;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          min-height: 56px;
          box-sizing: border-box;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-logo-section {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          flex-shrink: 0;
          min-width: 200px;
          cursor: pointer;
        }

        .header-logo-image {
          width: 122px;
          height: 122px;
          object-fit: contain;
          flex-shrink: 0;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          z-index: 25;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .header-title {
          color: #4a5568;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.5px;
          margin-left: 130px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .header-center {
          display: flex;
          flex: 1;
          justify-content: center;
          align-items: center;
          max-width: 600px;
        }

        .area-selector-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .selector-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .selector-icon {
          color: #4A90E2;
          font-size: 24px;
        }

        .area-selector-container {
          width: 100%;
          max-width: 400px;
        }

        .area-selector-dropdown {
          width: 100%;
          padding: 12px 20px;
          font-size: 16px;
          font-weight: 500;
          border: 2px solid #4A90E2;
          border-radius: 12px;
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          color: #2d3748;
          outline: none;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
        }

        .area-selector-dropdown:focus {
          border-color: #2f97d1;
          box-shadow: 0 0 0 3px rgba(47, 151, 209, 0.1);
          transform: translateY(-1px);
        }

        .area-selector-dropdown:hover {
          border-color: #2f97d1;
          transform: translateY(-1px);
        }

        .selector-loading {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #718096;
          font-weight: 500;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-top: 2px solid #4A90E2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-shrink: 0;
          min-width: 200px;
          justify-content: flex-end;
        }

        .hospital-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #4A90E2, #2f97d1);
          color: white;
          border-radius: 20px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
        }

        .hospital-icon {
          font-size: 18px;
        }

        /* Monitor hospitalario layout */
        .hospital-monitor-display {
          margin-top: 100px;
          padding: 20px;
          min-height: calc(100vh - 120px);
          background: linear-gradient(135deg, #f8fafc 0%, #e6f5f9 100%);
        }

        .monitor-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 30px;
          max-width: 1600px;
          margin: 0 auto;
          height: calc(100vh - 140px);
        }

        .monitor-main-panel {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 3px solid var(--area-color, #4A90E2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--area-color-light, #4A90E220);
        }

        .area-display {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .area-icon-large {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .area-title h1 {
          font-size: 42px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -1px;
        }

        .area-subtitle {
          font-size: 18px;
          color: #718096;
          margin: 5px 0 0 0;
          font-weight: 500;
        }

        .monitor-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 15px;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #48bb78;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .area-badge-large {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .monitor-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .monitor-empty-state {
          text-align: center;
          color: #718096;
        }

        .empty-icon-large {
          font-size: 120px;
          margin-bottom: 30px;
          opacity: 0.6;
        }

        .monitor-empty-state h2 {
          font-size: 36px;
          margin-bottom: 15px;
          color: #4a5568;
        }

        .monitor-empty-state p {
          font-size: 20px;
          color: #718096;
        }

        .monitor-current-turn {
          text-align: center;
          width: 100%;
        }

        .current-turn-header h2 {
          font-size: 32px;
          color: #2d3748;
          margin-bottom: 40px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .turn-display-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 60px;
          flex-wrap: wrap;
        }

        .turn-display-large {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: white;
          flex-shrink: 0;
        }

        .turn-number-huge {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }

        .area-letter-huge {
          font-size: 48px;
          font-weight: 700;
          opacity: 0.8;
          margin-bottom: -10px;
        }

        .number-huge {
          font-size: 120px;
          font-weight: 900;
          line-height: 1;
        }

        .turn-info-large {
          display: flex;
          flex-direction: column;
          gap: 30px;
          align-items: flex-start;
          min-width: 300px;
        }

        .info-item-large {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 600;
          color: #4a5568;
        }

        .info-item-large i {
          font-size: 28px;
        }

        .status-display-large {
          padding: 15px 30px;
          border-radius: 25px;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .status-display-large i {
          font-size: 24px;
        }

        /* Sidebar para monitor */
        .monitor-sidebar {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 2px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-header {
          background: linear-gradient(135deg, #f8fafc, #e6f5f9);
          padding: 25px;
          border-bottom: 2px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-header h3 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          color: #2d3748;
          margin: 0;
        }

        .sidebar-header i {
          font-size: 24px;
        }

        .turns-counter {
          padding: 8px 16px;
          border-radius: 15px;
          font-weight: 600;
          font-size: 14px;
        }

        .sidebar-content {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-empty-state {
          text-align: center;
          color: #718096;
          padding: 40px 20px;
        }

        .sidebar-empty-state i {
          font-size: 60px;
          margin-bottom: 20px;
          opacity: 0.6;
        }

        .sidebar-empty-state p {
          font-size: 18px;
        }

        .turns-queue {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 100%;
          overflow: visible;
        }

        .queue-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          background: #f8fafc;
          border-radius: 15px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          min-height: 80px;
        }

        .queue-item.next {
          background: var(--area-color-light, #4A90E220);
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .queue-item.calling {
          background: #fff5f5;
          border-color: #FF6B35;
          animation: calling-pulse 2s infinite;
        }

        .queue-number {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .queue-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .queue-info-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          gap: 8px;
          padding-left: 15px;
        }

        .consultorio-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #4a5568;
          font-size: 16px;
        }

        .queue-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .queue-status.calling {
          color: #FF6B35;
          font-weight: 700;
        }

        .queue-status.waiting {
          color: #718096;
        }

        .calling-indicator {
          position: relative;
        }

        .pulse-ring-small {
          width: 20px;
          height: 20px;
          border: 2px solid;
          border-radius: 50%;
          animation: pulse-ring 2s infinite;
        }

        /* Prompt de selección */
        .area-selection-prompt {
          margin-top: 100px;
          padding: 60px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 180px);
        }

        .prompt-content {
          text-align: center;
          color: #718096;
        }

        .prompt-icon {
          font-size: 120px;
          color: #4A90E2;
          margin-bottom: 30px;
          opacity: 0.7;
        }

        .prompt-content h2 {
          font-size: 36px;
          color: #2d3748;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .prompt-content p {
          font-size: 20px;
          color: #718096;
        }

        /* Animaciones */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes calling-pulse {
          0%, 100% {
            background: #fff5f5;
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4);
          }
          50% {
            background: #fed7d7;
            box-shadow: 0 0 0 10px rgba(255, 107, 53, 0);
          }
        }

        /* Responsive design */
        @media (max-width: 1200px) {
          .monitor-layout {
            grid-template-columns: 1fr;
            gap: 20px;
            height: auto;
          }
          
          .monitor-sidebar {
            order: -1;
            max-height: 400px;
          }
          
          .queue-item {
            padding: 12px 15px;
            min-height: 70px;
          }
          
          .queue-number {
            width: 50px;
            height: 50px;
            font-size: 16px;
          }
          
          .turn-display-container {
            gap: 40px;
          }
          
          .turn-display-large {
            width: 250px;
            height: 250px;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            height: auto;
            padding: 10px;
          }
          
          .public-header {
            height: auto;
            min-height: 120px;
          }
          
          .header-logo-section {
            min-width: auto;
          }
          
          .header-center {
            max-width: 100%;
            margin: 10px 0;
          }
          
          .hospital-monitor-display {
            margin-top: 140px;
          }
          
          .area-title h1 {
            font-size: 28px;
          }
          
          .turn-display-large {
            width: 200px;
            height: 200px;
          }
          
          .turn-display-container {
            flex-direction: column;
            gap: 30px;
          }
          
          .turn-info-large {
            align-items: center;
            min-width: auto;
          }

          .number-huge {
            font-size: 80px;
          }          .queue-item {
            padding: 10px 12px;
            min-height: 60px;
            gap: 12px;
          }
          
          .queue-number {
            width: 45px;
            height: 45px;
            font-size: 14px;
          }
          
          .consultorio-info {
            font-size: 14px;
          }
          
          .queue-status {
            font-size: 12px;
          }
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