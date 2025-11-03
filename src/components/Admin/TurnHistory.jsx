import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../Common/AdminHeader';
import AdminFooter from '../Common/AdminFooter';
import TestSpinner from '../Common/TestSpinner';
import Chatbot from '../Common/Chatbot';
import turnService from '../../services/turnService';
import patientService from '../../services/patientService';
import consultorioService from '../../services/consultorioService';
import areaService from '../../services/areaService';
import adminService from '../../services/adminService';
import '../../styles/UnifiedAdminPages.css';

// React Icons
import {
  FaHistory,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaUserMd,
  FaHospital,
  FaFilter,
  FaSync,
  FaChevronDown,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaClipboardList,
  FaInfoCircle,
  FaUserTimes,
  FaList,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaBaby,
  FaTooth,
  FaBrain,
  FaSyringe,
  FaEyeDropper,
  FaBone,
  FaCamera,
  FaBandAid,
  FaHeadSideVirus,
  FaHeart,
  FaFlask,
  FaFemale,
  FaProcedures,
  FaHeartbeat,
  FaStethoscope,
  FaCalendarWeek,
  FaCalendarDay,
  FaChartLine,
  FaEraser
} from 'react-icons/fa';
import {
  MdPregnantWoman,
  MdPsychology
} from 'react-icons/md';

// Función para obtener el icono del área desde la BD
const getAreaIconComponent = (iconName) => {
  if (!iconName) return FaHospital;
  
  // Mapa completo de iconos de React Icons
  const iconMapping = {
    // Sin prefijo
    'stethoscope': FaStethoscope,
    'baby': FaBaby,
    'heartbeat': FaHeartbeat,
    'heart': FaHeart,
    'user-md': FaUserMd,
    'female': FaFemale,
    'eye': FaEyeDropper,
    'bone': FaBone,
    'brain': FaBrain,
    'tooth': FaTooth,
    'flask': FaFlask,
    'syringe': FaSyringe,
    'hospital': FaHospital,
    'procedures': FaProcedures,
    'male': FaBaby,
    'camera': FaCamera,
    'bandaid': FaBandAid,
    'eye-dropper': FaEyeDropper,
    
    // Con prefijo fa-
    'fa-stethoscope': FaStethoscope,
    'fa-baby': FaBaby,
    'fa-heartbeat': FaHeartbeat,
    'fa-heart': FaHeart,
    'fa-user-md': FaUserMd,
    'fa-female': FaFemale,
    'fa-eye': FaEyeDropper,
    'fa-bone': FaBone,
    'fa-brain': FaBrain,
    'fa-tooth': FaTooth,
    'fa-flask': FaFlask,
    'fa-syringe': FaSyringe,
    'fa-hospital': FaHospital,
    'fa-procedures': FaProcedures,
    'fa-male': FaBaby,
    'fa-camera': FaCamera,
    'fa-bandaid': FaBandAid,
    'fa-eye-dropper': FaEyeDropper,
    
    // Componentes directos (por si se guardan así)
    'FaStethoscope': FaStethoscope,
    'FaBaby': FaBaby,
    'FaHeartbeat': FaHeartbeat,
    'FaHeart': FaHeart,
    'FaUserMd': FaUserMd,
    'FaFemale': FaFemale,
    'FaEyeDropper': FaEyeDropper,
    'FaBone': FaBone,
    'FaBrain': FaBrain,
    'FaTooth': FaTooth,
    'FaFlask': FaFlask,
    'FaSyringe': FaSyringe,
    'FaHospital': FaHospital,
    'FaProcedures': FaProcedures,
    'FaCamera': FaCamera,
    'FaBandAid': FaBandAid,
    'MdPregnantWoman': MdPregnantWoman,
    'MdPsychology': MdPsychology
  };
  
  // Limpiar el nombre del icono (remover prefijos)
  const cleanIconName = iconName.replace(/^(mdi-|fa-|fas-|far-|fab-)/, '').toLowerCase();
  
  // Buscar el icono
  return iconMapping[iconName] || iconMapping[cleanIconName] || iconMapping[iconName.toLowerCase()] || FaHospital;
};

// Función para obtener el icono y color del área desde la BD
const getAreaIconFromDB = (area) => {
  if (!area) {
    return {
      icon: FaHospital,
      color: '#4A90E2'
    };
  }
  
  // Usar los datos de la BD si existen
  const icon = area.s_icono ? getAreaIconComponent(area.s_icono) : FaHospital;
  const color = area.s_color || '#4A90E2';
  
  return {
    icon,
    color
  };
};

// Función para obtener el icono del estado
const getStatusIcon = (status) => {
  const statusIconMap = {
    'EN_ESPERA': FaClock,
    'EN_ATENCION': FaUserMd,
    'ATENDIDO': FaCheck,
    'CANCELADO': FaTimes,
    'NO_PRESENTE': FaUserTimes,
    'todos': FaList
  };
  return statusIconMap[status] || FaList;
};

// Función para obtener el color del estado
const getStatusColor = (status) => {
  const statusColorMap = {
    'EN_ESPERA': 'status-en-espera',
    'EN_ATENCION': 'status-en-atencion',
    'ATENDIDO': 'status-atendido',
    'CANCELADO': 'status-cancelado',
    'NO_PRESENTE': 'status-no-presente'
  };
  return statusColorMap[status] || 'status-default';
};

const TurnHistory = () => {
  const [turns, setTurns] = useState([]);
  const [patients, setPatients] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTurn, setSelectedTurn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const turnsPerPage = 10;

  // Estados de filtros
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    area: '',
    consultorio: ''
  });

  // Estados para dropdowns
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showConsultorioDropdown, setShowConsultorioDropdown] = useState(false);

  // Refs para cerrar dropdowns al hacer click fuera
  const dateRangeRef = useRef(null);
  const statusRef = useRef(null);
  const areaRef = useRef(null);
  const consultorioRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Detectar tema actual
  const [theme, setTheme] = useState(() => localStorage.getItem('mq-theme') || 'light');
  const isDarkMode = theme === 'dark';

  // Estados de turnos disponibles
  const turnStatuses = [
    { value: 'EN_ESPERA', label: 'En espera', color: 'info' },
    { value: 'EN_ATENCION', label: 'En atención', color: 'warning' },
    { value: 'ATENDIDO', label: 'Atendido', color: 'success' },
    { value: 'CANCELADO', label: 'Cancelado', color: 'danger' },
    { value: 'NO_PRESENTE', label: 'No presente', color: 'warning' }
  ];

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

    return () => observer.disconnect();
  }, [theme]);

  // Cargar datos al montar el componente
  useEffect(() => {
    setLoading(true);
    loadData();
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);

      const [turnsData, patientsData, consultoriosData, areasData, adminsData] = await Promise.all([
        turnService.getAllTurns().catch(err => {
          console.warn('Error cargando turnos:', err);
          return [];
        }),
        patientService.getAllPatients().catch(err => {
          console.warn('Error cargando pacientes:', err);
          return [];
        }),
        consultorioService.getAll().catch(err => {
          console.warn('Error cargando consultorios:', err);
          return [];
        }),
        areaService.getAll().catch(err => {
          console.warn('Error cargando áreas:', err);
          return [];
        }),
        adminService.getAllAdmins().catch(err => {
          console.warn('Error cargando administradores:', err);
          return [];
        })
      ]);

      // Ordenar turnos por fecha de creación descendente (más recientes primero)
      if (turnsData && turnsData.length > 0) {
        turnsData.sort((a, b) => {
          const dateA = new Date(a.d_fecha_creacion || a.d_fecha);
          const dateB = new Date(b.d_fecha_creacion || b.d_fecha);
          return dateB - dateA;
        });
      }

      setTurns(turnsData || []);
      setPatients(patientsData);
      setConsultorios(consultoriosData);
      setAreas(areasData);
      setAdmins(adminsData || []);
    } catch (error) {
      setError('Error cargando datos: ' + error.message);
      console.error('Error cargando datos:', error);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const loadTurns = async () => {
    try {
      const turnsData = await turnService.getAllTurns();
      
      if (turnsData && turnsData.length > 0) {
        turnsData.sort((a, b) => {
          const dateA = new Date(a.d_fecha_creacion || a.d_fecha);
          const dateB = new Date(b.d_fecha_creacion || b.d_fecha);
          return dateB - dateA;
        });
      }

      setTurns(turnsData || []);
    } catch (error) {
      setError('Error cargando historial: ' + error.message);
      console.error('Error cargando historial:', error);
      setTurns([]);
    }
  };

  const getPatientName = (uk_paciente) => {
    if (!uk_paciente) return 'Invitado';
    const patient = patients.find(p => p.uk_paciente === uk_paciente);
    return patient ? `${patient.s_nombre} ${patient.s_apellido}` : 'Paciente no encontrado';
  };

  const getPatientInfo = (uk_paciente) => {
    if (!uk_paciente) return null;
    return patients.find(p => p.uk_paciente === uk_paciente);
  };

  const getConsultorioInfo = (uk_consultorio) => {
    const consultorio = consultorios.find(c => c.uk_consultorio === uk_consultorio);
    return consultorio ? `Consultorio ${consultorio.i_numero_consultorio}` : 'Consultorio no encontrado';
  };

  const getAreaInfo = (uk_consultorio) => {
    const consultorio = consultorios.find(c => c.uk_consultorio === uk_consultorio);
    if (!consultorio) return '';
    const area = areas.find(a => a.uk_area === consultorio.uk_area);
    return area ? area.s_nombre_area : '';
  };

  const getAreaObject = (uk_consultorio) => {
    const consultorio = consultorios.find(c => c.uk_consultorio === uk_consultorio);
    if (!consultorio) return null;
    return areas.find(a => a.uk_area === consultorio.uk_area);
  };

  const getAdminName = (uk_usuario) => {
    if (!uk_usuario) return 'Sistema';
    const admin = admins.find(a => a.uk_administrador === uk_usuario);
    return admin ? `${admin.s_nombre} ${admin.s_apellido}` : `Admin (ID: ${uk_usuario})`;
  };

  const handleViewDetails = (turn) => {
    setSelectedTurn(turn);
    setShowDetailModal(true);
  };

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target)) {
        setShowDateRangeDropdown(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (areaRef.current && !areaRef.current.contains(event.target)) {
        setShowAreaDropdown(false);
      }
      if (consultorioRef.current && !consultorioRef.current.contains(event.target)) {
        setShowConsultorioDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Funciones de filtrado
  const handleDatePreset = (preset) => {
    const today = new Date();
    let dateFrom = new Date();
    
    switch(preset) {
      case 'today':
        dateFrom = today;
        break;
      case 'week':
        dateFrom.setDate(today.getDate() - 7);
        break;
      case 'month':
        dateFrom.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        dateFrom.setMonth(today.getMonth() - 3);
        break;
      default:
        return;
    }

    setFilters({
      ...filters,
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0]
    });
    setShowDateRangeDropdown(false);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters({
      ...filters,
      [filterKey]: value
    });
    setCurrentPage(1); // Reset a la primera página al filtrar
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      status: '',
      area: '',
      consultorio: ''
    });
    setCurrentPage(1);
  };

  // Aplicar filtros a los turnos
  const getFilteredTurns = () => {
    let filtered = [...turns];

    // Filtro de fecha
    if (filters.dateFrom) {
      filtered = filtered.filter(turn => {
        const turnDate = new Date(turn.d_fecha);
        const fromDate = new Date(filters.dateFrom);
        return turnDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(turn => {
        const turnDate = new Date(turn.d_fecha);
        const toDate = new Date(filters.dateTo);
        return turnDate <= toDate;
      });
    }

    // Filtro de estado
    if (filters.status) {
      filtered = filtered.filter(turn => turn.s_estado === filters.status);
    }

    // Filtro de área
    if (filters.area) {
      filtered = filtered.filter(turn => {
        const consultorio = consultorios.find(c => c.uk_consultorio === turn.uk_consultorio);
        return consultorio && consultorio.uk_area === filters.area;
      });
    }

    // Filtro de consultorio
    if (filters.consultorio) {
      filtered = filtered.filter(turn => turn.uk_consultorio === filters.consultorio);
    }

    return filtered;
  };

  const filteredTurns = getFilteredTurns();

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  // Paginación (aplicada a turnos filtrados)
  const totalPages = Math.ceil(filteredTurns.length / turnsPerPage);
  const startIndex = (currentPage - 1) * turnsPerPage;
  const endIndex = startIndex + turnsPerPage;
  const currentTurns = filteredTurns.slice(startIndex, endIndex);

  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

  if (loading) {
    return <TestSpinner message="Cargando historial de turnos..." />;
  }

  return (
    <div className="admin-page-unified">
      <AdminHeader />

      <div className="admin-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-icon">
            <FaHistory />
          </div>
          <div className="page-header-content">
            <h1 className="page-title">Historial de Turnos</h1>
            <p className="page-subtitle">
              Registro completo de todos los turnos del sistema - {filteredTurns.length} de {turns.length} registros
              {activeFiltersCount > 0 && ` (${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} activo${activeFiltersCount > 1 ? 's' : ''})`}
            </p>
          </div>
          <div className="page-actions">
            {activeFiltersCount > 0 && (
              <button className="btn btn-outline" onClick={clearFilters}>
                <FaEraser /> Limpiar Filtros
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => loadTurns()}>
              <FaSync /> Actualizar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="content-card filters-card" style={{ marginBottom: '1.5rem' }}>
          <div className="filters-container">
            <div className="filters-grid">
              {/* Filtro de Rango de Fechas */}
              <div className="filter-group" ref={dateRangeRef}>
                <label className="filter-label">
                  <FaCalendarAlt />
                  Rango de Fechas
                </label>
                <button 
                  className={`filter-button ${filters.dateFrom || filters.dateTo ? 'active' : ''}`}
                  onClick={() => setShowDateRangeDropdown(!showDateRangeDropdown)}
                >
                  {filters.dateFrom || filters.dateTo 
                    ? `${filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString('es-ES') : '...'} - ${filters.dateTo ? new Date(filters.dateTo).toLocaleDateString('es-ES') : '...'}`
                    : 'Seleccionar fechas'
                  }
                  <FaChevronDown className={showDateRangeDropdown ? 'rotate' : ''} />
                </button>
                {showDateRangeDropdown && (
                  <div className="filter-dropdown">
                    <div className="filter-dropdown-section">
                      <div className="date-presets">
                        <button onClick={() => handleDatePreset('today')} className="preset-button">
                          <FaCalendarDay /> Hoy
                        </button>
                        <button onClick={() => handleDatePreset('week')} className="preset-button">
                          <FaCalendarWeek /> Última semana
                        </button>
                        <button onClick={() => handleDatePreset('month')} className="preset-button">
                          <FaCalendarAlt /> Último mes
                        </button>
                        <button onClick={() => handleDatePreset('quarter')} className="preset-button">
                          <FaChartLine /> Último trimestre
                        </button>
                      </div>
                    </div>
                    <div className="filter-dropdown-divider"></div>
                    <div className="filter-dropdown-section">
                      <label className="date-input-label">Desde:</label>
                      <input
                        type="date"
                        className="date-input"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      />
                      <label className="date-input-label">Hasta:</label>
                      <input
                        type="date"
                        className="date-input"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Filtro de Estado */}
              <div className="filter-group" ref={statusRef}>
                <label className="filter-label">
                  <FaList />
                  Estado
                </label>
                <button 
                  className={`filter-button ${filters.status ? 'active' : ''}`}
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  {filters.status 
                    ? turnStatuses.find(s => s.value === filters.status)?.label || 'Seleccionar estado'
                    : 'Todos'
                  }
                  <FaChevronDown className={showStatusDropdown ? 'rotate' : ''} />
                </button>
                {showStatusDropdown && (
                  <div className="filter-dropdown">
                    <button 
                      className="filter-option"
                      onClick={() => {
                        handleFilterChange('status', '');
                        setShowStatusDropdown(false);
                      }}
                    >
                      <FaList />
                      <span>Todos</span>
                    </button>
                    {turnStatuses.map(status => {
                      const StatusIcon = getStatusIcon(status.value);
                      return (
                        <button
                          key={status.value}
                          className="filter-option"
                          onClick={() => {
                            handleFilterChange('status', status.value);
                            setShowStatusDropdown(false);
                          }}
                        >
                          <StatusIcon />
                          <span>{status.label}</span>
                          <span className={`status-badge-mini ${getStatusColor(status.value)}`}></span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filtro de Área */}
              <div className="filter-group" ref={areaRef}>
                <label className="filter-label">
                  <FaHospital />
                  Área
                </label>
                <button 
                  className={`filter-button ${filters.area ? 'active' : ''}`}
                  onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                >
                  {filters.area 
                    ? areas.find(a => a.uk_area === filters.area)?.s_nombre_area || 'Seleccionar área'
                    : 'Todas las áreas'
                  }
                  <FaChevronDown className={showAreaDropdown ? 'rotate' : ''} />
                </button>
                {showAreaDropdown && (
                  <div className="filter-dropdown">
                    <button 
                      className="filter-option"
                      onClick={() => {
                        handleFilterChange('area', '');
                        setShowAreaDropdown(false);
                      }}
                    >
                      <FaHospital />
                      <span>Todas las áreas</span>
                    </button>
                    {areas.map(area => {
                      const { icon: AreaIcon, color: iconColor } = getAreaIconFromDB(area);
                      return (
                        <button
                          key={area.uk_area}
                          className="filter-option"
                          onClick={() => {
                            handleFilterChange('area', area.uk_area);
                            setShowAreaDropdown(false);
                          }}
                        >
                          <AreaIcon style={{ color: iconColor }} />
                          <span>{area.s_nombre_area}</span>
                          <span 
                            className="area-color-indicator" 
                            style={{ backgroundColor: iconColor }}
                          ></span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filtro de Consultorio */}
              <div className="filter-group" ref={consultorioRef}>
                <label className="filter-label">
                  <FaHospital />
                  Consultorio
                </label>
                <button 
                  className={`filter-button ${filters.consultorio ? 'active' : ''}`}
                  onClick={() => setShowConsultorioDropdown(!showConsultorioDropdown)}
                >
                  {filters.consultorio 
                    ? `Consultorio ${consultorios.find(c => c.uk_consultorio === filters.consultorio)?.i_numero_consultorio || ''}`
                    : 'Todos los consultorios'
                  }
                  <FaChevronDown className={showConsultorioDropdown ? 'rotate' : ''} />
                </button>
                {showConsultorioDropdown && (
                  <div className="filter-dropdown">
                    <button 
                      className="filter-option"
                      onClick={() => {
                        handleFilterChange('consultorio', '');
                        setShowConsultorioDropdown(false);
                      }}
                    >
                      <FaHospital />
                      <span>Todos los consultorios</span>
                    </button>
                    {consultorios
                      .sort((a, b) => a.i_numero_consultorio - b.i_numero_consultorio)
                      .map(consultorio => (
                        <button
                          key={consultorio.uk_consultorio}
                          className="filter-option"
                          onClick={() => {
                            handleFilterChange('consultorio', consultorio.uk_consultorio);
                            setShowConsultorioDropdown(false);
                          }}
                        >
                          <FaHospital />
                          <span>Consultorio {consultorio.i_numero_consultorio}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              <FaTimes />
            </button>
          </div>
        )}

        {/* History List */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaClipboardList />
              Registros de Turnos
            </h3>
          </div>

          <div className="card-content" style={{ padding: 0 }}>
            {filteredTurns.length === 0 ? (
              <div className="empty-state">
                <FaHistory />
                <h3>{turns.length === 0 ? 'No hay registros' : 'No se encontraron resultados'}</h3>
                <p>
                  {turns.length === 0 
                    ? 'No se encontraron turnos en el sistema'
                    : 'No hay turnos que coincidan con los filtros seleccionados'
                  }
                </p>
                {activeFiltersCount > 0 && (
                  <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '1rem' }}>
                    <FaEraser /> Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="history-list-compact">
                  {currentTurns.map(turn => {
                    const areaName = getAreaInfo(turn.uk_consultorio);
                    const areaObject = getAreaObject(turn.uk_consultorio);
                    const { icon: AreaIcon, color: iconColor } = getAreaIconFromDB(areaObject);
                    const adminName = getAdminName(turn.uk_usuario_registro);

                    return (
                      <div 
                        key={turn.uk_turno} 
                        className="history-row"
                        onClick={() => handleViewDetails(turn)}
                      >
                        <div className="history-icon" style={{ color: iconColor }}>
                          <AreaIcon />
                        </div>
                        <div className="history-content">
                          <span className="history-main-text">
                            Turno #{turn.i_numero_turno} - {getPatientName(turn.uk_paciente)}
                          </span>
                          <span className="history-secondary-text">
                            {areaName} • {new Date(turn.d_fecha).toLocaleDateString('es-ES')} {turn.t_hora} • {turnStatuses.find(s => s.value === turn.s_estado)?.label}
                            {turn.uk_usuario_registro && ` • Asignado por: ${adminName}`}
                          </span>
                        </div>
                        <div className={`history-status-indicator status-${turn.s_estado.toLowerCase()}`}>
                          {React.createElement(getStatusIcon(turn.s_estado), { size: 14 })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Paginación */}
                {filteredTurns.length > turnsPerPage && (
                  <div className="pagination-bar">
                    <div className="pagination-info">
                      <span>Mostrando {startIndex + 1} - {Math.min(endIndex, filteredTurns.length)} de {filteredTurns.length} registros</span>
                    </div>
                    <div className="pagination-controls">
                      <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        title="Primera página"
                      >
                        <FaAngleDoubleLeft />
                      </button>
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        title="Página anterior"
                      >
                        <FaChevronLeft />
                      </button>
                      <span className="pagination-page">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                        title="Página siguiente"
                      >
                        <FaChevronRight />
                      </button>
                      <button
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                        title="Última página"
                      >
                        <FaAngleDoubleRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetailModal && selectedTurn && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FaInfoCircle />
                Detalles del Turno #{selectedTurn.i_numero_turno}
              </h3>
              <button onClick={() => setShowDetailModal(false)} className="modal-close">
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Información del Turno</h4>
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">Número de Turno:</span>
                    <span className="detail-value">#{selectedTurn.i_numero_turno}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Estado:</span>
                    <span className={`status-badge ${getStatusColor(selectedTurn.s_estado)}`}>
                      {turnStatuses.find(s => s.value === selectedTurn.s_estado)?.label || selectedTurn.s_estado}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fecha:</span>
                    <span className="detail-value">
                      {new Date(selectedTurn.d_fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Hora:</span>
                    <span className="detail-value">{selectedTurn.t_hora}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Área:</span>
                    <span className="detail-value">{getAreaInfo(selectedTurn.uk_consultorio)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Consultorio:</span>
                    <span className="detail-value">{getConsultorioInfo(selectedTurn.uk_consultorio)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Información del Paciente</h4>
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">Nombre:</span>
                    <span className="detail-value">{getPatientName(selectedTurn.uk_paciente)}</span>
                  </div>
                  {getPatientInfo(selectedTurn.uk_paciente) && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">DNI:</span>
                        <span className="detail-value">{getPatientInfo(selectedTurn.uk_paciente).c_dni || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Teléfono:</span>
                        <span className="detail-value">{getPatientInfo(selectedTurn.uk_paciente).c_telefono || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{getPatientInfo(selectedTurn.uk_paciente).c_email || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>Información de Registro y Auditoría</h4>
                <div className="detail-grid">
                  {selectedTurn.uk_usuario_registro && (
                    <div className="detail-row">
                      <span className="detail-label">Asignado por:</span>
                      <span className="detail-value" style={{ fontWeight: 700, color: 'var(--primary-medical)' }}>
                        <FaUserMd style={{ marginRight: '6px' }} />
                        {getAdminName(selectedTurn.uk_usuario_registro)}
                      </span>
                    </div>
                  )}
                  {selectedTurn.d_fecha_creacion && (
                    <div className="detail-row">
                      <span className="detail-label">Fecha de creación:</span>
                      <span className="detail-value">
                        {new Date(selectedTurn.d_fecha_creacion).toLocaleString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {selectedTurn.d_fecha_modificacion && (
                    <div className="detail-row">
                      <span className="detail-label">Última modificación:</span>
                      <span className="detail-value">
                        {new Date(selectedTurn.d_fecha_modificacion).toLocaleString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {selectedTurn.uk_usuario_modificacion && (
                    <div className="detail-row">
                      <span className="detail-label">Modificado por:</span>
                      <span className="detail-value">
                        <FaUserMd style={{ marginRight: '6px' }} />
                        {getAdminName(selectedTurn.uk_usuario_modificacion)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedTurn.s_observaciones && (
                <div className="detail-section">
                  <h4>Observaciones</h4>
                  <p className="observations-text">{selectedTurn.s_observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AdminFooter isDarkMode={isDarkMode} />
      <Chatbot />
    </div>
  );
};

export default TurnHistory;
