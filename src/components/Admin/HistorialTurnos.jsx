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
import '../../styles/UnifiedAdminPages.css';

// React Icons
import {
  FaCalendarCheck,
  FaUsers,
  FaClock,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
  FaPlus,
  FaSync,
  FaUser,
  FaHospital,
  FaClipboardList,
  FaUserMd,
  FaHeart,
  FaBaby,
  FaTooth,
  FaBrain,
  FaSyringe,
  FaEyeDropper,
  FaBone,
  FaCamera,
  FaBandAid,
  FaHeadSideVirus,
  FaUserNurse,
  FaUserTimes,
  FaList,
  FaFlask,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaHistory,
  FaStethoscope,
  FaHeartbeat,
  FaFemale,
  FaMale,
  FaProcedures,
  FaDoorOpen,
  FaAmbulance,
  FaPrescriptionBottle,
  FaXRay,
  FaMicroscope,
  FaLungs,
  FaHandHoldingHeart,
  FaWheelchair,
  FaCrutch,
  FaThermometer,
  FaHeadSideCough,
  FaVials
} from 'react-icons/fa';
import {
  MdPregnantWoman,
  MdPsychology
} from 'react-icons/md';

// Función para mapear nombres de React Icons a componentes (desde BD)
const getIconComponent = (iconName) => {
  const iconMap = {
    'FaStethoscope': FaStethoscope,
    'FaBaby': FaBaby,
    'FaHeartbeat': FaHeartbeat,
    'FaUserMd': FaUserMd,
    'FaFemale': FaFemale,
    'FaEye': FaEye,
    'FaBone': FaBone,
    'FaBrain': FaBrain,
    'FaMale': FaMale,
    'FaFlask': FaFlask,
    'FaProcedures': FaProcedures,
    'FaDoorOpen': FaDoorOpen,
    'FaHospital': FaHospital,
    'FaAmbulance': FaAmbulance,
    'FaSyringe': FaSyringe,
    'FaPrescriptionBottle': FaPrescriptionBottle,
    'FaXRay': FaXRay,
    'FaMicroscope': FaMicroscope,
    'FaLungs': FaLungs,
    'FaTooth': FaTooth,
    'FaHandHoldingHeart': FaHandHoldingHeart,
    'FaWheelchair': FaWheelchair,
    'FaCrutch': FaCrutch,
    'FaThermometer': FaThermometer,
    'FaHeadSideCough': FaHeadSideCough,
    'FaVials': FaVials,
    'FaHeart': FaHeart,
    'MdPregnantWoman': MdPregnantWoman,
    'MdPsychology': MdPsychology
  };
  return iconMap[iconName] || FaHospital; // Fallback a hospital si no se encuentra
};

// Función para obtener el icono minimalista del área
const getAreaIcon = (areaName) => {
  const iconMap = {
    'Medicina General': FaUserMd,
    'Pediatría': FaBaby,
    'Ginecólogo': MdPregnantWoman,
    'Dentista': FaTooth,
    'Neurólogo': FaHeadSideVirus,
    'Neurología': FaHeadSideVirus,
    'Laboratorio': FaFlask,
    'Vacunación': FaSyringe,
    'Enfermería': FaSyringe,
    'Cardiología': FaHeart,
    'Dermatología': FaBandAid,
    'Oftalmología': FaEyeDropper,
    'Traumatología': FaBone,
    'Psicología': MdPsychology,
    'Radiología': FaCamera,
    // Agregando variaciones comunes de nombres
    'area': FaHospital,
    'Area Prueba': FaHospital,
    'Ginecólogo': MdPregnantWoman,
    'Enfermeria': FaSyringe,  // Sin tilde
    'Pediatria': FaBaby,      // Sin tilde
    'Neurologo': FaHeadSideVirus, // Sin tilde
    'Neurologia': FaHeadSideVirus, // Sin tilde
    'Laboratorio': FaFlask,   // Laboratorio
    'Vacunacion': FaSyringe, // Sin tilde
    'Cardiologia': FaHeart,   // Sin tilde
    'Dermatologia': FaBandAid, // Sin tilde
    'Oftalmologia': FaEyeDropper, // Sin tilde
    'Traumatologia': FaBone,  // Sin tilde
    'Psicologia': MdPsychology, // Sin tilde
    'Radiologia': FaCamera    // Sin tilde
  };
  
  return iconMap[areaName] || FaHospital;
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
    'EN_ESPERA': '#ffc107',
    'EN_ATENCION': '#17a2b8', 
    'ATENDIDO': '#28a745',
    'CANCELADO': '#dc3545',
    'NO_PRESENTE': '#fd7e14',
    'todos': '#6c757d'
  };
  
  return statusColorMap[status] || '#6c757d';
};

// Función para obtener la clase CSS del área
const getAreaClass = (areaName) => {
  const classMap = {
    'Medicina General': 'medicina-general',
    'Pediatría': 'pediatria',
    'Ginecólogo': 'ginecologo',
    'Dentista': 'dentista',
    'Neurólogo': 'neurologo',
    'Neurología': 'neurologo',
    'Laboratorio': 'laboratorio',
    'Vacunación': 'vacunacion',
    'Enfermería': 'enfermeria',
    'Cardiología': 'cardiologia',
    'Dermatología': 'dermatologia',
    'Oftalmología': 'oftalmologia',
    'Traumatología': 'traumatologia',
    'Psicología': 'psicologia',
    'Radiología': 'radiologia',
    // Variaciones sin tildes y casos especiales
    'area': '',
    'Area Prueba': '',
    'Ginecólogo': 'ginecologo',
    'Enfermeria': 'enfermeria',
    'Pediatria': 'pediatria',
    'Neurologo': 'neurologo',
    'Neurologia': 'neurologo',
    'Laboratorio': 'laboratorio',
    'Vacunacion': 'vacunacion',
    'Cardiologia': 'cardiologia',
    'Dermatologia': 'dermatologia',
    'Oftalmologia': 'oftalmologia',
    'Traumatologia': 'traumatologia',
    'Psicologia': 'psicologia',
    'Radiologia': 'radiologia'
  };
  
  return classMap[areaName] || '';
};

const HistorialTurnos = () => {
  const [turns, setTurns] = useState([]);
  const [patients, setPatients] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detectar tema actual
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

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-status-select')) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Para el historial, configuramos las fechas con un rango mayor por defecto (último mes)
  const getDefaultStartDate = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1); // Un mes atrás
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedStartDate, setSelectedStartDate] = useState(getDefaultStartDate());
  const [selectedEndDate, setSelectedEndDate] = useState(getCurrentDate());
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedArea, setSelectedArea] = useState('todas');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [areaDropdownPosition, setAreaDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const turnsPerPage = 10; // Más turnos por página en el historial
  
  const statusButtonRef = useRef(null);
  const areaButtonRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados de turnos disponibles
  const turnStatuses = [
    { value: 'EN_ESPERA', label: 'En espera', color: 'info', indicator: '#ffc107' },
    { value: 'ATENDIDO', label: 'Atendido', color: 'success', indicator: '#28a745' },
    { value: 'CANCELADO', label: 'Cancelado', color: 'danger', indicator: '#dc3545' },
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    // Mostrar spinner brevemente para mejor UX
    setLoading(true);
    setTimeout(() => {
      loadData();
    }, 800);
  }, []);

  // Cargar turnos cuando cambie la fecha, estado o área
  useEffect(() => {
    loadTurns();
  }, [selectedStartDate, selectedEndDate, selectedStatus, selectedArea]);

  // Cerrar dropdowns al hacer scroll externo o resize
  useEffect(() => {
    const handleScroll = (e) => {
      // Verificar si el target y los métodos existen antes de usarlos
      if (!e.target) return;
      
      // No cerrar si el scroll es dentro del dropdown
      try {
        if ((e.target.classList && e.target.classList.contains('status-dropdown-menu')) || 
            (e.target.classList && e.target.classList.contains('area-dropdown-menu')) ||
            (e.target.closest && e.target.closest('.status-dropdown-menu')) ||
            (e.target.closest && e.target.closest('.area-dropdown-menu'))) {
          return;
        }
      } catch (error) {
        // Si hay error en la detección, simplemente continuar
        console.warn('Error in scroll detection:', error);
      }
      
      // Cerrar dropdowns solo si es scroll externo
      if (statusDropdownOpen || areaDropdownOpen) {
        setStatusDropdownOpen(false);
        setAreaDropdownOpen(false);
      }
    };

    const handleResize = () => {
      if (statusDropdownOpen || areaDropdownOpen) {
        setStatusDropdownOpen(false);
        setAreaDropdownOpen(false);
      }
    };

    if (statusDropdownOpen || areaDropdownOpen) {
      document.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        document.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [statusDropdownOpen, areaDropdownOpen]);

  const loadData = async () => {
    try {
      setError(null);

      // Cargar datos en paralelo
      const [patientsData, consultoriosData, areasData] = await Promise.all([
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
        })
      ]);

      setPatients(patientsData);
      setConsultorios(consultoriosData);
      setAreas(areasData);
    } catch (error) {
      setError('Error cargando datos: ' + error.message);
      console.error('Error cargando datos:', error);
    } finally {
      // Delay mínimo para transición suave del spinner
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const loadTurns = async () => {
    try {
      console.log('Loading turns with selectedStatus:', selectedStatus, 'startDate:', selectedStartDate, 'endDate:', selectedEndDate);
      let turnsData;
      const filters = {};

      if (selectedArea !== 'todas') {
        // Solo filtrar por consultorio específico
        filters.uk_consultorio = selectedArea;
      }

      if (selectedStatus !== 'todos') {
        // Incluir filtro de estado si no es "todos"
        filters.estado = selectedStatus;
      }

      console.log('Using getTurnsByDateRange with filters:', filters);
      turnsData = await turnService.getTurnsByDateRange(selectedStartDate, selectedEndDate, filters);
      
      console.log('Received turnsData:', turnsData);
      console.log('Number of turns:', turnsData?.length || 0);

      // Ordenar por fecha más reciente primero (útil en historial)
      if (turnsData && turnsData.length > 0) {
        turnsData.sort((a, b) => {
          const dateA = new Date(a.d_fecha + ' ' + a.t_hora);
          const dateB = new Date(b.d_fecha + ' ' + b.t_hora);
          return dateB - dateA; // Orden descendente (más reciente primero)
        });
      }

      setTurns(turnsData || []);
    } catch (error) {
      setError('Error cargando turnos: ' + error.message);
      console.error('Error cargando turnos:', error);
      setTurns([]);
    }
  };

  const getStatusLabel = (status) => {
    const statusObj = turnStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getStatusColorClass = (status) => {
    const statusColorMap = {
      'EN_ESPERA': 'status-en-espera',
      'EN_ATENCION': 'status-en-atencion', 
      'ATENDIDO': 'status-atendido',
      'CANCELADO': 'status-cancelado',
      'NO_PRESENTE': 'status-no-presente'
    };
    
    return statusColorMap[status] || 'status-default';
  };

  const getPatientName = (uk_paciente) => {
    if (!uk_paciente) return 'Invitado';
    const patient = patients.find(p => p.uk_paciente === uk_paciente);
    return patient ? `${patient.s_nombre} ${patient.s_apellido}` : 'Paciente no encontrado';
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

  // Generar lista de consultorios con área (usando colores e iconos desde BD)
  const getCombinedAreaConsultorioList = () => {
    const combined = [];

    // Agregar todos los consultorios con su área
    consultorios.forEach(consultorio => {
      const area = areas.find(a => a.uk_area === consultorio.uk_area);
      if (area) {
        // Obtener color e icono desde la BD
        const areaColor = area.s_color || '#4A90E2';
        const areaIconName = area.s_icono || 'FaHospital';
        const AreaIconComponent = getIconComponent(areaIconName);
        
        combined.push({
          type: 'consultorio',
          id: consultorio.uk_consultorio,
          name: `Consultorio ${consultorio.i_numero_consultorio}`,
          displayName: `Consultorio ${consultorio.i_numero_consultorio} - ${area.s_nombre_area}`,
          areaName: area.s_nombre_area,
          areaColor: areaColor,
          icon: AreaIconComponent,
          iconName: areaIconName,
          className: getAreaClass(area.s_nombre_area)
        });
      }
    });

    return combined;
  };

  // Obtener la información del elemento seleccionado (consultorio)
  const getSelectedItemInfo = () => {
    if (selectedArea === 'todas') {
      return {
        icon: FaHospital,
        iconComponent: FaHospital,
        areaColor: '#4A90E2',
        className: '',
        displayName: 'Todos los consultorios'
      };
    }
    
    const combined = getCombinedAreaConsultorioList();
    const selected = combined.find(item => item.id === selectedArea);
    
    if (selected) {
      return {
        icon: selected.icon,
        iconComponent: selected.icon,
        areaColor: selected.areaColor,
        className: selected.className,
        displayName: selected.displayName
      };
    }
    
    // Fallback
    return {
      icon: FaHospital,
      iconComponent: FaHospital,
      areaColor: '#4A90E2',
      className: '',
      displayName: 'Todos los consultorios'
    };
  };

  // Funciones de paginación
  const totalPages = Math.ceil(turns.length / turnsPerPage);
  const startIndex = (currentPage - 1) * turnsPerPage;
  const endIndex = startIndex + turnsPerPage;
  const currentTurns = turns.slice(startIndex, endIndex);

  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

  // Resetear a la primera página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStartDate, selectedEndDate, selectedStatus, selectedArea]);

  // Ajustar página actual si se queda sin turnos
  useEffect(() => {
    if (turns.length > 0 && currentTurns.length === 0 && currentPage > 1) {
      setCurrentPage(Math.max(1, Math.ceil(turns.length / turnsPerPage)));
    }
  }, [turns.length, currentTurns.length, currentPage, turnsPerPage]);

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
              Consulta y revisa el historial completo de turnos - {turns.length} turnos encontrados
            </p>
          </div>
          <div className="page-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/admin/turns')}
              title="Ir a Gestión de Turnos"
            >
              <FaCalendarCheck /> Gestión de Turnos
            </button>
            <button className="btn btn-secondary" onClick={loadTurns}>
              <FaSync /> Actualizar
            </button>
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

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group date-range-filter">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ margin: 0 }}>Fechas</label>
              <button
                type="button"
                onClick={() => {
                  setSelectedStartDate(getDefaultStartDate());
                  setSelectedEndDate(getCurrentDate());
                }}
                className="btn btn-secondary"
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  minHeight: 'auto',
                  height: 'auto',
                  lineHeight: '1'
                }}
                title="Reiniciar a último mes"
              >
                <FaSync style={{ fontSize: '10px' }} />
              </button>
            </div>
            <div className="date-range-container" style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'nowrap',
              width: '100%',
              maxWidth: '100%'
            }}>
              <div className="date-input-wrapper" style={{ flex: '1', minWidth: '0' }}>
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setSelectedStartDate(newStartDate);
                    // Si la fecha inicial es mayor que la final, ajustar la final
                    if (newStartDate > selectedEndDate) {
                      setSelectedEndDate(newStartDate);
                    }
                  }}
                  onClick={(e) => {
                    // Forzar que se abra el calendario al hacer click en cualquier parte
                    e.target.showPicker && e.target.showPicker();
                  }}
                  className="form-control"
                  placeholder="Fecha inicial"
                  title="Fecha inicial"
                  style={{ width: '100%', minWidth: '0' }}
                />
              </div>
              <span style={{ 
                color: 'var(--text-muted)', 
                fontSize: '13px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                padding: '0 6px',
                flexShrink: 0
              }}>a</span>
              <div className="date-input-wrapper" style={{ flex: '1', minWidth: '0' }}>
                <input
                  type="date"
                  value={selectedEndDate}
                  onChange={(e) => {
                    const newEndDate = e.target.value;
                    setSelectedEndDate(newEndDate);
                    // Si la fecha final es menor que la inicial, ajustar la inicial
                    if (newEndDate < selectedStartDate) {
                      setSelectedStartDate(newEndDate);
                    }
                  }}
                  onClick={(e) => {
                    // Forzar que se abra el calendario al hacer click en cualquier parte
                    e.target.showPicker && e.target.showPicker();
                  }}
                  min={selectedStartDate}
                  className="form-control"
                  placeholder="Fecha final"
                  title="Fecha final"
                  style={{ width: '100%', minWidth: '0' }}
                />
              </div>
            </div>
          </div>
          <div className="filter-group">
            <label>Estado</label>
            <div className="custom-status-select">
              <div 
                ref={statusButtonRef}
                className="status-select-trigger"
                onClick={() => {
                  if (!statusDropdownOpen && statusButtonRef.current) {
                    const rect = statusButtonRef.current.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom + window.scrollY,
                      left: rect.left + window.scrollX,
                      width: rect.width
                    });
                  }
                  setStatusDropdownOpen(!statusDropdownOpen);
                }}
              >
                <div className="status-selected">
                  <div className={`status-icon status-${selectedStatus.toLowerCase()}`}>
                    {React.createElement(getStatusIcon(selectedStatus))}
                  </div>
                  <span>{selectedStatus === 'todos' ? 'Todos los estados' : turnStatuses.find(s => s.value === selectedStatus)?.label}</span>
                </div>
                <div className="dropdown-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>
              
              {statusDropdownOpen && createPortal(
                <>
                  <div 
                    className="status-dropdown-overlay"
                    onClick={() => setStatusDropdownOpen(false)}
                  />
                  <div 
                    className="status-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: `${dropdownPosition.width}px`,
                      zIndex: 999999999
                    }}
                  >
                    <div 
                      className="status-option"
                      onClick={() => {
                        setSelectedStatus('todos');
                        setStatusDropdownOpen(false);
                      }}
                    >
                      <div className="status-icon status-todos">
                        <FaList />
                      </div>
                      <span>Todos los estados</span>
                    </div>
                    {turnStatuses.map(status => (
                      <div
                        key={status.value}
                        className="status-option"
                        onClick={() => {
                          setSelectedStatus(status.value);
                          setStatusDropdownOpen(false);
                        }}
                      >
                        <div className={`status-icon status-${status.value.toLowerCase()}`}>
                          {React.createElement(getStatusIcon(status.value))}
                        </div>
                        <span>{status.label}</span>
                      </div>
                    ))}
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
          <div className="filter-group">
            <label>ÁREA Y CONSULTORIO</label>
            <div className="custom-area-select">
              <div 
                ref={areaButtonRef}
                className="area-select-trigger"
                onClick={() => {
                  // Siempre calcular posición antes de cambiar el estado
                  const rect = areaButtonRef.current?.getBoundingClientRect();
                  if (rect) {
                    setAreaDropdownPosition({
                      top: rect.bottom + window.scrollY,
                      left: rect.left + window.scrollX,
                      width: rect.width
                    });
                  }
                  setAreaDropdownOpen(!areaDropdownOpen);
                }}
              >
                <div className="area-selected">
                  <div 
                    className="area-icon"
                    style={{
                      background: 'none',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '0',
                      padding: '0',
                      boxShadow: 'none',
                      color: `${getSelectedItemInfo().areaColor} !important`
                    }}
                  >
                    <span style={{ color: getSelectedItemInfo().areaColor, display: 'flex', alignItems: 'center' }}>
                      {React.createElement(getSelectedItemInfo().iconComponent)}
                    </span>
                  </div>
                  <span>{getSelectedItemInfo().displayName}</span>
                </div>
                <div className="dropdown-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>
              
              {areaDropdownOpen && createPortal(
                <>
                  <div 
                    className="area-dropdown-overlay"
                    onClick={() => setAreaDropdownOpen(false)}
                  />
                  <div 
                    className="area-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: `${areaDropdownPosition.top}px`,
                      left: `${areaDropdownPosition.left}px`,
                      width: `${areaDropdownPosition.width}px`,
                      zIndex: 999999999
                    }}
                  >
                    <div 
                      className="area-option"
                      onClick={() => {
                        setSelectedArea('todas');
                        setAreaDropdownOpen(false);
                      }}
                    >
                      <div 
                        className="area-icon"
                        style={{ 
                          background: 'none',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '0',
                          padding: '0',
                          boxShadow: 'none'
                        }}
                      >
                        <span style={{ color: '#4A90E2', display: 'flex', alignItems: 'center' }}>
                          <FaHospital />
                        </span>
                      </div>
                      <span>Todos los consultorios</span>
                    </div>
                    {getCombinedAreaConsultorioList().map(item => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="area-option"
                        onClick={() => {
                          setSelectedArea(item.id);
                          setAreaDropdownOpen(false);
                        }}
                      >
                        <div 
                          className="area-icon"
                          style={{ 
                            background: 'none',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            padding: '0',
                            boxShadow: 'none'
                          }}
                        >
                          <span style={{ color: item.areaColor, display: 'flex', alignItems: 'center' }}>
                            {React.createElement(item.icon)}
                          </span>
                        </div>
                        <span>{item.displayName}</span>
                      </div>
                    ))}
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
          <div className="filter-group">
            <button className="btn btn-secondary">
              <FaFilter /> Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Historial de Turnos - Lista con Tarjetas */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaClipboardList />
              Registros de Turnos
            </h3>
            <div className="card-actions">
              <span style={{ 
                fontSize: '14px', 
                color: 'var(--text-muted)',
                fontWeight: 500
              }}>
                {turns.length} registro{turns.length !== 1 ? 's' : ''} encontrado{turns.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="card-content" style={{ padding: '20px' }}>
            {turns.length === 0 ? (
              <div className="empty-state">
                <FaHistory />
                <h3>No hay turnos en el historial</h3>
                <p>No se encontraron turnos para los filtros seleccionados</p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px' 
              }}>
                {currentTurns.map(turn => {
                  // Obtener información del consultorio y área
                  const consultorioData = consultorios.find(c => c.uk_consultorio === turn.uk_consultorio);
                  const areaData = areas.find(a => a.uk_area === consultorioData?.uk_area);
                  
                  // Obtener color e icono desde la BD
                  const areaColor = areaData?.s_color || '#4A90E2';
                  const areaIconName = areaData?.s_icono || 'FaHospital';
                  const areaName = areaData?.s_nombre_area || 'Área';
                  const AreaIconComponent = getIconComponent(areaIconName);
                  
                  return (
                    <div
                      key={turn.uk_turno}
                      style={{
                        background: isDarkMode ? 'rgba(15, 27, 47, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                        border: isDarkMode ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(226, 232, 240, 0.8)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = isDarkMode 
                          ? '0 4px 16px rgba(0, 0, 0, 0.3)' 
                          : '0 4px 16px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = isDarkMode 
                          ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
                          : '0 2px 8px rgba(0, 0, 0, 0.05)';
                      }}
                    >
                      {/* Icono del Área - Usando color e icono desde BD */}
                      <div style={{
                        width: '56px',
                        height: '56px',
                        minWidth: '56px',
                        borderRadius: '50%',
                        background: areaColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: '#ffffff',
                        border: `2px solid ${areaColor}`,
                        boxShadow: `0 2px 8px ${areaColor}40`,
                      }}>
                        <AreaIconComponent />
                      </div>

                      {/* Información Principal */}
                      <div style={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        minWidth: 0
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: areaColor,
                            letterSpacing: '0.5px'
                          }}>
                            #{turn.i_numero_turno}
                          </span>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: isDarkMode ? '#e6edf3' : '#1e293b',
                          }}>
                            {getPatientName(turn.uk_paciente)}
                          </span>
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '16px',
                          fontSize: '14px',
                          color: isDarkMode ? 'rgba(203, 213, 225, 0.8)' : 'rgba(71, 85, 105, 0.8)',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 600, color: areaColor }}>{areaName}</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            • {getConsultorioInfo(turn.uk_consultorio)}
                          </span>
                        </div>
                      </div>

                      {/* Fecha y Hora */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '4px',
                        minWidth: '140px'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: isDarkMode ? '#cbd5e1' : '#475569',
                        }}>
                          {new Date(turn.d_fecha).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          color: isDarkMode ? 'rgba(203, 213, 225, 0.7)' : 'rgba(71, 85, 105, 0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <FaClock size={11} />
                          {turn.t_hora}
                        </span>
                      </div>

                      {/* Estado */}
                      <div style={{
                        minWidth: '100px',
                        display: 'flex',
                        justifyContent: 'flex-end'
                      }}>
                        <span 
                          className={`status-badge ${getStatusColorClass(turn.s_estado)}`}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {React.createElement(getStatusIcon(turn.s_estado), { 
                            size: 12 
                          })}
                          {getStatusLabel(turn.s_estado)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Barra de paginación */}
            {turns.length > turnsPerPage && (
              <div className="pagination-bar">
                <div className="pagination-info">
                  <span>Página {currentPage} de {totalPages} | {turns.length} turnos total</span>
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
          </div>
        </div>
      </div>

      <AdminFooter isDarkMode={isDarkMode} />
      <Chatbot />
    </div>
  );
};

export default HistorialTurnos;
