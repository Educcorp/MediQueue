import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import AdminFooter from '../components/Common/AdminFooter';
import Chatbot from '../components/Common/Chatbot';
import adminService from '../services/adminService';
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
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

const AdminUsersPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    s_nombre: '',
    s_apellido: '',
    s_email: '',
    s_usuario: '',
    s_password: '',
    c_telefono: '',
    tipo_usuario: 2
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      c_telefono: '',
      tipo_usuario: 2
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
      c_telefono: admin.c_telefono || '',
      tipo_usuario: admin.tipo_usuario
    });
    setShowModal(true);
  };

  const handleDelete = async (admin) => {
    if (admin.uk_administrador === user?.uk_administrador) {
      alert(t('admin:users.messages.cannotDeleteSelf', 'No puedes eliminar tu propia cuenta'));
      return;
    }

    if (window.confirm(t('admin:users.messages.deleteConfirm'))) {
      try {
        await adminService.deleteAdmin(admin.uk_administrador);
        await loadAdmins();
        alert(t('admin:users.messages.deleteSuccess'));
      } catch (error) {
        alert(t('common:messages.error') + ': ' + error.message);
        console.error('Error eliminando administrador:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.s_nombre || !formData.s_apellido || !formData.s_email || !formData.s_usuario) {
      alert(t('admin:users.messages.validationError'));
      return;
    }

    // Validación de contraseña (debe coincidir con la del backend: min 6, 1 minúscula, 1 mayúscula y 1 número)
    const passwordProvided = !!formData.s_password && formData.s_password.length > 0;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!editingAdmin && !passwordProvided) {
      alert(t('admin:users.messages.passwordRequired', 'La contraseña es requerida para crear un nuevo administrador'));
      return;
    }

    if (passwordProvided && !passwordRegex.test(formData.s_password)) {
      alert(t('admin:users.messages.passwordFormat', 'La contraseña debe tener al menos 6 caracteres e incluir minúscula, mayúscula y número'));
      return;
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

      if (editingAdmin) {
        await adminService.updateAdmin(editingAdmin.uk_administrador, adminData);
        alert(t('admin:users.messages.updateSuccess'));
      } else {
        await adminService.createAdmin(adminData);
        alert(t('admin:users.messages.createSuccess') + '\n\n✉️ Se ha enviado un correo de verificación a ' + adminData.s_email + '.\nEl administrador debe verificar su correo antes de poder iniciar sesión.');
      }

      await loadAdmins();
      setShowModal(false);
      setFormData({
        s_nombre: '',
        s_apellido: '',
        s_email: '',
        s_usuario: '',
        s_password: '',
        c_telefono: '',
        tipo_usuario: 2
      });
    } catch (error) {
      let errorMessage = 'Error guardando administrador';
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.message) {
          errorMessage += ': ' + data.message;
        }
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          const detail = data.errors
            .map(err => (err.field ? `${err.field}: ${err.message}` : err.message))
            .join('; ');
          errorMessage += `\nDetalles: ${detail}`;
        }
      } else {
        errorMessage += ': ' + error.message;
      }
      alert(errorMessage);
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
  const superAdmins = admins.filter(a => a.tipo_usuario === 1).length;
  const supervisors = admins.filter(a => a.tipo_usuario === 2).length;

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
                  {totalAdmins}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {t('admin:users.stats.totalUsers', 'Total Usuarios')}
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
                background: 'linear-gradient(135deg, var(--warning-color), #fd7e14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <FaCrown />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {superAdmins}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {t('admin:users.stats.superAdmins', 'Super Administradores')}
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
                <FaUserShield />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {supervisors}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {t('admin:users.stats.supervisors', 'Supervisores')}
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
              <div className="data-table">
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FaEnvelope style={{ color: 'var(--primary-medical)', fontSize: '12px' }} />
                              <span style={{ color: 'var(--primary-medical)' }}>{admin.s_email}</span>
                            </div>
                            {admin.b_email_verified === false || admin.b_email_verified === 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <FaExclamationCircle style={{ color: '#f39c12', fontSize: '11px' }} />
                                <span style={{ 
                                  fontSize: '11px', 
                                  color: '#f39c12',
                                  fontWeight: '500'
                                }}>
                                  Pendiente de verificación
                                </span>
                              </div>
                            ) : admin.b_email_verified === true || admin.b_email_verified === 1 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <FaCheckCircle style={{ color: '#27ae60', fontSize: '11px' }} />
                                <span style={{ 
                                  fontSize: '11px', 
                                  color: '#27ae60',
                                  fontWeight: '500'
                                }}>
                                  Email verificado
                                </span>
                              </div>
                            ) : null}
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
                          <span className={`status-badge ${admin.tipo_usuario === 1 ? 'warning' : 'success'}`}>
                            {admin.tipo_usuario === 1 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaCrown style={{ fontSize: '10px' }} />
                                {t('common:roles.admin')}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaUserShield style={{ fontSize: '10px' }} />
                                {t('common:roles.supervisor')}
                              </div>
                            )}
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
                          <div style={{ display: 'flex', gap: '4px' }}>
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
                  />
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
                    <option value={2}>{t('common:roles.supervisor')}</option>
                    <option value={1}>{t('common:roles.admin')}</option>
                  </select>
                </div>
              </div>

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
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
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
      
      <AdminFooter />
      <Chatbot />
    </div>
  );
};

export default AdminUsersPage;