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
            permission: 'supervisor'
        },
        {
            path: '/admin/turns',
            label: 'Turnos',
            permission: 'supervisor'
        },
        {
            path: '/admin/patients',
            label: 'Pacientes',
            permission: 'supervisor'
        },
        {
            path: '/admin/consultorios',
            label: 'Consultorios',
            permission: 'supervisor'
        },
        {
            path: '/admin/users',
            label: 'Usuarios',
            permission: 'admin'
        },
        {
            path: '/admin/statistics',
            label: 'Estadísticas',
            permission: 'supervisor'
        },
        {
            path: '/admin/settings',
            label: 'Configuración',
            permission: 'admin'
        }
    ];

    return (
        <div className="transparent-header">
            <div className="header-content">
                <div className="logo-section">
                    <img
                        src="/images/mediqueue_logo.png"
                        alt="MediQueue Logo"
                        className="header-logo"
                    />
                    <span className="logo-text">MediQueue®</span>
                </div>

                <div className="header-nav">
                    {navigationItems.map((item) => {
                        if (!canAccess(item.path)) return null;

                        return (
                            <div
                                key={item.path}
                                className={`nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                {item.label}
                            </div>
                        );
                    })}
                </div>

                <div className="header-right">
                    <div className="user-info">
                        <span className="user-name">{user?.s_nombre || 'Administrador'}</span>
                        <span className="user-role">
                            {user?.tipo_usuario === 1 ? 'Admin' : 'Supervisor'}
                        </span>
                    </div>
                    <div className="logout-btn" onClick={handleLogout}>
                        Cerrar Sesión
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
