import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/TakeTurn.css';

const TakeTurn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [consultorios, setConsultorios] = useState([]);
  const [formData, setFormData] = useState({
    id_consultorio: ''
  });

  // Cargar consultorios al montar el componente
  useEffect(() => {
    loadConsultorios();
  }, []);

  const loadConsultorios = async () => {
    try {
      // Primero intentar obtener consultorios disponibles
      let consultoriosData = [];
      try {
        const consultoriosResponse = await api.get('/consultorios/disponibles');
        consultoriosData = consultoriosResponse.data.data || [];
      } catch (disponiblesError) {
        console.log('No se pudieron obtener consultorios disponibles, intentando con todos los consultorios');
      }

      // Si no hay consultorios disponibles, obtener todos los consultorios
      if (consultoriosData.length === 0) {
        try {
          const todosConsultoriosResponse = await api.get('/consultorios/basicos');
          consultoriosData = todosConsultoriosResponse.data.data || [];
        } catch (todosError) {
          console.error('Error obteniendo consultorios:', todosError);
          setError('No se pudieron obtener los consultorios. Verifique que el sistema esté configurado correctamente.');
          return;
        }
      }

      setConsultorios(consultoriosData);

      if (consultoriosData.length === 0) {
        setError('No hay consultorios configurados en el sistema');
      }
    } catch (error) {
      console.error('Error cargando consultorios:', error);
      setError('Error al cargar los consultorios disponibles');
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
      if (!formData.id_consultorio) {
        setError('Por favor selecciona un consultorio');
        return;
      }

      // Crear turno sin registrar datos del paciente (paciente invitado)
      const response = await api.post('/turnos/rapido', {
        id_consultorio: parseInt(formData.id_consultorio)
      });

      const result = response.data.data;

      // Limpiar formulario
      setFormData({
        id_consultorio: ''
      });

      // Redirigir inmediatamente a la página principal
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
              <p>Selecciona tu consultorio y confirma para generar tu turno</p>
            </div>

            <form onSubmit={handleFormSubmit} className="turn-form">
              {/* Se elimina la captura de nombre, apellido, teléfono y email */}

              <div className="form-group">
                <label htmlFor="consultorio" className="form-label">
                  <i className="mdi mdi-hospital-building"></i>
                  Consultorio *
                </label>
                <select
                  id="consultorio"
                  name="id_consultorio"
                  value={formData.id_consultorio}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Selecciona un consultorio</option>
                  {consultorios.map((consultorio) => (
                    <option key={consultorio.id_consultorio} value={consultorio.id_consultorio}>
                      Consultorio {consultorio.numero_consultorio} - {consultorio.nombre_area}
                    </option>
                  ))}
                </select>
              </div>

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
                <li>Solo debes seleccionar el consultorio y confirmar</li>
                <li>Tu turno será agregado a la cola de espera del consultorio seleccionado</li>
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
