import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import turnService from '../services/turnService';
import areaService from '../services/areaService';
import Footer from '../components/Footer';
import '../styles/TakeTurn.css';

// React Icons
import {
  FaTicketAlt,
  FaHospital,
  FaStethoscope,
  FaBaby,
  FaHeartbeat,
  FaUserMd,
  FaFemale,
  FaEye as FaEyeMed,
  FaBone,
  FaBrain,
  FaMale,
  FaFlask,
  FaProcedures,
  FaCheckCircle,
  FaArrowLeft,
  FaHome,
  FaHandPaper,
  FaClipboardList
} from 'react-icons/fa';

const TakeTurn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [areas, setAreas] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [turnResult, setTurnResult] = useState(null);
  const [countdown, setCountdown] = useState(5);

  // Función mejorada para obtener iconos desde la base de datos
  const getAreaIcon = (areaName, areaData = null) => {
    // Si tenemos datos del área desde la BD, usar esos primero
    if (areaData && areaData.s_icono && areaData.s_color) {
      const iconName = areaData.s_icono;
      const color = areaData.s_color;
      const letter = areaData.s_letra || (areaData.s_nombre_area || areaName)?.charAt(0) || 'A';
      
      // Mapear iconos de la BD a React Icons
      const iconMapping = {
        'stethoscope': FaStethoscope,
        'baby': FaBaby,
        'heartbeat': FaHeartbeat,
        'user-md': FaUserMd,
        'female': FaFemale,
        'eye': FaEyeMed,
        'bone': FaBone,
        'brain': FaBrain,
        'male': FaMale,
        'flask': FaFlask,
        'procedures': FaProcedures,
        'hospital': FaHospital,
        'hospital-building': FaHospital,
        'ambulance': FaHospital, // fallback
        'syringe': FaHospital, // fallback
        'prescription-bottle': FaHospital, // fallback
        'x-ray': FaHospital, // fallback
        'microscope': FaHospital, // fallback
        'lungs': FaHospital, // fallback
        'tooth': FaHospital, // fallback
        'head-side-cough': FaUserMd, // fallback
        'hand-holding-heart': FaHeartbeat, // fallback
        'wheelchair': FaUserMd, // fallback
        'crutch': FaUserMd, // fallback
        'thermometer': FaHospital // fallback
      };
      
      // Limpiar el nombre del icono (remover prefijos como 'mdi-', 'fa-', etc.)
      const cleanIconName = iconName.replace(/^(mdi-|fa-|fas-|far-|fab-)/, '').toLowerCase();
      const IconComponent = iconMapping[cleanIconName] || FaHospital;
      
      return {
        icon: IconComponent,
        color: color,
        letter: letter
      };
    }

    // Fallback con iconos hardcodeados por nombre del área
    const iconMap = {
      'Medicina General': { icon: FaStethoscope, color: '#4A90E2', letter: 'MG' },
      'Pediatría': { icon: FaBaby, color: '#17A2B8', letter: 'PE' },
      'Cardiología': { icon: FaHeartbeat, color: '#DC3545', letter: 'C' },
      'Dermatología': { icon: FaUserMd, color: '#FFC107', letter: 'D' },
      'Ginecología': { icon: FaFemale, color: '#E91E63', letter: 'G' },
      'Oftalmología': { icon: FaEyeMed, color: '#17A2B8', letter: 'O' },
      'Ortopedia': { icon: FaBone, color: '#795548', letter: 'OR' },
      'Psiquiatría': { icon: FaBrain, color: '#9C27B0', letter: 'PS' },
      'Neurología': { icon: FaBrain, color: '#FF5722', letter: 'N' },
      'Urología': { icon: FaMale, color: '#3F51B5', letter: 'U' },
      'Endocrinología': { icon: FaFlask, color: '#28A745', letter: 'E' },
      'Gastroenterología': { icon: FaProcedures, color: '#FFC107', letter: 'GA' }
    };

    const defaultArea = iconMap[areaName] || { 
      icon: FaHospital, 
      color: '#4A90E2', 
      letter: areaName?.charAt(0) || 'A' 
    };
    
    return defaultArea;
  };

  // Efecto para el countdown de redirección
  useEffect(() => {
    let timer;
    if (showSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showSuccess && countdown === 0) {
      // Redirigir a tomar turno después del countdown
      handleNewTurn();
    }
    return () => clearTimeout(timer);
  }, [showSuccess, countdown]);

  // Cargar áreas al montar el componente
  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      setError('');

      const areasData = await areaService.getBasics().catch(err => {
        console.warn('Error cargando áreas:', err);
        return [];
      });

      setAreas(areasData || []);

      if (areasData.length === 0) {
        setError('No hay áreas médicas configuradas en el sistema');
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArea = (area) => {
    setSelectedArea(area);
    setError('');
  };

  const handleTakeAreaTurn = async () => {
    if (!selectedArea) {
      setError('Por favor selecciona un área');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Crear turno con asignación automática en el área específica
      const result = await turnService.createTurnPublicoAuto({
        uk_area: selectedArea.uk_area
      });

      setTurnResult(result);
      setShowSuccess(true);
      setCountdown(5); // Iniciar countdown de 5 segundos

    } catch (error) {
      console.error('Error generando turno:', error);
      setError(error.response?.data?.message || 'Error al generar el turno');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    setSelectedArea(null);
    setShowSuccess(false);
    setTurnResult(null);
    setError('');
  };

  const handleNewTurn = () => {
    setSelectedArea(null);
    setShowSuccess(false);
    setTurnResult(null);
    setError('');
    setCountdown(5);
  };

  return (
    <div className="touch-hospital-container">
      {/* Header profesional estilo admin panel */}
      <header className="touch-header">
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

          {/* Title Section */}
          <div className="header-center">
            <div className="page-title-section">
              <h1 className="page-title">
                <FaHandPaper className="title-icon" />
                Tomar Turno
              </h1>
              <p className="page-subtitle">Seleccione el área médica para generar su turno</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="header-right">
            <button onClick={handleGoHome} className="home-button-touch">
              <FaHome className="home-icon" />
              <span>Inicio</span>
            </button>
          </div>
        </div>
      </header>

      <div className="touch-content">
        {/* Loading State */}
        {loading && (
          <div className="touch-loading">
            <div className="loading-circle"></div>
            <h2>Procesando solicitud...</h2>
            <p>Generando su turno, por favor espere</p>
          </div>
        )}

        {/* Success State */}
        {showSuccess && turnResult && (
          <div className="touch-success">
            <div className="success-card-compact">
              <div className="success-icon">
                <FaCheckCircle />
              </div>
              <h1>¡Turno Generado Exitosamente!</h1>
              
              <div className="turn-number-display-compact">
                <div className="turn-label">Su número de turno es:</div>
                <div className="turn-number-big">
                  {selectedArea && getAreaIcon(selectedArea.s_nombre_area, selectedArea).letter}
                  {turnResult.i_numero_turno || turnResult.numero_turno || turnResult.id || 'N/A'}
                </div>
              </div>

              {turnResult.asignacion_automatica?.consultorio_asignado && (
                <div className="assignment-info-compact">
                  <div className="info-row">
                    <div className="info-item-compact">
                      <FaHospital className="info-icon-small" />
                      <div className="info-text-compact">
                        <strong>Consultorio:</strong>
                        <span>#{turnResult.asignacion_automatica.consultorio_asignado.numero} - {turnResult.asignacion_automatica.consultorio_asignado.area}</span>
                      </div>
                    </div>
                    <div className="info-item-compact">
                      <FaClipboardList className="info-icon-small" />
                      <div className="info-text-compact">
                        <strong>En espera:</strong>
                        <span>{turnResult.asignacion_automatica.consultorio_asignado.turnos_en_espera || 0} turnos</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="redirect-info">
                <p className="redirect-message">
                  Su turno se mostrará en la pantalla de visualización de turnos
                </p>
                <div className="countdown-display">
                  <div className="countdown-circle">
                    <span className="countdown-number">{countdown}</span>
                  </div>
                  <p className="countdown-text">Redirigiendo automáticamente...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Area Confirmation */}
        {selectedArea && !loading && !showSuccess && (
          <div className="touch-confirmation">
            <div className="confirmation-card">
              <div className="back-button-container">
                <button onClick={handleGoBack} className="back-button-touch">
                  <FaArrowLeft />
                  Volver a Áreas
                </button>
              </div>

              <div className="selected-area-display">
                {(() => {
                  const areaIcon = getAreaIcon(selectedArea.s_nombre_area, selectedArea);
                  const IconComponent = areaIcon.icon;
                  return (
                    <>
                      <div
                        className="area-icon-huge"
                        style={{
                          background: `linear-gradient(135deg, ${areaIcon.color}, ${areaIcon.color}dd)`
                        }}
                      >
                        <IconComponent />
                        <div className="area-letter-huge">{areaIcon.letter}</div>
                      </div>
                      <div className="area-info-confirmation">
                        <h2 style={{ color: areaIcon.color }}>{selectedArea.s_nombre_area}</h2>
                        <p>Se asignará automáticamente el consultorio más disponible de esta área</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="confirmation-actions-touch">
                <button
                  onClick={handleTakeAreaTurn}
                  className="generate-turn-button"
                  disabled={loading}
                  style={{
                    '--area-color': selectedArea ? getAreaIcon(selectedArea.s_nombre_area, selectedArea).color : '#4A90E2'
                  }}
                >
                  {loading ? (
                    <>
                      <div className="button-spinner"></div>
                      Generando Turno...
                    </>
                  ) : (
                    <>
                      <FaTicketAlt />
                      Generar Turno en {selectedArea.s_nombre_area}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Area Selection */}
        {!selectedArea && !loading && !showSuccess && (
          <div className="touch-areas">
            {areas.length === 0 ? (
              <div className="empty-state-touch">
                <FaHospital className="empty-icon" />
                <h3>No hay áreas médicas disponibles</h3>
                <p>Actualmente no hay consultorios configurados en el sistema</p>
              </div>
            ) : (
              <>
                <div className="areas-instruction">
                  <h2>Seleccione el área médica</h2>
                  <p>Toque el área médica para la cual desea tomar un turno</p>
                </div>
                
                <div className="areas-grid-touch">
                  {areas.map(area => {
                    const areaIcon = getAreaIcon(area.s_nombre_area, area);
                    const IconComponent = areaIcon.icon;

                    return (
                      <button
                        key={area.uk_area}
                        className="area-button-touch"
                        onClick={() => handleSelectArea(area)}
                        style={{
                          '--area-color': areaIcon.color,
                          '--area-color-light': areaIcon.color + '20',
                          '--area-color-dark': areaIcon.color + 'dd'
                        }}
                      >
                        <div className="area-icon-touch">
                          <IconComponent />
                        </div>
                        <div className="area-info-touch">
                          <h3>{area.s_nombre_area}</h3>
                          <p>Consultorio automático</p>
                        </div>
                        <div className="area-badge-touch">
                          {areaIcon.letter}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="error-message-touch">
            <div className="error-content">
              <h3>⚠️ Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Estilos específicos para monitor touch hospitalario */}
      <style>{`
        /* Contenedor principal para monitor touch */
        .touch-hospital-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e6f5f9 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
        }

        /* Header profesional */
        .touch-header {
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
        }

        .page-title-section {
          text-align: center;
        }

        .page-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          font-size: 32px;
          font-weight: 700;
          color: #2d3748;
          margin: 0;
        }

        .title-icon {
          color: #4A90E2;
          font-size: 36px;
        }

        .page-subtitle {
          color: #718096;
          font-size: 16px;
          margin: 5px 0 0 0;
          font-weight: 500;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-shrink: 0;
          min-width: 200px;
          justify-content: flex-end;
        }

        .home-button-touch {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #4A90E2, #2f97d1);
          color: white;
          border: none;
          border-radius: 20px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
        }

        .home-button-touch:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(74, 144, 226, 0.4);
        }

        .home-icon {
          font-size: 18px;
        }

        /* Contenido principal */
        .touch-content {
          margin-top: 100px;
          padding: 40px 20px;
          min-height: calc(100vh - 120px);
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Estado de carga */
        .touch-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .loading-circle {
          width: 80px;
          height: 80px;
          border: 6px solid #e2e8f0;
          border-top: 6px solid #4A90E2;
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
          margin-bottom: 30px;
        }

        .touch-loading h2 {
          font-size: 28px;
          color: #2d3748;
          margin-bottom: 10px;
        }

        .touch-loading p {
          font-size: 18px;
          color: #718096;
        }

        /* Estado de éxito */
        .touch-success {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 120px);
          padding: 20px;
        }

        .success-card {
          background: white;
          border-radius: 30px;
          padding: 60px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border: 3px solid #48bb78;
          max-width: 800px;
          width: 100%;
        }

        .success-icon {
          font-size: 100px;
          color: #48bb78;
          margin-bottom: 30px;
        }

        .success-card h1 {
          font-size: 36px;
          color: #2d3748;
          margin-bottom: 40px;
          font-weight: 700;
        }

        .turn-number-display {
          margin: 40px 0;
          padding: 30px;
          background: linear-gradient(135deg, #48bb78, #38a169);
          border-radius: 20px;
          color: white;
        }

        .turn-label {
          font-size: 20px;
          margin-bottom: 15px;
          opacity: 0.9;
        }

        .turn-number-big {
          font-size: 80px;
          font-weight: 900;
          line-height: 1;
        }

        .assignment-info {
          margin: 40px 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 15px;
          text-align: left;
        }

        .info-icon {
          font-size: 24px;
          color: #4A90E2;
          flex-shrink: 0;
        }

        .info-text {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .info-text strong {
          font-size: 16px;
          color: #2d3748;
        }

        .info-text span {
          font-size: 18px;
          color: #4a5568;
        }

        .success-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 40px;
        }

        .primary-action-touch, .secondary-action-touch {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 30px;
          border: none;
          border-radius: 15px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
          justify-content: center;
        }

        .primary-action-touch {
          background: linear-gradient(135deg, #4A90E2, #2f97d1);
          color: white;
          box-shadow: 0 8px 20px rgba(74, 144, 226, 0.3);
        }

        .secondary-action-touch {
          background: #f8fafc;
          color: #4a5568;
          border: 2px solid #e2e8f0;
        }

        .primary-action-touch:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(74, 144, 226, 0.4);
        }

        .secondary-action-touch:hover {
          transform: translateY(-3px);
          background: #edf2f7;
        }

        /* Compact Success Card - Fits viewport */
        .success-card-compact {
          background: white;
          border-radius: 25px;
          padding: 30px 40px;
          text-align: center;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
          border: 3px solid #48bb78;
          max-width: 650px;
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
        }

        .success-card-compact .success-icon {
          font-size: 60px;
          color: #48bb78;
          margin-bottom: 20px;
        }

        .success-card-compact h1 {
          font-size: 28px;
          color: #2d3748;
          margin-bottom: 25px;
          font-weight: 700;
        }

        .turn-number-display-compact {
          margin: 25px 0;
          padding: 25px;
          background: linear-gradient(135deg, #48bb78, #38a169);
          border-radius: 20px;
          color: white;
        }

        .turn-number-display-compact .turn-label {
          font-size: 16px;
          margin-bottom: 10px;
          opacity: 0.9;
        }

        .turn-number-display-compact .turn-number-big {
          font-size: 64px;
          font-weight: 900;
          line-height: 1;
        }

        .assignment-info-compact {
          margin: 20px 0;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .info-item-compact {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 12px;
          text-align: left;
        }

        .info-icon-small {
          font-size: 18px;
          color: #4A90E2;
          flex-shrink: 0;
        }

        .info-text-compact {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .info-text-compact strong {
          font-size: 14px;
          color: #2d3748;
        }

        .info-text-compact span {
          font-size: 16px;
          color: #4a5568;
        }

        .redirect-info {
          margin-top: 25px;
          padding: 20px;
          background: #f0f9ff;
          border-radius: 15px;
          border: 2px solid #bfdbfe;
        }

        .redirect-message {
          font-size: 16px;
          color: #1e40af;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .countdown-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .countdown-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .countdown-number {
          color: white;
          font-size: 24px;
          font-weight: 700;
        }

        .countdown-text {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        /* Confirmación de área */
        .touch-confirmation {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
        }

        .confirmation-card {
          background: white;
          border-radius: 30px;
          padding: 50px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border: 3px solid #e2e8f0;
          max-width: 900px;
          width: 100%;
        }

        .back-button-container {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 30px;
        }

        .back-button-touch {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: #f8fafc;
          color: #4a5568;
          border: 2px solid #e2e8f0;
          border-radius: 15px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button-touch:hover {
          background: #edf2f7;
          transform: translateX(-3px);
        }

        .selected-area-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          margin: 40px 0;
        }

        .area-icon-huge {
          width: 150px;
          height: 150px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
          color: white;
          position: relative;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        }

        .area-letter-huge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background: rgba(255, 255, 255, 0.9);
          color: #2d3748;
          font-size: 24px;
          font-weight: 700;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .area-info-confirmation {
          text-align: center;
        }

        .area-info-confirmation h2 {
          font-size: 36px;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .area-info-confirmation p {
          font-size: 18px;
          color: #718096;
          line-height: 1.6;
        }

        .confirmation-actions-touch {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .generate-turn-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 25px 50px;
          background: linear-gradient(135deg, var(--area-color, #4A90E2), var(--area-color, #4A90E2)dd);
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 22px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 400px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .generate-turn-button:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        }

        .generate-turn-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Selección de áreas */
        .touch-areas {
          max-width: 1200px;
          margin: 0 auto;
        }

        .areas-instruction {
          text-align: center;
          margin-bottom: 50px;
        }

        .areas-instruction h2 {
          font-size: 36px;
          color: #2d3748;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .areas-instruction p {
          font-size: 20px;
          color: #718096;
        }

        .areas-grid-touch {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          padding: 20px 0;
        }

        .area-button-touch {
          background: white;
          border: 3px solid transparent;
          border-radius: 25px;
          padding: 40px 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          min-height: 200px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }

        .area-button-touch:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border-color: var(--area-color, #4A90E2);
          background: var(--area-color-light, #4A90E220);
        }

        .area-icon-touch {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--area-color, #4A90E2), var(--area-color-dark, #4A90E2dd));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .area-info-touch {
          text-align: center;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .area-info-touch h3 {
          font-size: 22px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .area-info-touch p {
          font-size: 16px;
          color: #718096;
          font-weight: 500;
        }

        .area-badge-touch {
          position: absolute;
          top: 15px;
          right: 15px;
          background: var(--area-color, #4A90E2);
          color: white;
          font-size: 14px;
          font-weight: 700;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        /* Estado vacío */
        .empty-state-touch {
          text-align: center;
          padding: 80px 20px;
          color: #718096;
        }

        .empty-icon {
          font-size: 120px;
          color: #4A90E2;
          margin-bottom: 30px;
          opacity: 0.7;
        }

        .empty-state-touch h3 {
          font-size: 28px;
          color: #2d3748;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .empty-state-touch p {
          font-size: 18px;
          color: #718096;
        }

        /* Mensaje de error */
        .error-message-touch {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          max-width: 600px;
          width: 90%;
        }

        .error-content {
          background: #fed7d7;
          color: #c53030;
          padding: 20px 30px;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(197, 48, 48, 0.2);
          border: 2px solid #feb2b2;
        }

        .error-content h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
        }

        .error-content p {
          margin: 0;
          font-size: 16px;
        }

        /* Animaciones */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive design */
        @media (max-width: 1200px) {
          .areas-grid-touch {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
          }
          
          .confirmation-card, .success-card {
            padding: 40px 30px;
          }
        }

        @media (max-width: 768px) {
          .touch-header {
            height: auto;
            min-height: 120px;
          }
          
          .header-content {
            flex-direction: column;
            padding: 10px;
            gap: 10px;
          }
          
          .header-logo-section {
            min-width: auto;
          }
          
          .touch-content {
            margin-top: 140px;
          }
          
          .areas-grid-touch {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .area-button-touch {
            padding: 30px 20px;
            min-height: 160px;
          }
          
          .page-title {
            font-size: 24px;
          }
          
          .areas-instruction h2 {
            font-size: 28px;
          }
          
          .success-actions {
            flex-direction: column;
            gap: 15px;
          }
          
          .generate-turn-button {
            min-width: 300px;
            padding: 20px 30px;
            font-size: 18px;
          }
          
          .turn-number-big {
            font-size: 60px;
          }
          
          .success-card h1 {
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .touch-content {
            padding: 20px 15px;
          }
          
          .confirmation-card, .success-card {
            padding: 30px 20px;
          }
          
          .area-icon-huge {
            width: 120px;
            height: 120px;
            font-size: 48px;
          }
          
          .area-info-confirmation h2 {
            font-size: 28px;
          }
        }
      `}</style>
      
      <Footer />
    </div>
  );
};

export default TakeTurn;