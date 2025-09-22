import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
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
  FaKey
} from 'react-icons/fa';

const AdminUsersPage = () => {
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
      setError('Error cargando administradores: ' + error.message);
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
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar al administrador "${admin.s_nombre} ${admin.s_apellido}"?`)) {
      try {
        await adminService.deleteAdmin(admin.uk_administrador);
        await loadAdmins();
        alert('Administrador eliminado correctamente');
      } catch (error) {
        alert('Error eliminando administrador: ' + error.message);
        console.error('Error eliminando administrador:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.s_nombre || !formData.s_apellido || !formData.s_email || !formData.s_usuario) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (!editingAdmin && !formData.s_password) {
      alert('La contraseña es requerida para crear un nuevo administrador');
      return;
    }

    try {
      const adminData = {
        s_nombre: formData.s_nombre.trim(),
        s_apellido: formData.s_apellido.trim(),
        s_email: formData.s_email.trim(),
        s_usuario: formData.s_usuario.trim(),
        c_telefono: formData.c_telefono.trim() || null,
        tipo_usuario: parseInt(formData.tipo_usuario)
      };

      if (formData.s_password) {
        adminData.s_password = formData.s_password;
      }

      if (editingAdmin) {
        await adminService.updateAdmin(editingAdmin.uk_administrador, adminData);
        alert('Administrador actualizado correctamente');
      } else {
        await adminService.createAdmin(adminData);
        alert('Administrador creado correctamente');
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
        errorMessage += ': ' + error.response.data.message;
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
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        </div>
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
            <h1 className="page-title">Gestión de Usuarios</h1>
            <p className="page-subtitle">
              Administra los usuarios del sistema - {totalAdmins} administradores registrados
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={loadAdmins}>
              <FaSync /> Actualizar
            </button>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <FaPlus /> Nuevo Usuario
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
                  Total Usuarios
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
                  Super Administradores
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
                  Supervisores
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="filters-section">
          <div className="filter-group" style={{ flex: '1', maxWidth: '400px' }}>
            <label>Buscar Usuarios</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar por nombre, email o usuario..."
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
              <FaFilter /> Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaUsersCog />
              Lista de Usuarios Administrativos
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
            {filteredAdmins.length === 0 ? (
              <div className="empty-state">
                <FaUsersCog />
                <h3>No hay usuarios registrados</h3>
                <p>
                  {searchTerm 
                    ? 'No se encontraron usuarios con los filtros aplicados' 
                    : 'No hay usuarios administrativos en el sistema'}
                </p>
                <button className="btn btn-primary" onClick={handleAddNew}>
                  <FaPlus /> Crear Primer Usuario
                </button>
              </div>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Nombre Completo</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Tipo</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaEnvelope style={{ color: 'var(--primary-medical)', fontSize: '12px' }} />
                            <span style={{ color: 'var(--primary-medical)' }}>{admin.s_email}</span>
                          </div>
                        </td>
                        <td>
                          {admin.c_telefono ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FaPhone style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                              <span style={{ fontFamily: 'monospace' }}>{admin.c_telefono}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No registrado</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${admin.tipo_usuario === 1 ? 'warning' : 'success'}`}>
                            {admin.tipo_usuario === 1 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaCrown style={{ fontSize: '10px' }} />
                                Admin
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaUserShield style={{ fontSize: '10px' }} />
                                Supervisor
                              </div>
                            )}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaCalendarAlt style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                            <span style={{ fontSize: '14px' }}>
                              {admin.d_fecha_creacion ? new Date(admin.d_fecha_creacion).toLocaleDateString('es-ES') : 'No disponible'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleEdit(admin)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              title="Editar usuario"
                            >
                              <FaEdit />
                            </button>
                            {admin.uk_administrador !== user?.uk_administrador && (
                              <button
                                onClick={() => handleDelete(admin)}
                                className="btn btn-danger"
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                title="Eliminar usuario"
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
            background: 'white',
            borderRadius: 'var(--border-radius)',
            padding: 0,
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
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
                {editingAdmin ? 'Editar Usuario' : 'Nuevo Usuario Administrativo'}
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
                    placeholder="Nombre"
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
                    placeholder="Apellido"
                    className="form-control"
                    required
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="s_email"
                    value={formData.s_email}
                    onChange={handleInputChange}
                    placeholder="email@ejemplo.com"
                    className="form-control"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="c_telefono"
                    value={formData.c_telefono}
                    onChange={handleInputChange}
                    placeholder="+57 300 123 4567"
                    className="form-control"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Usuario *</label>
                  <input
                    type="text"
                    name="s_usuario"
                    value={formData.s_usuario}
                    onChange={handleInputChange}
                    placeholder="nombre_usuario"
                    className="form-control"
                    required
                    maxLength={30}
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de Usuario *</label>
                  <select
                    name="tipo_usuario"
                    value={formData.tipo_usuario}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  >
                    <option value={2}>Supervisor</option>
                    <option value={1}>Super Administrador</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  {editingAdmin ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="s_password"
                    value={formData.s_password}
                    onChange={handleInputChange}
                    placeholder={editingAdmin ? 'Dejar vacío para no cambiar' : 'Contraseña segura'}
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
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaCheck />
                  {editingAdmin ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;