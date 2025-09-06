import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import turnService from '../../services/turnService';
import patientService from '../../services/patientService';

const TurnManager = () => {
  const [turns, setTurns] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTurn, setEditingTurn] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [formData, setFormData] = useState({
    numero_turno: '',
    estado: 'En espera',
    fecha: new Date().toISOString().split('T')[0],
    hora: '',
    id_paciente: '',
    id_consultorio: 1,
    id_administrador: '',
    id_area: ''
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados de turnos disponibles
  const turnStatuses = [
    { value: 'En espera', label: 'En espera', color: '#4299e1' },
    { value: 'Llamando', label: 'Llamando', color: '#805ad5' },
    { value: 'Atendido', label: 'Atendido', color: '#48bb78' },
    { value: 'Cancelado', label: 'Cancelado', color: '#e53e3e' }
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Cargar turnos cuando cambie la fecha o estado
  useEffect(() => {
    loadTurns();
  }, [selectedDate, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar pacientes y turnos en paralelo
      const [patientsData, turnsData] = await Promise.all([
        patientService.getAllPatients().catch(err => {
          console.warn('Error cargando pacientes:', err);
          return []; // Retornar array vacío si falla
        }),
        turnService.getAllTurns().catch(err => {
          console.warn('Error cargando turnos:', err);
          return []; // Retornar array vacío si falla
        })
      ]);

      setPatients(patientsData);
      setTurns(turnsData);
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
      if (selectedStatus === 'todos') {
        // Intentar obtener turnos por fecha, si falla usar getAllTurns
        try {
          turnsData = await turnService.getTurnsByDate(selectedDate, { id_area: formData.id_area || undefined });
        } catch (dateError) {
          console.warn('Error obteniendo turnos por fecha, usando getAllTurns:', dateError);
          turnsData = await turnService.getAllTurns({ id_area: formData.id_area || undefined });
          // Filtrar por fecha en el frontend si es necesario
          if (turnsData && Array.isArray(turnsData)) {
            turnsData = turnsData.filter(turn => turn.fecha === selectedDate);
          }
        }
      } else {
        try {
          turnsData = await turnService.getTurnsByStatus(selectedStatus, { id_area: formData.id_area || undefined });
        } catch (statusError) {
          console.warn('Error obteniendo turnos por estado, usando getAllTurns:', statusError);
          turnsData = await turnService.getAllTurns({ id_area: formData.id_area || undefined });
          // Filtrar por estado en el frontend si es necesario
          if (turnsData && Array.isArray(turnsData)) {
            turnsData = turnsData.filter(turn => turn.estado === selectedStatus);
          }
        }
      }
      setTurns(turnsData || []);
    } catch (error) {
      setError('Error cargando turnos: ' + error.message);
      console.error('Error cargando turnos:', error);
      setTurns([]); // Asegurar que turns sea un array
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const handleAddNew = () => {
    setEditingTurn(null);
    setFormData({
      numero_turno: '',
      estado: 'En espera',
      fecha: selectedDate,
      hora: '',
      id_paciente: '',
      id_consultorio: 1,
      id_administrador: user?.id_administrador || ''
    });
    setShowModal(true);
  };

  const handleEdit = (turn) => {
    setEditingTurn(turn);
    setFormData({
      numero_turno: turn.numero_turno,
      estado: turn.estado,
      fecha: turn.fecha,
      hora: turn.hora,
      id_paciente: turn.id_paciente,
      id_consultorio: turn.id_consultorio,
      id_administrador: turn.id_administrador
    });
    setShowModal(true);
  };

  const handleDelete = async (turn) => {
    if (window.confirm(`¿Estás seguro de eliminar el turno #${turn.numero_turno}?`)) {
      try {
        await turnService.deleteTurn(turn.id_turno);
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
      await turnService.changeTurnStatus(turn.id_turno, newStatus);
      await loadTurns();
      alert(`Estado del turno #${turn.numero_turno} actualizado a "${newStatus}"`);
    } catch (error) {
      alert('Error actualizando estado: ' + error.message);
      console.error('Error actualizando estado:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_consultorio) {
      alert('Seleccione consultorio');
      return;
    }

    try {
      if (editingTurn) {
        // Actualizar turno existente
        await turnService.updateTurn(editingTurn.id_turno, formData);
        alert('Turno actualizado correctamente');
      } else {
        // Crear nuevo turno
        {
          const payload = { id_consultorio: Number(formData.id_consultorio) };
          if (formData.id_paciente) {
            payload.id_paciente = Number(formData.id_paciente);
          }
          await turnService.createTurn(payload);
        }
        alert('Turno creado correctamente');
      }

      await loadTurns();
      setShowModal(false);
      setFormData({
        numero_turno: '',
        estado: 'En espera',
        fecha: selectedDate,
        hora: '',
        id_paciente: '',
        id_consultorio: 1,
        id_administrador: user?.id_administrador || ''
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

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id_paciente === patientId);
    return patient ? patient.nombre : 'Paciente no encontrado';
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
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/admin/dashboard')} className="back-button">
              ← Volver al Dashboard
            </button>
            <h1>📋 Gestión de Turnos</h1>
          </div>
          <div className="header-right">
            <span className="user-info">👤 {user?.nombre}</span>
            <button onClick={handleLogout} className="logout-button">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turns.map(turn => (
                  <tr key={turn.id_turno}>
                    <td className="turn-number">#{turn.numero_turno}</td>
                    <td>{getPatientName(turn.id_paciente)}</td>
                    <td>{new Date(turn.fecha).toLocaleDateString('es-ES')}</td>
                    <td>{turn.hora}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(turn.estado) }}
                      >
                        {turn.estado}
                      </span>
                    </td>
                    <td>Consultorio {turn.id_consultorio}</td>
                    <td className="actions-cell">
                      <select
                        value={turn.estado}
                        onChange={(e) => handleStatusChange(turn, e.target.value)}
                        className="status-select"
                      >
                        {turnStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleEdit(turn)}
                        className="edit-button"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(turn)}
                        className="delete-button"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {turns.length === 0 && (
              <div className="empty-state">
                <p>No hay turnos registrados para la fecha seleccionada</p>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Número de Turno</label>
                  <input
                    type="number"
                    name="numero_turno"
                    value={formData.numero_turno}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Generado automáticamente"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    disabled
                  >
                    {turnStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Hora</label>
                  <input
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Paciente *</label>
                <select
                  name="id_paciente"
                  value={formData.id_paciente}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id_paciente} value={patient.id_paciente}>
                      {patient.nombre} {patient.apellido} {patient.telefono ? `- ${patient.telefono}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Consultorio *</label>
                <input
                  type="number"
                  name="id_consultorio"
                  value={formData.id_consultorio}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Área (opcional)</label>
                <input
                  type="number"
                  name="id_area"
                  value={formData.id_area}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Filtrar por área para la tabla"
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
          gap: 8px;
          align-items: center;
        }

        .status-select {
          padding: 4px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.8em;
          background: white;
          cursor: pointer;
        }

        .edit-button {
          background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8em;
          transition: all 0.3s ease;
        }

        .edit-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
        }

        .delete-button {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8em;
          transition: all 0.3s ease;
        }

        .delete-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(197, 48, 48, 0.3);
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #4a5568;
        }

        .form-group input, .form-group select {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
        }

        .form-group input:focus, .form-group select:focus {
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

          .form-row {
            grid-template-columns: 1fr;
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
  );
};

export default TurnManager;
