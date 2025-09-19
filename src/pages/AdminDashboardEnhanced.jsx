import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import turnService from '../services/turnService';
import patientService from '../services/patientService';
import consultorioService from '../services/consultorioService';
import areaService from '../services/areaService';
import adminService from '../services/adminService';
import '../styles/AdminDashboard.css';

// React Icons imports
import {
    FaCalendarCheck,
    FaUserInjured,
    FaHospital,
    FaUsersCog,
    FaChartLine,
    FaCog,
    FaClock,
    FaUserCheck,
    FaBuilding,
    FaChartBar,
    FaUserShield,
    FaArrowRight,
    FaPlus,
    FaEdit,
    FaSearch,
    FaFileAlt,
    FaHistory,
    FaBell,
    FaCog as FaSettings,
    FaUserMd,
    FaStethoscope,
    FaClipboardList,
    FaCalendarAlt,
    FaUserFriends,
    FaChartPie,
    FaCogs,
    FaTachometerAlt,
    FaExclamationTriangle,
    FaCheckCircle,
    FaInfoCircle
} from 'react-icons/fa';

import {
    HiOutlineUsers,
    HiOutlineViewGrid,
    HiOutlineChartBar,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlineCog,
    HiOutlineChartPie,
    HiOutlineOfficeBuilding,
    HiOutlineUserGroup,
    HiOutlineClipboardList
} from 'react-icons/hi';

import {
    MdDirectionsBoat,
    MdLocalHospital,
    MdPeople,
    MdDashboard,
    MdAssignment,
    MdTrendingUp,
    MdTrendingDown,
    MdAccessTime,
    MdToday,
    MdDateRange
} from 'react-icons/md';

import {
    LuPackage2,
    LuUsers,
    LuCalendar,
    LuSettings,
    LuBarChart3,
    LuActivity,
    LuTrendingUp,
    LuTrendingDown
} from 'react-icons/lu';

const AdminDashboardEnhanced = () => {
    const { user, logout, getEstadisticas } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalTurns: 0,
        activeTurns: 0,
        totalPatients: 0,
        totalConsultorios: 0,
        totalAreas: 0,
        totalAdmins: 0,
        todayTurns: 0,
        completedTurns: 0
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                turnsStats,
                patientsData,
                consultoriosData,
                areasData,
                adminsData,
                todayTurns,
                activeTurns
            ] = await Promise.all([
                turnService.getTurnStatistics().catch(() => null),
                patientService.getAllPatients().catch(() => []),
                consultorioService.getAll().catch(() => []),
                areaService.getAll().catch(() => []),
                adminService.getAllAdmins().catch(() => []),
                turnService.getTurnsByDate(new Date().toISOString().split('T')[0]).catch(() => []),
                turnService.getActiveTurns().catch(() => [])
            ]);

            setStats({
                totalTurns: turnsStats?.total_turnos || 0,
                activeTurns: activeTurns.length,
                totalPatients: patientsData.length,
                totalConsultorios: consultoriosData.length,
                totalAreas: areasData.length,
                totalAdmins: adminsData.length,
                todayTurns: todayTurns.length,
                completedTurns: turnsStats?.turnos_atendidos || 0
            });
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
            setError('Error cargando datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
    };

    const refreshData = () => {
        loadDashboardData();
    };

    if (loading) {
        return (
            <div className="admin-dashboard loading">
                <AdminHeader />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <AdminHeader />
            <div className="dashboard-content-wrapper">
                {error && (
                    <div className="error-banner">
                        <span>⚠️ {error}</span>
                        <button onClick={refreshData} className="retry-btn">
                            Reintentar
                        </button>
                    </div>
                )}

                <main className="dashboard-content">
                    {/* Estadísticas generales */}
                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <div className="stat-icon">
                                <FaCalendarCheck />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.totalTurns}</h3>
                                <p>Total Turnos</p>
                                <div className="stat-trend">
                                    <LuTrendingUp />
                                    <span>+12% este mes</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-icon">
                                <FaClock />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.activeTurns}</h3>
                                <p>Turnos Activos</p>
                                <div className="stat-trend">
                                    <FaCheckCircle />
                                    <span>En tiempo real</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card info">
                            <div className="stat-icon">
                                <FaUserInjured />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.totalPatients}</h3>
                                <p>Pacientes</p>
                                <div className="stat-trend">
                                    <LuTrendingUp />
                                    <span>+8% este mes</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card warning">
                            <div className="stat-icon">
                                <FaHospital />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.totalConsultorios}</h3>
                                <p>Consultorios</p>
                                <div className="stat-trend">
                                    <FaCheckCircle />
                                    <span>Disponibles</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card secondary">
                            <div className="stat-icon">
                                <FaBuilding />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.totalAreas}</h3>
                                <p>Áreas</p>
                                <div className="stat-trend">
                                    <FaCheckCircle />
                                    <span>Configuradas</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card danger">
                            <div className="stat-icon">
                                <FaUserShield />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.totalAdmins}</h3>
                                <p>Administradores</p>
                                <div className="stat-trend">
                                    <FaCheckCircle />
                                    <span>Activos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Accesos rápidos principales */}
                    <div className="quick-access-section">
                        <h2 className="section-title">
                            <FaTachometerAlt />
                            Accesos Rápidos
                        </h2>
                        <div className="quick-access-grid">
                            <Link to="/admin/turns" className="quick-access-card turns">
                                <div className="card-icon">
                                    <FaCalendarCheck />
                                </div>
                                <div className="card-content">
                                    <h3>Gestionar Turnos</h3>
                                    <p>Administrar el sistema de turnos médicos</p>
                                    <div className="card-stats">
                                        <span className="stat-item">
                                            <FaClock />
                                            {stats.activeTurns} activos
                                        </span>
                                        <span className="stat-item">
                                            <MdToday />
                                            {stats.todayTurns} hoy
                                        </span>
                                    </div>
                                </div>
                                <div className="card-arrow">
                                    <FaArrowRight />
                                </div>
                            </Link>

                            <Link to="/admin/patients" className="quick-access-card patients">
                                <div className="card-icon">
                                    <FaUserInjured />
                                </div>
                                <div className="card-content">
                                    <h3>Gestionar Pacientes</h3>
                                    <p>Administrar información de pacientes</p>
                                    <div className="card-stats">
                                        <span className="stat-item">
                                            <FaUserCheck />
                                            {stats.totalPatients} registrados
                                        </span>
                                    </div>
                                </div>
                                <div className="card-arrow">
                                    <FaArrowRight />
                                </div>
                            </Link>

                            <Link to="/admin/consultorios" className="quick-access-card consultorios">
                                <div className="card-icon">
                                    <FaHospital />
                                </div>
                                <div className="card-content">
                                    <h3>Gestionar Consultorios</h3>
                                    <p>Administrar consultorios y áreas médicas</p>
                                    <div className="card-stats">
                                        <span className="stat-item">
                                            <FaBuilding />
                                            {stats.totalConsultorios} consultorios
                                        </span>
                                        <span className="stat-item">
                                            <HiOutlineOfficeBuilding />
                                            {stats.totalAreas} áreas
                                        </span>
                                    </div>
                                </div>
                                <div className="card-arrow">
                                    <FaArrowRight />
                                </div>
                            </Link>

                            <Link to="/admin/users" className="quick-access-card users">
                                <div className="card-icon">
                                    <FaUsersCog />
                                </div>
                                <div className="card-content">
                                    <h3>Gestionar Usuarios</h3>
                                    <p>Crear, editar y eliminar usuarios administradores</p>
                                    <div className="card-stats">
                                        <span className="stat-item">
                                            <FaUserShield />
                                            {stats.totalAdmins} administradores
                                        </span>
                                    </div>
                                </div>
                                <div className="card-arrow">
                                    <FaArrowRight />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Herramientas adicionales */}
                    <div className="tools-section">
                        <h2 className="section-title">
                            <FaCogs />
                            Herramientas del Sistema
                        </h2>
                        <div className="tools-grid">
                            <Link to="/admin/statistics" className="tool-card statistics">
                                <div className="tool-icon">
                                    <FaChartLine />
                                </div>
                                <div className="tool-content">
                                    <h3>Estadísticas</h3>
                                    <p>Reportes y análisis del sistema</p>
                                    <div className="tool-stats">
                                        <span className="stat-item">
                                            <FaCheckCircle />
                                            {stats.completedTurns} atendidos
                                        </span>
                                    </div>
                                </div>
                                <div className="tool-arrow">
                                    <FaArrowRight />
                                </div>
                            </Link>

                            <Link to="/admin/settings" className="tool-card settings">
                                <div className="tool-icon">
                                    <FaCog />
                                </div>
                                <div className="tool-content">
                                    <h3>Configuración</h3>
                                    <p>Configuración del sistema y preferencias</p>
                                    <div className="tool-stats">
                                        <span className="stat-item">
                                            <FaSettings />
                                            Sistema
                                        </span>
                                    </div>
                                </div>
                                <div className="tool-arrow">
                                    <FaArrowRight />
                                </div>
                            </Link>

                            <div className="tool-card reports">
                                <div className="tool-icon">
                                    <FaFileAlt />
                                </div>
                                <div className="tool-content">
                                    <h3>Reportes</h3>
                                    <p>Generar reportes detallados</p>
                                    <div className="tool-stats">
                                        <span className="stat-item">
                                            <FaChartBar />
                                            Disponibles
                                        </span>
                                    </div>
                                </div>
                                <div className="tool-arrow">
                                    <FaArrowRight />
                                </div>
                            </div>

                            <div className="tool-card notifications">
                                <div className="tool-icon">
                                    <FaBell />
                                </div>
                                <div className="tool-content">
                                    <h3>Notificaciones</h3>
                                    <p>Gestionar alertas del sistema</p>
                                    <div className="tool-stats">
                                        <span className="stat-item">
                                            <FaInfoCircle />
                                            Activas
                                        </span>
                                    </div>
                                </div>
                                <div className="tool-arrow">
                                    <FaArrowRight />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del sistema */}
                    <div className="system-info-section">
                        <div className="system-info-card">
                            <div className="info-header">
                                <h3>
                                    <FaInfoCircle />
                                    Información del Sistema
                                </h3>
                            </div>
                            <div className="info-content">
                                <div className="info-item">
                                    <span className="info-label">Versión:</span>
                                    <span className="info-value">2.0.0</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Última actualización:</span>
                                    <span className="info-value">{new Date().toLocaleDateString('es-ES')}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Estado:</span>
                                    <span className="info-value status-active">
                                        <FaCheckCircle />
                                        Activo
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardEnhanced;
