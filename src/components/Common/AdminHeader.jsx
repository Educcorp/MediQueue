import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/useAuth';
import './AdminHeader.css';

const AdminHeader = () => {
    const { user, logout } = useAuth();
    const { canAccess } = usePermissions();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
    };

    const isActiveRoute = (route) => {
        return location.pathname === route;
    };

    const navigationItems = [
        {
            path: '/admin/dashboard',
            label: 'Dashboard',
            icon: 'fas fa-tachometer-alt',
            permission: 'supervisor'
        },
        {
            path: '/admin/turns',
            label: 'Turnos',
            icon: 'fas fa-calendar-check',
            permission: 'supervisor'
        },
        {
            path: '/admin/patients',
            label: 'Pacientes',
            icon: 'fas fa-user-injured',
            permission: 'supervisor'
        },
        {
            path: '/admin/consultorios',
            label: 'Consultorios',
            icon: 'fas fa-hospital',
            permission: 'supervisor'
        },
        {
            path: '/admin/users',
            label: 'Usuarios',
            icon: 'fas fa-users-cog',
            permission: 'admin'
        },
        {
            path: '/admin/statistics',
            label: 'Estadísticas',
            icon: 'fas fa-chart-line',
            permission: 'supervisor'
        },
        {
            path: '/admin/settings',
            label: 'Configuración',
            icon: 'fas fa-cog',
            permission: 'admin'
        }
    ];

    return (
        <header className="admin-header">
            <div className="header-container">
                {/* Logo y título */}
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
                            <h1>Panel de Administración</h1>
                            <p>Sistema de Gestión Médica</p>
                        </div>
                    </div>
                </div>

                {/* Navegación */}
                <nav className="header-navigation">
                    <ul className="nav-list">
                        {navigationItems.map((item) => {
                            if (!canAccess(item.path)) return null;

                            return (
                                <li key={item.path} className="nav-item">
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                                        title={item.label}
                                    >
                                        <i className={item.icon}></i>
                                        <span className="nav-label">{item.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Información del usuario y acciones */}
                <div className="header-right">
                    <div className="admin-info">
                        <span className="admin-name">
                            <i className="fas fa-user-shield"></i>
                            {user?.s_nombre || 'Administrador'}
                        </span>
                        <span className="admin-role">
                            {user?.tipo_usuario === 1 ? 'Administrador' : 'Supervisor'}
                        </span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <i className="fas fa-sign-out-alt"></i>
                        <span className="logout-text">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
