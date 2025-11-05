import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import AdminFooter from '../components/Common/AdminFooter';
import Chatbot from '../components/Common/Chatbot';
import '../styles/UnifiedAdminPages.css';

// React Icons
import {
    FaCog,
    FaCogs,
    FaClock,
    FaBell,
    FaTools,
    FaSave,
    FaSync,
    FaExclamationTriangle,
    FaTimes,
    FaCheck,
    FaToggleOn,
    FaToggleOff,
    FaEnvelope,
    FaSms,
    FaMobile,
    FaCalendarAlt,
    FaHourglassHalf,
    FaWrench,
    FaDatabase,
    FaShieldAlt,
    FaEye,
    FaChartLine,
    FaUsersCog
} from 'react-icons/fa';

const AdminSettingsPage = () => {
    const { t } = useTranslation(['settings', 'common']);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        general: {
            systemName: 'MediQueue',
            systemVersion: '1.0.0',
            timezone: 'America/Bogota',
            language: 'es',
            dateFormat: 'DD/MM/YYYY'
        },
        operations: {
            maxTurnsPerDay: 100,
            turnDuration: 30,
            workingHours: {
                start: '08:00',
                end: '18:00'
            },
            maxAdvanceDays: 30,
            allowCancellation: true,
            cancellationDeadline: 60 // minutos antes
        },
        notifications: {
            email: true,
            sms: false,
            push: true,
            reminders: {
                enabled: true,
                beforeHours: 24
            },
            adminAlerts: true
        },
        maintenance: {
            enabled: false,
            message: 'Sistema en mantenimiento programado. Regrese más tarde.',
            scheduledTime: '',
            estimatedDuration: 60
        },
        security: {
            sessionTimeout: 120, // minutos
            passwordMinLength: 8,
            requireSpecialChars: true,
            maxLoginAttempts: 3,
            lockoutDuration: 15 // minutos
        }
    });

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
            general: {
                systemName: 'MediQueue',
                systemVersion: '1.0.0',
                timezone: 'America/Bogota',
                language: 'es',
                dateFormat: 'DD/MM/YYYY'
            },
            operations: {
                maxTurnsPerDay: 100,
                turnDuration: 30,
                workingHours: {
                    start: '08:00',
                    end: '18:00'
                },
                maxAdvanceDays: 30,
                allowCancellation: true,
                cancellationDeadline: 60
            },
            notifications: {
                email: true,
                sms: false,
                push: true,
                reminders: {
                    enabled: true,
                    beforeHours: 24
                },
                adminAlerts: true
            },
            maintenance: {
                enabled: false,
                message: 'Sistema en mantenimiento programado. Regrese más tarde.',
                scheduledTime: '',
                estimatedDuration: 60
            },
            security: {
                sessionTimeout: 120,
                passwordMinLength: 8,
                requireSpecialChars: true,
                maxLoginAttempts: 3,
                lockoutDuration: 15
            }
        });
    };

    const handleInputChange = (section, field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setSettings(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [parent]: {
                        ...prev[section][parent],
                        [child]: value
                    }
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        }
    };

    const toggleBoolean = (section, field) => {
        const currentValue = field.includes('.')
            ? settings[section][field.split('.')[0]][field.split('.')[1]]
            : settings[section][field];
        handleInputChange(section, field, !currentValue);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: FaCog },
        { id: 'operations', label: 'Operaciones', icon: FaClock },
        { id: 'notifications', label: 'Notificaciones', icon: FaBell },
        { id: 'maintenance', label: 'Mantenimiento', icon: FaTools },
        { id: 'security', label: 'Seguridad', icon: FaShieldAlt }
    ];

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
                    <p>Guardando configuración...</p>
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
                        <FaCog />
                    </div>
                    <div className="page-header-content">
                        <h1 className="page-title">Configuración del Sistema</h1>
                        <p className="page-subtitle">
                            Administra la configuración general y parámetros operacionales
                        </p>
                    </div>
                    <div className="page-actions">
                        <button className="btn btn-secondary" onClick={handleReset}>
                            <FaSync /> Restaurar
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <FaSave /> Guardar Cambios
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="error-message">
                        <FaExclamationTriangle />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            <FaTimes />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        <FaCheck />
                        <span>{success}</span>
                        <button onClick={() => setSuccess(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', overflowX: 'auto' }}>
                    {tabs.map(tab => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                                style={{
                                    minWidth: 'auto',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <IconComponent />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="content-card">
                    <div className="card-content">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div>
                                <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--text-primary)' }}>
                                    Configuración General del Sistema
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                    <div className="form-group">
                                        <label>Nombre del Sistema</label>
                                        <input
                                            type="text"
                                            value={settings.general.systemName}
                                            onChange={(e) => handleInputChange('general', 'systemName', e.target.value)}
                                            className="form-control"
                                            placeholder="Nombre del sistema"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Versión</label>
                                        <input
                                            type="text"
                                            value={settings.general.systemVersion}
                                            onChange={(e) => handleInputChange('general', 'systemVersion', e.target.value)}
                                            className="form-control"
                                            placeholder="Versión del sistema"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Zona Horaria</label>
                                        <select
                                            value={settings.general.timezone}
                                            onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                                            className="form-control"
                                        >
                                            <option value="America/Bogota">Colombia (GMT-5)</option>
                                            <option value="America/Mexico_City">México (GMT-6)</option>
                                            <option value="America/Argentina/Buenos_Aires">Argentina (GMT-3)</option>
                                            <option value="America/Lima">Perú (GMT-5)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Idioma</label>
                                        <select
                                            value={settings.general.language}
                                            onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                                            className="form-control"
                                        >
                                            <option value="es">Español</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Operations Settings */}
                        {activeTab === 'operations' && (
                            <div>
                                <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--text-primary)' }}>
                                    Configuración Operacional
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                    <div className="form-group">
                                        <label>Máximo Turnos por Día</label>
                                        <input
                                            type="number"
                                            value={settings.operations.maxTurnsPerDay}
                                            onChange={(e) => handleInputChange('operations', 'maxTurnsPerDay', parseInt(e.target.value))}
                                            className="form-control"
                                            min="1"
                                            max="500"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Duración del Turno (minutos)</label>
                                        <input
                                            type="number"
                                            value={settings.operations.turnDuration}
                                            onChange={(e) => handleInputChange('operations', 'turnDuration', parseInt(e.target.value))}
                                            className="form-control"
                                            min="5"
                                            max="120"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Hora de Inicio</label>
                                        <input
                                            type="time"
                                            value={settings.operations.workingHours.start}
                                            onChange={(e) => handleInputChange('operations', 'workingHours.start', e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Hora de Finalización</label>
                                        <input
                                            type="time"
                                            value={settings.operations.workingHours.end}
                                            onChange={(e) => handleInputChange('operations', 'workingHours.end', e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Días Máximos de Anticipación</label>
                                        <input
                                            type="number"
                                            value={settings.operations.maxAdvanceDays}
                                            onChange={(e) => handleInputChange('operations', 'maxAdvanceDays', parseInt(e.target.value))}
                                            className="form-control"
                                            min="1"
                                            max="365"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <button
                                                type="button"
                                                onClick={() => toggleBoolean('operations', 'allowCancellation')}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}
                                            >
                                                {settings.operations.allowCancellation ?
                                                    <FaToggleOn style={{ color: 'var(--primary-medical)' }} /> :
                                                    <FaToggleOff style={{ color: 'var(--text-muted)' }} />
                                                }
                                            </button>
                                            <label style={{ margin: 0, cursor: 'pointer' }} onClick={() => toggleBoolean('operations', 'allowCancellation')}>
                                                Permitir Cancelaciones
                                            </label>
                                        </div>
                                        {settings.operations.allowCancellation && (
                                            <div className="form-group">
                                                <label>Límite de Cancelación (minutos antes)</label>
                                                <input
                                                    type="number"
                                                    value={settings.operations.cancellationDeadline}
                                                    onChange={(e) => handleInputChange('operations', 'cancellationDeadline', parseInt(e.target.value))}
                                                    className="form-control"
                                                    min="0"
                                                    max="1440"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Settings */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--text-primary)' }}>
                                    Configuración de Notificaciones
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                        <div style={{
                                            padding: '20px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--border-radius-sm)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px'
                                        }}>
                                            <FaEnvelope style={{ fontSize: '24px', color: 'var(--primary-medical)' }} />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, marginBottom: '4px' }}>Email</h4>
                                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Notificaciones por correo</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleBoolean('notifications', 'email')}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}
                                            >
                                                {settings.notifications.email ?
                                                    <FaToggleOn style={{ color: 'var(--success-color)' }} /> :
                                                    <FaToggleOff style={{ color: 'var(--text-muted)' }} />
                                                }
                                            </button>
                                        </div>

                                        <div style={{
                                            padding: '20px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--border-radius-sm)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px'
                                        }}>
                                            <FaSms style={{ fontSize: '24px', color: 'var(--warning-color)' }} />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, marginBottom: '4px' }}>SMS</h4>
                                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Mensajes de texto</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleBoolean('notifications', 'sms')}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}
                                            >
                                                {settings.notifications.sms ?
                                                    <FaToggleOn style={{ color: 'var(--success-color)' }} /> :
                                                    <FaToggleOff style={{ color: 'var(--text-muted)' }} />
                                                }
                                            </button>
                                        </div>

                                        <div style={{
                                            padding: '20px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--border-radius-sm)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px'
                                        }}>
                                            <FaMobile style={{ fontSize: '24px', color: 'var(--info-color)' }} />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, marginBottom: '4px' }}>Push</h4>
                                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Notificaciones push</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleBoolean('notifications', 'push')}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}
                                            >
                                                {settings.notifications.push ?
                                                    <FaToggleOn style={{ color: 'var(--success-color)' }} /> :
                                                    <FaToggleOff style={{ color: 'var(--text-muted)' }} />
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <button
                                                type="button"
                                                onClick={() => toggleBoolean('notifications', 'reminders.enabled')}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}
                                            >
                                                {settings.notifications.reminders.enabled ?
                                                    <FaToggleOn style={{ color: 'var(--primary-medical)' }} /> :
                                                    <FaToggleOff style={{ color: 'var(--text-muted)' }} />
                                                }
                                            </button>
                                            <label style={{ margin: 0, cursor: 'pointer' }} onClick={() => toggleBoolean('notifications', 'reminders.enabled')}>
                                                Recordatorios Automáticos
                                            </label>
                                        </div>
                                        {settings.notifications.reminders.enabled && (
                                            <div className="form-group">
                                                <label>Horas Antes del Turno</label>
                                                <input
                                                    type="number"
                                                    value={settings.notifications.reminders.beforeHours}
                                                    onChange={(e) => handleInputChange('notifications', 'reminders.beforeHours', parseInt(e.target.value))}
                                                    className="form-control"
                                                    min="1"
                                                    max="72"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Maintenance Settings */}
                        {activeTab === 'maintenance' && (
                            <div>
                                <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--text-primary)' }}>
                                    Configuración de Mantenimiento
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{
                                        padding: '20px',
                                        border: `2px solid ${settings.maintenance.enabled ? 'var(--warning-color)' : 'var(--border-color)'}`,
                                        borderRadius: 'var(--border-radius)',
                                        background: settings.maintenance.enabled ? 'rgba(255, 193, 7, 0.1)' : 'transparent'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                            <FaWrench style={{ fontSize: '24px', color: settings.maintenance.enabled ? 'var(--warning-color)' : 'var(--text-muted)' }} />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, marginBottom: '4px' }}>Modo Mantenimiento</h4>
                                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                                                    {settings.maintenance.enabled ? 'Sistema actualmente en mantenimiento' : 'Sistema operativo normal'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleBoolean('maintenance', 'enabled')}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '32px' }}
                                            >
                                                {settings.maintenance.enabled ?
                                                    <FaToggleOn style={{ color: 'var(--warning-color)' }} /> :
                                                    <FaToggleOff style={{ color: 'var(--text-muted)' }} />
                                                }
                                            </button>
                                        </div>

                                        <div className="form-group">
                                            <label>Mensaje de Mantenimiento</label>
                                            <textarea
                                                value={settings.maintenance.message}
                                                onChange={(e) => handleInputChange('maintenance', 'message', e.target.value)}
                                                className="form-control"
                                                rows="3"
                                                placeholder="Mensaje que verán los usuarios durante el mantenimiento"
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Fecha y Hora Programada</label>
                                                <input
                                                    type="datetime-local"
                                                    value={settings.maintenance.scheduledTime}
                                                    onChange={(e) => handleInputChange('maintenance', 'scheduledTime', e.target.value)}
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Duración Estimada (minutos)</label>
                                                <input
                                                    type="number"
                                                    value={settings.maintenance.estimatedDuration}
                                                    onChange={(e) => handleInputChange('maintenance', 'estimatedDuration', parseInt(e.target.value))}
                                                    className="form-control"
                                                    min="5"
                                                    max="480"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div>
                                <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--text-primary)' }}>
                                    Configuración de Seguridad
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                    <div className="form-group">
                                        <label>Tiempo de Sesión (minutos)</label>
                                        <input
                                            type="number"
                                            value={settings.security.sessionTimeout}
                                            onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                            className="form-control"
                                            min="15"
                                            max="480"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Longitud Mínima de Contraseña</label>
                                        <input
                                            type="number"
                                            value={settings.security.passwordMinLength}
                                            onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                                            className="form-control"
                                            min="6"
                                            max="20"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Máximo Intentos de Login</label>
                                        <input
                                            type="number"
                                            value={settings.security.maxLoginAttempts}
                                            onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                                            className="form-control"
                                            min="3"
                                            max="10"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Duración de Bloqueo (minutos)</label>
                                        <input
                                            type="number"
                                            value={settings.security.lockoutDuration}
                                            onChange={(e) => handleInputChange('security', 'lockoutDuration', parseInt(e.target.value))}
                                            className="form-control"
                                            min="5"
                                            max="60"
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button
                                            type="button"
                                            onClick={() => toggleBoolean('security', 'requireSpecialChars')}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}
                                        >
                                            {settings.security.requireSpecialChars ?
                                                <FaToggleOn style={{ color: 'var(--primary-medical)' }} /> :
                                                <FaToggleOff style={{ color: 'var(--text-muted)' }} />
                                            }
                                        </button>
                                        <label style={{ margin: 0, cursor: 'pointer' }} onClick={() => toggleBoolean('security', 'requireSpecialChars')}>
                                            Requerir Caracteres Especiales en Contraseñas
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <AdminFooter />
            <Chatbot />
        </div>
    );
};

export default AdminSettingsPage;