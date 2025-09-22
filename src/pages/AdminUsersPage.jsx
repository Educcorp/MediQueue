import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import adminService from '../services/adminService';
import { TURN_STATUS_LABELS, USER_TYPE_LABELS } from '../utils/constants';
import '../styles/AdminPages.css';

const AdminUsersPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
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

    if (!formData.s_email.includes('@')) {
      alert('Por favor ingrese un email válido');
      return;
    }

    try {
      if (editingAdmin) {
        // Actualizar administrador existente
        await adminService.updateAdmin(editingAdmin.uk_administrador, {
          s_nombre: formData.s_nombre,
          s_apellido: formData.s_apellido,
          s_email: formData.s_email,
          s_usuario: formData.s_usuario,
          s_password: formData.s_password || undefined,
          c_telefono: formData.c_telefono || undefined,
          tipo_usuario: formData.tipo_usuario
        });

        alert('Administrador actualizado correctamente');
      } else {
        // Crear nuevo administrador
        if (!formData.s_password) {
          alert('La contraseña es requerida para nuevos administradores');
          return;
        }

        await adminService.createAdmin({
          s_nombre: formData.s_nombre,
          s_apellido: formData.s_apellido,
          s_email: formData.s_email,
          s_usuario: formData.s_usuario,
          s_password: formData.s_password,
          c_telefono: formData.c_telefono || undefined,
          tipo_usuario: formData.tipo_usuario
        });

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
        const { message, errors } = error.response.data;
        errorMessage = message;

        if (errors && errors.length > 0) {
          const validationErrors = errors.map(err => err.message).join('\n');
          errorMessage += '\n\nDetalles:\n' + validationErrors;
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

  // Filtrar administradores por término de búsqueda
  const filteredAdmins = admins.filter(admin =>
    admin.s_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.s_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.s_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.s_usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando administradores...</p>
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

            {/* Barra de búsqueda y acciones */}
            <div className="search-and-actions">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Buscar administradores..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
              <div className="actions-bar">
                <button onClick={handleAddNew} className="add-button">
                  + Nuevo Administrador
                </button>
                <button onClick={loadAdmins} className="refresh-button">
                  🔄 Actualizar
                </button>
              </div>
            </div>

            <div className="admins-table">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Usuario</th>
                    <th>Tipo</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map(admin => (
                    <tr key={admin.uk_administrador}>
                      <td>
                        <div className="admin-name">
                          <strong>{admin.s_nombre} {admin.s_apellido}</strong>
                        </div>
                      </td>
                      <td>{admin.s_email}</td>
                      <td>
                        <span className="username-badge">{admin.s_usuario}</span>
                      </td>
                      <td>
                        <span className={`type-badge ${admin.tipo_usuario === 1 ? 'admin' : 'supervisor'}`}>
                          {USER_TYPE_LABELS[admin.tipo_usuario]}
                        </span>
                      </td>
                      <td>{admin.c_telefono || 'No registrado'}</td>
                      <td>
                        <span className={`status-badge ${admin.ck_estado === 'ACTIVO' ? 'active' : 'inactive'}`}>
                          {admin.ck_estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="edit-button"
                          title="Editar administrador"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(admin)}
                          className="delete-button"
                          disabled={admin.uk_administrador === user?.uk_administrador}
                          title={admin.uk_administrador === user?.uk_administrador ? 'No puedes eliminar tu propia cuenta' : 'Eliminar administrador'}
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAdmins.length === 0 && (
                <div className="empty-state">
                  <p>{searchTerm ? 'No se encontraron administradores' : 'No hay administradores registrados'}</p>
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
                  {editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
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
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="s_nombre"
                      value={formData.s_nombre}
                      onChange={handleInputChange}
                      required
                      placeholder="Nombre del administrador"
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellido *</label>
                    <input
                      type="text"
                      name="s_apellido"
                      value={formData.s_apellido}
                      onChange={handleInputChange}
                      required
                      placeholder="Apellido del administrador"
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
                      required
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Usuario *</label>
                    <input
                      type="text"
                      name="s_usuario"
                      value={formData.s_usuario}
                      onChange={handleInputChange}
                      required
                      placeholder="Nombre de usuario"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      name="c_telefono"
                      value={formData.c_telefono}
                      onChange={handleInputChange}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Usuario *</label>
                    <select
                      name="tipo_usuario"
                      value={formData.tipo_usuario}
                      onChange={handleInputChange}
                      required
                    >
                      <option value={2}>Supervisor</option>
                      <option value={1}>Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Contraseña {editingAdmin ? '(dejar vacío para no cambiar)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="s_password"
                    value={formData.s_password}
                    onChange={handleInputChange}
                    required={!editingAdmin}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <small style={{ color: '#666', fontSize: '0.8em', marginTop: '4px', display: 'block' }}>
                    {editingAdmin ? 'Deja vacío para mantener la contraseña actual' : 'Debe contener al menos 6 caracteres'}
                  </small>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary">
                    {editingAdmin ? 'Actualizar' : 'Crear'}
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

export default AdminUsersPage;