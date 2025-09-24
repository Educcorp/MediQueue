import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import turnService from '../services/turnService';
import consultorioService from '../services/consultorioService';
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
  FaDoorOpen,
  FaInfoCircle,
  FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa';

const TakeTurn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedConsultorio, setSelectedConsultorio] = useState(null);
  const [consultorios, setConsultorios] = useState([]);
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

  // Cargar consultorios y áreas al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar consultorios y áreas en paralelo
      const [consultoriosData, areasData] = await Promise.all([
        consultorioService.getDisponibles().catch(err => {
          console.warn('Error cargando consultorios disponibles:', err);
          return consultorioService.getAll().catch(() => []);
        }),
        areaService.getAll().catch(err => {
          console.warn('Error cargando áreas:', err);
          return [];
        })
      ]);

      setConsultorios(consultoriosData || []);
      setAreas(areasData || []);

      if (consultoriosData.length === 0) {
        setError('No hay consultorios configurados en el sistema');
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConsultorio = (consultorio) => {
    setSelectedConsultorio(consultorio);
    setError('');
  };

  const handleConfirmTurn = async () => {
    if (!selectedConsultorio) {
      setError('Por favor selecciona un consultorio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Crear turno enviando únicamente el consultorio.
      // El backend completará con null o placeholders ("Invitado").
      const result = await turnService.createTurnPublico({
        uk_consultorio: selectedConsultorio.uk_consultorio
      });

      // Mostrar mensaje de éxito
      alert(`¡Turno generado exitosamente! Tu número de turno es: ${result.i_numero_turno}`);

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
    setSelectedConsultorio(null);
    setError('');
  };

  // Obtener consultorios por área
  const getConsultoriosByArea = (areaId) => {
    return consultorios.filter(c => c.uk_area === areaId);
  };

  const getConsultorioInfo = (consultorio) => {
    const area = areas.find(a => a.uk_area === consultorio.uk_area);
    return {
      numero: consultorio.i_numero_consultorio,
      area: area ? area.s_nombre_area : 'Sin área'
    };
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
              <p className="header-subtitle">Gestiona tu ingreso a la cola del consultorio elegido</p>
            </div>
            {selectedConsultorio && (
              <button onClick={handleGoBack} className="back-button">
                <FaArrowLeft /> Volver
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando áreas médicas...</p>
          </div>
        )}

        {/* Vista de confirmación de turno seleccionado */}
        {selectedConsultorio && !loading && (
          <div className="confirmation-container">
            <div className="selected-consultorio-card">
              <div className="consultorio-header">
                <div className="consultorio-icon">
                  <FaDoorOpen />
                </div>
                <div className="consultorio-info">
                  <h2>Consultorio #{selectedConsultorio.i_numero_consultorio}</h2>
                  <p>{getConsultorioInfo(selectedConsultorio).area}</p>
                </div>
              </div>
              
              <div className="confirmation-actions">
                <button
                  onClick={handleConfirmTurn}
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
                      Confirmar y Generar Turno
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

        {/* Vista principal - Selección de áreas */}
        {!selectedConsultorio && !loading && (
          <div className="areas-container">
            {areas.length === 0 ? (
              <div className="empty-state">
                <FaBuilding />
                <h3>No hay áreas médicas disponibles</h3>
                <p>Actualmente no hay consultorios configurados en el sistema</p>
              </div>
            ) : (
              <div className="areas-grid">
                {areas.map(area => {
                  const areaConsultorios = getConsultoriosByArea(area.uk_area);
                  const areaIcon = getAreaIcon(area.s_nombre_area);
                  const IconComponent = areaIcon.icon;

                  return (
                    <div key={area.uk_area} className="area-card">
                      <div 
                        className="area-header" 
                        style={{
                          background: `linear-gradient(135deg, ${areaIcon.color}20, ${areaIcon.color}10)`,
                          borderBottom: `1px solid ${areaIcon.color}30`
                        }}
                      >
                        <div className="area-header-content">
                          <div 
                            className="area-icon"
                            style={{
                              background: `linear-gradient(135deg, ${areaIcon.color}, ${areaIcon.color}dd)`
                            }}
                          >
                            <IconComponent />
                          </div>
                          <div className="area-info">
                            <h3 style={{ color: areaIcon.color }}>
                              {area.s_nombre_area}
                            </h3>
                            <p>
                              {areaConsultorios.length} consultorio{areaConsultorios.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="area-content">
                        {areaConsultorios.length === 0 ? (
                          <div className="no-consultorios">
                            <FaDoorOpen />
                            <p>No hay consultorios en esta área</p>
                          </div>
                        ) : (
                          <div className="consultorios-list">
                            {areaConsultorios.map(consultorio => (
                              <button
                                key={consultorio.uk_consultorio}
                                className="consultorio-button"
                                onClick={() => handleSelectConsultorio(consultorio)}
                              >
                                <div className="consultorio-content">
                                  <FaDoorOpen style={{ color: areaIcon.color }} />
                                  <span>
                                    Consultorio #{consultorio.i_numero_consultorio}
                                  </span>
                                  <span className="status-badge success">
                                    ACTIVO
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Información importante */}
            <div className="info-section">
              <div className="info-card">
                <h3>
                  <FaInfoCircle />
                  Información Importante
                </h3>
                <ul className="info-list">
                  <li>Selecciona el consultorio donde deseas ser atendido</li>
                  <li>Tu turno será agregado a la cola de espera del consultorio seleccionado</li>
                  <li>Si no registras datos, tu turno saldrá como "Invitado"</li>
                  <li>Puedes ver el estado de los turnos en la pantalla principal</li>
                  <li>Mantente atento a los llamados en la pantalla de turnos</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {error && !selectedConsultorio && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeTurn;