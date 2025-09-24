import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';

const AdminUsersPage = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: ''
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

            // Usar el servicio real para obtener administradores
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
        setFormData({ nombre: '', email: '', password: '' });
        setShowModal(true);
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            nombre: admin.nombre,
            email: admin.email,
            password: ''
        });
        setShowModal(true);
    };

    const handleDelete = async (admin) => {
        if (admin.id_administrador === user?.id_administrador) {
            alert('No puedes eliminar tu propia cuenta');
            return;
        }

        if (window.confirm(`¿Estás seguro de eliminar al administrador "${admin.nombre}"?`)) {
            try {
                // Llamar al servicio real para eliminar
                await adminService.deleteAdmin(admin.id_administrador);

                // Recargar la lista de administradores
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

        if (!formData.nombre || !formData.email) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        if (!formData.email.includes('@')) {
            alert('Por favor ingrese un email válido');
            return;
        }

        try {
            if (editingAdmin) {
                // Actualizar administrador existente
                await adminService.updateAdmin(editingAdmin.id_administrador, {
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password || undefined // Solo enviar password si se proporcionó
                });

                alert('Administrador actualizado correctamente');
            } else {
                // Crear nuevo administrador
                if (!formData.password) {
                    alert('La contraseña es requerida para nuevos administradores');
                    return;
                }

                await adminService.createAdmin({
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password
                });

                alert('Administrador creado correctamente');
            }

            // Recargar la lista de administradores
            await loadAdmins();
            setShowModal(false);
            setFormData({ nombre: '', email: '', password: '' });
        } catch (error) {
            let errorMessage = 'Error guardando administrador';

            if (error.response && error.response.data) {
                const { message, errors } = error.response.data;
                errorMessage = message;

                // Si hay errores de validación específicos, mostrarlos
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
            {/* Header */}
            <header className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
                            ← Volver al Dashboard
                        </button>
                        <h1>👥 Gestión de Administradores</h1>
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

                    <div className="actions-bar">
                        <button onClick={handleAddNew} className="add-button">
                            + Nuevo Administrador
                        </button>
                        <button onClick={loadAdmins} className="refresh-button">
                            🔄 Actualizar
                        </button>
                    </div>

                    <div className="admins-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(admin => (
                                    <tr key={admin.id_administrador}>
                                        <td>{admin.id_administrador}</td>
                                        <td>{admin.nombre}</td>
                                        <td>{admin.email}</td>
                                        <td className="actions-cell">
                                            <button
                                                onClick={() => handleEdit(admin)}
                                                className="edit-button"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin)}
                                                className="delete-button"
                                                disabled={admin.id_administrador === user?.id_administrador}
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {admins.length === 0 && (
                            <div className="empty-state">
                                <p>No hay administradores registrados</p>
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
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Contraseña {editingAdmin ? '(dejar vacío para no cambiar)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!editingAdmin}
                                    placeholder="Ej: Admin123"
                                />
                                <small style={{ color: '#666', fontSize: '0.8em', marginTop: '4px', display: 'block' }}>
                                    Debe contener al menos una mayúscula, una minúscula y un número
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

            <style jsx>{`
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

        .actions-cell {
          display: flex;
          gap: 10px;
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
          max-width: 500px;
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
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #4a5568;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-group input:focus {
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

          .actions-bar {
            flex-direction: column;
          }

          .admins-table {
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
    );
};

export default AdminUsersPage;
