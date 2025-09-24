import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminFooter from '../components/Common/AdminFooter';
import TestSpinner from '../components/Common/TestSpinner';
import './ModernAdminDashboard.css';

// React Icons - usando los mismos del admin panel
import {
    FaUsers,
    FaUserMd,
    FaCode,
    FaLaptopCode,
    FaDatabase,
    FaShieldAlt,
    FaHeart,
    FaLightbulb,
    FaGlobe,
    FaGithub,
    FaLinkedin,
    FaEnvelope,
    FaCalendarCheck,
    FaClock,
    FaAward,
    FaChartLine,
    FaEye,
    FaDownload,
    FaPalette
} from 'react-icons/fa';
import {
    HiOutlineUsers,
    HiOutlineChartBar,
    HiOutlineLightBulb,
    HiOutlineGlobe
} from 'react-icons/hi';

const AboutPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        teamMembers: 6,
        projectsCompleted: 25,
        yearsExperience: 3,
        technologiesUsed: 15
    });
    const navigate = useNavigate();

    // Detectar tema actual como en el admin panel
    const [theme, setTheme] = useState(() => localStorage.getItem('mq-theme') || 'light');
    const isDarkMode = theme === 'dark';

    // Escuchar cambios de tema
    useEffect(() => {
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
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    // Team members data usando el formato del admin
    const teamMembers = [
        {
            id: 1,
            name: 'Damián Valencia',
            role: 'Analista de Sistemas & Metodologías',
            image: '/images/team/damian.png',
            github: 'https://github.com/Dami-Val',
            description: 'Especialista en metodologías médicas y análisis de sistemas hospitalarios. Optimiza procesos para mejorar la experiencia del paciente.',
            specialties: ['Business Analysis', 'Process Optimization', 'Data Analytics'],
            icon: FaChartLine,
            color: 'warning'
        },
        {
            id: 3,
            name: 'Emmanuel Palacios',
            role: 'CTO & Desarrollador Principal',
            image: '/images/team/emmanuel.png',
            github: 'https://github.com/Emma-Pal',
            description: 'Ingeniero de software especializado en sistemas de salud y arquitectura escalable. Dirige el desarrollo tecnológico de la plataforma.',
            specialties: ['React.js', 'Node.js', 'MySQL'],
            icon: FaCode,
            color: 'success'
        },
        {
            id: 4,
            name: 'Priscila Justo',
            role: 'Diseñadora UX/UI',
            image: '/images/team/priscila.png',
            github: 'https://github.com/pjusto930',
            description: 'Especialista en experiencia de usuario con enfoque en interfaces médicas intuitivas. Diseña soluciones centradas en el usuario.',
            specialties: ['UX Design', 'UI Design', 'Prototyping'],
            icon: FaPalette,
            color: 'warning'
        },
        {
            id: 5,
            name: 'Yoselin Reynaga',
            role: 'Arquitecta de Datos',
            image: '/images/team/yoselin.png',
            github: 'https://github.com/yoselinRS',
            description: 'Experta en bases de datos médicas y sistemas de información hospitalaria. Garantiza la integridad y seguridad de los datos.',
            specialties: ['MySQL', 'Data Analysis', 'Database Security'],
            icon: FaDatabase,
            color: 'info'
        },
        {
            id: 6,
            name: 'Gregorio Sánchez',
            role: 'Especialista en Seguridad',
            image: '/images/team/gregorio.png',
            github: 'https://github.com/Gregorio-Yahir',
            description: 'Experto en ciberseguridad médica y protección de datos de pacientes. Asegura el cumplimiento de normativas HIPAA.',
            specialties: ['Cybersecurity', 'HIPAA Compliance', 'Data Protection'],
            icon: FaShieldAlt,
            color: 'info'
        }
    ];

    // Stats cards usando el mismo formato del admin
    const statsCards = [
        {
            id: 'team',
            title: 'Miembros del Equipo',
            value: stats.teamMembers,
            icon: HiOutlineUsers,
            color: 'primary',
            growth: 0,
            subtitle: 'Especialistas en tecnología médica'
        },
        {
            id: 'projects',
            title: 'Proyectos Completados',
            value: stats.projectsCompleted,
            icon: FaCalendarCheck,
            color: 'success',
            growth: 15,
            subtitle: 'Soluciones implementadas'
        },
        {
            id: 'experience',
            title: 'Años de Experiencia',
            value: stats.yearsExperience,
            icon: FaAward,
            color: 'info',
            growth: 0,
            subtitle: 'En desarrollo de software médico'
        },
        {
            id: 'technologies',
            title: 'Tecnologías',
            value: stats.technologiesUsed,
            icon: HiOutlineLightBulb,
            color: 'warning',
            growth: 8,
            subtitle: 'Stack tecnológico moderno'
        }
    ];

    const companyValues = [
        {
            icon: FaHeart,
            title: 'Compromiso con la Salud',
            description: 'Desarrollamos tecnología que impacta positivamente en la vida de las personas y mejora la atención médica.',
            color: 'danger'
        },
        {
            icon: FaLightbulb,
            title: 'Innovación Continua',
            description: 'Implementamos las últimas tecnologías para crear soluciones médicas de vanguardia.',
            color: 'warning'
        },
        {
            icon: FaShieldAlt,
            title: 'Seguridad y Privacidad',
            description: 'Garantizamos los más altos estándares de seguridad para proteger la información médica sensible.',
            color: 'info'
        },
        {
            icon: FaGlobe,
            title: 'Acceso Universal',
            description: 'Creamos soluciones inclusivas que facilitan el acceso a la atención médica para todos.',
            color: 'success'
        }
    ];

    if (loading) {
        return (
            <div className="modern-dashboard">
                <div className="dashboard-container">
                    <TestSpinner />
                </div>
                <AdminFooter />
            </div>
        );
    }

    return (
        <div className="modern-dashboard">
            <div className="dashboard-container">
                {/* Welcome Section - igual que en admin dashboard */}
                <div className="welcome-section">
                    <div className="welcome-content">
                        <h1 className="dashboard-title">
                            Nuestro Equipo de Desarrollo
                        </h1>
                        <p className="dashboard-subtitle">
                            Conoce a los especialistas que hacen posible MediQueue - Transformando la atención médica a través de la tecnología
                        </p>
                    </div>
                    <div className="welcome-actions">
                        <button className="action-btn primary" onClick={() => navigate('/tomar-turno')}>
                            <FaCalendarCheck /> Tomar Turno
                        </button>
                    </div>
                </div>

                {/* Stats Grid - mismo diseño que admin */}
                <div className="stats-grid">
                    {statsCards.map((stat) => {
                        const IconComponent = stat.icon;
                        return (
                            <div key={stat.id} className={`stat-card ${stat.color}`}>
                                <div className="stat-header">
                                    <div className="stat-icon">
                                        <IconComponent />
                                    </div>
                                    {stat.growth !== 0 && (
                                        <div className="stat-growth">
                                            <span className={stat.growth > 0 ? 'positive' : 'negative'}>
                                                {stat.growth > 0 ? '+' : ''}{stat.growth}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value">{stat.value}</div>
                                    <div className="stat-title">{stat.title}</div>
                                    <div className="stat-description">{stat.subtitle}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Team Members Section */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FaUsers className="section-icon" />
                            Miembros del Equipo
                        </h2>
                        <p className="section-subtitle">
                            Especialistas dedicados a la excelencia en tecnología médica
                        </p>
                    </div>

                    <div className="team-grid">
                        {teamMembers.map((member) => {
                            const IconComponent = member.icon;
                            return (
                                <div key={member.id} className={`team-member-card ${member.color}`}>
                                    <div className="member-header">
                                        <div className="member-avatar">
                                            <img 
                                                src={member.image} 
                                                alt={member.name}
                                                onError={(e) => {
                                                    e.target.src = '/images/default-avatar.svg';
                                                }}
                                            />
                                        </div>
                                        <div className="member-icon">
                                            <IconComponent />
                                        </div>
                                    </div>
                                    
                                    <div className="member-content">
                                        <h3 className="member-name">{member.name}</h3>
                                        <p className="member-role">{member.role}</p>
                                        <p className="member-description">{member.description}</p>
                                        
                                        <div className="member-specialties">
                                            {member.specialties.map((specialty, idx) => (
                                                <span key={idx} className="specialty-tag">
                                                    {specialty}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        <div className="member-actions">
                                            <a 
                                                href={member.github} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="member-btn primary"
                                            >
                                                <FaGithub /> GitHub
                                            </a>
                                            <button 
                                                className="member-btn secondary"
                                                onClick={() => window.open(`mailto:${member.name.toLowerCase().replace(' ', '.')}@mediqueue.com`)}
                                            >
                                                <FaEnvelope /> Contacto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Company Values Section */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FaAward className="section-icon" />
                            Nuestros Valores
                        </h2>
                        <p className="section-subtitle">
                            Los principios que guían nuestro trabajo en el desarrollo de soluciones médicas
                        </p>
                    </div>

                    <div className="values-grid">
                        {companyValues.map((value, index) => {
                            const IconComponent = value.icon;
                            return (
                                <div key={index} className={`value-card ${value.color}`}>
                                    <div className="value-icon">
                                        <IconComponent />
                                    </div>
                                    <h3 className="value-title">{value.title}</h3>
                                    <p className="value-description">{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Technology Stack Section */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <HiOutlineLightBulb className="section-icon" />
                            Stack Tecnológico
                        </h2>
                        <p className="section-subtitle">
                            Tecnologías modernas para soluciones médicas robustas y escalables
                        </p>
                    </div>

                    <div className="tech-grid">
                        <div className="tech-category">
                            <h4>Frontend</h4>
                            <div className="tech-tags">
                                <span className="tech-tag react">React.js</span>
                                <span className="tech-tag">HTML5</span>
                                <span className="tech-tag">CSS3</span>
                                <span className="tech-tag">JavaScript ES6+</span>
                                <span className="tech-tag">Vite</span>
                            </div>
                        </div>
                        <div className="tech-category">
                            <h4>Backend</h4>
                            <div className="tech-tags">
                                <span className="tech-tag node">Node.js</span>
                                <span className="tech-tag">Express.js</span>
                                <span className="tech-tag">REST API</span>
                                <span className="tech-tag">JWT</span>
                            </div>
                        </div>
                        <div className="tech-category">
                            <h4>Base de Datos</h4>
                            <div className="tech-tags">
                                <span className="tech-tag mysql">MySQL</span>
                                <span className="tech-tag">Sequelize ORM</span>
                                <span className="tech-tag">Database Design</span>
                            </div>
                        </div>
                        <div className="tech-category">
                            <h4>DevOps & Tools</h4>
                            <div className="tech-tags">
                                <span className="tech-tag">Git</span>
                                <span className="tech-tag">GitHub</span>
                                <span className="tech-tag">Railway</span>
                                <span className="tech-tag">VS Code</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <AdminFooter />
        </div>
    );
};

export default AboutPage;