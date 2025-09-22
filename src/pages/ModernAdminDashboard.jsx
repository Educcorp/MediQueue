import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import LoadingScreen from '../components/Common/LoadingScreen';
import turnService from '../services/turnService';
import patientService from '../services/patientService';
import consultorioService from '../services/consultorioService';
import areaService from '../services/areaService';
import adminService from '../services/adminService';
import './ModernAdminDashboard.css';

// React Icons
import {
    FaCalendarCheck,
    FaUsers,
    FaHospital,
    FaChartLine,
    FaClock,
    FaUserCheck,
    FaArrowUp,
    FaArrowDown,
    FaEye,
    FaEdit,
    FaPlus,
    FaFilter,
    FaDownload
} from 'react-icons/fa';
import {
    HiOutlineUsers,
    HiOutlineClock,
    HiOutlineChartBar,
    HiOutlineCalendar
} from 'react-icons/hi';

const ModernAdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTurns: 0,
        activeTurns: 0,
        totalPatients: 0,
        totalConsultorios: 0,
        todayTurns: 0,
        completedTurns: 0
    });
    const [recentTurns, setRecentTurns] = useState([]);
    const [quickStats, setQuickStats] = useState({
        todayGrowth: 12,
        patientsGrowth: 8,
        consultoriosActive: 5,
        avgWaitTime: 15
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const [
                turnsStats,
                patientsData,
                consultoriosData,
                areasData,
                todayTurns,
                activeTurns,
                recentTurnsData
            ] = await Promise.all([
                turnService.getTurnStatistics().catch(() => null),
                patientService.getAllPatients().catch(() => []),
                consultorioService.getAll().catch(() => []),
                areaService.getAll().catch(() => []),
                turnService.getTurnsByDate(new Date().toISOString().split('T')[0]).catch(() => []),
                turnService.getActiveTurns().catch(() => []),
                turnService.getRecentTurns?.() || Promise.resolve([])
            ]);

            setStats({
                totalTurns: turnsStats?.total_turnos || 0,
                activeTurns: activeTurns.length,
                totalPatients: patientsData.length,
                totalConsultorios: consultoriosData.length,
                todayTurns: todayTurns.length,
                completedTurns: turnsStats?.completados || 0
            });

            setRecentTurns(recentTurnsData.slice(0, 8));

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Cargando dashboard médico" showProgress={true} />;
    }

    const statCards = [
        {
            id: 'patients',
            title: 'Total Pacientes',
            value: stats.totalPatients,
            icon: FaUsers,
            color: 'primary',
            growth: quickStats.patientsGrowth,
            subtitle: 'Registrados en el sistema'
        },
        {
            id: 'turns',
            title: 'Turnos Hoy',
            value: stats.todayTurns,
            icon: FaCalendarCheck,
            color: 'success',
            growth: quickStats.todayGrowth,
            subtitle: 'Programados para hoy'
        },
        {
            id: 'consultorios',
            title: 'Consultorios',
            value: stats.totalConsultorios,
            icon: FaHospital,
            color: 'info',
            growth: 0,
            subtitle: `${quickStats.consultoriosActive} activos ahora`
        },
        {
            id: 'active',
            title: 'Turnos Activos',
            value: stats.activeTurns,
            icon: FaClock,
            color: 'warning',
            growth: -3,
            subtitle: `~${quickStats.avgWaitTime}min promedio`
        }
    ];

    return (
        <div className="modern-dashboard">
            <AdminHeader />

            <div className="dashboard-container">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="welcome-content">
                        <h1 className="dashboard-title">
                            Bienvenido, {user?.s_nombre || 'Administrador'}
                        </h1>
                        <p className="dashboard-subtitle">
                            Resumen general del sistema MediQueue - {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="welcome-actions">
                        <button className="action-btn primary" onClick={() => navigate('/admin/turns')}>
                            <FaPlus /> Nuevo Turno
                        </button>
                        <button className="action-btn secondary" onClick={() => navigate('/admin/statistics')}>
                            <FaDownload /> Generar Reporte
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {statCards.map((card) => (
                        <div key={card.id} className={`stat-card ${card.color}`}>
                            <div className="stat-header">
                                <div className="stat-icon">
                                    <card.icon />
                                </div>
                                <div className="stat-growth">
                                    {card.growth > 0 ? <FaArrowUp /> : card.growth < 0 ? <FaArrowDown /> : null}
                                    <span className={card.growth > 0 ? 'positive' : card.growth < 0 ? 'negative' : 'neutral'}>
                                        {card.growth !== 0 ? `${Math.abs(card.growth)}%` : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-value">{card.value.toLocaleString()}</h3>
                                <p className="stat-title">{card.title}</p>
                                <p className="stat-subtitle">{card.subtitle}</p>
                            </div>
                            <div className="stat-footer">
                                <button className="stat-action" onClick={() => navigate(`/admin/${card.id}`)}>
                                    Ver detalles <FaArrowUp />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="content-grid">
                    {/* Recent Activity */}
                    <div className="content-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <HiOutlineCalendar />
                                Actividad Reciente
                            </h3>
                            <div className="card-actions">
                                <button className="card-action">
                                    <FaFilter />
                                </button>
                                <button className="card-action">
                                    <FaEye />
                                </button>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="activity-list">
                                {recentTurns.length > 0 ? recentTurns.map((turn, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-icon">
                                            <FaUserCheck />
                                        </div>
                                        <div className="activity-content">
                                            <p className="activity-title">
                                                Turno #{turn.id || (index + 1)} - {turn.paciente || 'Paciente'}
                                            </p>
                                            <p className="activity-subtitle">
                                                {turn.consultorio || 'Consultorio'} • {turn.fecha || 'Hoy'}
                                            </p>
                                        </div>
                                        <div className="activity-status">
                                            <span className={`status-badge ${turn.estado || 'pending'}`}>
                                                {turn.estado === 'completado' ? 'Completado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state">
                                        <FaClock />
                                        <p>No hay actividad reciente</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="content-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <HiOutlineChartBar />
                                Acciones Rápidas
                            </h3>
                        </div>
                        <div className="card-content">
                            <div className="quick-actions-grid">
                                <button
                                    className="quick-action-item"
                                    onClick={() => navigate('/admin/patients')}
                                >
                                    <div className="quick-action-icon patients">
                                        <FaUsers />
                                    </div>
                                    <div className="quick-action-content">
                                        <h4>Gestionar Pacientes</h4>
                                        <p>Ver y administrar pacientes</p>
                                    </div>
                                </button>

                                <button
                                    className="quick-action-item"
                                    onClick={() => navigate('/admin/turns')}
                                >
                                    <div className="quick-action-icon turns">
                                        <FaCalendarCheck />
                                    </div>
                                    <div className="quick-action-content">
                                        <h4>Programar Turnos</h4>
                                        <p>Crear nuevos turnos</p>
                                    </div>
                                </button>

                                <button
                                    className="quick-action-item"
                                    onClick={() => navigate('/admin/consultorios')}
                                >
                                    <div className="quick-action-icon consultorios">
                                        <FaHospital />
                                    </div>
                                    <div className="quick-action-content">
                                        <h4>Consultorios</h4>
                                        <p>Administrar espacios</p>
                                    </div>
                                </button>

                                <button
                                    className="quick-action-item"
                                    onClick={() => navigate('/admin/statistics')}
                                >
                                    <div className="quick-action-icon stats">
                                        <FaChartLine />
                                    </div>
                                    <div className="quick-action-content">
                                        <h4>Ver Estadísticas</h4>
                                        <p>Reportes y métricas</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="content-card full-width">
                        <div className="card-header">
                            <h3 className="card-title">
                                <HiOutlineUsers />
                                Estado del Sistema
                            </h3>
                            <div className="card-actions">
                                <button className="card-action primary">
                                    <FaEdit /> Configurar
                                </button>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="system-metrics">
                                <div className="metric-item">
                                    <div className="metric-label">Turnos Completados</div>
                                    <div className="metric-bar">
                                        <div className="metric-progress" style={{ width: '75%' }}></div>
                                    </div>
                                    <div className="metric-value">75% (12/16)</div>
                                </div>
                                <div className="metric-item">
                                    <div className="metric-label">Consultorios Ocupados</div>
                                    <div className="metric-bar">
                                        <div className="metric-progress secondary" style={{ width: '60%' }}></div>
                                    </div>
                                    <div className="metric-value">60% (3/5)</div>
                                </div>
                                <div className="metric-item">
                                    <div className="metric-label">Satisfacción Pacientes</div>
                                    <div className="metric-bar">
                                        <div className="metric-progress success" style={{ width: '92%' }}></div>
                                    </div>
                                    <div className="metric-value">92%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernAdminDashboard;
