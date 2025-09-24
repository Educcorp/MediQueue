import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import AdminFooter from '../components/Common/AdminFooter';
import TestSpinner from '../components/Common/TestSpinner';
import patientService from '../services/patientService';
import { RECORD_STATUS_LABELS } from '../utils/constants';
import { formatDate, calculateAge, formatPhone } from '../utils/helpers';
import '../styles/UnifiedAdminPages.css';

// React Icons
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaEnvelope,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync,
  FaSearch,
  FaFilter,
  FaUser,
  FaPhone,
  FaBirthdayCake,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaTimes,
  FaCheck,
  FaEye
} from 'react-icons/fa';

const PatientManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
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
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [formData, setFormData] = useState({
    s_nombre: '',
    s_apellido: '',
    c_telefono: '',
    s_email: '',
    d_fecha_nacimiento: ''
  });

  useEffect(() => {
    // Mostrar spinner brevemente para mejor UX
    setLoading(true);
    setTimeout(() => {
      loadPatients();
    }, 800);
  }, []);

  const loadPatients = async () => {
    try {
      setError(null);

      const patientsData = await patientService.getAllPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      setError('Error cargando pacientes');
    } finally {
      // Delay mínimo para transición suave del spinner
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleAddNew = () => {
    setEditingPatient(null);
    setFormData({
      s_nombre: '',
      s_apellido: '',
      c_telefono: '',
      s_email: '',
      d_fecha_nacimiento: ''
    });
    setShowModal(true);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      s_nombre: patient.s_nombre,
      s_apellido: patient.s_apellido,
      c_telefono: patient.c_telefono || '',
      s_email: patient.s_email || '',
      d_fecha_nacimiento: patient.d_fecha_nacimiento ? patient.d_fecha_nacimiento.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (patient) => {
    if (window.confirm(`¿Estás seguro de eliminar al paciente "${patient.s_nombre} ${patient.s_apellido}"?`)) {
      try {
        await patientService.deletePatient(patient.uk_paciente);
        await loadPatients();
        alert('Paciente eliminado correctamente');
      } catch (error) {
        alert('Error eliminando paciente: ' + error.message);
        console.error('Error eliminando paciente:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.s_nombre || !formData.s_apellido || !formData.c_telefono) {
      alert('Por favor complete los campos requeridos (nombre, apellido y teléfono)');
      return;
    }

    try {
      if (editingPatient) {
        await patientService.updatePatient(editingPatient.uk_paciente, {
          s_nombre: formData.s_nombre.trim(),
          s_apellido: formData.s_apellido.trim(),
          c_telefono: formData.c_telefono.trim(),
          s_email: formData.s_email.trim() || null,
          d_fecha_nacimiento: formData.d_fecha_nacimiento || null
        });
        alert('Paciente actualizado correctamente');
      } else {
        await patientService.createPatient({
          s_nombre: formData.s_nombre.trim(),
          s_apellido: formData.s_apellido.trim(),
          c_telefono: formData.c_telefono.trim(),
          s_email: formData.s_email.trim() || null,
          d_fecha_nacimiento: formData.d_fecha_nacimiento || null
        });
        alert('Paciente creado correctamente');
      }

      await loadPatients();
      setShowModal(false);
      setFormData({
        s_nombre: '',
        s_apellido: '',
        c_telefono: '',
        s_email: '',
        d_fecha_nacimiento: ''
      });
    } catch (error) {
      alert('Error guardando paciente: ' + error.message);
      console.error('Error guardando paciente:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  // Filtrar pacientes
  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.s_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.s_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.c_telefono.includes(searchTerm) ||
      (patient.s_email && patient.s_email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || patient.ck_estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calcular estadísticas
  const activePatients = patients.filter(p => p.ck_estado === 'ACTIVO').length;
  const inactivePatients = patients.filter(p => p.ck_estado === 'INACTIVO').length;
  const patientsWithEmail = patients.filter(p => p.s_email).length;

  if (loading) {
    return <TestSpinner message="Cargando pacientes..." />;
  }

  return (
    <div className="admin-page-unified">
      <AdminHeader />

      <div className="admin-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-icon">
            <FaUsers />
          </div>
          <div className="page-header-content">
            <h1 className="page-title">Gestión de Pacientes</h1>
            <p className="page-subtitle">
              Administra la base de datos de pacientes - {patients.length} registros encontrados
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={loadPatients}>
              <FaSync /> Actualizar
            </button>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <FaPlus /> Nuevo Paciente
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

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div className="content-card">
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'linear-gradient(135deg, var(--primary-medical), var(--accent-medical))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <FaUsers />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {patients.length}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Total Pacientes
                </p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'linear-gradient(135deg, var(--success-color), #20c997)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <FaUserCheck />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {activePatients}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Pacientes Activos
                </p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'linear-gradient(135deg, var(--danger-color), #c82333)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <FaUserTimes />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {inactivePatients}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Pacientes Inactivos
                </p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'linear-gradient(135deg, var(--info-color), var(--primary-medical))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <FaEnvelope />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {patientsWithEmail}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Con Email
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group" style={{ flex: '1', maxWidth: '400px' }}>
            <label>Buscar Pacientes</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o email..."
                value={searchTerm}
                onChange={handleSearch}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
              <FaSearch style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </div>
          <div className="filter-group">
            <label>Estado</label>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="form-control"
            >
              <option value="todos">Todos los estados</option>
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
            </select>
          </div>
          <div className="filter-group">
            <button className="btn btn-secondary">
              <FaFilter /> Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaUsers />
              Lista de Pacientes
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
            {filteredPatients.length === 0 ? (
              <div className="empty-state">
                <FaUsers />
                <h3>No hay pacientes registrados</h3>
                <p>
                  {searchTerm || statusFilter !== 'todos'
                    ? 'No se encontraron pacientes con los filtros aplicados'
                    : 'No hay pacientes registrados en el sistema'}
                </p>
                <button className="btn btn-primary" onClick={handleAddNew}>
                  <FaPlus /> Registrar Primer Paciente
                </button>
              </div>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Edad</th>
                      <th>Estado</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map(patient => (
                      <tr key={patient.uk_paciente}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaUser style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                            <strong>{patient.s_nombre} {patient.s_apellido}</strong>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaPhone style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                            <span style={{ fontFamily: 'monospace' }}>
                              {formatPhone(patient.c_telefono)}
                            </span>
                          </div>
                        </td>
                        <td>
                          {patient.s_email ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FaEnvelope style={{ color: 'var(--primary-medical)', fontSize: '12px' }} />
                              <span style={{ color: 'var(--primary-medical)' }}>{patient.s_email}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No registrado</span>
                          )}
                        </td>
                        <td>
                          {patient.d_fecha_nacimiento ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FaBirthdayCake style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                              <span>{calculateAge(patient.d_fecha_nacimiento)} años</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No registrado</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${patient.ck_estado === 'ACTIVO' ? 'success' : 'secondary'}`}>
                            {RECORD_STATUS_LABELS[patient.ck_estado] || patient.ck_estado}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaCalendarAlt style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                            <span style={{ fontSize: '14px' }}>
                              {formatDate(patient.d_fecha_creacion)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleEdit(patient)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              title="Editar paciente"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(patient)}
                              className="btn btn-danger"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              title="Eliminar paciente"
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

      {/* Modal para crear/editar paciente */}
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
            background: 'white',
            borderRadius: 'var(--border-radius)',
            padding: 0,
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
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
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="s_nombre"
                    value={formData.s_nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre del paciente"
                    className="form-control"
                    required
                    maxLength={50}
                  />
                </div>
                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    name="s_apellido"
                    value={formData.s_apellido}
                    onChange={handleInputChange}
                    placeholder="Apellido del paciente"
                    className="form-control"
                    required
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="c_telefono"
                    value={formData.c_telefono}
                    onChange={handleInputChange}
                    placeholder="+57 300 123 4567"
                    className="form-control"
                    required
                    maxLength={15}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="s_email"
                    value={formData.s_email}
                    onChange={handleInputChange}
                    placeholder="email@ejemplo.com"
                    className="form-control"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="d_fecha_nacimiento"
                  value={formData.d_fecha_nacimiento}
                  onChange={handleInputChange}
                  className="form-control"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaCheck />
                  {editingPatient ? 'Actualizar' : 'Crear'}
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

export default PatientManagement;