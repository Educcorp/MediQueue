import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import '../styles/AdminSettingsPage.css';

const AdminSettingsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [settings, setSettings] = useState({
        systemName: 'MediQueue',
        systemVersion: '1.0.0',
        maxTurnsPerDay: 100,
        turnDuration: 30,
        workingHours: {
            start: '08:00',
            end: '18:00'
        },
        notifications: {
            email: true,
            sms: false,
            push: true
        },
        maintenance: {
            enabled: false,
            message: 'Sistema en mantenimiento'
        }
    });

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            // Aquí iría la lógica para guardar la configuración
            // Por ahora simulamos un guardado exitoso
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess('Configuración guardada exitosamente');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError('Error guardando la configuración: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSettings({
            systemName: 'MediQueue',
            systemVersion: '1.0.0',
            maxTurnsPerDay: 100,
            turnDuration: 30,
            workingHours: {
                start: '08:00',
                end: '18:00'
            },
            notifications: {
                email: true,
                sms: false,
                push: true
            },
            maintenance: {
                enabled: false,
                message: 'Sistema en mantenimiento'
            }
        });
    };

    if (loading) {
        return (
            <div className="admin-settings-page loading">
                <AdminHeader />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Guardando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-settings-page">
            <AdminHeader />

            {error && (
                <div className="error-banner">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)} className="retry-btn">
                        ✕
                    </button>
                </div>
            )}

            {success && (
                <div className="success-banner">
                    <span>✅ {success}</span>
                    <button onClick={() => setSuccess(null)} className="close-btn">
                        ✕
                    </button>
                </div>
            )}

            <main className="settings-content">
                <div className="settings-container">
                    <div className="page-header">
                        <h1>⚙️ Configuración del Sistema</h1>
                        <p>Gestiona la configuración general del sistema de turnos</p>
                    </div>

                    <div className="settings-grid">
                        {/* Configuración General */}
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>📋 Configuración General</h2>
                                <p>Configuración básica del sistema</p>
                            </div>
                            <div className="form-group">
                                <label htmlFor="systemName">Nombre del Sistema</label>
                                <input
                                    type="text"
                                    id="systemName"
                                    value={settings.systemName}
                                    onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="systemVersion">Versión del Sistema</label>
                                <input
                                    type="text"
                                    id="systemVersion"
                                    value={settings.systemVersion}
                                    onChange={(e) => setSettings({ ...settings, systemVersion: e.target.value })}
                                    className="form-input"
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Configuración de Turnos */}
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>🕐 Configuración de Turnos</h2>
                                <p>Parámetros relacionados con los turnos</p>
                            </div>
                            <div className="form-group">
                                <label htmlFor="maxTurnsPerDay">Máximo de Turnos por Día</label>
                                <input
                                    type="number"
                                    id="maxTurnsPerDay"
                                    value={settings.maxTurnsPerDay}
                                    onChange={(e) => setSettings({ ...settings, maxTurnsPerDay: parseInt(e.target.value) })}
                                    className="form-input"
                                    min="1"
                                    max="1000"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="turnDuration">Duración de Turnos (minutos)</label>
                                <input
                                    type="number"
                                    id="turnDuration"
                                    value={settings.turnDuration}
                                    onChange={(e) => setSettings({ ...settings, turnDuration: parseInt(e.target.value) })}
                                    className="form-input"
                                    min="5"
                                    max="120"
                                />
                            </div>
                        </div>

                        {/* Horarios de Trabajo */}
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>⏰ Horarios de Trabajo</h2>
                                <p>Define los horarios de atención del sistema</p>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="startTime">Hora de Inicio</label>
                                    <input
                                        type="time"
                                        id="startTime"
                                        value={settings.workingHours.start}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            workingHours: { ...settings.workingHours, start: e.target.value }
                                        })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endTime">Hora de Fin</label>
                                    <input
                                        type="time"
                                        id="endTime"
                                        value={settings.workingHours.end}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            workingHours: { ...settings.workingHours, end: e.target.value }
                                        })}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notificaciones */}
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>🔔 Configuración de Notificaciones</h2>
                                <p>Gestiona los tipos de notificaciones del sistema</p>
                            </div>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.email}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            notifications: { ...settings.notifications, email: e.target.checked }
                                        })}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-text">Notificaciones por Email</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.sms}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            notifications: { ...settings.notifications, sms: e.target.checked }
                                        })}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-text">Notificaciones por SMS</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.push}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            notifications: { ...settings.notifications, push: e.target.checked }
                                        })}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-text">Notificaciones Push</span>
                                </label>
                            </div>
                        </div>

                        {/* Modo Mantenimiento */}
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>🔧 Modo Mantenimiento</h2>
                                <p>Configura el modo de mantenimiento del sistema</p>
                            </div>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenance.enabled}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            maintenance: { ...settings.maintenance, enabled: e.target.checked }
                                        })}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-text">Activar Modo Mantenimiento</span>
                                </label>
                            </div>
                            <div className="form-group">
                                <label htmlFor="maintenanceMessage">Mensaje de Mantenimiento</label>
                                <textarea
                                    id="maintenanceMessage"
                                    value={settings.maintenance.message}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        maintenance: { ...settings.maintenance, message: e.target.value }
                                    })}
                                    className="form-textarea"
                                    rows="3"
                                    disabled={!settings.maintenance.enabled}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="settings-actions">
                        <button onClick={handleReset} className="btn btn-secondary">
                            <i className="fas fa-undo"></i>
                            Restaurar Valores
                        </button>
                        <button onClick={handleSave} className="btn btn-primary" disabled={loading}>
                            <i className="fas fa-save"></i>
                            {loading ? 'Guardando...' : 'Guardar Configuración'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminSettingsPage;
