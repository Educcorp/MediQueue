import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaPlus,
    FaSearch,
    FaFileAlt,
    FaHistory,
    FaBell,
    FaCog,
    FaUserPlus,
    FaCalendarPlus,
    FaHospital,
    FaChartBar,
    FaDownload,
    FaUpload,
    FaSync,
    FaTrash,
    FaEdit,
    FaEye,
    FaPrint
} from 'react-icons/fa';

import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineDocumentText,
    HiOutlineClock,
    HiOutlineBell,
    HiOutlineCog
} from 'react-icons/hi';

const QuickActions = () => {
    const quickActions = [
        {
            title: 'Nuevo Turno',
            description: 'Crear un nuevo turno médico',
            icon: <FaCalendarPlus className="text-2xl" />,
            link: '/admin/turns/new',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'from-blue-50 to-blue-100'
        },
        {
            title: 'Nuevo Paciente',
            description: 'Registrar un nuevo paciente',
            icon: <FaUserPlus className="text-2xl" />,
            link: '/admin/patients/new',
            color: 'from-green-500 to-green-600',
            bgColor: 'from-green-50 to-green-100'
        },
        {
            title: 'Nuevo Consultorio',
            description: 'Agregar un consultorio',
            icon: <FaHospital className="text-2xl" />,
            link: '/admin/consultorios/new',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'from-orange-50 to-orange-100'
        },
        {
            title: 'Buscar Turnos',
            description: 'Buscar turnos existentes',
            icon: <FaSearch className="text-2xl" />,
            link: '/admin/turns/search',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-100'
        },
        {
            title: 'Reportes',
            description: 'Generar reportes del sistema',
            icon: <FaChartBar className="text-2xl" />,
            link: '/admin/reports',
            color: 'from-cyan-500 to-cyan-600',
            bgColor: 'from-cyan-50 to-cyan-100'
        },
        {
            title: 'Exportar Datos',
            description: 'Exportar información del sistema',
            icon: <FaDownload className="text-2xl" />,
            link: '/admin/export',
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'from-indigo-50 to-indigo-100'
        },
        {
            title: 'Importar Datos',
            description: 'Importar información al sistema',
            icon: <FaUpload className="text-2xl" />,
            link: '/admin/import',
            color: 'from-teal-500 to-teal-600',
            bgColor: 'from-teal-50 to-teal-100'
        },
        {
            title: 'Sincronizar',
            description: 'Sincronizar datos del sistema',
            icon: <FaSync className="text-2xl" />,
            link: '/admin/sync',
            color: 'from-pink-500 to-pink-600',
            bgColor: 'from-pink-50 to-pink-100'
        }
    ];

    return (
        <div className="quick-actions-section">
            <h2 className="section-title">
                <FaPlus />
                Acciones Rápidas
            </h2>
            <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.link}
                        className="quick-action-card"
                        style={{
                            background: `linear-gradient(135deg, ${action.bgColor})`,
                            borderLeft: `4px solid ${action.color.split(' ')[0].replace('from-', '#')}`
                        }}
                    >
                        <div className="action-icon" style={{ color: action.color.split(' ')[0].replace('from-', '#') }}>
                            {action.icon}
                        </div>
                        <div className="action-content">
                            <h3>{action.title}</h3>
                            <p>{action.description}</p>
                        </div>
                        <div className="action-arrow">
                            <FaPlus className="text-sm" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;

