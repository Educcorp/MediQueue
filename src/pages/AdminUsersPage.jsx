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
    <div className="admin-users-page">
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

        <style>{`
        .admin-users-page {
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

        .search-and-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .search-bar {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }

        .actions-bar {
          display: flex;
          gap: 15px;
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

        .admins-table {
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

        .admin-name {
          font-weight: 600;
          color: #2d3748;
        }

        .username-badge {
          background: #e2e8f0;
          color: #4a5568;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 500;
        }

        .type-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
          text-transform: uppercase;
        }

        .type-badge.admin {
          background: #fed7d7;
          color: #c53030;
        }

        .type-badge.supervisor {
          background: #bee3f8;
          color: #2a4365;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #c6f6d5;
          color: #22543d;
        }

        .status-badge.inactive {
          background: #fed7d7;
          color: #742a2a;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
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

        .delete-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(197, 48, 48, 0.3);
        }

        .delete-button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
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

        .form-group input,
        .form-group select {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
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

          .search-and-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .actions-bar {
            justify-content: center;
          }

          .admins-table {
            overflow-x: auto;
          }

          .actions-cell {
            flex-direction: column;
            gap: 5px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
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

export default AdminUsersPage;