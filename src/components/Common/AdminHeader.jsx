import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/useAuth';
import {
    FaTachometerAlt,
    FaCalendarCheck,
    FaUserInjured,
    FaHospital,
    FaChartLine,
    FaUser,
    FaSignOutAlt,
    FaCog,
    FaUserCog,
    FaExclamationTriangle,
    FaSun,
    FaMoon,
    FaShieldAlt,
    FaCookie,
    FaHistory
} from 'react-icons/fa';

const AdminHeader = () => {
    const { user, logout } = useAuth();
    const { canAccess } = usePermissions();
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef(null);

    // Estados para animaciones y UI
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [theme, setTheme] = useState(() => localStorage.getItem('mq-theme') || 'light');

    // Detectar scroll para efectos del header
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
            setIsScrolled(currentScrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Ocultar notificación después de 3 segundos
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    // Aplicar tema en raiz y persistir
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem('mq-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    // Función para mostrar notificación
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
    };

    const handleLogout = async () => {
        setConfirmLogout(true);
        setIsMenuOpen(false);
    };

    const confirmLogoutAction = async () => {
        const currentUser = user?.s_nombre || 'Administrador';

        await logout();
        setConfirmLogout(false);

        showNotification(`¡Hasta pronto, ${currentUser}! Has cerrado sesión correctamente.`);

        setTimeout(() => {
            navigate('/admin');
        }, 1500);
    };

    const cancelLogout = () => {
        setConfirmLogout(false);
    };

    const isActiveRoute = (route) => {
        return location.pathname === route;
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Items de navegación principales (sin usuarios y configuración)
    const navigationItems = [
        {
            path: '/admin/dashboard',
            label: 'Dashboard',
            permission: 'supervisor',
            icon: <FaTachometerAlt />
        },
        {
            path: '/admin/turns',
            label: 'Turnos',
            permission: 'supervisor',
            icon: <FaCalendarCheck />
        },
        {
            path: '/admin/patients',
            label: 'Pacientes',
            permission: 'supervisor',
            icon: <FaUserInjured />
        },
        {
            path: '/admin/consultorios',
            label: 'Consultorios',
            permission: 'supervisor',
            icon: <FaHospital />
        },
        {
            path: '/admin/statistics',
            label: 'Estadísticas',
            permission: 'supervisor',
            icon: <FaChartLine />
        }
    ];

    // Items del panel lateral
    const sidebarItems = [
        {
            path: '/admin/users',
            label: 'Gestión de Usuarios',
            permission: 'admin',
            icon: <FaUserCog />
        },
        {
            path: '/admin/settings',
            label: 'Configuración',
            permission: 'admin',
            icon: <FaCog />
        }
    ];

    // Items públicos del panel lateral (no requieren permisos de admin)
    const publicSidebarItems = [
        {
            path: '/privacy',
            label: 'Privacidad y Cookies',
            permission: 'public',
            icon: <FaShieldAlt />
        }
    ];

    // Manejador de clics fuera del menú
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                const profileButton = document.querySelector('[data-profile-button]');
                if (!profileButton?.contains(event.target)) {
                    setIsMenuOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            {/* Header */}
            <header style={{
                backgroundColor: theme === 'dark' ? 'rgba(7, 19, 39, 0.85)' : 'rgba(255, 255, 255, 0.5)',
                color: theme === 'dark' ? '#e6edf3' : '#4a5568',
                padding: '12px 40px',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                height: '80px',
                zIndex: 1000,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: isScrolled ? (theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.35)' : '0 4px 20px rgba(0, 0, 0, 0.1)') : 'none',
                borderBottom: isScrolled ? (theme === 'dark' ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(255, 255, 255, 0.2)') : 'none',
                transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
            }}>
                {/* Partículas de fondo */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            width: `${Math.random() * 4 + 2}px`,
                            height: `${Math.random() * 4 + 2}px`,
                            backgroundColor: (theme === 'dark'
                                ? ['rgba(119, 184, 206, 0.12)', 'rgba(47, 151, 209, 0.08)', 'rgba(148, 163, 184, 0.08)', 'rgba(47, 151, 209, 0.05)']
                                : ['rgba(47, 151, 209, 0.15)', 'rgba(47, 151, 209, 0.1)', 'rgba(74, 85, 104, 0.1)', 'rgba(47, 151, 209, 0.05)'])[Math.floor(Math.random() * 4)],
                            borderRadius: '50%',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: 0.3,
                            animation: `mediqueueFloat ${Math.random() * 20 + 10}s infinite linear`,
                            animationDelay: `${Math.random() * 5}s`,
                        }} />
                    ))}
                </div>

                {/* Línea decorativa */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(47, 151, 209, 0.3) 50%, transparent 100%)',
                    opacity: isScrolled ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                    zIndex: 1,
                }}></div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    minHeight: '56px',
                    boxSizing: 'border-box',
                }}>
                    {/* Logo Section */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            position: 'relative',
                            flexShrink: 0,
                            minWidth: '200px',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={() => setHoveredItem('logo')}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        <img
                            src="/images/mediqueue_logo.png"
                            alt="MediQueue Logo"
                            style={{
                                width: '122px',
                                height: '122px',
                                objectFit: 'contain',
                                flexShrink: 0,
                                position: 'absolute',
                                top: '50%',
                                left: 0,
                                transform: 'translateY(-50%)',
                                zIndex: 25,
                                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                filter: hoveredItem === 'logo' ? 'brightness(1.1)' : 'brightness(1)',
                            }}
                        />
                        <span style={{
                            color: theme === 'dark' ? '#e6edf3' : '#4a5568',
                            fontSize: '28px',
                            fontWeight: 600,
                            letterSpacing: '-0.5px',
                            marginLeft: '130px',
                            textShadow: hoveredItem === 'logo'
                                ? (theme === 'dark' ? '0 0 8px rgba(119, 184, 206, 0.4)' : '0 0 8px rgba(47, 151, 209, 0.5)')
                                : (theme === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.6)' : '0 1px 2px rgba(0, 0, 0, 0.1)'),
                            transform: hoveredItem === 'logo' ? 'translateY(-2px)' : 'translateY(0)',
                            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        }}>MediQueue®</span>
                    </div>

                    {/* Navigation */}
                    <nav style={{
                        display: 'flex',
                        gap: '32px',
                        alignItems: 'center',
                        flex: 1,
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        {navigationItems.map((item, index) => {
                            if (!canAccess(item.path)) return null;

                            return (
                                <div
                                    key={item.path}
                                    style={{
                                        color: isActiveRoute(item.path) ? '#2f97d1' : (theme === 'dark' ? '#cbd5e1' : '#4a5568'),
                                        textDecoration: 'none',
                                        fontWeight: isActiveRoute(item.path) ? 600 : 500,
                                        fontSize: '16px',
                                        position: 'relative',
                                        padding: '12px 20px',
                                        borderRadius: '8px',
                                        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        background: isActiveRoute(item.path)
                                            ? 'rgba(47, 151, 209, 0.1)'
                                            : 'transparent',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        textShadow: 'none',
                                    }}
                                    onMouseEnter={() => setHoveredItem(`nav-${index}`)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    onClick={() => navigate(item.path)}
                                >
                                    <span style={{
                                        marginRight: '8px',
                                        color: isActiveRoute(item.path) ? '#2f97d1' : (theme === 'dark' ? '#9aa4ae' : '#6b7280'),
                                        transform: hoveredItem === `nav-${index}` ? 'scale(1.2) translateY(-1px)' : 'scale(1)',
                                        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                    }}>
                                        {item.icon}
                                    </span>
                                    <span style={{
                                        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        transform: hoveredItem === `nav-${index}` ? 'translateX(3px)' : 'translateX(0)',
                                    }}>
                                        {item.label}
                                    </span>

                                    {/* Animated background effect */}
                                    {hoveredItem === `nav-${index}` && !isActiveRoute(item.path) && (
                                        <>
                                            <span style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                background: 'rgba(47, 151, 209, 0.1)',
                                                zIndex: -1,
                                                transform: 'translateY(100%)',
                                                animation: 'mediqueueSlideUp 0.4s forwards cubic-bezier(0.25, 0.8, 0.25, 1)',
                                            }}></span>
                                            <span style={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '2px',
                                                bottom: '0',
                                                left: '0',
                                                background: 'linear-gradient(90deg, transparent 0%, rgba(47, 151, 209, 0.5) 50%, transparent 100%)',
                                                animation: 'mediqueueFadeIn 0.3s forwards',
                                            }}></span>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Profile Section */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flexShrink: 0,
                        minWidth: '150px',
                        justifyContent: 'flex-end',
                    }}>
                        {/* iOS-style theme toggle */}
                        <button
                            aria-label="Cambiar tema"
                            title={theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
                            onClick={toggleTheme}
                            style={{
                                position: 'relative',
                                width: '70px',
                                height: '34px',
                                borderRadius: '999px',
                                border: theme === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(47, 151, 209, 0.3)',
                                background: theme === 'dark' ? 'linear-gradient(135deg, #071327, #050b16)' : 'linear-gradient(135deg, #e6f5f9, #f3f8fb)',
                                boxShadow: theme === 'dark' ? 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 6px 18px rgba(0,0,0,0.35)' : 'inset 0 0 0 1px rgba(47,151,209,0.06), 0 6px 18px rgba(47,151,209,0.2)',
                                cursor: 'pointer',
                                padding: 0,
                                outline: 'none'
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                top: '50%',
                                left: theme === 'dark' ? '36px' : '6px',
                                transform: 'translateY(-50%)',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: theme === 'dark' ? 'linear-gradient(135deg, #0f1b2f, #091224)' : 'linear-gradient(135deg, #ffffff, #e8f3f7)',
                                boxShadow: theme === 'dark' ? '0 4px 10px rgba(0,0,0,0.45)' : '0 4px 10px rgba(47,151,209,0.25)',
                                transition: 'left 0.25s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme === 'dark' ? '#eab308' : '#0ea5e9'
                            }}>
                                {theme === 'dark' ? <FaMoon /> : <FaSun />}
                            </span>
                        </button>

                        <div
                            data-profile-button
                            style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '50%',
                                backgroundColor: theme === 'dark' ? 'rgba(119, 184, 206, 0.12)' : 'rgba(47, 151, 209, 0.1)',
                                overflow: 'hidden',
                                boxShadow: theme === 'dark' ? '0 4px 15px rgba(0, 0, 0, 0.4)' : '0 4px 15px rgba(47, 151, 209, 0.2)',
                                border: theme === 'dark' ? '2px solid rgba(148, 163, 184, 0.2)' : '2px solid rgba(47, 151, 209, 0.3)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: theme === 'dark' ? '#77b8ce' : '#2f97d1',
                                fontSize: '20px',
                                transform: hoveredItem === 'profile' ? 'translateY(-3px) scale(1.05)' : 'translateY(0) scale(1)',
                                ...(isMenuOpen ? { animation: 'mediqueuePulse 2s infinite' } : {})
                            }}
                            onMouseEnter={() => setHoveredItem('profile')}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={toggleMenu}
                        >
                            <FaUser />
                        </div>

                        {/* Sidebar Menu */}
                        <div ref={menuRef} style={{
                            position: 'absolute',
                            top: '65px',
                            right: '0',
                            backgroundColor: theme === 'dark' ? 'rgba(5, 11, 22, 0.95)' : 'rgba(248, 250, 252, 0.95)',
                            color: theme === 'dark' ? '#e6edf3' : '#374151',
                            boxShadow: theme === 'dark' ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.15)',
                            borderRadius: '12px',
                            padding: '16px',
                            display: isMenuOpen ? 'block' : 'none',
                            zIndex: 200,
                            minWidth: '280px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            backdropFilter: 'blur(15px)',
                            WebkitBackdropFilter: 'blur(15px)',
                            border: theme === 'dark' ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(148, 163, 184, 0.2)',
                            animation: isMenuOpen ? 'mediqueueFadeInDown 0.3s forwards' : 'none',
                            transformOrigin: 'top right',
                        }}>
                            {/* User Profile Section */}
                            <div style={{
                                padding: '16px',
                                borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(148, 163, 184, 0.2)',
                                marginBottom: '12px',
                                textAlign: 'center',
                                background: theme === 'dark' ? 'linear-gradient(135deg, rgba(7, 19, 39, 0.6) 0%, rgba(15, 27, 47, 0.6) 100%)' : 'linear-gradient(135deg, rgba(119, 184, 206, 0.1) 0%, rgba(47, 151, 209, 0.08) 100%)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(5px)',
                                WebkitBackdropFilter: 'blur(5px)',
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    margin: '0 auto 12px auto',
                                    border: theme === 'dark' ? '2px solid rgba(148, 163, 184, 0.2)' : '2px solid rgba(47, 151, 209, 0.3)',
                                    padding: '2px',
                                    backgroundColor: theme === 'dark' ? 'rgba(7, 19, 39, 0.5)' : 'rgba(47, 151, 209, 0.08)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                    boxShadow: theme === 'dark' ? '0 4px 15px rgba(119, 184, 206, 0.25)' : '0 4px 15px rgba(47, 151, 209, 0.15)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontSize: '24px',
                                    color: theme === 'dark' ? '#e6edf3' : '#2f97d1',
                                }}>
                                    <FaUser />
                                </div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: theme === 'dark' ? '#77b8ce' : '#2f97d1',
                                    marginBottom: '4px',
                                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                }}>{user?.s_nombre || 'Administrador'}</div>
                                <div style={{
                                    fontSize: '14px',
                                    color: theme === 'dark' ? 'rgba(230, 237, 243, 0.75)' : 'rgba(255, 255, 255, 0.7)',
                                    marginBottom: '12px',
                                    background: 'rgba(47, 151, 209, 0.2)',
                                    padding: '4px 12px',
                                    borderRadius: '100px',
                                    display: 'inline-block',
                                }}>
                                    {user?.tipo_usuario === 1 ? 'Administrador' : 'Supervisor'}
                                </div>
                            </div>

                            {/* Admin Panel Section */}
                            <div style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(107, 114, 128, 0.8)',
                                textTransform: 'uppercase',
                                padding: '8px 16px',
                                letterSpacing: '1px',
                                marginTop: '8px',
                            }}>Panel Administrativo</div>
                            {sidebarItems.map((item, index) => {
                                if (!canAccess(item.path)) return null;

                                return (
                                    <div
                                        key={item.path}
                                        style={{
                                            padding: '12px 16px',
                                            color: theme === 'dark' ? 'rgba(230, 237, 243, 0.9)' : 'rgba(55, 65, 81, 0.9)',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            borderRadius: '8px',
                                            margin: '4px 0',
                                            backgroundColor: hoveredItem === `menu-${index}` ? (theme === 'dark' ? 'rgba(119, 184, 206, 0.16)' : 'rgba(47, 151, 209, 0.1)') : 'transparent',
                                            transform: hoveredItem === `menu-${index}` ? 'translateX(5px)' : 'translateX(0)',
                                            boxShadow: hoveredItem === `menu-${index}` ? (theme === 'dark' ? '0 0 15px rgba(0, 0, 0, 0.35)' : '0 0 15px rgba(47, 151, 209, 0.15)') : 'none',
                                        }}
                                        onMouseEnter={() => setHoveredItem(`menu-${index}`)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        <span style={{
                                            marginRight: '12px',
                                            fontSize: '16px',
                                            color: theme === 'dark' ? '#77b8ce' : '#2f97d1',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </div>
                                );
                            })}

                            <div style={{
                                height: '1px',
                                background: theme === 'dark' ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)' : 'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.3) 50%, transparent 100%)',
                                margin: '12px 0',
                                width: '100%',
                            }}></div>

                            {/* Public Section */}
                            <div style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(107, 114, 128, 0.8)',
                                textTransform: 'uppercase',
                                padding: '8px 16px',
                                letterSpacing: '1px',
                                marginTop: '8px',
                            }}>Información Legal</div>
                            {publicSidebarItems.map((item, index) => {
                                return (
                                    <div
                                        key={item.path}
                                        style={{
                                            padding: '12px 16px',
                                            color: theme === 'dark' ? 'rgba(230, 237, 243, 0.9)' : 'rgba(55, 65, 81, 0.9)',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            borderRadius: '8px',
                                            margin: '4px 0',
                                            backgroundColor: hoveredItem === `public-${index}` ? (theme === 'dark' ? 'rgba(119, 184, 206, 0.16)' : 'rgba(47, 151, 209, 0.1)') : 'transparent',
                                            transform: hoveredItem === `public-${index}` ? 'translateX(5px)' : 'translateX(0)',
                                            boxShadow: hoveredItem === `public-${index}` ? (theme === 'dark' ? '0 0 15px rgba(0, 0, 0, 0.35)' : '0 0 15px rgba(47, 151, 209, 0.15)') : 'none',
                                        }}
                                        onMouseEnter={() => setHoveredItem(`public-${index}`)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        <span style={{
                                            marginRight: '12px',
                                            fontSize: '16px',
                                            color: theme === 'dark' ? '#77b8ce' : '#2f97d1',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </div>
                                );
                            })}

                            <div style={{
                                height: '1px',
                                background: theme === 'dark' ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)' : 'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.3) 50%, transparent 100%)',
                                margin: '12px 0',
                                width: '100%',
                            }}></div>

                            {/* Logout Button */}
                            <button
                                style={{
                                    padding: '12px 16px',
                                    background: theme === 'dark' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(248, 113, 113, 0.85) 100%)' : 'linear-gradient(135deg, rgba(255, 82, 82, 0.8) 0%, rgba(255, 105, 105, 0.8) 100%)',
                                    color: theme === 'dark' ? '#e6edf3' : 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(255, 82, 82, 0.25)',
                                    backdropFilter: 'blur(5px)',
                                    WebkitBackdropFilter: 'blur(5px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '12px 0',
                                    width: '100%',
                                }}
                                onClick={handleLogout}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 82, 82, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 82, 82, 0.25)';
                                }}
                            >
                                <FaSignOutAlt style={{ marginRight: '8px' }} />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme === 'dark' ? 'rgba(5, 11, 22, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                display: confirmLogout ? 'flex' : 'none',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                animation: confirmLogout ? 'mediqueueFadeIn 0.3s forwards' : 'none',
            }} onClick={cancelLogout}>
                <div
                    style={{
                        backgroundColor: theme === 'dark' ? 'rgba(5, 11, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '16px',
                        boxShadow: theme === 'dark' ? '0 15px 40px rgba(0, 0, 0, 0.4)' : '0 15px 40px rgba(0, 0, 0, 0.2)',
                        width: '90%',
                        maxWidth: '450px',
                        padding: 0,
                        overflow: 'hidden',
                        animation: 'mediqueueModalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(148, 163, 184, 0.2)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{
                        background: theme === 'dark' ? 'linear-gradient(135deg, rgba(7, 19, 39, 0.9) 0%, rgba(15, 27, 47, 0.95) 100%)' : 'linear-gradient(135deg, rgba(47, 151, 209, 0.8) 0%, rgba(47, 151, 209, 0.9) 100%)',
                        color: theme === 'dark' ? '#e6edf3' : 'white',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        gap: '12px',
                    }}>
                        <FaExclamationTriangle size={24} />
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Confirmar cierre de sesión</h3>
                    </div>
                    <div style={{
                        padding: '24px',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: theme === 'dark' ? 'rgba(230, 237, 243, 0.9)' : 'rgba(55, 65, 81, 0.9)',
                        textAlign: 'center',
                    }}>
                        <p>¿Estás seguro de que deseas cerrar tu sesión en <strong>MediQueue</strong>?</p>
                        <p>Tendrás que volver a iniciar sesión para acceder al panel administrativo.</p>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px',
                        padding: '0 24px 24px 24px'
                    }}>
                        <button
                            style={{
                                padding: '12px 24px',
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                color: theme === 'dark' ? 'white' : '#374151',
                                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(148, 163, 184, 0.3)',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                outline: 'none',
                                backdropFilter: 'blur(5px)',
                                WebkitBackdropFilter: 'blur(5px)',
                            }}
                            onClick={cancelLogout}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(148, 163, 184, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.1)';
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, rgba(255, 82, 82, 0.9) 0%, rgba(255, 105, 105, 0.9) 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                outline: 'none',
                                boxShadow: '0 4px 15px rgba(255, 82, 82, 0.3)',
                            }}
                            onClick={confirmLogoutAction}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 82, 82, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 82, 82, 0.3)';
                            }}
                        >
                            Sí, cerrar sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* Success/Error Notification */}
            <div style={{
                position: 'fixed',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                minWidth: '300px',
                maxWidth: '90%',
                backgroundColor: 'rgba(47, 151, 209, 0.9)',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                zIndex: 9999,
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 500,
                display: notification.show ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                animation: notification.show ? 'mediqueueFadeInUp 0.3s forwards' : 'none',
            }}>
                {notification.type === 'success' && (
                    <span style={{
                        display: 'inline-block',
                        animation: 'mediqueueWaveHand 0.5s ease-in-out 2',
                        transformOrigin: '70% 70%',
                        marginRight: '12px',
                        fontSize: '20px',
                    }}>👋</span>
                )}
                {notification.message}
            </div>

            {/* CSS Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes mediqueueModalFadeIn {
                        0% { transform: scale(0.9); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }

                    @keyframes mediqueueWaveHand {
                        0% { transform: rotate(0deg); }
                        50% { transform: rotate(15deg); }
                        100% { transform: rotate(0deg); }
                    }
                    
                    @keyframes mediqueueFloat {
                        0% {
                            transform: translateY(0) translateX(0);
                        }
                        25% {
                            transform: translateY(-10px) translateX(10px);
                        }
                        50% {
                            transform: translateY(0) translateX(15px);
                        }
                        75% {
                            transform: translateY(10px) translateX(5px);
                        }
                        100% {
                            transform: translateY(0) translateX(0);
                        }
                    }
                    
                    @keyframes mediqueueFadeInDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px) scale(0.98);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                    
                    @keyframes mediqueueFadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes mediqueueFadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                    
                    @keyframes mediqueueSlideUp {
                        from {
                            transform: translateY(100%);
                        }
                        to {
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes mediqueuePulse {
                        0% {
                            box-shadow: 0 0 0 0 rgba(47, 151, 209, 0.5);
                        }
                        70% {
                            box-shadow: 0 0 0 10px rgba(47, 151, 209, 0);
                        }
                        100% {
                            box-shadow: 0 0 0 0 rgba(47, 151, 209, 0);
                        }
                    }
                    
                    /* Responsive */
                    @media (max-width: 768px) {
                        .mediqueueHeader {
                            padding: 8px 20px !important;
                            height: 70px !important;
                        }
                    }
                `
            }} />
        </>
    );
};

export default AdminHeader;
