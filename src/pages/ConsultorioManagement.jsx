import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ConsultorioManagement.css';
import areaService from '../services/areaService';
import consultorioService from '../services/consultorioService';

const ConsultorioManagement = () => {
    const { user, logout } = useAuth();
    const [consultorios, setConsultorios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newAreaName, setNewAreaName] = useState('');
    const [newConsultorioNumbers, setNewConsultorioNumbers] = useState({}); // { [areaId]: numero }
    const [showAreaForm, setShowAreaForm] = useState(false);
    const [showConsultorioForm, setShowConsultorioForm] = useState({}); // { [areaId]: boolean }
    const [errors, setErrors] = useState({ area: '', consultorio: {} });

    // Mapa de iconos y colores por nombre de área
    const areaUI = {
        'Medicina General': { icono: 'fas fa-stethoscope', color: '#4CAF50' },
        'Pediatría': { icono: 'fas fa-baby', color: '#FF9800' },
        'Cardiología': { icono: 'fas fa-heartbeat', color: '#F44336' },
        'Dermatología': { icono: 'fas fa-user-md', color: '#9C27B0' }
    };

    useEffect(() => {
        const loadConsultorios = async () => {
            try {
                setLoading(true);
                // 1) Traer áreas básicas
                const areas = await areaService.getBasics();
                // 2) Para cada área, traer sus consultorios
                const areasConConsultorios = await Promise.all(
                    areas.map(async (a) => {
                        const { consultorios } = await consultorioService.getByArea(a.id_area);
                        // 3) Calcular disponibilidad según endpoint de disponibles
                        const disponibles = await consultorioService.getDisponibles();
                        const disponiblesIds = new Set(disponibles.map((c) => c.id_consultorio));

                        const { icono, color } = areaUI[a.nombre_area] || { icono: 'fas fa-hospital', color: '#77b8ce' };

                        return {
                            id: a.id_area,
                            nombre: a.nombre_area,
                            icono,
                            color,
                            consultorios: consultorios.map((c) => ({
                                id: c.id_consultorio,
                                numero: c.numero_consultorio,
                                disponible: disponiblesIds.has(c.id_consultorio),
                                estado: disponiblesIds.has(c.id_consultorio) ? 'Disponible' : 'Ocupado'
                            }))
                        };
                    })
                );

                setConsultorios(areasConConsultorios);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Error al cargar los consultorios');
                setLoading(false);
            }
        };

        loadConsultorios();
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    // Crear nueva área
    const handleCreateArea = async (e) => {
        e.preventDefault();
        const name = newAreaName.trim();
        if (name.length < 3) {
            setErrors((prev) => ({ ...prev, area: 'El nombre debe tener al menos 3 caracteres' }));
            return;
        }
        try {
            setLoading(true);
            await areaService.create(name);
            setNewAreaName('');
            setErrors((prev) => ({ ...prev, area: '' }));
            setShowAreaForm(false);
            // recargar grilla
            await toggleConsultorioEstado();
        } catch (e) {
            console.error(e);
            alert('No se pudo crear el área');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar un área (si backend lo permite: sin consultorios asociados)
    const handleDeleteArea = async (areaId) => {
        if (!window.confirm('¿Eliminar esta área?')) return;
        try {
            setLoading(true);
            await areaService.remove(areaId);
            await toggleConsultorioEstado();
        } catch (e) {
            console.error(e);
            alert('No se pudo eliminar el área. Verifique que no tenga consultorios asociados.');
        } finally {
            setLoading(false);
        }
    };

    // Crear consultorio en un área
    const handleCreateConsultorio = async (areaId) => {
        const raw = String(newConsultorioNumbers[areaId] || '').trim();
        const numero = Number(raw);
        if (!raw || isNaN(numero) || numero <= 0 || !Number.isInteger(numero)) {
            setErrors((prev) => ({ ...prev, consultorio: { ...prev.consultorio, [areaId]: 'Ingrese un número entero mayor a 0' } }));
            return;
        }
        try {
            setLoading(true);
            await consultorioService.create({ numero_consultorio: numero, id_area: areaId });
            setNewConsultorioNumbers((prev) => ({ ...prev, [areaId]: '' }));
            setErrors((prev) => ({ ...prev, consultorio: { ...prev.consultorio, [areaId]: '' } }));
            setShowConsultorioForm((prev) => ({ ...prev, [areaId]: false }));
            await toggleConsultorioEstado();
        } catch (e) {
            console.error(e);
            alert('No se pudo crear el consultorio. Asegúrese de que el número no exista en la misma área.');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar consultorio
    const handleDeleteConsultorio = async (consultorioId) => {
        if (!window.confirm('¿Eliminar este consultorio?')) return;
        try {
            setLoading(true);
            await consultorioService.remove(consultorioId);
            await toggleConsultorioEstado();
        } catch (e) {
            console.error(e);
            alert('No se pudo eliminar el consultorio. Verifique que no tenga turnos asociados.');
        } finally {
            setLoading(false);
        }
    };

    // Para marcar disponible/ocupado usaremos el criterio actual del backend:
    // Disponible = no tiene turnos en 'En espera' o 'Llamando' hoy.
    // Para efectos de UI, solo recargamos desde el backend después de una acción
    // que afecte la cola (no gestionamos turnos aquí). Aquí ofrecemos un refresco.
    const toggleConsultorioEstado = async () => {
        // En este MVP recargamos datos desde los endpoints para reflejar disponibilidad actual.
        // Si se requiere un switch manual persistente, habría que crear un campo en DB.
        try {
            setLoading(true);
            const areas = await areaService.getBasics();
            const disponibles = await consultorioService.getDisponibles();
            const disponiblesIds = new Set(disponibles.map((c) => c.id_consultorio));
            const areasConConsultorios = await Promise.all(
                areas.map(async (a) => {
                    const { consultorios } = await consultorioService.getByArea(a.id_area);
                    const { icono, color } = areaUI[a.nombre_area] || { icono: 'fas fa-hospital', color: '#77b8ce' };
                    return {
                        id: a.id_area,
                        nombre: a.nombre_area,
                        icono,
                        color,
                        consultorios: consultorios.map((c) => ({
                            id: c.id_consultorio,
                            numero: c.numero_consultorio,
                            disponible: disponiblesIds.has(c.id_consultorio),
                            estado: disponiblesIds.has(c.id_consultorio) ? 'Disponible' : 'Ocupado'
                        }))
                    };
                })
            );
            setConsultorios(areasConConsultorios);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoColor = (disponible) => {
        return disponible ? '#4CAF50' : '#F44336';
    };

    const getEstadoIcon = (disponible) => {
        return disponible ? 'fas fa-check-circle' : 'fas fa-times-circle';
    };

    if (loading) {
        return (
            <div className="consultorio-management">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando consultorios...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="consultorio-management">
                <div className="error-container">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="consultorio-management">
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
                            <h1>Gestión de Consultorios</h1>
                            <p>Administración de consultorios y áreas médicas</p>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <Link to="/admin/dashboard" className="back-btn">
                        <i className="fas fa-arrow-left"></i>
                        Volver al Dashboard
                    </Link>
                    <span className="admin-name">
                        <i className="fas fa-user-shield"></i>
                        {user?.nombre || 'Administrador'}
                    </span>
                    <button onClick={handleLogout} className="logout-btn">
                        <i className="fas fa-sign-out-alt"></i>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="management-content">
                <div className="content-header">
                    <div className="stats-container">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="fas fa-hospital"></i>
                            </div>
                            <div className="stat-info">
                                <h3>{consultorios.length}</h3>
                                <p>Áreas Médicas</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="fas fa-door-open"></i>
                            </div>
                            <div className="stat-info">
                                <h3>{consultorios.reduce((total, area) => total + area.consultorios.length, 0)}</h3>
                                <p>Total Consultorios</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div className="stat-info">
                                <h3>{consultorios.reduce((total, area) =>
                                    total + area.consultorios.filter(c => c.disponible).length, 0)}</h3>
                                <p>Disponibles</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="fas fa-times-circle"></i>
                            </div>
                            <div className="stat-info">
                                <h3>{consultorios.reduce((total, area) =>
                                    total + area.consultorios.filter(c => !c.disponible).length, 0)}</h3>
                                <p>Ocupados</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gestión de áreas */}
                <div className="area-actions">
                    <button className="btn primary" onClick={() => setShowAreaForm(true)}>
                        <i className="fas fa-plus"></i>
                        Añadir Área
                    </button>
                </div>

                {showAreaForm && (
                    <div className="modal-overlay" onClick={() => setShowAreaForm(false)}>
                        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Nueva Área Médica</h3>
                                <button className="btn small" onClick={() => setShowAreaForm(false)}>
                                    Cancelar
                                </button>
                            </div>
                            <form onSubmit={handleCreateArea} className="modal-body">
                                <input
                                    type="text"
                                    placeholder="Nombre de nueva área (mín. 3 caracteres)"
                                    value={newAreaName}
                                    onChange={(e) => setNewAreaName(e.target.value)}
                                    maxLength={60}
                                    autoFocus
                                />
                                {errors.area && <span className="field-error">{errors.area}</span>}
                                <div className="modal-actions">
                                    <button type="button" className="btn" onClick={() => setShowAreaForm(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn primary">
                                        <i className="fas fa-check"></i>
                                        Crear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="areas-grid">
                    {consultorios.map((area) => (
                        <div key={area.id} className="area-card">
                            <div className="area-header" style={{ backgroundColor: area.color }}>
                                <div className="area-icon">
                                    <i className={area.icono}></i>
                                </div>
                                <div className="area-info">
                                    <h2>{area.nombre}</h2>
                                    <p>{area.consultorios.length} consultorios</p>
                                </div>
                                <div className="area-tools">
                                    <button className="btn danger small" onClick={() => handleDeleteArea(area.id)}>
                                        <i className="fas fa-trash"></i>
                                        Eliminar Área
                                    </button>
                                </div>
                            </div>

                            <div className="consultorios-list">
                                {area.consultorios.map((consultorio) => (
                                    <div key={consultorio.id} className="consultorio-item">
                                        <div className="consultorio-info">
                                            <div className="consultorio-number">
                                                <i className="fas fa-door-open"></i>
                                                <span>Consultorio {consultorio.numero}</span>
                                            </div>
                                            <div
                                                className="consultorio-status"
                                                style={{ color: getEstadoColor(consultorio.disponible) }}
                                            >
                                                <i className={getEstadoIcon(consultorio.disponible)}></i>
                                                <span>{consultorio.estado}</span>
                                            </div>
                                        </div>
                                        <button
                                            className={`toggle-btn ${consultorio.disponible ? 'available' : 'occupied'}`}
                                            onClick={toggleConsultorioEstado}
                                        >
                                            <i className={`fas ${consultorio.disponible ? 'fa-pause' : 'fa-play'}`}></i>
                                            {consultorio.disponible ? 'Marcar Ocupado' : 'Marcar Disponible'}
                                        </button>
                                        <button
                                            className="btn danger small"
                                            onClick={() => handleDeleteConsultorio(consultorio.id)}
                                        >
                                            <i className="fas fa-trash"></i>
                                            Eliminar
                                        </button>
                                    </div>
                                ))}

                                <div className="consultorio-add-container">
                                    <button className="btn primary" onClick={() => setShowConsultorioForm((prev) => ({ ...prev, [area.id]: true }))}>
                                        <i className="fas fa-plus"></i>
                                        Añadir Consultorio
                                    </button>
                                </div>

                                {showConsultorioForm[area.id] && (
                                    <div className="modal-overlay" onClick={() => setShowConsultorioForm((prev) => ({ ...prev, [area.id]: false }))}>
                                        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                                            <div className="modal-header">
                                                <h3>Nuevo Consultorio · {area.nombre}</h3>
                                                <button className="btn small" onClick={() => setShowConsultorioForm((prev) => ({ ...prev, [area.id]: false }))}>Cancelar</button>
                                            </div>
                                            <div className="modal-body">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="N° consultorio (entero)"
                                                    value={newConsultorioNumbers[area.id] || ''}
                                                    onChange={(e) => setNewConsultorioNumbers((prev) => ({ ...prev, [area.id]: e.target.value }))}
                                                />
                                                {errors.consultorio?.[area.id] && (
                                                    <span className="field-error">{errors.consultorio[area.id]}</span>
                                                )}
                                                <div className="modal-actions">
                                                    <button className="btn" onClick={() => setShowConsultorioForm((prev) => ({ ...prev, [area.id]: false }))}>Cancelar</button>
                                                    <button className="btn primary" onClick={() => handleCreateConsultorio(area.id)}>
                                                        <i className="fas fa-check"></i>
                                                        Crear
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ConsultorioManagement;
