import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import turnService from '../services/turnService';
import areaService from '../services/areaService';
import { generateTurnTicket } from '../services/ticketService';
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
  FaClipboardList,
  FaTooth,
  FaSyringe
} from 'react-icons/fa';

const TakeTurn = () => {
  const { t } = useTranslation(['takeTurn', 'common']);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCooldownError, setIsCooldownError] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areas, setAreas] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [turnResult, setTurnResult] = useState(null);
  const [countdown, setCountdown] = useState(5);

  // Función mejorada para obtener iconos desde la base de datos
  const getAreaIcon = (areaName, areaData = null) => {
    console.log('getAreaIcon llamada con:', { areaName, areaData });

    // Si tenemos datos del área desde la BD, usar esos primero
    if (areaData && areaData.s_icono && areaData.s_color) {
      const iconName = areaData.s_icono;
      const color = areaData.s_color;
      const letter = areaData.s_letra || (areaData.s_nombre_area || areaName)?.charAt(0) || 'A';

      console.log('Usando datos de BD:', { iconName, color, letter });

      // Mapear iconos de la BD a React Icons (nombres más comunes en Material Design)
      const iconMapping = {
        // React Icons FontAwesome directos (nombres exactos de la BD)
        'FaTooth': FaTooth,
        'FaFemale': FaFemale,
        'FaFlask': FaFlask,
        'FaBrain': FaBrain,
        'FaBaby': FaBaby,
        'FaSyringe': FaSyringe,
        'FaStethoscope': FaStethoscope,
        'FaHeartbeat': FaHeartbeat,
        'FaUserMd': FaUserMd,
        'FaEye': FaEyeMed,
        'FaBone': FaBone,
        'FaMale': FaMale,
        'FaProcedures': FaProcedures,
        'FaHospital': FaHospital,

        // Material Design Icons (sin prefijo mdi-)
        'stethoscope': FaStethoscope,
        'baby': FaBaby,
        'baby-face': FaBaby,
        'baby-face-outline': FaBaby,
        'heart': FaHeartbeat,
        'heart-pulse': FaHeartbeat,
        'heartbeat': FaHeartbeat,
        'doctor': FaUserMd,
        'account-tie': FaUserMd,
        'human-male-female': FaUserMd,
        'gender-female': FaFemale,
        'human-female': FaFemale,
        'eye': FaEyeMed,
        'eye-outline': FaEyeMed,
        'bone': FaBone,
        'brain': FaBrain,
        'human-male': FaMale,
        'test-tube': FaFlask,
        'flask': FaFlask,
        'flask-outline': FaFlask,
        'stomach': FaProcedures,
        'hospital': FaHospital,
        'hospital-building': FaHospital,
        'hospital-box': FaHospital,
        'hospital-marker': FaHospital,
        'needle': FaSyringe,
        'syringe': FaSyringe,
        'pill': FaHospital,
        'medication': FaHospital,
        'tooth': FaTooth,
        'tooth-outline': FaTooth,
        'virus': FaUserMd,
        'virus-outline': FaUserMd,
        'shield-cross': FaHospital,
        'medical-bag': FaHospital,
        'wheelchair-accessibility': FaUserMd,
        'thermometer': FaHospital,

        // FontAwesome icons (con y sin prefijo fa-)
        'fa-stethoscope': FaStethoscope,
        'fa-baby': FaBaby,
        'fa-heartbeat': FaHeartbeat,
        'fa-user-md': FaUserMd,
        'fa-female': FaFemale,
        'fa-eye': FaEyeMed,
        'fa-bone': FaBone,
        'fa-brain': FaBrain,
        'fa-male': FaMale,
        'fa-flask': FaFlask,
        'fa-procedures': FaProcedures,
        'fa-hospital': FaHospital,
        'fa-tooth': FaTooth,
        'fa-syringe': FaSyringe
      };

      // Limpiar el nombre del icono (remover prefijos como 'mdi-', 'fa-', etc.)
      const cleanIconName = iconName.replace(/^(mdi-|fa-|fas-|far-|fab-)/, '').toLowerCase();

      // Buscar el icono primero por nombre exacto, luego por nombre limpio
      const IconComponent = iconMapping[iconName] || iconMapping[cleanIconName] || iconMapping[iconName.toLowerCase()] || FaHospital;

      console.log('Mapeo de icono:', {
        iconNameOriginal: iconName,
        cleanIconName,
        foundIconExact: !!iconMapping[iconName],
        foundIconClean: !!iconMapping[cleanIconName],
        foundIconLower: !!iconMapping[iconName.toLowerCase()],
        IconComponent: IconComponent.name
      });

      return {
        icon: IconComponent,
        color: color,
        letter: letter
      };
    }

    console.log('⚠️ No hay datos de BD válidos, usando fallback para:', areaName);

    // Fallback con iconos hardcodeados por nombre del área
    const iconMap = {
      'Medicina General': { icon: FaStethoscope, color: '#4A90E2', letter: 'MG' },
      'Pediatría': { icon: FaBaby, color: '#17A2B8', letter: 'PE' },
      'Cardiología': { icon: FaHeartbeat, color: '#DC3545', letter: 'C' },
      'Dermatología': { icon: FaUserMd, color: '#FFC107', letter: 'D' },
      'Ginecología': { icon: FaFemale, color: '#E91E63', letter: 'G' },
      'Ginecólogo': { icon: FaFemale, color: '#E91E63', letter: 'G' },
      'Oftalmología': { icon: FaEyeMed, color: '#17A2B8', letter: 'O' },
      'Ortopedia': { icon: FaBone, color: '#795548', letter: 'OR' },
      'Psiquiatría': { icon: FaBrain, color: '#9C27B0', letter: 'PS' },
      'Neurología': { icon: FaBrain, color: '#FF5722', letter: 'N' },
      'Urología': { icon: FaMale, color: '#3F51B5', letter: 'U' },
      'Endocrinología': { icon: FaFlask, color: '#28A745', letter: 'E' },
      'Gastroenterología': { icon: FaProcedures, color: '#FFC107', letter: 'GA' },
      'Laboratorio': { icon: FaFlask, color: '#28A745', letter: 'L' },
      'Dentista': { icon: FaHospital, color: '#4A90E2', letter: 'D' },
      'Vacunación': { icon: FaHospital, color: '#DC3545', letter: 'V' }
    };

    const defaultArea = iconMap[areaName] || {
      icon: FaHospital,
      color: '#4A90E2',
      letter: areaName?.charAt(0) || 'A'
    };

    console.log('📋 Usando fallback icon para:', areaName, defaultArea);

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

      // Debug: Mostrar los datos exactos que llegan de la BD
      console.log('Datos completos de áreas desde BD:', areasData);
      areasData.forEach((area, index) => {
        console.log(`Área ${index + 1}:`, {
          nombre: area.s_nombre_area,
          icono: area.s_icono,
          color: area.s_color,
          letra: area.s_letra,
          completo: area
        });
      });

      setAreas(areasData || []);

      if (areasData.length === 0) {
        setError(t('takeTurn:areas.noAreas'));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError(t('common:messages.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArea = (area) => {
    setSelectedArea(area);
    setError('');
    setIsCooldownError(false);
  };

  const handleTakeAreaTurn = async () => {
    if (!selectedArea) {
      setError(t('takeTurn:errors.selectArea'));
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

      // 🎫 GENERAR Y DESCARGAR TICKET AUTOMÁTICAMENTE
      try {
        // Obtener la letra del área desde los datos del área seleccionada
        const areaLetra = selectedArea.s_letra || selectedArea.s_nombre_area?.charAt(0) || 'A';
        const numeroTurno = result.i_numero_turno || result.numero_turno || result.id;

        // Formatear número de turno con letra (ej: C1, M2, P3)
        const numeroTurnoConLetra = `${areaLetra}${numeroTurno}`;

        const ticketData = {
          numero_turno: numeroTurnoConLetra,
          paciente_nombre: 'Paciente', // Anónimo en modo público
          area_nombre: selectedArea.s_nombre_area,
          consultorio_numero: result.asignacion_automatica?.consultorio_asignado?.numero || null,
          fecha_creacion: new Date().toISOString(),
          estado: 'espera',
          id: result.id || result.uk_turno
        };

        // Generar ticket PDF automáticamente
        await generateTurnTicket(ticketData);
        console.log('✅ Ticket PDF generado y descargado automáticamente');
      } catch (ticketError) {
        console.error('⚠️ Error al generar ticket (no afecta el turno):', ticketError);
        // No mostramos error al usuario porque el turno se creó correctamente
      }

    } catch (error) {
      console.error('Error generando turno:', error);

      // Manejar específicamente el error de cooldown (429)
      if (error.response?.status === 429) {
        const errorData = error.response?.data;
        const timeRemaining = errorData?.data?.timeRemaining;

        // Mensaje personalizado para cooldown
        let cooldownMessage = error.response?.data?.message ||
          'Por favor espera antes de solicitar otro turno';

        if (timeRemaining) {
          const minutes = Math.floor(timeRemaining / 60);
          const seconds = timeRemaining % 60;
          if (minutes > 0) {
            cooldownMessage = `Debes esperar ${minutes} minuto${minutes > 1 ? 's' : ''} y ${seconds} segundo${seconds > 1 ? 's' : ''} antes de solicitar otro turno`;
          } else {
            cooldownMessage = `Debes esperar ${seconds} segundo${seconds > 1 ? 's' : ''} antes de solicitar otro turno`;
          }
        }

        setError(cooldownMessage);
        setIsCooldownError(true);
      } else {
        setError(error.response?.data?.message || t('takeTurn:errors.generatingError'));
        setIsCooldownError(false);
      }
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
    setIsCooldownError(false);
  };

  const handleNewTurn = () => {
    setSelectedArea(null);
    setShowSuccess(false);
    setTurnResult(null);
    setError('');
    setIsCooldownError(false);
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
            <span className="header-title">{t('common:appNameFull')}</span>
          </div>

          {/* Title Section */}
          <div className="header-center">
            <div className="page-title-section">
              <h1 className="page-title">
                <FaHandPaper className="title-icon" />
                {t('takeTurn:header.title')}
              </h1>
              <p className="page-subtitle"></p>
            </div>
          </div>

          {/* Right Section */}
          <div className="header-right">
            <button onClick={handleGoHome} className="home-button-touch">
              <FaHome className="home-icon" />
              <span>{t('common:buttons.home')}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="touch-content">
        {/* Loading State */}
        {loading && (
          <div className="touch-loading">
            <div className="loading-circle"></div>
            <h2>{t('takeTurn:loading.processing')}</h2>
            <p>{t('takeTurn:loading.pleaseWait')}</p>
          </div>
        )}

        {/* Success State */}
        {showSuccess && turnResult && (
          <div className="touch-success">
            <div className="success-card-compact" style={{
              '--area-color': selectedArea ? getAreaIcon(selectedArea.s_nombre_area, selectedArea).color : '#4A90E2',
              '--area-color-light': selectedArea ? getAreaIcon(selectedArea.s_nombre_area, selectedArea).color + '20' : '#4A90E220'
            }}>
              {(() => {
                const areaIcon = selectedArea ? getAreaIcon(selectedArea.s_nombre_area, selectedArea) : null;
                const IconComponent = areaIcon ? areaIcon.icon : FaCheckCircle;

                return (
                  <>
                    <div className="success-icon-area" style={{
                      background: `linear-gradient(135deg, ${areaIcon?.color || '#4A90E2'}, ${areaIcon?.color || '#4A90E2'}dd)`
                    }}>
                      <IconComponent className="success-area-icon" />
                      <FaCheckCircle className="success-check-overlay" />
                    </div>
                    <h1 style={{ color: areaIcon?.color || '#4A90E2' }}>{t('takeTurn:success.title')}</h1>

                    <div className="area-info-success">
                      <h3>{t('takeTurn:success.area')}: {selectedArea?.s_nombre_area}</h3>
                    </div>
                  </>
                );
              })()}

              <div className="turn-number-display-compact">
                <div className="turn-label">{t('takeTurn:success.yourNumber')}</div>
                <div className="turn-number-big" style={{
                  background: `linear-gradient(135deg, ${selectedArea ? getAreaIcon(selectedArea.s_nombre_area, selectedArea).color : '#4A90E2'}, ${selectedArea ? getAreaIcon(selectedArea.s_nombre_area, selectedArea).color : '#4A90E2'}dd)`
                }}>
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
                        <strong>{t('takeTurn:success.office')}:</strong>
                        <span>#{turnResult.asignacion_automatica.consultorio_asignado.numero} - {turnResult.asignacion_automatica.consultorio_asignado.area}</span>
                      </div>
                    </div>
                    <div className="info-item-compact">
                      <FaClipboardList className="info-icon-small" />
                      <div className="info-text-compact">
                        <strong>{t('takeTurn:success.waiting')}:</strong>
                        <span>{turnResult.asignacion_automatica.consultorio_asignado.turnos_en_espera || 0} {t('takeTurn:success.turns')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="redirect-info">
                <p className="redirect-message">
                  {t('takeTurn:success.displayMessage')}
                </p>
                <div className="countdown-display">
                  <div className="countdown-circle">
                    <span className="countdown-number">{countdown}</span>
                  </div>
                  <p className="countdown-text">{t('takeTurn:success.redirecting')}</p>
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
                  {t('takeTurn:confirmation.backToAreas')}
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
                        <p>{t('takeTurn:confirmation.autoAssign')}</p>
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
                      <span>{t('takeTurn:confirmation.generating')}</span>
                    </>
                  ) : (
                    <>
                      <FaTicketAlt className="button-icon" />
                      <span>{t('takeTurn:confirmation.generateButton')}</span>
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
                <h3>{t('takeTurn:areas.noAreas')}</h3>
                <p>{t('takeTurn:areas.noOffices')}</p>
              </div>
            ) : (
              <>
                <div className="areas-instruction">
                  <h2>{t('takeTurn:')}</h2>
                  <p>{t('takeTurn:')}</p>
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
              <h3>{isCooldownError ? 'En espera' : `⚠️ ${t('common:messages.error')}`}</h3>
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
          margin-top: 80px;
          padding: 10px 40px;
          min-height: calc(100vh - 80px);
          max-width: 100vw;
          margin-left: auto;
          margin-right: auto;
          box-sizing: border-box;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
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
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
          border: 3px solid var(--area-color, #48bb78);
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .success-card-compact .success-icon {
          font-size: 60px;
          color: #48bb78;
          margin-bottom: 20px;
        }

        /* Estilos para pantalla de éxito mejorada con área */
        .success-icon-area {
          width: 90px;
          height: 90px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .success-area-icon {
          font-size: 36px;
          color: white;
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
        }

        .success-check-overlay {
          position: absolute;
          bottom: -8px;
          right: -8px;
          background: #48bb78;
          color: white;
          font-size: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(72, 187, 120, 0.4);
          border: 3px solid white;
        }

        .area-info-success {
          text-align: center;
          margin-bottom: 15px;
          padding: 10px 20px;
          background: var(--area-color-light, #4A90E220);
          border-radius: 12px;
          border: 2px solid var(--area-color, #4A90E2);
        }

        .area-info-success h3 {
          color: var(--area-color, #4A90E2);
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        /* Estilos para botón de generar turno */
        .button-icon {
          font-size: 28px;
        }

        .success-card-compact h1 {
          font-size: 24px;
          color: #2d3748;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .turn-number-display-compact {
          margin: 15px 0;
          text-align: center;
        }

        .turn-number-display-compact .turn-label {
          font-size: 14px;
          margin-bottom: 8px;
          color: #4a5568;
          font-weight: 600;
        }

        .turn-number-display-compact .turn-number-big {
          font-size: 48px;
          font-weight: 900;
          line-height: 1;
          color: white;
          padding: 15px 25px;
          border-radius: 15px;
          display: inline-block;
          min-width: 160px;
          text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .assignment-info-compact {
          margin: 10px 0;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item-compact {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: #f8fafc;
          border-radius: 10px;
          text-align: left;
        }

        .info-icon-small {
          font-size: 16px;
          color: #4A90E2;
          flex-shrink: 0;
        }

        .info-text-compact {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .info-text-compact strong {
          font-size: 12px;
          color: #2d3748;
        }

        .info-text-compact span {
          font-size: 14px;
          color: #4a5568;
        }

        .redirect-info {
          margin-top: 15px;
          padding: 12px;
          background: #f0f9ff;
          border-radius: 10px;
          border: 2px solid #bfdbfe;
        }

        .redirect-message {
          font-size: 14px;
          color: #1e40af;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .countdown-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .countdown-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(59, 130, 246, 0.3);
        }

        .countdown-number {
          color: white;
          font-size: 18px;
          font-weight: 700;
        }

        .countdown-text {
          font-size: 12px;
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
          gap: 20px;
          padding: 35px 60px;
          background: white !important;
          color: #2d3748 !important;
          border: 3px solid #e2e8f0;
          border-radius: 25px;
          font-size: 28px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 500px;
          min-height: 80px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
        }

        .generate-turn-button span {
          color: #2d3748 !important;
        }

        .generate-turn-button .button-icon {
          color: #2d3748 !important;
        }

        .generate-turn-button:hover:not(:disabled) {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
          background: #f8fafc !important;
          border-color: var(--area-color, #4A90E2);
        }

        .generate-turn-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 32px;
          height: 32px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
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
          margin-bottom: 25px;
        }

        .areas-instruction h2 {
          font-size: 28px;
          color: #2d3748;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .areas-instruction p {
          font-size: 18px;
          color: #718096;
        }

        .areas-grid-touch {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 40px;
          padding: 0;
          max-width: 1600px;
          margin: 0 auto;
          height: auto;
        }

        .area-button-touch {
          background: white;
          border: 3px solid transparent;
          border-radius: 20px;
          padding: 40px 35px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          min-height: 40px;
          width: 100%;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        }

        .area-button-touch:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border-color: var(--area-color, #4A90E2);
          background: var(--area-color-light, #4A90E220);
        }

        .area-icon-touch {
          width: 120px;
          height: 120px;
          border-radius: 30px;
          background: linear-gradient(135deg, var(--area-color, #4A90E2), var(--area-color-dark, #4A90E2dd));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 56px;
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
          font-size: 30px;
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
          font-size: 18px;
          font-weight: 700;
          width: 45px;
          height: 45px;
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