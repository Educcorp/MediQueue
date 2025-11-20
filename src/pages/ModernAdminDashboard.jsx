import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import AdminFooter from '../components/Common/AdminFooter';
import TestSpinner from '../components/Common/TestSpinner';
import Chatbot from '../components/Common/Chatbot';
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
    const { t, i18n } = useTranslation(['admin', 'common']);
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
        todayGrowth: 0,
        patientsGrowth: 0,
        consultoriosActive: 0,
        avgWaitTime: 0
    });

    // Detectar tema actual
    const [theme, setTheme] = useState(() => localStorage.getItem('mq-theme') || 'light');
    const isDarkMode = theme === 'dark';

    // Escuchar cambios de tema
    useEffect(() => {
        const handleThemeChange = () => {
            const currentTheme = localStorage.getItem('mq-theme') || 'light';
            setTheme(currentTheme);
        };

        // Verificar cambios directos en el atributo data-theme
        const observer = new MutationObserver(() => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            if (currentTheme !== theme) {
                setTheme(currentTheme);
            }
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => {
            observer.disconnect();
        };
    }, [theme]);

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
                todayTurns
            ] = await Promise.all([
                turnService.getTurnStatistics().catch(() => null),
                patientService.getAllPatients().catch(() => []),
                consultorioService.getAll().catch(() => []),
                areaService.getAll().catch(() => []),
                // Usar getAllTurns sin filtros para obtener turnos de hoy (por defecto del backend)
                turnService.getAllTurns().catch(() => [])
            ]);

            // Debug: Ver estructura de turnos
            console.log('📊 Total turnos de hoy:', todayTurns.length);
            if (todayTurns.length > 0) {
                console.log('📋 Primer turno estructura:', todayTurns[0]);
                console.log('📋 Estados disponibles:', todayTurns.map(t => t.s_estado));
            }

            // Filtrar turnos activos de hoy (EN_ESPERA o LLAMANDO)
            let activeTurns = todayTurns.filter(turn => 
                turn.s_estado === 'EN_ESPERA' || turn.s_estado === 'LLAMANDO'
            );

            console.log('🎯 Turnos activos filtrados:', activeTurns.length);

            // Si no hay turnos activos, mostrar todos los turnos del día
            if (activeTurns.length === 0) {
                console.log('⚠️ No hay turnos activos, mostrando todos los turnos de hoy');
                activeTurns = todayTurns;
            }

            setStats({
                totalTurns: turnsStats?.total_turnos || 0,
                activeTurns: todayTurns.filter(t => t.s_estado === 'EN_ESPERA' || t.s_estado === 'LLAMANDO').length,
                totalPatients: patientsData.length,
                totalConsultorios: consultoriosData.length,
                todayTurns: todayTurns.length,
                completedTurns: turnsStats?.completados || 0
            });

            // Usar los turnos para la sección de actividad reciente
            // Los turnos ya incluyen información del área y consultorio con colores
            console.log('🎨 Turnos para actividad reciente:', activeTurns.slice(0, 2));
            setRecentTurns(activeTurns.slice(0, 8));

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <TestSpinner message="Cargando dashboard..." />;
    }

    const statCards = [
        {
            id: 'patients',
            title: t('admin:dashboard.stats.patients'),
            value: stats.totalPatients,
            icon: FaUsers,
            color: 'primary',
            growth: quickStats.patientsGrowth,
            subtitle: t('admin:dashboard.stats.patientsSubtitle')
        },
        {
            id: 'turns',
            title: t('admin:dashboard.stats.turnsToday'),
            value: stats.todayTurns,
            icon: FaCalendarCheck,
            color: 'success',
            growth: quickStats.todayGrowth,
            subtitle: t('admin:dashboard.stats.scheduledToday')
        },
        {
            id: 'consultorios',
            title: t('admin:dashboard.stats.offices'),
            value: stats.totalConsultorios,
            icon: FaHospital,
            color: 'info',
            growth: 0,
            subtitle: t('admin:dashboard.stats.activeNow', { count: quickStats.consultoriosActive })
        },
        {
            id: 'active',
            title: t('admin:dashboard.stats.activeTurns'),
            value: stats.activeTurns,
            icon: FaClock,
            color: 'warning',
            growth: 0,
            subtitle: t('admin:dashboard.stats.avgWaitTime', { time: quickStats.avgWaitTime })
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
                            {t('admin:dashboard.welcome')}, {user?.s_nombre || t('admin:dashboard.administrator')}
                        </h1>
                        <p className="dashboard-subtitle">
                            {t('admin:dashboard.summary')} - {new Date().toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="welcome-actions">
                        <button className="action-btn primary" onClick={() => navigate('/admin/turns')}>
                            <FaCalendarCheck /> {t('admin:dashboard.cards.turns.manageButton')}
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
                                    {t('admin:dashboard.viewDetails')} <FaArrowUp />
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
                                {t('admin:dashboard.recentActivity')}
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
                                        <div className="activity-icon" style={{ 
                                            backgroundColor: turn.s_color || '#667eea',
                                            color: 'white',
                                            background: turn.s_color ? turn.s_color : 'linear-gradient(135deg, #667eea, #764ba2)'
                                        }}>
                                            {turn.s_letra || turn.i_numero_turno}
                                        </div>
                                        <div className="activity-content">
                                            <p className="activity-title">
                                                {t('admin:dashboard.turn')} #{turn.i_numero_turno || turn.id || (index + 1)}
                                                {turn.s_nombre_paciente && ` - ${turn.s_nombre_paciente} ${turn.s_apellido_paciente || ''}`}
                                            </p>
                                            <p className="activity-subtitle">
                                                <FaHospital style={{ marginRight: '5px' }} />
                                                {turn.s_nombre_area || turn.area || t('admin:dashboard.office')} 
                                                {' • '}
                                                {t('admin:dashboard.office')} {turn.i_numero_consultorio || turn.consultorio}
                                            </p>
                                        </div>
                                        <div className="activity-status">
                                            <span className={`status-badge ${turn.s_estado?.toLowerCase() || turn.estado || 'pending'}`}>
                                                {turn.s_estado === 'EN_ESPERA' ? t('common:status.waiting') : 
                                                 turn.s_estado === 'LLAMANDO' ? t('common:status.calling') :
                                                 turn.s_estado === 'ATENDIDO' ? t('common:status.completed') : 
                                                 turn.estado || t('common:status.pending')}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state">
                                        <FaClock />
                                        <p>{t('admin:dashboard.noRecentActivity')}</p>
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
                                {t('admin:dashboard.quickActions.title')}
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
                                        <h4>{t('admin:dashboard.quickActions.managePatients')}</h4>
                                        <p>{t('admin:dashboard.quickActions.viewAndManage')}</p>
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
                                        <h4>{t('admin:dashboard.quickActions.scheduleTurns')}</h4>
                                        <p>{t('admin:dashboard.quickActions.createNewTurns')}</p>
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
                                        <h4>{t('admin:dashboard.quickActions.offices')}</h4>
                                        <p>{t('admin:dashboard.quickActions.manageSpaces')}</p>
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
                                        <h4>{t('admin:dashboard.quickActions.viewStatistics')}</h4>
                                        <p>{t('admin:dashboard.quickActions.reportsAndMetrics')}</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <AdminFooter isDarkMode={isDarkMode} />
            <Chatbot />
        </div>
    );
};export default ModernAdminDashboard;
