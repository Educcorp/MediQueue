import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import turnService from '../services/turnService';
import consultorioService from '../services/consultorioService';
import areaService from '../services/areaService';
import '../styles/TakeTurn.css';

const TakeTurn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [consultorios, setConsultorios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    uk_consultorio: ''
  });
  // Interfaz simplificada: no se solicitan datos de paciente

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

  const handleTakeTurn = () => {
    setError('');
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.uk_consultorio) {
        setError('Por favor selecciona un consultorio');
        return;
      }

      // Crear turno enviando únicamente el consultorio.
      // El backend completará con null o placeholders ("Invitado").
      const result = await turnService.createTurnPublico({
        uk_consultorio: formData.uk_consultorio
      });

      // Mostrar mensaje de éxito
      alert(`¡Turno generado exitosamente! Tu número de turno es: ${result.i_numero_turno}`);

      // Limpiar formulario
      setFormData({
        uk_consultorio: ''
      });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setError('');
    setFormData({
      uk_consultorio: ''
    });
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

        {/* Encabezado inspirado en admin con estilo propio */}
        <div className="take-turn-header">
          <div className="header-card">
            <div className="header-icon">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <div className="header-texts">
              <h1 className="header-title">Tomar Turno</h1>
              <p className="header-subtitle">Gestiona tu ingreso a la cola del consultorio elegido</p>
            </div>
          </div>
        </div>

        {/* Formulario para tomar turno */}
        {showForm && (
          <div className="turn-form-card">
            <div className="form-header">
              <h2>
                <i className="mdi mdi-clipboard-text"></i>
                Tomar Nuevo Turno
              </h2>
              <p>Selecciona el consultorio al que te diriges</p>
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
                  {consultorios.map((consultorio) => {
                    const info = getConsultorioInfo(consultorio);
                    return (
                      <option key={consultorio.uk_consultorio} value={consultorio.uk_consultorio}>
                        Consultorio {info.numero} - {info.area}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Interfaz simplificada: sin formulario de datos personales */}

              {/* Mensajes de Error */}
              {error && (
                <div className="message error">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Botones de acción */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="cancel-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #e2e8f0',
                        borderTop: '2px solid #77b8ce',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        display: 'inline-block',
                        marginRight: '8px'
                      }}></div>
                      Generando Turno...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-ticket-alt"></i>
                      Generar Turno
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Botón principal para tomar turno */
        }
        {!showForm && (
          <div className="main-button-container">
            <button
              onClick={handleTakeTurn}
              className="main-take-turn-button"
              disabled={loading || consultorios.length === 0}
              aria-busy={loading ? 'true' : 'false'}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e2e8f0',
                    borderTop: '2px solid #77b8ce',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    display: 'inline-block',
                    marginRight: '8px'
                  }}></div>
                  Cargando...
                </>
              ) : (
                <>
                  <i className="fas fa-ticket-alt"></i>
                  Tomar Turno
                </>
              )}
            </button>

            {/* Mensaje de error */}
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Información adicional */}
            <div className="info-card">
              <h3>
                <i className="fas fa-info-circle"></i>
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
        )}
      </div>

      
    </div>
  );
};

export default TakeTurn;