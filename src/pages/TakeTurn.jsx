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
    uk_consultorio: '',
    c_telefono: '',
    s_nombre: '',
    s_apellido: '',
    s_email: '',
    d_fecha_nacimiento: ''
  });
  const [showPatientForm, setShowPatientForm] = useState(false);

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

      let result;
      
      if (showPatientForm && (formData.c_telefono || formData.s_nombre)) {
        // Crear turno con datos del paciente
        result = await turnService.createTurnPublico({
          uk_consultorio: formData.uk_consultorio,
          c_telefono: formData.c_telefono || null,
          s_nombre: formData.s_nombre || null,
          s_apellido: formData.s_apellido || null,
          s_email: formData.s_email || null,
          d_fecha_nacimiento: formData.d_fecha_nacimiento || null
        });
      } else {
        // Crear turno sin datos del paciente
        result = await turnService.createTurnPublico({
          uk_consultorio: formData.uk_consultorio
        });
      }

      // Mostrar mensaje de éxito
      alert(`¡Turno generado exitosamente! Tu número de turno es: ${result.i_numero_turno}`);

      // Limpiar formulario
      setFormData({
        uk_consultorio: '',
        c_telefono: '',
        s_nombre: '',
        s_apellido: '',
        s_email: '',
        d_fecha_nacimiento: ''
      });
      setShowPatientForm(false);

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
    setShowPatientForm(false);
    setError('');
    setFormData({
      uk_consultorio: '',
      c_telefono: '',
      s_nombre: '',
      s_apellido: '',
      s_email: '',
      d_fecha_nacimiento: ''
    });
  };

  const togglePatientForm = () => {
    setShowPatientForm(!showPatientForm);
    if (!showPatientForm) {
      // Limpiar datos del paciente al ocultar el formulario
      setFormData(prev => ({
        ...prev,
        c_telefono: '',
        s_nombre: '',
        s_apellido: '',
        s_email: '',
        d_fecha_nacimiento: ''
      }));
    }
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

        {/* Formulario para tomar turno */}
        {showForm && (
          <div className="turn-form-card">
            <div className="form-header">
              <h2>
                <i className="mdi mdi-clipboard-text"></i>
                Tomar Nuevo Turno
              </h2>
              <p>Selecciona tu consultorio y opcionalmente registra tus datos</p>
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

              {/* Toggle para mostrar formulario de paciente */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showPatientForm}
                    onChange={togglePatientForm}
                  />
                  <span className="checkmark"></span>
                  Registrar mis datos (opcional)
                </label>
              </div>

              {/* Formulario de datos del paciente */}
              {showPatientForm && (
                <div className="patient-form">
                  <h3>Datos Personales</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="telefono" className="form-label">
                        <i className="mdi mdi-phone"></i>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="c_telefono"
                        value={formData.c_telefono}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Ej: +57 300 123 4567"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nombre" className="form-label">
                        <i className="mdi mdi-account"></i>
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="s_nombre"
                        value={formData.s_nombre}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="apellido" className="form-label">
                        <i className="mdi mdi-account"></i>
                        Apellido
                      </label>
                      <input
                        type="text"
                        id="apellido"
                        name="s_apellido"
                        value={formData.s_apellido}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        <i className="mdi mdi-email"></i>
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="s_email"
                        value={formData.s_email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="fecha_nacimiento" className="form-label">
                        <i className="mdi mdi-calendar"></i>
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        id="fecha_nacimiento"
                        name="d_fecha_nacimiento"
                        value={formData.d_fecha_nacimiento}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                      <span className="loading-spinner"></span>
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

        {/* Botón principal para tomar turno */}
        {!showForm && (
          <div className="main-button-container">
            <button
              onClick={handleTakeTurn}
              className="main-take-turn-button"
              disabled={loading || consultorios.length === 0}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
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
                <li>Opcionalmente puedes registrar tus datos para un mejor seguimiento</li>
                <li>Tu turno será agregado a la cola de espera del consultorio seleccionado</li>
                <li>Puedes ver el estado de los turnos en la pantalla principal</li>
                <li>Mantente atento a los llamados en la pantalla de turnos</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .patient-form {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .patient-form h3 {
          margin: 0 0 15px 0;
          color: #4a5568;
          font-size: 1.1em;
          font-weight: 600;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-row:last-child {
          margin-bottom: 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 500;
          color: #4a5568;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkmark {
          position: relative;
          display: inline-block;
          width: 18px;
          height: 18px;
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background: #667eea;
          border-color: #667eea;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input::placeholder {
          color: #a0aec0;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default TakeTurn;