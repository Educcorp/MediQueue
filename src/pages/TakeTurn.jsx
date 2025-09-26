import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import turnService from '../services/turnService';
import areaService from '../services/areaService';
import '../styles/TakeTurn.css';

// React Icons
import {
  FaTicketAlt,
  FaHospital,
  FaBuilding,
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
  FaInfoCircle,
  FaCheckCircle,
  FaArrowLeft,
  FaRandom,
  // FaClock // COMENTADO: No se usa sin turno rápido
} from 'react-icons/fa';

const TakeTurn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [areas, setAreas] = useState([]);

  // Mapa de iconos y colores por nombre de área médica
  const getAreaIcon = (areaName) => {
    const iconMap = {
      'Medicina General': { icon: FaStethoscope, color: 'var(--primary-medical)' },
      'Pediatría': { icon: FaBaby, color: 'var(--info-color)' },
      'Cardiología': { icon: FaHeartbeat, color: 'var(--danger-color)' },
      'Dermatología': { icon: FaUserMd, color: 'var(--warning-color)' },
      'Ginecología': { icon: FaFemale, color: '#E91E63' },
      'Oftalmología': { icon: FaEyeMed, color: 'var(--info-color)' },
      'Ortopedia': { icon: FaBone, color: '#795548' },
      'Psiquiatría': { icon: FaBrain, color: '#9C27B0' },
      'Neurología': { icon: FaBrain, color: '#FF5722' },
      'Urología': { icon: FaMale, color: '#3F51B5' },
      'Endocrinología': { icon: FaFlask, color: 'var(--success-color)' },
      'Gastroenterología': { icon: FaProcedures, color: '#FFC107' }
    };

    return iconMap[areaName] || { icon: FaHospital, color: 'var(--primary-medical)' };
  };

  // Cargar áreas al montar el componente
  const [formData, setFormData] = useState({
    uk_consultorio: ''
  });
  const [selectedArea, setSelectedArea] = useState(null);
  // Interfaz simplificada: no se solicitan datos de paciente

  // Cargar consultorios y áreas al montar el componente
  useEffect(() => {
    loadAreas();
  }, []);

  // Filtrar por área recibida por query param (?area=)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qpArea = params.get('area');
      setSelectedArea(qpArea);
    } catch (_) { }
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      setError('');

      const areasData = await areaService.getAll().catch(err => {
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

  // COMENTADO: Función para turno rápido (asignación automática global)
  /*
  const handleTakeRandomTurn = async () => {
    setLoading(true);
    setError('');

    try {
      // Crear turno con asignación automática sin especificar área
      const result = await turnService.createTurnPublicoAuto({});

      // Mostrar mensaje de éxito con información del consultorio asignado
      const consultorioInfo = result.asignacion_automatica?.consultorio_asignado;
      const mensaje = consultorioInfo 
        ? `¡Turno generado exitosamente!\n\nTu número de turno es: ${result.i_numero_turno}\nConsultorio asignado: #${consultorioInfo.numero} - ${consultorioInfo.area}\nTurnos en espera: ${consultorioInfo.turnos_en_espera}`
        : `¡Turno generado exitosamente! Tu número de turno es: ${result.i_numero_turno}`;
      
      alert(mensaje);

      // Redirigir a la página principal
      navigate('/');

    } catch (error) {
      console.error('Error generando turno:', error);
      setError(error.response?.data?.message || 'Error al generar el turno');
    } finally {
      setLoading(false);
    }
  };
  */

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

      // Mostrar mensaje de éxito con información del consultorio asignado
      const consultorioInfo = result.asignacion_automatica?.consultorio_asignado;
      const mensaje = consultorioInfo 
        ? `¡Turno generado exitosamente!\n\nTu número de turno es: ${result.i_numero_turno}\nConsultorio asignado: #${consultorioInfo.numero} - ${consultorioInfo.area}\nTurnos en espera: ${consultorioInfo.turnos_en_espera}`
        : `¡Turno generado exitosamente! Tu número de turno es: ${result.i_numero_turno}`;
      
      alert(mensaje);

      // Redirigir a la página principal
      navigate('/');

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
    setError('');
  };

  return (
    <div className="take-turn-container">
      <div className="take-turn-content">
        {/* Encabezado */}
        <div className="take-turn-header">
          <div className="header-card">
            <div className="header-icon">
              <FaTicketAlt />
            </div>
            <div className="header-texts">
              <h1 className="header-title">Tomar Turno</h1>
              <p className="header-subtitle">Selecciona un área médica y se asignará automáticamente el consultorio más disponible</p>
            </div>
            {selectedArea && (
              <button onClick={handleGoBack} className="back-button">
                <FaArrowLeft /> Volver
              </button>
            )}
          </div>
        </div>

            <form onSubmit={handleFormSubmit} className="turn-form">
              <div className="form-group">
                <label htmlFor="consultorio" className="form-label">
                  <i className="mdi mdi-hospital-building"></i>
                  Consultorio *
                </label>
                <select
                  id="consultorio"
                  name="uk_consultorio"
                  value={formData.uk_consultorio}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Selecciona un consultorio</option>
                  {(selectedArea ? consultorios.filter(c => c.uk_area === selectedArea) : consultorios).map((consultorio) => {
                    const info = getConsultorioInfo(consultorio);
                    return (
                      <option key={consultorio.uk_consultorio} value={consultorio.uk_consultorio}>
                        Consultorio {info.numero} - {info.area}
                      </option>
                    );
                  })}
                </select>
              </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Procesando solicitud...</p>
          </div>
        )}

        {/* Vista de confirmación de área seleccionada */}
        {selectedArea && !loading && (
          <div className="confirmation-container">
            <div className="selected-area-card">
              <div className="area-header-confirmation">
                {(() => {
                  const areaIcon = getAreaIcon(selectedArea.s_nombre_area);
                  const IconComponent = areaIcon.icon;
                  return (
                    <>
                      <div 
                        className="area-icon-large"
                        style={{
                          background: `linear-gradient(135deg, ${areaIcon.color}, ${areaIcon.color}dd)`
                        }}
                      >
                        <IconComponent />
                      </div>
                      <div className="area-info-confirmation">
                        <h2 style={{ color: areaIcon.color }}>{selectedArea.s_nombre_area}</h2>
                        <p>Se asignará automáticamente el consultorio más disponible de esta área</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="confirmation-actions">
                <button
                  onClick={handleTakeAreaTurn}
                  className="confirm-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="button-spinner"></div>
                      Generando Turno...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Generar Turno en {selectedArea.s_nombre_area}
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}
          </div>
        )}


        {/* COMENTADO: Vista principal con opción de turno rápido
        {!showAreaSelection && !selectedArea && !loading && (
          <div className="main-options-container">
            <div className="options-grid">
              {/* Opción de turno aleatorio 
              <div className="option-card primary">
                <div className="option-icon">
                  <FaRandom />
                </div>
                <div className="option-content">
                  <h2>Turno Rápido</h2>
                  <p>Se asignará automáticamente el consultorio más disponible de todo el hospital</p>
                  <div className="option-features">
                    <span><FaClock /> Más rápido</span>
                    <span><FaRandom /> Automático</span>
                  </div>
                </div>
                <button
                  onClick={handleTakeRandomTurn}
                  className="option-button primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="button-spinner"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <FaTicketAlt />
                      Generar Turno Rápido
                    </>
                  )}
                </button>
              </div>

              {/* Opción de selección por área - MOVIDA ABAJO COMO VISTA PRINCIPAL 
              <div className="option-card secondary">
                <div className="option-icon">
                  <FaHospital />
                </div>
                <div className="option-content">
                  <h2>Por Área Médica</h2>
                  <p>Elige un área específica y se asignará el consultorio más disponible de esa área</p>
                  <div className="option-features">
                    <span><FaHospital /> Específico</span>
                    <span><FaRandom /> Automático</span>
                  </div>
                </div>
                <button
                  onClick={handleShowAreaSelection}
                  className="option-button secondary"
                  disabled={loading || areas.length === 0}
                >
                  <FaBuilding />
                  Seleccionar Área
                </button>
              </div>
            </div>
        )}
        */}

        {/* Vista principal directa - Selección de áreas */}
        {!selectedArea && !loading && (
          <div className="areas-container">
            {areas.length === 0 ? (
              <div className="empty-state">
                <FaBuilding />
                <h3>No hay áreas médicas disponibles</h3>
                <p>Actualmente no hay consultorios configurados en el sistema</p>
              </div>
            ) : (
              <div className="areas-grid-simple">
                {areas.map(area => {
                  const areaIcon = getAreaIcon(area.s_nombre_area);
                  const IconComponent = areaIcon.icon;

                  return (
                    <button
                      key={area.uk_area}
                      className="area-button"
                      onClick={() => handleSelectArea(area)}
                    >
                      <div 
                        className="area-icon-button"
                        style={{
                          background: `linear-gradient(135deg, ${areaIcon.color}, ${areaIcon.color}dd)`
                        }}
                      >
                        <IconComponent />
                      </div>
                      <div className="area-info-button">
                        <h3 style={{ color: areaIcon.color }}>
                          {area.s_nombre_area}
                        </h3>
                        <p>Consultorio automático</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {error && !selectedArea && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeTurn;