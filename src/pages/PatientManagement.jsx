import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import AdminFooter from '../components/Common/AdminFooter';
import Chatbot from '../components/Common/Chatbot';
import Tutorial from '../components/Common/Tutorial';
import TestSpinner from '../components/Common/TestSpinner';
import patientService from '../services/patientService';
import useTutorial from '../hooks/useTutorial';
import { getAvailablePatientsTutorialSteps } from '../utils/tutorialSteps';
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
  FaEye,
  FaQuestionCircle
} from 'react-icons/fa';

const PatientManagement = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tutorial hook
  const {
    showTutorial,
    completeTutorial,
    skipTutorial,
    startTutorial
  } = useTutorial('admin-patients');

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

  // Estados para modales de notificación
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({ message: '', details: '' });

  // Estados para modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({
    message: '',
    patientData: null,
    isUpdate: false
  });

  // Estados para modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

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

  const handleDelete = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      await patientService.deletePatient(patientToDelete.uk_paciente);
      await loadPatients();
      setShowDeleteModal(false);

      // Mostrar modal de éxito
      setSuccessModalData({
        message: 'Paciente eliminado correctamente',
        patientData: {
          nombre: patientToDelete.s_nombre,
          apellido: patientToDelete.s_apellido,
          telefono: patientToDelete.c_telefono,
          email: patientToDelete.s_email || null,
          fechaNacimiento: patientToDelete.d_fecha_nacimiento || null
        },
        isUpdate: false
      });
      setShowSuccessModal(true);
      setPatientToDelete(null);

      // Auto-cerrar el modal después de 3 segundos
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      setShowDeleteModal(false);
      setPatientToDelete(null);

      setErrorModalData({
        message: 'No es posible eliminar el paciente',
        details: ''
      });
      setShowErrorModal(true);

      setTimeout(() => {
        setShowErrorModal(false);
      }, 4000);

      console.error('Error eliminando paciente:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPatientToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.s_nombre || !formData.s_apellido || !formData.c_telefono) {
      setErrorModalData({
        message: 'Por favor complete todos los campos requeridos',
        details: ''
      });
      setShowErrorModal(true);

      // Auto-cerrar después de 4 segundos
      setTimeout(() => {
        setShowErrorModal(false);
      }, 4000);
      return;
    }

    try {
      const isUpdate = !!editingPatient;

      if (isUpdate) {
        await patientService.updatePatient(editingPatient.uk_paciente, {
          s_nombre: formData.s_nombre.trim(),
          s_apellido: formData.s_apellido.trim(),
          c_telefono: formData.c_telefono.trim(),
          s_email: formData.s_email.trim() || null,
          d_fecha_nacimiento: formData.d_fecha_nacimiento || null
        });
      } else {
        await patientService.createPatient({
          s_nombre: formData.s_nombre.trim(),
          s_apellido: formData.s_apellido.trim(),
          c_telefono: formData.c_telefono.trim(),
          s_email: formData.s_email.trim() || null,
          d_fecha_nacimiento: formData.d_fecha_nacimiento || null
        });
      }

      await loadPatients();
      setShowModal(false);

      // Mostrar modal de éxito
      setSuccessModalData({
        message: isUpdate ? 'Paciente actualizado correctamente' : 'Paciente creado correctamente',
        patientData: {
          nombre: formData.s_nombre.trim(),
          apellido: formData.s_apellido.trim(),
          telefono: formData.c_telefono.trim(),
          email: formData.s_email.trim() || null,
          fechaNacimiento: formData.d_fecha_nacimiento || null
        },
        isUpdate
      });
      setShowSuccessModal(true);

      // Limpiar formulario
      setFormData({
        s_nombre: '',
        s_apellido: '',
        c_telefono: '',
        s_email: '',
        d_fecha_nacimiento: ''
      });

      // Auto-cerrar el modal después de 3 segundos
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error('Error guardando paciente:', error);

      // Mensaje más específico según el tipo de error
      let errorMessage = editingPatient
        ? 'No es posible actualizar el paciente'
        : 'No es posible crear el paciente';
      
      let errorDetails = '';

      // Error 409 - Conflicto (teléfono o email duplicado)
      if (error.response?.status === 409) {
        errorMessage = editingPatient
          ? 'Cannot update patient'
          : 'Patient already exists';
        errorDetails = 'A patient with this phone number or email already exists in the system.';
      }
      // Error 400 - Validación
      else if (error.response?.status === 400) {
        errorMessage = 'Invalid data';
        errorDetails = error.response?.data?.message || 'Please check the entered information.';
      }
      // Otros errores
      else if (error.response?.data?.message) {
        errorDetails = error.response.data.message;
      }

      setErrorModalData({
        message: errorMessage,
        details: errorDetails
      });
      setShowErrorModal(true);

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        setShowErrorModal(false);
      }, 5000);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorModalData({ message: '', details: '' });
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessModalData({ message: '', patientData: null, isUpdate: false });
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
            <h1 className="page-title">{t('admin:patients.title')}</h1>
            <p className="page-subtitle">
              {t('admin:patients.subtitle')} - {patients.length} {t('admin:patients.recordsFound', 'registros encontrados')}
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-secondary"
              onClick={startTutorial}
              title="Ver tutorial"
              style={{ padding: '8px 12px' }}
            >
              <FaQuestionCircle />
            </button>
            <button className="btn btn-secondary" onClick={loadPatients}>
              <FaSync /> {t('common:buttons.refresh')}
            </button>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <FaPlus /> {t('admin:patients.addPatient')}
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
        <div className="stats-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
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
                  {t('admin:patients.stats.total')}
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
                  {t('admin:patients.stats.active')}
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
                  {t('admin:patients.stats.inactive', 'Pacientes Inactivos')}
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
                  {t('admin:patients.stats.withEmail', 'Con Email')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group" style={{ flex: '1', maxWidth: '400px' }}>
            <label>{t('admin:patients.search')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={t('admin:patients.searchPlaceholder')}
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
            <label>{t('common:status.status', 'Estado')}</label>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="form-control"
            >
              <option value="todos">{t('admin:patients.filters.all')}</option>
              <option value="ACTIVO">{t('admin:patients.filters.active')}</option>
              <option value="INACTIVO">{t('admin:patients.filters.inactive')}</option>
            </select>
          </div>
          <div className="filter-group">
            <button className="btn btn-secondary">
              <FaFilter /> {t('common:buttons.filter')}
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaUsers />
              {t('admin:patients.listTitle', 'Lista de Pacientes')}
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
                <h3>{t('admin:patients.empty')}</h3>
                <p>
                  {searchTerm || statusFilter !== 'todos'
                    ? t('admin:patients.noResults', 'No se encontraron pacientes con los filtros aplicados')
                    : t('admin:patients.noPatients')}
                </p>
                <button className="btn btn-primary" onClick={handleAddNew}>
                  <FaPlus /> {t('admin:patients.createFirstPatient')}
                </button>
              </div>
            ) : (
              <div className="data-table patients-table">
                <table>
                  <thead>
                    <tr>
                      <th>{t('admin:patients.table.name')}</th>
                      <th>{t('admin:patients.table.phone')}</th>
                      <th>{t('admin:patients.table.email')}</th>
                      <th>{t('admin:patients.table.age', 'Edad')}</th>
                      <th>{t('admin:patients.table.status')}</th>
                      <th>{t('admin:patients.table.registrationDate', 'Fecha Registro')}</th>
                      <th>{t('common:buttons.actions')}</th>
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
                          <div className="patient-actions" style={{ display: 'flex', gap: '4px' }}>
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
            background: 'var(--bg-white)',
            borderRadius: 'var(--border-radius)',
            padding: 0,
            maxWidth: '600px',
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
                {editingPatient ? t('admin:patients.editPatient') : t('admin:patients.addPatient')}
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
                  <label>{t('admin:patients.form.firstName')} *</label>
                  <input
                    type="text"
                    name="s_nombre"
                    value={formData.s_nombre}
                    onChange={handleInputChange}
                    placeholder={t('admin:patients.form.firstNamePlaceholder')}
                    className="form-control"
                    required
                    maxLength={50}
                  />
                </div>
                <div className="form-group">
                  <label>{t('admin:patients.form.lastName')} *</label>
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
                  <label>{t('admin:patients.form.phone')} *</label>
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
                  <label>{t('admin:patients.form.email')}</label>
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
                <label>{t('admin:patients.form.birthDate')}</label>
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
                  {t('common:buttons.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaCheck />
                  {editingPatient ? t('common:buttons.update') : t('common:buttons.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar paciente */}
      {showDeleteModal && patientToDelete && (
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
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--border-radius)',
            padding: 0,
            maxWidth: '450px',
            width: '90%',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {/* Header del modal */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isDarkMode ? 'rgba(234, 93, 75, 0.1)' : 'rgba(234, 93, 75, 0.05)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(234, 93, 75, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea5d4b',
                fontSize: '20px'
              }}>
                <FaExclamationTriangle />
              </div>
              <h3 style={{
                margin: 0,
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Confirmar Eliminación
              </h3>
            </div>

            {/* Contenido del modal */}
            <div style={{ padding: '24px' }}>
              <p style={{
                margin: '0 0 16px 0',
                color: 'var(--text-primary)',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                ¿Estás seguro de eliminar al paciente <strong>{patientToDelete.s_nombre} {patientToDelete.s_apellido}</strong>?
              </p>

              {/* Información del paciente */}
              <div style={{
                background: isDarkMode ? 'rgba(119, 184, 206, 0.1)' : 'rgba(216, 240, 244, 0.5)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: `1px solid ${isDarkMode ? 'rgba(119, 184, 206, 0.2)' : 'rgba(119, 184, 206, 0.3)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FaUser style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Paciente:</strong> {patientToDelete.s_nombre} {patientToDelete.s_apellido}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: patientToDelete.s_email ? '8px' : '0' }}>
                  <FaPhone style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Teléfono:</strong> {patientToDelete.c_telefono}
                  </span>
                </div>
                {patientToDelete.s_email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaEnvelope style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                    <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                      <strong>Email:</strong> {patientToDelete.s_email}
                    </span>
                  </div>
                )}
              </div>

              <p style={{
                margin: '0',
                color: 'var(--text-muted)',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Botones de acción */}
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={cancelDelete}
                className="btn btn-secondary"
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: '#ea5d4b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(234, 93, 75, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#d94435';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(234, 93, 75, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ea5d4b';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(234, 93, 75, 0.3)';
                }}
              >
                Sí, eliminar paciente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notificación de éxito */}
      {showSuccessModal && successModalData.patientData && (
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
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--border-radius)',
            padding: 0,
            maxWidth: '420px',
            width: '90%',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {/* Contenido del modal */}
            <div style={{ padding: '32px 24px' }}>
              {/* Icono de éxito grande */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(40, 167, 69, 0.3)',
                  animation: 'successPulse 0.6s ease-out'
                }}>
                  <FaCheck style={{ color: 'white', fontSize: '32px' }} />
                </div>
              </div>

              {/* Título */}
              <h3 style={{
                margin: '0 0 12px 0',
                color: 'var(--text-primary)',
                fontSize: '22px',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                ¡Éxito!
              </h3>

              {/* Mensaje principal */}
              <p style={{
                margin: '0 0 20px 0',
                color: 'var(--text-secondary)',
                fontSize: '15px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {successModalData.message}
              </p>

              {/* Información del paciente */}
              <div style={{
                background: isDarkMode ? 'rgba(119, 184, 206, 0.08)' : 'rgba(216, 240, 244, 0.4)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: `1px solid ${isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.25)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaUser style={{ color: '#77b8ce', fontSize: '14px' }} />
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                    {successModalData.patientData.nombre} {successModalData.patientData.apellido}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: successModalData.patientData.email ? '10px' : '0' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaPhone style={{ color: '#77b8ce', fontSize: '14px' }} />
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                    {successModalData.patientData.telefono}
                  </span>
                </div>
                {successModalData.patientData.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaEnvelope style={{ color: '#77b8ce', fontSize: '14px' }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                      {successModalData.patientData.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de progreso de auto-cierre */}
            <div style={{
              height: '4px',
              background: isDarkMode ? 'rgba(119, 184, 206, 0.1)' : 'rgba(216, 240, 244, 0.5)',
              borderRadius: '0 0 var(--border-radius) var(--border-radius)',
              overflow: 'hidden',
              marginTop: '8px'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                animation: 'autoCloseProgress 3s linear forwards'
              }} />
            </div>

            {/* Botón de acción */}
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                type="button"
                onClick={closeSuccessModal}
                style={{
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                  width: '100%',
                  maxWidth: '200px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notificación de error */}
      {showErrorModal && (
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
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--border-radius)',
            padding: 0,
            maxWidth: '450px',
            width: '90%',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {/* Contenido del modal */}
            <div style={{ padding: '32px 24px' }}>
              {/* Icono de error grande */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(220, 53, 69, 0.3)',
                  animation: 'successPulse 0.6s ease-out'
                }}>
                  <FaExclamationTriangle style={{ color: 'white', fontSize: '32px' }} />
                </div>
              </div>

              {/* Título */}
              <h3 style={{
                margin: '0 0 12px 0',
                color: 'var(--text-primary)',
                fontSize: '22px',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                Error
              </h3>

              {/* Mensaje principal */}
              <p style={{
                margin: errorModalData.details ? '0 0 12px 0' : '0 0 24px 0',
                color: 'var(--text-secondary)',
                fontSize: '16px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {errorModalData.message}
              </p>

              {/* Mensaje de detalles (opcional) */}
              {errorModalData.details && (
                <p style={{
                  margin: '0 0 24px 0',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  textAlign: 'center',
                  padding: '12px',
                  background: isDarkMode ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.05)',
                  borderRadius: '8px',
                  border: `1px solid ${isDarkMode ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)'}`
                }}>
                  {errorModalData.details}
                </p>
              )}
            </div>

            {/* Barra de progreso de auto-cierre */}
            <div style={{
              height: '4px',
              background: isDarkMode ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.15)',
              borderRadius: '0 0 var(--border-radius) var(--border-radius)',
              overflow: 'hidden',
              marginTop: '8px'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                animation: 'autoCloseProgress 5s linear forwards'
              }} />
            </div>

            {/* Botón de acción */}
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                type="button"
                onClick={closeErrorModal}
                style={{
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                  width: '100%',
                  maxWidth: '200px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}


      <AdminFooter isDarkMode={isDarkMode} />
      <Chatbot />

      {/* Tutorial Component */}
      <Tutorial
        steps={getAvailablePatientsTutorialSteps()}
        show={showTutorial}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />
    </div>
  );
}; export default PatientManagement;