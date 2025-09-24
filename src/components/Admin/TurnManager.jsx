import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../Common/AdminHeader';
import AdminFooter from '../Common/AdminFooter';
import TestSpinner from '../Common/TestSpinner';
import turnService from '../../services/turnService';
import patientService from '../../services/patientService';
import consultorioService from '../../services/consultorioService';
import areaService from '../../services/areaService';
import '../../styles/UnifiedAdminPages.css';

// React Icons
import {
  FaCalendarCheck,
  FaUsers,
  FaClock,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
  FaPlus,
  FaSync,
  FaUser,
  FaHospital,
  FaClipboardList
} from 'react-icons/fa';

const TurnManager = () => {
  const [turns, setTurns] = useState([]);
  const [patients, setPatients] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Detectar tema actual
  const [theme, setTheme] = useState(() => localStorage.getItem('mq-theme') || 'light');
  const isDarkMode = theme === 'dark';

  // Escuchar cambios de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      if (currentTheme !== theme) {
        setTheme(currentTheme);
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      observer.disconnect();
    };
  }, [theme]);

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
    { value: 'EN_ESPERA', label: 'En espera', color: 'info' },
    { value: 'LLAMANDO', label: 'Llamando', color: 'warning' },
    { value: 'ATENDIDO', label: 'Atendido', color: 'success' },
    { value: 'CANCELADO', label: 'Cancelado', color: 'danger' },
    { value: 'NO_PRESENTE', label: 'No presente', color: 'secondary' }
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    // Mostrar spinner brevemente para mejor UX
    setLoading(true);
    setTimeout(() => {
      loadData();
    }, 800);
  }, []);

  // Cargar turnos cuando cambie la fecha, estado o área
  useEffect(() => {
    loadTurns();
  }, [selectedDate, selectedStatus, selectedArea]);

  const loadData = async () => {
    try {
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
      // Delay mínimo para transición suave del spinner
      setTimeout(() => {
        setLoading(false);
      }, 300);
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

  const getStatusLabel = (status) => {
    const statusObj = turnStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getStatusColor = (status) => {
    const statusObj = turnStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'secondary';
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
    return <TestSpinner message="Cargando turnos..." />;
  }

  return (
    <div className="admin-page-unified">
      <AdminHeader />

      <div className="admin-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-icon">
            <FaCalendarCheck />
          </div>
          <div className="page-header-content">
            <h1 className="page-title">Gestión de Turnos</h1>
            <p className="page-subtitle">
              Administra los turnos médicos del sistema - {turns.length} turnos encontrados
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={loadTurns}>
              <FaSync /> Actualizar
            </button>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <FaPlus /> Nuevo Turno
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              <FaTimes />
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-control"
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
            <label>Área</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="form-control"
            >
              <option value="todas">Todas las áreas</option>
              {areas.map(area => (
                <option key={area.uk_area} value={area.uk_area}>
                  {area.s_nombre_area}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <button className="btn btn-secondary">
              <FaFilter /> Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Turns Table */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaClipboardList />
              Lista de Turnos
            </h3>
            <div className="card-actions">
              <button className="card-action" title="Ver detalles">
                <FaEye />
              </button>
              <button className="card-action" title="Filtros">
                <FaFilter />
              </button>
            </div>
          </div>

          <div className="card-content" style={{ padding: 0 }}>
            {turns.length === 0 ? (
              <div className="empty-state">
                <FaCalendarCheck />
                <h3>No hay turnos registrados</h3>
                <p>No se encontraron turnos para los filtros seleccionados</p>
                <button className="btn btn-primary" onClick={handleAddNew}>
                  <FaPlus /> Crear Primer Turno
                </button>
              </div>
            ) : (
              <div className="data-table">
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
                        <td>
                          <strong>#{turn.i_numero_turno}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaUser style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                            {getPatientName(turn.uk_paciente)}
                          </div>
                        </td>
                        <td>{new Date(turn.d_fecha).toLocaleDateString('es-ES')}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaClock style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                            {turn.t_hora}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(turn.s_estado)}`}>
                            {getStatusLabel(turn.s_estado)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaHospital style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                            {getConsultorioInfo(turn.uk_consultorio)}
                          </div>
                        </td>
                        <td>{getAreaInfo(turn.uk_consultorio)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {turn.s_estado === 'EN_ESPERA' && (
                              <>
                                <button
                                  onClick={() => handleMarkAsAttended(turn)}
                                  className="btn btn-success"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                  title="Marcar como atendido"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => handleMarkAsNoShow(turn)}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                  title="Marcar como no presente"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                            {turn.s_estado !== 'CANCELADO' && turn.s_estado !== 'ATENDIDO' && (
                              <button
                                onClick={() => handleCancelTurn(turn)}
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                title="Cancelar turno"
                              >
                                <FaTimes />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(turn)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              title="Editar observaciones"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(turn)}
                              className="btn btn-danger"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              title="Eliminar turno"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--border-radius)',
            padding: 0,
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                {editingTurn ? 'Editar Turno' : 'Nuevo Turno'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label>Consultorio *</label>
                <select
                  name="uk_consultorio"
                  value={formData.uk_consultorio}
                  onChange={handleInputChange}
                  className="form-control"
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
                  className="form-control"
                >
                  <option value="">Sin paciente asignado</option>
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
                  className="form-control"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTurn ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <AdminFooter isDarkMode={isDarkMode} />
    </div>
  );
};

export default TurnManager;