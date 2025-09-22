import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../Common/AdminHeader';
import turnService from '../../services/turnService';
import patientService from '../../services/patientService';
import consultorioService from '../../services/consultorioService';
import areaService from '../../services/areaService';
import '../../styles/AdminPages.css';

const TurnManager = () => {
  const [turns, setTurns] = useState([]);
  const [patients, setPatients] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTurn, setEditingTurn] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedArea, setSelectedArea] = useState('todas');
  const [formData, setFormData] = useState({
    uk_consultorio: '',
    uk_paciente: '',
    s_observaciones: ''
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados de turnos disponibles
  const turnStatuses = [
    { value: 'EN_ESPERA', label: 'En espera', color: '#4299e1' },
    { value: 'LLAMANDO', label: 'Llamando', color: '#805ad5' },
    { value: 'ATENDIDO', label: 'Atendido', color: '#48bb78' },
    { value: 'CANCELADO', label: 'Cancelado', color: '#e53e3e' },
    { value: 'NO_PRESENTE', label: 'No presente', color: '#a0aec0' }
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Cargar turnos cuando cambie la fecha, estado o área
  useEffect(() => {
    loadTurns();
  }, [selectedDate, selectedStatus, selectedArea]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [patientsData, consultoriosData, areasData] = await Promise.all([
        patientService.getAllPatients().catch(err => {
          console.warn('Error cargando pacientes:', err);
          return [];
        }),
        consultorioService.getAll().catch(err => {
          console.warn('Error cargando consultorios:', err);
          return [];
        }),
        areaService.getAll().catch(err => {
          console.warn('Error cargando áreas:', err);
          return [];
        })
      ]);

      setPatients(patientsData);
      setConsultorios(consultoriosData);
      setAreas(areasData);
    } catch (error) {
      setError('Error cargando datos: ' + error.message);
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTurns = async () => {
    try {
      let turnsData;
      const filters = {};

      if (selectedArea !== 'todas') {
        filters.uk_area = selectedArea;
      }

      if (selectedStatus === 'todos') {
        turnsData = await turnService.getTurnsByDate(selectedDate, filters);
      } else {
        turnsData = await turnService.getTurnsByStatus(selectedStatus, filters);
      }

      setTurns(turnsData || []);
    } catch (error) {
      setError('Error cargando turnos: ' + error.message);
      console.error('Error cargando turnos:', error);
      setTurns([]);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const handleAddNew = () => {
    setEditingTurn(null);
    setFormData({
      uk_consultorio: '',
      uk_paciente: '',
      s_observaciones: ''
    });
    setShowModal(true);
  };

  const handleEdit = (turn) => {
    setEditingTurn(turn);
    setFormData({
      uk_consultorio: turn.uk_consultorio,
      uk_paciente: turn.uk_paciente || '',
      s_observaciones: turn.s_observaciones || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (turn) => {
    if (window.confirm(`¿Estás seguro de eliminar el turno #${turn.i_numero_turno}?`)) {
      try {
        await turnService.deleteTurn(turn.uk_turno);
        await loadTurns();
        alert('Turno eliminado correctamente');
      } catch (error) {
        alert('Error eliminando turno: ' + error.message);
        console.error('Error eliminando turno:', error);
      }
    }
  };

  const handleStatusChange = async (turn, newStatus) => {
    try {
      await turnService.updateTurnStatus(turn.uk_turno, newStatus);
      await loadTurns();
      alert(`Estado del turno #${turn.i_numero_turno} actualizado a "${turnStatuses.find(s => s.value === newStatus)?.label}"`);
    } catch (error) {
      alert('Error actualizando estado: ' + error.message);
      console.error('Error actualizando estado:', error);
    }
  };

  const handleMarkAsAttended = async (turn) => {
    try {
      await turnService.markTurnAsAttended(turn.uk_turno);
      await loadTurns();
      alert(`Turno #${turn.i_numero_turno} marcado como atendido`);
    } catch (error) {
      alert('Error marcando turno como atendido: ' + error.message);
      console.error('Error marcando turno como atendido:', error);
    }
  };

  const handleMarkAsNoShow = async (turn) => {
    try {
      await turnService.markTurnAsNoShow(turn.uk_turno);
      await loadTurns();
      alert(`Turno #${turn.i_numero_turno} marcado como no presente`);
    } catch (error) {
      alert('Error marcando turno como no presente: ' + error.message);
      console.error('Error marcando turno como no presente:', error);
    }
  };

  const handleCancelTurn = async (turn) => {
    if (window.confirm(`¿Estás seguro de cancelar el turno #${turn.i_numero_turno}?`)) {
      try {
        await turnService.cancelTurn(turn.uk_turno);
        await loadTurns();
        alert(`Turno #${turn.i_numero_turno} cancelado`);
      } catch (error) {
        alert('Error cancelando turno: ' + error.message);
        console.error('Error cancelando turno:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.uk_consultorio) {
      alert('Seleccione consultorio');
      return;
    }

    try {
      if (editingTurn) {
        // Actualizar observaciones del turno
        await turnService.updateTurnObservations(editingTurn.uk_turno, formData.s_observaciones);
        alert('Turno actualizado correctamente');
      } else {
        // Crear nuevo turno
        if (formData.uk_paciente) {
          await turnService.createTurnWithPaciente({
            uk_consultorio: formData.uk_consultorio,
            uk_paciente: formData.uk_paciente,
            s_observaciones: formData.s_observaciones
          });
        } else {
          await turnService.createTurn({
            uk_consultorio: formData.uk_consultorio,
            s_observaciones: formData.s_observaciones
          });
        }
        alert('Turno creado correctamente');
      }

      await loadTurns();
      setShowModal(false);
      setFormData({
        uk_consultorio: '',
        uk_paciente: '',
        s_observaciones: ''
      });
    } catch (error) {
      let errorMessage = 'Error guardando turno';
      if (error.response && error.response.data) {
        errorMessage += ': ' + error.response.data.message;
      } else {
        errorMessage += ': ' + error.message;
      }
      alert(errorMessage);
      console.error('Error guardando turno:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    const statusObj = turnStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : '#718096';
  };

  const getStatusLabel = (status) => {
    const statusObj = turnStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getPatientName = (uk_paciente) => {
    if (!uk_paciente) return 'Invitado';
    const patient = patients.find(p => p.uk_paciente === uk_paciente);
    return patient ? `${patient.s_nombre} ${patient.s_apellido}` : 'Paciente no encontrado';
  };

  const getConsultorioInfo = (uk_consultorio) => {
    const consultorio = consultorios.find(c => c.uk_consultorio === uk_consultorio);
    return consultorio ? `Consultorio ${consultorio.i_numero_consultorio}` : 'Consultorio no encontrado';
  };

  const getAreaInfo = (uk_consultorio) => {
    const consultorio = consultorios.find(c => c.uk_consultorio === uk_consultorio);
    if (!consultorio) return '';
    const area = areas.find(a => a.uk_area === consultorio.uk_area);
    return area ? area.s_nombre_area : '';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando turnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminHeader />
      <div className="page-content-wrapper">
        {/* Contenido principal */}
        <main className="page-main">
          <div className="page-container">
            {error && (
              <div className="error-banner">
                <span>❌ {error}</span>
                <button onClick={() => setError(null)}>✕</button>
              </div>
            )}

            {/* Filtros */}
            <div className="filters-section">
              <div className="filter-group">
                <label>Fecha:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Estado:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="todos">Todos los estados</option>
                  {turnStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Área:</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="filter-select"
                >
                  <option value="todas">Todas las áreas</option>
                  {areas.map(area => (
                    <option key={area.uk_area} value={area.uk_area}>
                      {area.s_nombre_area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Barra de acciones */}
            <div className="actions-bar">
              <button onClick={handleAddNew} className="add-button">
                + Nuevo Turno
              </button>
              <button onClick={loadTurns} className="refresh-button">
                🔄 Actualizar
              </button>
            </div>

            {/* Tabla de turnos */}
            <div className="turns-table">
              <table>
                <thead>
                  <tr>
                    <th># Turno</th>
                    <th>Paciente</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th>Consultorio</th>
                    <th>Área</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {turns.map(turn => (
                    <tr key={turn.uk_turno}>
                      <td className="turn-number">#{turn.i_numero_turno}</td>
                      <td>{getPatientName(turn.uk_paciente)}</td>
                      <td>{new Date(turn.d_fecha).toLocaleDateString('es-ES')}</td>
                      <td>{turn.t_hora}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(turn.s_estado) }}
                        >
                          {getStatusLabel(turn.s_estado)}
                        </span>
                      </td>
                      <td>{getConsultorioInfo(turn.uk_consultorio)}</td>
                      <td>{getAreaInfo(turn.uk_consultorio)}</td>
                      <td className="actions-cell">
                        <select
                          value={turn.s_estado}
                          onChange={(e) => handleStatusChange(turn, e.target.value)}
                          className="status-select"
                        >
                          {turnStatuses.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <div className="action-buttons">
                          {turn.s_estado === 'EN_ESPERA' && (
                            <button
                              onClick={() => handleMarkAsAttended(turn)}
                              className="action-button attended"
                              title="Marcar como atendido"
                            >
                              ✓
                            </button>
                          )}
                          {turn.s_estado === 'EN_ESPERA' && (
                            <button
                              onClick={() => handleMarkAsNoShow(turn)}
                              className="action-button no-show"
                              title="Marcar como no presente"
                            >
                              ✗
                            </button>
                          )}
                          {turn.s_estado !== 'CANCELADO' && turn.s_estado !== 'ATENDIDO' && (
                            <button
                              onClick={() => handleCancelTurn(turn)}
                              className="action-button cancel"
                              title="Cancelar turno"
                            >
                              🗑️
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(turn)}
                            className="action-button edit"
                            title="Editar observaciones"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(turn)}
                            className="action-button delete"
                            title="Eliminar turno"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {turns.length === 0 && (
                <div className="empty-state">
                  <p>No hay turnos registrados para los filtros seleccionados</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modal para crear/editar */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>
                  {editingTurn ? 'Editar Turno' : 'Nuevo Turno'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="close-button"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Consultorio *</label>
                  <select
                    name="uk_consultorio"
                    value={formData.uk_consultorio}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar consultorio</option>
                    {consultorios.map(consultorio => (
                      <option key={consultorio.uk_consultorio} value={consultorio.uk_consultorio}>
                        Consultorio {consultorio.i_numero_consultorio} - {getAreaInfo(consultorio.uk_consultorio)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Paciente (opcional)</label>
                  <select
                    name="uk_paciente"
                    value={formData.uk_paciente}
                    onChange={handleInputChange}
                  >
                    <option value="">Sin paciente</option>
                    {patients.map(patient => (
                      <option key={patient.uk_paciente} value={patient.uk_paciente}>
                        {patient.s_nombre} {patient.s_apellido} - {patient.c_telefono}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Observaciones</label>
                  <textarea
                    name="s_observaciones"
                    value={formData.s_observaciones}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary">
                    {editingTurn ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TurnManager;