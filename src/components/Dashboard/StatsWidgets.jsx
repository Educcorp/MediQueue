import React, { useState, useEffect } from 'react';
import {
    FaCalendarCheck,
    FaUserInjured,
    FaHospital,
    FaUsersCog,
    FaClock,
    FaUserCheck,
    FaBuilding,
    FaUserShield,
    FaCheckCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaSync
} from 'react-icons/fa';

import {
    LuTrendingUp,
    LuTrendingDown,
    LuActivity
} from 'react-icons/lu';

const StatsWidgets = ({ stats, loading }) => {
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdate(new Date());
        }, 30000); // Actualizar cada 30 segundos

        return () => clearInterval(interval);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const widgets = [
        {
            title: 'Turnos Hoy',
            value: stats.todayTurns,
            icon: <FaCalendarCheck />,
            color: 'primary',
            trend: '+12%',
            trendUp: true,
            subtitle: 'Turnos programados'
        },
        {
            title: 'Pacientes Activos',
            value: stats.totalPatients,
            icon: <FaUserInjured />,
            color: 'success',
            trend: '+8%',
            trendUp: true,
            subtitle: 'Pacientes registrados'
        },
        {
            title: 'Consultorios',
            value: stats.totalConsultorios,
            icon: <FaHospital />,
            color: 'warning',
            trend: '100%',
            trendUp: true,
            subtitle: 'Disponibles'
        },
        {
            title: 'Administradores',
            value: stats.totalAdmins,
            icon: <FaUserShield />,
            color: 'danger',
            trend: 'Activos',
            trendUp: true,
            subtitle: 'Usuarios del sistema'
        }
    ];

    if (loading) {
        return (
            <div className="stats-widgets-section">
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
                    <p>Cargando estadísticas...</p>
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
        <div className="stats-widgets-section">
            <div className="widgets-header">
                <h2 className="section-title">
                    <LuActivity />
                    Estadísticas en Tiempo Real
                </h2>
                <div className="last-update">
                    <FaSync className="text-sm" />
                    <span>Última actualización: {formatTime(lastUpdate)}</span>
                </div>
            </div>

            <div className="widgets-grid">
                {widgets.map((widget, index) => (
                    <div key={index} className={`stats-widget ${widget.color}`}>
                        <div className="widget-header">
                            <div className="widget-icon">
                                {widget.icon}
                            </div>
                            <div className="widget-trend">
                                {widget.trendUp ? <LuTrendingUp /> : <LuTrendingDown />}
                                <span>{widget.trend}</span>
                            </div>
                        </div>

                        <div className="widget-content">
                            <h3 className="widget-value">{widget.value}</h3>
                            <p className="widget-title">{widget.title}</p>
                            <p className="widget-subtitle">{widget.subtitle}</p>
                        </div>

                        <div className="widget-footer">
                            <div className="widget-status">
                                <FaCheckCircle />
                                <span>Activo</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsWidgets;

