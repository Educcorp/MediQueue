import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import patientService from '../services/patientService';
import { RECORD_STATUS_LABELS } from '../utils/constants';
import { formatDate, calculateAge, formatPhone } from '../utils/helpers';

const PatientManagement = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            setLoading(true);
            setError(null);

            const patientsData = await patientService.getAllPatients();
            setPatients(patientsData);
        } catch (error) {
            console.error('Error cargando pacientes:', error);
            setError('Error cargando pacientes');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
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

    if (loading) {
        return (
            <div className="patient-management loading">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando pacientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-management">
            <header className="management-header">
                <div className="header-left">
                    <div className="header-logo-section">
                        <div className="header-logo-container">
                            <img src="/images/mediqueue_logo.png" alt="MediQueue Logo" className="header-logo-image" />
                            <div className="header-logo-text-group">
                                <span className="header-logo-text">Medi</span>
                                <span className="header-logo-text2">Queue</span>
                            </div>
                        </div>
                        <div className="header-subtitle">
                            <h1>Gestión de Pacientes</h1>
                            <p>Administración de información de pacientes</p>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                        <i className="fas fa-arrow-left"></i>
                        Volver al Dashboard
                    </button>
                    <span className="admin-name">
                        <i className="fas fa-user-shield"></i>
                        {user?.s_nombre || 'Administrador'}
                    </span>
                    <button onClick={handleLogout} className="logout-btn">
                        <i className="fas fa-sign-out-alt"></i>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {error && (
                <div className="error-banner">
                    <span>⚠️ {error}</span>
                    <button onClick={loadPatients} className="retry-btn">
                        Reintentar
                    </button>
                </div>
            )}

            <main className="management-content">
                <div className="content-header">
                    <div className="stats-container">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="stat-info">
                                <h3>{patients.length}</h3>
                                <p>Total Pacientes</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="fas fa-user-check"></i>
                            </div>
                            <div className="stat-info">
                                <h3>{patients.filter(p => p.ck_estado === 'ACTIVO').length}</h3>
                                <p>Pacientes Activos</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="fas fa-user-times"></i>
                            </div>
                            <div className="stat-info">
                                <h3>{patients.filter(p => p.ck_estado === 'INACTIVO').length}</h3>
                                <p>Pacientes Inactivos</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div className="stat-info">
                                <h3>{patients.filter(p => p.s_email).length}</h3>
                                <p>Con Email</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de búsqueda y filtros */}
                <div className="search-and-filters">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar pacientes..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                        <i className="fas fa-search search-icon"></i>
                    </div>
                    <div className="filters">
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            className="filter-select"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="ACTIVO">Activos</option>
                            <option value="INACTIVO">Inactivos</option>
                        </select>
                    </div>
                    <div className="actions-bar">
                        <button onClick={handleAddNew} className="btn primary">
                            <i className="fas fa-plus"></i>
                            Nuevo Paciente
                        </button>
                        <button onClick={loadPatients} className="btn secondary">
                            <i className="fas fa-sync-alt"></i>
                            Actualizar
                        </button>
                    </div>
                </div>

                <div className="patients-table">
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
                                        <div className="patient-name">
                                            <strong>{patient.s_nombre} {patient.s_apellido}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="phone-number">
                                            {formatPhone(patient.c_telefono)}
                                        </span>
                                    </td>
                                    <td>
                                        {patient.s_email ? (
                                            <span className="email">{patient.s_email}</span>
                                        ) : (
                                            <span className="no-email">No registrado</span>
                                        )}
                                    </td>
                                    <td>
                                        {patient.d_fecha_nacimiento ? (
                                            <span className="age">{calculateAge(patient.d_fecha_nacimiento)} años</span>
                                        ) : (
                                            <span className="no-age">No registrado</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${patient.ck_estado === 'ACTIVO' ? 'active' : 'inactive'}`}>
                                            {RECORD_STATUS_LABELS[patient.ck_estado]}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="registration-date">
                                            {formatDate(patient.d_fecha_creacion)}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            onClick={() => handleEdit(patient)}
                                            className="edit-button"
                                            title="Editar paciente"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(patient)}
                                            className="delete-button"
                                            title="Eliminar paciente"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredPatients.length === 0 && (
                        <div className="empty-state">
                            <i className="fas fa-users"></i>
                            <p>{searchTerm || statusFilter !== 'todos' ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal para crear/editar paciente */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
                            <button className="btn small" onClick={() => setShowModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        name="s_nombre"
                                        value={formData.s_nombre}
                                        onChange={handleInputChange}
                                        placeholder="Nombre del paciente"
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
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn primary">
                                    <i className="fas fa-check"></i>
                                    {editingPatient ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .patient-management {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .patient-management.loading {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-container {
          text-align: center;
          color: #718096;
        }

        .loading-spinner {
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

        .error-banner {
          background: #fed7d7;
          color: #c53030;
          padding: 15px 20px;
          margin: 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(197, 48, 48, 0.1);
        }

        .retry-btn {
          background: #c53030;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          background: #9c2626;
          transform: translateY(-1px);
        }

        .management-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-logo-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-logo-image {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .header-logo-text-group {
          display: flex;
          align-items: baseline;
        }

        .header-logo-text {
          font-size: 1.5em;
          font-weight: 700;
          color: #2d3748;
        }

        .header-logo-text2 {
          font-size: 1.5em;
          font-weight: 700;
          color: #667eea;
        }

        .header-subtitle h1 {
          margin: 0;
          color: #2d3748;
          font-size: 1.8em;
        }

        .header-subtitle p {
          margin: 5px 0 0 0;
          color: #718096;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .back-btn {
          background: #f1f5f9;
          border: 1px solid #cbd5e0;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-btn:hover {
          background: #e2e8f0;
        }

        .admin-name {
          color: #4a5568;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logout-btn {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(197, 48, 48, 0.3);
        }

        .management-content {
          padding: 40px 20px;
        }

        .content-header {
          margin-bottom: 30px;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5em;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-info h3 {
          margin: 0;
          font-size: 2em;
          font-weight: 700;
          color: #2d3748;
        }

        .stat-info p {
          margin: 0;
          color: #718096;
          font-weight: 500;
        }

        .search-and-filters {
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

        .filters {
          display: flex;
          gap: 15px;
        }

        .filter-select {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
          background: white;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .actions-bar {
          display: flex;
          gap: 15px;
        }

        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn.primary {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
        }

        .btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
        }

        .btn.secondary {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          color: #4a5568;
        }

        .btn.secondary:hover {
          background: #edf2f7;
        }

        .btn.small {
          padding: 8px 12px;
          font-size: 0.9em;
        }

        .patients-table {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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

        .patient-name {
          font-weight: 600;
          color: #2d3748;
        }

        .phone-number {
          font-family: monospace;
          color: #4a5568;
        }

        .email {
          color: #667eea;
        }

        .no-email, .no-age {
          color: #a0aec0;
          font-style: italic;
        }

        .age {
          color: #4a5568;
          font-weight: 500;
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

        .registration-date {
          color: #718096;
          font-size: 0.9em;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
        }

        .edit-button {
          background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9em;
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
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.3s ease;
        }

        .delete-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(197, 48, 48, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #718096;
        }

        .empty-state i {
          font-size: 3em;
          margin-bottom: 20px;
          opacity: 0.5;
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

        .modal-card {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          color: #2d3748;
        }

        .modal-body {
          padding: 20px;
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

        .form-group input {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
        }

        .modal-actions button {
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .modal-actions button[type="button"] {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          color: #4a5568;
        }

        .modal-actions button[type="button"]:hover {
          background: #edf2f7;
        }

        .modal-actions button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .modal-actions button.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .header-left {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }

          .header-right {
            flex-direction: column;
            gap: 10px;
          }

          .search-and-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .actions-bar {
            justify-content: center;
          }

          .patients-table {
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

          .modal-card {
            width: 95%;
            margin: 10px;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
        </div>
    );
};

export default PatientManagement;

