import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('about');
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
            role: t('teamMembers.damian.role'),
            image: '/images/team/damian.png',
            github: 'https://github.com/Dami-Val',
            description: t('teamMembers.damian.description'),
            specialties: ['Business Analysis', 'Process Optimization', 'Data Analytics'],
            icon: FaChartLine,
            color: 'warning'
        },
        {
            id: 3,
            name: 'Emmanuel Palacios',
            role: t('teamMembers.emmanuel.role'),
            image: '/images/team/emmanuel.png',
            github: 'https://github.com/Emma-Pal',
            description: t('teamMembers.emmanuel.description'),
            specialties: ['React.js', 'Node.js', 'MySQL'],
            icon: FaCode,
            color: 'success'
        },
        {
            id: 4,
            name: 'Priscila Justo',
            role: t('teamMembers.priscila.role'),
            image: '/images/team/priscila.png',
            github: 'https://github.com/pjusto930',
            description: t('teamMembers.priscila.description'),
            specialties: ['UX Design', 'UI Design', 'Prototyping'],
            icon: FaPalette,
            color: 'warning'
        },
        {
            id: 5,
            name: 'Yoselin Reynaga',
            role: t('teamMembers.yoselin.role'),
            image: '/images/team/yoselin.png',
            github: 'https://github.com/yoselinRS',
            description: t('teamMembers.yoselin.description'),
            specialties: ['MySQL', 'Data Analysis', 'Database Security'],
            icon: FaDatabase,
            color: 'info'
        },
        {
            id: 6,
            name: 'Gregorio Sánchez',
            role: t('teamMembers.gregorio.role'),
            image: '/images/team/gregorio.png',
            github: 'https://github.com/Gregorio-Yahir',
            description: t('teamMembers.gregorio.description'),
            specialties: ['Cybersecurity', 'HIPAA Compliance', 'Data Protection'],
            icon: FaShieldAlt,
            color: 'info'
        }
    ];

    // Stats cards usando el mismo formato del admin
    const statsCards = [
        {
            id: 'team',
            title: t('stats.teamMembers.title'),
            value: stats.teamMembers,
            icon: HiOutlineUsers,
            color: 'primary',
            growth: 0,
            subtitle: t('stats.teamMembers.subtitle')
        },
        {
            id: 'projects',
            title: t('stats.projectsCompleted.title'),
            value: stats.projectsCompleted,
            icon: FaCalendarCheck,
            color: 'success',
            growth: 15,
            subtitle: t('stats.projectsCompleted.subtitle')
        },
        {
            id: 'experience',
            title: t('stats.yearsExperience.title'),
            value: stats.yearsExperience,
            icon: FaAward,
            color: 'info',
            growth: 0,
            subtitle: t('stats.yearsExperience.subtitle')
        },
        {
            id: 'technologies',
            title: t('stats.technologies.title'),
            value: stats.technologiesUsed,
            icon: HiOutlineLightBulb,
            color: 'warning',
            growth: 8,
            subtitle: t('stats.technologies.subtitle')
        }
    ];

    const companyValues = [
        {
            icon: FaHeart,
            title: t('values.healthCommitment.title'),
            description: t('values.healthCommitment.description'),
            color: 'danger'
        },
        {
            icon: FaLightbulb,
            title: t('values.continuousInnovation.title'),
            description: t('values.continuousInnovation.description'),
            color: 'warning'
        },
        {
            icon: FaShieldAlt,
            title: t('values.securityPrivacy.title'),
            description: t('values.securityPrivacy.description'),
            color: 'info'
        },
        {
            icon: FaGlobe,
            title: t('values.universalAccess.title'),
            description: t('values.universalAccess.description'),
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
                            {t('title')}
                        </h1>
                        <p className="dashboard-subtitle">
                            {t('subtitle')}
                        </p>
                    </div>
                    <div className="welcome-actions">
                        <button className="action-btn primary" onClick={() => navigate('/tomar-turno')}>
                            <FaCalendarCheck /> {t('takeTurnButton')}
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
                            {t('teamSection.title')}
                        </h2>
                        <p className="section-subtitle">
                            {t('teamSection.subtitle')}
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
                                                <FaGithub /> {t('teamSection.githubButton')}
                                            </a>
                                            <button 
                                                className="member-btn secondary"
                                                onClick={() => window.open(`mailto:${member.name.toLowerCase().replace(' ', '.')}@mediqueue.com`)}
                                            >
                                                <FaEnvelope /> {t('teamSection.contactButton')}
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
                            {t('valuesSection.title')}
                        </h2>
                        <p className="section-subtitle">
                            {t('valuesSection.subtitle')}
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
                            {t('techSection.title')}
                        </h2>
                        <p className="section-subtitle">
                            {t('techSection.subtitle')}
                        </p>
                    </div>

                    <div className="tech-grid">
                        <div className="tech-category">
                            <h4>{t('techSection.categories.frontend')}</h4>
                            <div className="tech-tags">
                                <span className="tech-tag react">React.js</span>
                                <span className="tech-tag">HTML5</span>
                                <span className="tech-tag">CSS3</span>
                                <span className="tech-tag">JavaScript ES6+</span>
                                <span className="tech-tag">Vite</span>
                            </div>
                        </div>
                        <div className="tech-category">
                            <h4>{t('techSection.categories.backend')}</h4>
                            <div className="tech-tags">
                                <span className="tech-tag node">Node.js</span>
                                <span className="tech-tag">Express.js</span>
                                <span className="tech-tag">REST API</span>
                                <span className="tech-tag">JWT</span>
                            </div>
                        </div>
                        <div className="tech-category">
                            <h4>{t('techSection.categories.database')}</h4>
                            <div className="tech-tags">
                                <span className="tech-tag mysql">MySQL</span>
                                <span className="tech-tag">Sequelize ORM</span>
                                <span className="tech-tag">Database Design</span>
                            </div>
                        </div>
                        <div className="tech-category">
                            <h4>{t('techSection.categories.devops')}</h4>
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