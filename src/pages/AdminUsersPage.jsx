import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import AdminFooter from '../components/Common/AdminFooter';
import Chatbot from '../components/Common/Chatbot';
import Tutorial from '../components/Common/Tutorial';
import adminService from '../services/adminService';
import useTutorial from '../hooks/useTutorial';
import { getAvailableUsersTutorialSteps } from '../utils/tutorialSteps';
import { USER_TYPE_LABELS } from '../utils/constants';
import '../styles/UnifiedAdminPages.css';

// React Icons
import {
  FaUsersCog,
  FaUserShield,
  FaUser,
  FaPlus,
  FaSync,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaEye,
  FaExclamationTriangle,
  FaTimes,
  FaCheck,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaLock,
  FaUsers,
  FaCrown,
  FaEyeSlash,
  FaKey,
  FaQuestionCircle,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

const AdminUsersPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [formData, setFormData] = useState({
    s_nombre: '',
    s_apellido: '',
    s_email: '',
    s_usuario: '',
    s_password: '',
    s_password_confirm: '',
    c_telefono: '',
    tipo_usuario: 1
  });

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

  // Estados para modales de notificación
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({ 
    message: '', 
    data: null,
    type: '' // 'create', 'update', 'delete'
  });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({ message: '' });

  // Estados para modales de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningModalData, setWarningModalData] = useState({ message: '' });

  // Tutorial hook
  const {
    showTutorial,
    completeTutorial,
    skipTutorial,
    startTutorial
  } = useTutorial('admin-users');

  // Cargar administradores al montar el componente
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);

      const administradores = await adminService.getAllAdmins();
      setAdmins(administradores);

    } catch (error) {
      setError(t('common:messages.error') + ': ' + error.message);
      console.error('Error cargando administradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAdmin(null);
    setFormData({
      s_nombre: '',
      s_apellido: '',
      s_email: '',
      s_usuario: '',
      s_password: '',
      s_password_confirm: '',
      c_telefono: '',
      tipo_usuario: 1
    });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      s_nombre: admin.s_nombre,
      s_apellido: admin.s_apellido,
      s_email: admin.s_email,
      s_usuario: admin.s_usuario,
      s_password: '',
      s_password_confirm: '',
      c_telefono: admin.c_telefono || '',
      tipo_usuario: admin.tipo_usuario
    });
    setShowModal(true);
  };

  const handleDelete = (admin) => {
    if (admin.uk_administrador === user?.uk_administrador) {
      setWarningModalData({ 
        message: 'No puedes eliminar tu propia cuenta'
      });
      setShowWarningModal(true);
      return;
    }

    setUserToDelete(admin);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await adminService.deleteAdmin(userToDelete.uk_administrador);
      setShowDeleteModal(false);
      setUserToDelete(null);
      await loadAdmins();
      
      // Mostrar modal de éxito
      setSuccessModalData({
        message: 'Usuario eliminado exitosamente',
        data: {
          nombre: userToDelete.s_nombre,
          apellido: userToDelete.s_apellido,
          email: userToDelete.s_email,
          usuario: userToDelete.s_usuario
        },
        type: 'delete'
      });
      setShowSuccessModal(true);
      
      // Auto cerrar después de 3 segundos
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      setErrorModalData({ 
        message: 'No se pudo eliminar el usuario'
      });
      setShowErrorModal(true);
      
      // Auto cerrar después de 4 segundos
      setTimeout(() => {
        setShowErrorModal(false);
      }, 4000);
      
      console.error('Error eliminando administrador:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const closeWarningModal = () => {
    setShowWarningModal(false);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.s_nombre || !formData.s_apellido || !formData.s_email || !formData.s_usuario) {
      setErrorModalData({ 
        message: 'Por favor completa todos los campos requeridos'
      });
      setShowErrorModal(true);
      
      setTimeout(() => {
        setShowErrorModal(false);
      }, 4000);
      return;
    }

    // Validación de contraseña (debe coincidir con la del backend: min 6, 1 minúscula, 1 mayúscula y 1 número)
    const passwordProvided = !!formData.s_password && formData.s_password.length > 0;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!editingAdmin && !passwordProvided) {
      setErrorModalData({ 
        message: 'La contraseña es requerida para crear un nuevo usuario'
      });
      setShowErrorModal(true);
      
      setTimeout(() => {
        setShowErrorModal(false);
      }, 4000);
      return;
    }

    if (passwordProvided) {
      // Validar que las contraseñas coincidan
      if (formData.s_password !== formData.s_password_confirm) {
        setErrorModalData({ 
          message: 'Las contraseñas no coinciden'
        });
        setShowErrorModal(true);
        
        setTimeout(() => {
          setShowErrorModal(false);
        }, 4000);
        return;
      }

      // Validar formato de contraseña
      if (!passwordRegex.test(formData.s_password)) {
        setErrorModalData({ 
          message: 'La contraseña debe tener al menos 6 caracteres e incluir minúscula, mayúscula y número'
        });
        setShowErrorModal(true);
        
        setTimeout(() => {
          setShowErrorModal(false);
        }, 4000);
        return;
      }
    }

    try {
      const adminData = {
        s_nombre: formData.s_nombre.trim(),
        s_apellido: formData.s_apellido.trim(),
        s_email: formData.s_email.trim(),
        s_usuario: formData.s_usuario.trim(),
        tipo_usuario: parseInt(formData.tipo_usuario)
      };

      // Solo incluir teléfono si viene no vacío para evitar errores de validación (trim sobre null)
      const telefonoTrimmed = (formData.c_telefono || '').trim();
      if (telefonoTrimmed) {
        adminData.c_telefono = telefonoTrimmed;
      }

      if (passwordProvided) {
        adminData.s_password = formData.s_password;
      }

      console.log('Datos a enviar:', adminData);

      if (editingAdmin) {
        await adminService.updateAdmin(editingAdmin.uk_administrador, adminData);
        
        setSuccessModalData({
          message: 'Usuario actualizado exitosamente',
          data: {
            nombre: formData.s_nombre,
            apellido: formData.s_apellido,
            email: formData.s_email,
            usuario: formData.s_usuario,
            telefono: formData.c_telefono
          },
          type: 'update'
        });
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      } else {
        await adminService.createAdmin(adminData);
        
        setSuccessModalData({
          message: 'Usuario creado exitosamente',
          data: {
            nombre: formData.s_nombre,
            apellido: formData.s_apellido,
            email: formData.s_email,
            usuario: formData.s_usuario,
            telefono: formData.c_telefono
          },
          type: 'create'
        });
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      }

      await loadAdmins();
      setShowModal(false);
      setFormData({
        s_nombre: '',
        s_apellido: '',
        s_email: '',
        s_usuario: '',
        s_password: '',
        s_password_confirm: '',
        c_telefono: '',
        tipo_usuario: 1
      });
    } catch (error) {
      let errorMessage = 'No se pudo guardar el usuario';
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.message) {
          errorMessage = data.message;
        }
      }
      
      setErrorModalData({ message: errorMessage });
      setShowErrorModal(true);
      
      setTimeout(() => {
        setShowErrorModal(false);
      }, 4000);
      
      console.error('Error guardando administrador:', error);
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

  // Filtrar administradores
  const filteredAdmins = admins.filter(admin =>
    admin.s_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.s_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.s_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.s_usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(a => a.email_verified).length;

  if (loading) {
    return (
      <div className="admin-page-unified">
        <AdminHeader />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          <div style={{
            textAlign: 'center',
            color: '#718096'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #77b8ce',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}></div>
            <p>{t('admin:common.loading')}</p>
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="admin-page-unified">
      <AdminHeader />

      <div className="admin-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-icon">
            <FaUsersCog />
          </div>
          <div className="page-header-content">
            <h1 className="page-title">{t('admin:users.title')}</h1>
            <p className="page-subtitle">
              {t('admin:users.subtitle')} - {totalAdmins} {t('admin:users.registered', 'administradores registrados')}
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
            <button className="btn btn-secondary" onClick={loadAdmins}>
              <FaSync /> {t('common:buttons.refresh')}
            </button>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <FaPlus /> {t('admin:users.addUser')}
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
                  {totalAdmins}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {t('admin:users.stats.totalUsers', 'Total Usuarios')}
                </p>
              </div>
            </div>
          </div>                  
        </div>

        {/* Search Section */}
        <div className="filters-section">
          <div className="filter-group" style={{ flex: '1', maxWidth: '400px' }}>
            <label>{t('admin:users.search')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={t('admin:users.searchPlaceholder')}
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
            <button className="btn btn-secondary">
              <FaFilter /> {t('common:buttons.filter')}
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaUsersCog />
              {t('admin:users.listTitle', 'Lista de Usuarios Administrativos')}
            </h3>
            <div className="card-actions">
              <button className="card-action" title={t('common:buttons.view')}>
                <FaEye />
              </button>
              <button className="card-action" title={t('common:buttons.filter')}>
                <FaFilter />
              </button>
            </div>
          </div>

          <div className="card-content" style={{ padding: 0 }}>
            {filteredAdmins.length === 0 ? (
              <div className="empty-state">
                <FaUsersCog />
                <h3>{t('admin:users.noUsers')}</h3>
                <p>
                  {searchTerm
                    ? t('admin:users.noUsersForFilters', 'No se encontraron usuarios con los filtros aplicados')
                    : t('admin:users.noUsersInSystem', 'No hay usuarios administrativos en el sistema')}
                </p>
                <button className="btn btn-primary" onClick={handleAddNew}>
                  <FaPlus /> {t('admin:users.createFirstUser')}
                </button>
              </div>
            ) : (
              <div className="data-table users-table">
                <table>
                  <thead>
                    <tr>
                      <th>{t('admin:users.table.username', 'Usuario')}</th>
                      <th>{t('admin:users.table.fullName', 'Nombre Completo')}</th>
                      <th>{t('admin:users.table.email', 'Email')}</th>
                      <th>{t('admin:users.table.phone', 'Teléfono')}</th>
                      <th>{t('admin:users.table.type', 'Tipo')}</th>
                      <th>{t('admin:users.table.registrationDate', 'Fecha Registro')}</th>
                      <th>{t('common:buttons.actions', 'Acciones')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map(admin => (
                      <tr key={admin.uk_administrador}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaUser style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                            <strong>{admin.s_usuario}</strong>
                            {admin.uk_administrador === user?.uk_administrador && (
                              <span style={{
                                backgroundColor: 'var(--primary-medical)',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600'
                              }}>
                                TÚ
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              {admin.s_nombre} {admin.s_apellido}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <FaEnvelope style={{ color: 'var(--primary-medical)', fontSize: '12px' }} />
                              <span style={{ color: 'var(--primary-medical)' }}>{admin.s_email}</span>
                            </div>
                            {admin.b_email_verified ? (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                fontSize: '11px',
                                color: '#10b981',
                                fontWeight: '500'
                              }}>
                                <FaCheckCircle style={{ fontSize: '10px' }} />
                                {t('admin:users.emailVerified', 'Email verificado')}
                              </div>
                            ) : (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                fontSize: '11px',
                                color: '#f59e0b',
                                fontWeight: '500'
                              }}>
                                <FaExclamationCircle style={{ fontSize: '10px' }} />
                                {t('admin:users.pendingVerification', 'Pendiente de verificación')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {admin.c_telefono ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FaPhone style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                              <span style={{ fontFamily: 'monospace' }}>{admin.c_telefono}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{t('admin:users.noPhone', 'No registrado')}</span>
                          )}
                        </td>
                        <td>
                          <span className="status-badge warning">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FaUserShield style={{ fontSize: '10px' }} />
                              {t('common:roles.admin')}
                            </div>
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaCalendarAlt style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                            <span style={{ fontSize: '14px' }}>
                              {admin.d_fecha_creacion ? new Date(admin.d_fecha_creacion).toLocaleDateString('es-ES') : t('common:messages.noData', 'No disponible')}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="user-actions" style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleEdit(admin)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              title={t('common:buttons.edit')}
                            >
                              <FaEdit />
                            </button>
                            {admin.uk_administrador !== user?.uk_administrador && (
                              <button
                                onClick={() => handleDelete(admin)}
                                className="btn btn-danger"
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                title={t('common:buttons.delete')}
                              >
                                <FaTrash />
                              </button>
                            )}
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

      {/* Modal para crear/editar usuario */}
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
            overflow: 'auto',
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
                {editingAdmin ? t('admin:users.editUser') : t('admin:users.newUser', 'Nuevo Usuario Administrativo')}
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
                  <label>{t('admin:users.form.name')} *</label>
                  <input
                    type="text"
                    name="s_nombre"
                    value={formData.s_nombre}
                    onChange={handleInputChange}
                    placeholder={t('admin:users.form.namePlaceholder')}
                    className="form-control"
                    required
                    maxLength={50}
                  />
                </div>
                <div className="form-group">
                  <label>{t('admin:users.form.lastName', 'Apellido')} *</label>
                  <input
                    type="text"
                    name="s_apellido"
                    value={formData.s_apellido}
                    onChange={handleInputChange}
                    placeholder={t('admin:users.form.lastNamePlaceholder', 'Apellido')}
                    className="form-control"
                    required
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin:users.form.email')} *</label>
                  <input
                    type="email"
                    name="s_email"
                    value={formData.s_email}
                    onChange={handleInputChange}
                    placeholder={t('admin:users.form.emailPlaceholder')}
                    className="form-control"
                    required
                    maxLength={100}
                    readOnly={editingAdmin !== null}
                    disabled={editingAdmin !== null}
                    style={editingAdmin !== null ? { 
                      backgroundColor: '#f5f5f5', 
                      cursor: 'not-allowed',
                      color: '#666'
                    } : {}}
                    title={editingAdmin !== null ? 'El email no puede modificarse una vez creado el usuario' : ''}
                  />
                  {editingAdmin !== null && (
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      ℹ️ El email no puede modificarse para mantener la verificación
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>{t('admin:users.form.phone', 'Teléfono')}</label>
                  <input
                    type="tel"
                    name="c_telefono"
                    value={formData.c_telefono}
                    onChange={handleInputChange}
                    placeholder={t('admin:users.form.phonePlaceholder', '+57 300 123 4567')}
                    className="form-control"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin:users.form.username', 'Usuario')} *</label>
                  <input
                    type="text"
                    name="s_usuario"
                    value={formData.s_usuario}
                    onChange={handleInputChange}
                    placeholder={t('admin:users.form.usernamePlaceholder', 'nombre_usuario')}
                    className="form-control"
                    required
                    maxLength={30}
                  />
                </div>
                <div className="form-group">
                  <label>{t('admin:users.form.userType', 'Tipo de Usuario')} *</label>
                  <select
                    name="tipo_usuario"
                    value={formData.tipo_usuario}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  >
                    <option value="1">{t('common:roles.admin', 'Administrador')}</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>
                    {editingAdmin ? t('admin:users.form.newPasswordOptional', 'Nueva Contraseña (opcional)') : t('admin:users.form.password') + ' *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="s_password"
                      value={formData.s_password}
                      onChange={handleInputChange}
                      placeholder={editingAdmin ? t('admin:users.form.passwordEmptyToKeep', 'Dejar vacío para no cambiar') : t('admin:users.form.passwordPlaceholder')}
                      className="form-control"
                      style={{ paddingRight: '40px' }}
                      required={!editingAdmin}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Campo de Confirmación de Contraseña - Solo aparece si hay contraseña escrita */}
                {formData.s_password && formData.s_password.length > 0 && (
                  <div className="form-group">
                    <label>
                      {t('admin:users.form.confirmPassword', 'Confirmar Contraseña')} *
                    </label>
                    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                      <input
                        type={showPasswordConfirm ? 'text' : 'password'}
                        name="s_password_confirm"
                        value={formData.s_password_confirm}
                        onChange={handleInputChange}
                        placeholder={t('admin:users.form.confirmPassword', 'Confirmar Contraseña')}
                        className="form-control"
                        style={{ 
                          paddingRight: '40px',
                          borderColor: formData.s_password_confirm && formData.s_password !== formData.s_password_confirm ? '#d93025' : ''
                        }}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {formData.s_password_confirm && formData.s_password !== formData.s_password_confirm && (
                      <small style={{ color: '#d93025', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                         Las contraseñas no coinciden
                      </small>
                    )}
                    {formData.s_password_confirm && formData.s_password === formData.s_password_confirm && (
                      <small style={{ color: '#137333', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                         Las contraseñas coinciden
                      </small>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  {t('common:buttons.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaCheck />
                  {editingAdmin ? t('common:buttons.update') : t('common:buttons.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de advertencia (no puede eliminar su propia cuenta) */}
      {showWarningModal && (
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
            <div style={{ padding: '32px 24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(255, 193, 7, 0.3)',
                  animation: 'successPulse 0.6s ease-out'
                }}>
                  <FaExclamationTriangle style={{ color: 'white', fontSize: '32px' }} />
                </div>
              </div>

              <h3 style={{ 
                margin: '0 0 12px 0',
                color: 'var(--text-primary)',
                fontSize: '22px',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                Advertencia
              </h3>

              <p style={{ 
                margin: '0 0 24px 0',
                color: 'var(--text-secondary)',
                fontSize: '16px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {warningModalData.message}
              </p>
            </div>

            <div style={{ 
              padding: '16px 24px 24px',
              display: 'flex', 
              justifyContent: 'center'
            }}>
              <button 
                type="button" 
                onClick={closeWarningModal}
                style={{
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                  width: '100%',
                  maxWidth: '200px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(255, 193, 7, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && userToDelete && (
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

            <div style={{ padding: '24px' }}>
              <p style={{ 
                margin: '0 0 16px 0',
                color: 'var(--text-primary)',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                ¿Estás seguro de eliminar el usuario <strong>{userToDelete.s_usuario}</strong>?
              </p>
              
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
                    <strong>Usuario:</strong> {userToDelete.s_usuario}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FaUser style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Nombre:</strong> {userToDelete.s_nombre} {userToDelete.s_apellido}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaEnvelope style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Email:</strong> {userToDelete.s_email}
                  </span>
                </div>
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
                Sí, eliminar usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notificación de éxito */}
      {showSuccessModal && successModalData.data && (
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
            <div style={{ padding: '32px 24px' }}>
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

              <h3 style={{ 
                margin: '0 0 12px 0',
                color: 'var(--text-primary)',
                fontSize: '22px',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                ¡Éxito!
              </h3>

              <p style={{ 
                margin: '0 0 20px 0',
                color: 'var(--text-secondary)',
                fontSize: '15px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {successModalData.message}
              </p>
              
              <div style={{
                background: isDarkMode ? 'rgba(119, 184, 206, 0.08)' : 'rgba(216, 240, 244, 0.4)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: `1px solid ${isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.25)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FaUser style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Usuario:</strong> {successModalData.data.usuario}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FaUser style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Nombre:</strong> {successModalData.data.nombre} {successModalData.data.apellido}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: successModalData.data.telefono ? '8px' : '0' }}>
                  <FaEnvelope style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Email:</strong> {successModalData.data.email}
                  </span>
                </div>
                {successModalData.data.telefono && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaPhone style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                    <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                      <strong>Teléfono:</strong> {successModalData.data.telefono}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              height: '4px',
              background: isDarkMode ? 'rgba(40, 167, 69, 0.1)' : 'rgba(40, 167, 69, 0.15)',
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
            <div style={{ padding: '32px 24px' }}>
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

              <h3 style={{ 
                margin: '0 0 12px 0',
                color: 'var(--text-primary)',
                fontSize: '22px',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                Error
              </h3>

              <p style={{ 
                margin: '0 0 24px 0',
                color: 'var(--text-secondary)',
                fontSize: '16px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {errorModalData.message}
              </p>
            </div>

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
                animation: 'autoCloseProgress 4s linear forwards'
              }} />
            </div>

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

      <AdminFooter />
      <Chatbot />

      {/* Tutorial Component */}
      <Tutorial
        steps={getAvailableUsersTutorialSteps()}
        show={showTutorial}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />
    </div>
  );
};

export default AdminUsersPage;