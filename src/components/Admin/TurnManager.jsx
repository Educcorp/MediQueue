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
    <div className="turn-manager-page">
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

        <style>{`
        .turn-manager-page {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .page-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .back-button {
          background: #f1f5f9;
          border: 1px solid #cbd5e0;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: #e2e8f0;
        }

        .header-left h1 {
          margin: 0;
          color: #2d3748;
          font-size: 1.8em;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-info {
          color: #4a5568;
          font-weight: 500;
        }

        .logout-button {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .logout-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(197, 48, 48, 0.3);
        }

        .page-main {
          padding: 40px 20px;
        }

        .page-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .error-banner {
          background: #fed7d7;
          color: #c53030;
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-banner button {
          background: none;
          border: none;
          color: #c53030;
          cursor: pointer;
          font-size: 1.2em;
        }

        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .filter-group label {
          font-weight: 600;
          color: #4a5568;
          font-size: 0.9em;
        }

        .filter-input, .filter-select {
          padding: 8px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.9em;
          transition: all 0.3s ease;
        }

        .filter-input:focus, .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .actions-bar {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }

        .add-button {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .add-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
        }

        .refresh-button {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          color: #4a5568;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .refresh-button:hover {
          background: #edf2f7;
        }

        .turns-table {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #f7fafc;
          padding: 15px 20px;
          text-align: left;
          font-weight: 600;
          color: #4a5568;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 15px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        tr:hover {
          background: #f8fafc;
        }

        .turn-number {
          font-weight: 600;
          color: #667eea;
        }

        .status-badge {
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
          text-transform: uppercase;
        }

        .actions-cell {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }

        .status-select {
          padding: 4px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.8em;
          background: white;
          cursor: pointer;
          margin-bottom: 5px;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .action-button {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8em;
          transition: all 0.3s ease;
        }

        .action-button:hover {
          transform: translateY(-1px);
        }

        .action-button.attended {
          background: #c6f6d5;
          border-color: #9ae6b4;
          color: #22543d;
        }

        .action-button.no-show {
          background: #fed7d7;
          border-color: #feb2b2;
          color: #742a2a;
        }

        .action-button.cancel {
          background: #fed7d7;
          border-color: #feb2b2;
          color: #742a2a;
        }

        .action-button.edit {
          background: #bee3f8;
          border-color: #90cdf4;
          color: #2a4365;
        }

        .action-button.delete {
          background: #fed7d7;
          border-color: #feb2b2;
          color: #742a2a;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #718096;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 25px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          color: #2d3748;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5em;
          cursor: pointer;
          color: #718096;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: #f1f5f9;
          color: #4a5568;
        }

        .modal-form {
          padding: 25px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .form-group label {
          font-weight: 600;
          color: #4a5568;
        }

        .form-group input, .form-group select, .form-group textarea {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
        }

        .form-actions button {
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .form-actions button[type="button"] {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          color: #4a5568;
        }

        .form-actions button[type="button"]:hover {
          background: #edf2f7;
        }

        .form-actions button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .form-actions button.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }

        .loading-spinner {
          text-align: center;
          color: #718096;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 20px;
          }

          .header-left {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }

          .filters-section {
            flex-direction: column;
            gap: 15px;
          }

          .actions-bar {
            flex-direction: column;
          }

          .turns-table {
            overflow-x: auto;
          }

          .actions-cell {
            flex-direction: column;
            gap: 5px;
          }

          .modal {
            width: 95%;
            margin: 10px;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
      </div>
    </div>
  );
};

export default TurnManager;