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
  FaList
} from 'react-icons/fa';
import {
  MdPregnantWoman,
  MdPsychology
} from 'react-icons/md';


// Función para obtener el icono minimalista del área
const getAreaIcon = (areaName) => {
  const iconMap = {
    'Medicina General': FaUserMd,
    'Pediatría': FaBaby,
    'Ginecólogo': MdPregnantWoman,
    'Dentista': FaTooth,
    'Neurólogo': FaHeadSideVirus,
    'Neurología': FaHeadSideVirus,
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
    'Neurologia': FaHeadSideVirus, // Sin tilde
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
    'EN_ATENCION': FaUserMd, // Cambio a FaUserMd que sí existe
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
    'Neurologia': 'neurologo',
    'Cardiologia': 'cardiologia',
    'Dermatologia': 'dermatologia',
    'Oftalmologia': 'oftalmologia',
    'Traumatologia': 'traumatologia',
    'Psicologia': 'psicologia',
    'Radiologia': 'radiologia'
  };
  
  return classMap[areaName] || '';
};

const TurnManager = () => {
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

  const [showModal, setShowModal] = useState(false);
  const [editingTurn, setEditingTurn] = useState(null);
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedArea, setSelectedArea] = useState('todas');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [areaDropdownPosition, setAreaDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const turnsPerPage = 5;
  
  const statusButtonRef = useRef(null);
  const areaButtonRef = useRef(null);
  
  const [formData, setFormData] = useState({
    uk_consultorio: '',
    uk_paciente: '',
    s_observaciones: ''
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados de turnos disponibles
  const turnStatuses = [
    { value: 'EN_ESPERA', label: 'En espera', color: 'info', indicator: '#ffc107' },
    { value: 'EN_ATENCION', label: 'En atención', color: 'warning', indicator: '#17a2b8' },
    { value: 'ATENDIDO', label: 'Atendido', color: 'success', indicator: '#28a745' },
    { value: 'CANCELADO', label: 'Cancelado', color: 'danger', indicator: '#dc3545' },
    { value: 'NO_PRESENTE', label: 'No presente', color: 'secondary', indicator: '#fd7e14' }
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
  }, [selectedDate, selectedStatus, selectedArea]);

  // Efecto para actualizar la fecha automáticamente cada día
  useEffect(() => {
    // Función para actualizar la fecha si ha cambiado
    const updateDateIfNeeded = () => {
      const currentDate = getCurrentDate();
      if (selectedDate !== currentDate) {
        setSelectedDate(currentDate);
      }
    };

    // Verificar inmediatamente al cargar el componente
    updateDateIfNeeded();

    // Calcular cuánto tiempo falta hasta la próxima medianoche
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(now.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

    // Establecer timeout para la primera actualización a medianoche
    const midnightTimeout = setTimeout(() => {
      updateDateIfNeeded();
      
      // Después de la primera actualización, establecer intervalo cada 24 horas
      const dailyInterval = setInterval(updateDateIfNeeded, 24 * 60 * 60 * 1000);
      
      // Cleanup del intervalo
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    // Verificación cada minuto para asegurar que no se pierda el cambio de día
    const minuteInterval = setInterval(updateDateIfNeeded, 60 * 1000);

    // Cleanup
    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(minuteInterval);
    };
  }, []); // Solo se ejecuta una vez al montar el componente

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
      let turnsData;
      const filters = {};

      if (selectedArea !== 'todas') {
        filters.uk_area = selectedArea;
      }

      if (selectedStatus === 'todos') {
        turnsData = await turnService.getTurnsByDate(selectedDate, filters);
        
        // Si no hay turnos para la fecha específica, intentar obtener todos los turnos
        if (!turnsData || turnsData.length === 0) {
          turnsData = await turnService.getAllTurns(filters);
        }
      } else {
        turnsData = await turnService.getTurnsByStatus(selectedStatus, filters);
      }

      setTurns(turnsData || []);
    } catch (error) {
      console.error('Error cargando turnos:', error);
      setError('Error cargando turnos: ' + error.message);
      setTurns([]);
    }
  };

  const handleAddNew = () => {
    setEditingTurn(null);
    setFormData({
      uk_consultorio: '',
      uk_paciente: '',
      s_observaciones: ''
    });
    setShowModal(true);
  };

  const handleEdit = (turn) => {
    setEditingTurn(turn);
    setFormData({
      uk_consultorio: turn.uk_consultorio,
      uk_paciente: turn.uk_paciente || '',
      s_observaciones: turn.s_observaciones || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (turn) => {
    if (window.confirm(`¿Estás seguro de eliminar el turno #${turn.i_numero_turno}?`)) {
      try {
        console.log('🗑️ Intentando eliminar turno:', turn.uk_turno);
        console.log('🔍 Longitud del UUID:', turn.uk_turno?.length);
        console.log('🔍 UUID completo:', JSON.stringify(turn.uk_turno));
        await turnService.deleteTurn(turn.uk_turno);
        console.log('✅ Turno eliminado exitosamente');
        await loadTurns();
        alert('Turno eliminado correctamente');
      } catch (error) {
        console.error('❌ Error eliminando turno:', error);
        console.error('❌ Detalles del error:', error.response?.data);
        alert('Error eliminando turno: ' + error.message);
      }
    }
  };

  const handleStatusChange = async (turn, newStatus) => {
    try {
      await turnService.updateTurnStatus(turn.uk_turno, newStatus);
      await loadTurns();
      alert(`Estado del turno #${turn.i_numero_turno} actualizado a "${turnStatuses.find(s => s.value === newStatus)?.label}"`);
    } catch (error) {
      alert('Error actualizando estado: ' + error.message);
      console.error('Error actualizando estado:', error);
    }
  };

  const handleMarkAsAttended = async (turn) => {
    try {
      await turnService.markTurnAsAttended(turn.uk_turno);
      await loadTurns();
      alert(`Turno #${turn.i_numero_turno} marcado como atendido`);
    } catch (error) {
      alert('Error marcando turno como atendido: ' + error.message);
      console.error('Error marcando turno como atendido:', error);
    }
  };

  const handleMarkAsNoShow = async (turn) => {
    try {
      await turnService.markTurnAsNoShow(turn.uk_turno);
      await loadTurns();
      alert(`Turno #${turn.i_numero_turno} marcado como no presente`);
    } catch (error) {
      alert('Error marcando turno como no presente: ' + error.message);
      console.error('Error marcando turno como no presente:', error);
    }
  };

  const handleCancelTurn = async (turn) => {
    if (window.confirm(`¿Estás seguro de cancelar el turno #${turn.i_numero_turno}?`)) {
      try {
        await turnService.cancelTurn(turn.uk_turno);
        await loadTurns();
        alert(`Turno #${turn.i_numero_turno} cancelado`);
      } catch (error) {
        alert('Error cancelando turno: ' + error.message);
        console.error('Error cancelando turno:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.uk_consultorio) {
      alert('Seleccione consultorio');
      return;
    }

    try {
      if (editingTurn) {
        // Actualizar observaciones del turno
        await turnService.updateTurnObservations(editingTurn.uk_turno, formData.s_observaciones);
        alert('Turno actualizado correctamente');
      } else {
        // Crear nuevo turno
        // Para asignar un paciente ya existente, usar el endpoint estándar /turnos
        // con uk_consultorio y opcionalmente uk_paciente.
        const payload = {
          uk_consultorio: formData.uk_consultorio,
          s_observaciones: formData.s_observaciones,
          ...(formData.uk_paciente ? { uk_paciente: formData.uk_paciente } : {})
        };
        await turnService.createTurn(payload);
      }

      await loadTurns();
      setShowModal(false);
      setFormData({
        uk_consultorio: '',
        uk_paciente: '',
        s_observaciones: ''
      });
    } catch (error) {
      let errorMessage = 'Error guardando turno';
      if (error.response && error.response.data) {
        errorMessage += ': ' + error.response.data.message;
      } else {
        errorMessage += ': ' + error.message;
      }
      alert(errorMessage);
      console.error('Error guardando turno:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusLabel = (status) => {
    const statusObj = turnStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getStatusColor = (status) => {
    const statusObj = turnStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'secondary';
  };

  const getPatientName = (turn) => {
    // Si el turno ya trae los nombres del paciente del backend, usarlos
    if (turn.s_nombre_paciente && turn.s_apellido_paciente) {
      if (turn.s_nombre_paciente === 'Paciente' && turn.s_apellido_paciente === 'Invitado') {
        return 'Invitado';
      }
      return `${turn.s_nombre_paciente} ${turn.s_apellido_paciente}`;
    }
    
    // Fallback al método original
    if (!turn.uk_paciente) return 'Invitado';
    const patient = patients.find(p => p.uk_paciente === turn.uk_paciente);
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

  // ===== LÓGICA DE PAGINACIÓN =====
  const totalTurns = turns.length;
  const totalPages = Math.ceil(totalTurns / turnsPerPage);
  const startIndex = (currentPage - 1) * turnsPerPage;
  const endIndex = startIndex + turnsPerPage;
  const currentTurns = turns.slice(startIndex, endIndex);

  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedStatus, selectedArea]);

  if (loading) {
    return <TestSpinner message="Cargando turnos..." />;
  }

  return (
    <div className="admin-page-unified">
      <AdminHeader />

      <div className="admin-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-icon">
            <FaCalendarCheck />
          </div>
          <div className="page-header-content">
            <h1 className="page-title">Gestión de Turnos</h1>
            <p className="page-subtitle">
              Administra los turnos médicos del sistema - {turns.length} turnos encontrados
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={loadTurns}>
              <FaSync /> Actualizar
            </button>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <FaPlus /> Nuevo Turno
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
          <div className="filter-group">
            <label>Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control"
            />
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
            <label>Área</label>
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
                  <div className={`area-icon ${getAreaClass(selectedArea === 'todas' ? 'todas' : areas.find(a => a.uk_area === selectedArea)?.s_nombre_area || selectedArea)}`}>
                    {selectedArea === 'todas' ? (
                      <FaHospital />
                    ) : (
                      React.createElement(getAreaIcon(areas.find(a => a.uk_area === selectedArea)?.s_nombre_area || selectedArea))
                    )}
                  </div>
                  <span>{selectedArea === 'todas' ? 'Todas las áreas' : areas.find(a => a.uk_area === selectedArea)?.s_nombre_area || selectedArea}</span>
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
                      <div className="area-icon"><FaHospital /></div>
                      <span>Todas las áreas</span>
                    </div>
                    {areas.map(area => (
                      <div
                        key={area.uk_area}
                        className="area-option"
                        onClick={() => {
                          setSelectedArea(area.uk_area);
                          setAreaDropdownOpen(false);
                        }}
                      >
                        <div className={`area-icon ${getAreaClass(area.s_nombre_area)}`}>
                          {React.createElement(getAreaIcon(area.s_nombre_area))}
                        </div>
                        <span>{area.s_nombre_area}</span>
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

        {/* Turns Table */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaClipboardList />
              Lista de Turnos
            </h3>
            <div className="card-actions">
              <button className="card-action" onClick={handleAddNew} title="Agregar nuevo turno">
                <FaPlus />
              </button>
              <button className="card-action" title="Ver detalles">
                <FaEye />
              </button>
              <button className="card-action" title="Filtros">
                <FaFilter />
              </button>
            </div>
          </div>

          <div className="card-content" style={{ padding: 0 }}>
            {turns.length === 0 ? (
              <div className="empty-state">
                <FaCalendarCheck />
                <h3>No hay turnos registrados</h3>
                <p>No se encontraron turnos para los filtros seleccionados</p>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAddNew}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    minWidth: 'auto',
                    width: 'auto',
                    maxWidth: '200px'
                  }}
                >
                  Crear Turno
                </button>
              </div>
            ) : (
              <div>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th># Turno</th>
                        <th>Paciente</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Consultorio</th>
                        <th>Área</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTurns.map(turn => (
                      <tr key={turn.uk_turno}>
                        <td>
                          <strong>#{turn.i_numero_turno}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaUser style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                            {getPatientName(turn)}
                          </div>
                        </td>
                        <td>{new Date(turn.d_fecha).toLocaleDateString('es-ES')}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaClock style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                            {turn.t_hora}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(turn.s_estado)}`}>
                            {getStatusLabel(turn.s_estado)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaHospital style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                            {getConsultorioInfo(turn.uk_consultorio)}
                          </div>
                        </td>
                        <td>{getAreaInfo(turn.uk_consultorio)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {turn.s_estado === 'EN_ESPERA' && (
                              <>
                                <button
                                  onClick={() => handleMarkAsAttended(turn)}
                                  className="btn btn-success"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                  title="Marcar como atendido"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => handleMarkAsNoShow(turn)}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                  title="Marcar como no presente"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                            {turn.s_estado !== 'CANCELADO' && turn.s_estado !== 'ATENDIDO' && (
                              <button
                                onClick={() => handleCancelTurn(turn)}
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                title="Cancelar turno"
                              >
                                <FaTimes />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(turn)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              title="Editar observaciones"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(turn)}
                              className="btn btn-danger"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              title="Eliminar turno"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Filas vacías para mantener altura constante (solo después de página 1) */}
                    {currentPage > 1 && Array.from({ length: turnsPerPage - currentTurns.length }, (_, index) => (
                      <tr key={`empty-${index}`} style={{ 
                        height: '60px',
                        backgroundColor: 'transparent'
                      }}>
                        <td style={{ color: 'transparent' }}>-</td>
                        <td style={{ color: 'transparent' }}>-</td>
                        <td style={{ color: 'transparent' }}>-</td>
                        <td style={{ color: 'transparent' }}>-</td>
                        <td style={{ color: 'transparent' }}>-</td>
                        <td style={{ color: 'transparent' }}>-</td>
                        <td style={{ color: 'transparent' }}>-</td>
                        <td style={{ color: 'transparent' }}>-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Barra de Paginación */}
              {totalTurns > turnsPerPage && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '15px',
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: isDarkMode ? '#1a252f' : '#f8f9fa',
                  borderTop: `1px solid ${isDarkMode ? '#2c3e50' : '#dee2e6'}`,
                  borderRadius: '0 0 8px 8px'
                }}>
                  {/* Primera página */}
                  <button 
                    onClick={goToFirstPage} 
                    disabled={currentPage === 1}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      color: currentPage === 1 ? '#6c757d' : (isDarkMode ? '#74b9ff' : '#007bff'),
                      border: 'none',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '18px',
                      fontWeight: '900',
                      transition: 'all 0.3s ease',
                      textShadow: currentPage === 1 ? 'none' : (isDarkMode ? '0 0 8px rgba(116, 185, 255, 0.5)' : '0 0 6px rgba(0, 123, 255, 0.3)')
                    }}
                    title="Primera página"
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.backgroundColor = isDarkMode ? 'rgba(52, 73, 94, 0.3)' : 'rgba(227, 242, 253, 0.5)';
                        e.target.style.textShadow = isDarkMode ? '0 0 12px rgba(116, 185, 255, 0.8)' : '0 0 8px rgba(0, 123, 255, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    &lt;&lt;
                  </button>
                  
                  {/* Página anterior */}
                  <button 
                    onClick={goToPreviousPage} 
                    disabled={currentPage === 1}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      color: currentPage === 1 ? '#6c757d' : (isDarkMode ? '#74b9ff' : '#007bff'),
                      border: 'none',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '18px',
                      fontWeight: '900',
                      transition: 'all 0.3s ease',
                      textShadow: currentPage === 1 ? 'none' : (isDarkMode ? '0 0 8px rgba(116, 185, 255, 0.5)' : '0 0 6px rgba(0, 123, 255, 0.3)')
                    }}
                    title="Página anterior"
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.backgroundColor = isDarkMode ? 'rgba(52, 73, 94, 0.3)' : 'rgba(227, 242, 253, 0.5)';
                        e.target.style.textShadow = isDarkMode ? '0 0 12px rgba(116, 185, 255, 0.8)' : '0 0 8px rgba(0, 123, 255, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    &lt;
                  </button>
                  
                  {/* Indicador de página */}
                  <div style={{ 
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: isDarkMode ? '#ecf0f1' : '#495057',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    border: `1px solid ${isDarkMode ? '#2c3e50' : '#dee2e6'}`,
                    textShadow: isDarkMode ? '0 0 6px rgba(236, 240, 241, 0.3)' : 'none'
                  }}>
                    Página {currentPage} de {totalPages} | {totalTurns} turnos total
                  </div>
                  
                  {/* Página siguiente */}
                  <button 
                    onClick={goToNextPage} 
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      color: currentPage === totalPages ? '#6c757d' : (isDarkMode ? '#74b9ff' : '#007bff'),
                      border: 'none',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '18px',
                      fontWeight: '900',
                      transition: 'all 0.3s ease',
                      textShadow: currentPage === totalPages ? 'none' : (isDarkMode ? '0 0 8px rgba(116, 185, 255, 0.5)' : '0 0 6px rgba(0, 123, 255, 0.3)')
                    }}
                    title="Página siguiente"
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.backgroundColor = isDarkMode ? 'rgba(52, 73, 94, 0.3)' : 'rgba(227, 242, 253, 0.5)';
                        e.target.style.textShadow = isDarkMode ? '0 0 12px rgba(116, 185, 255, 0.8)' : '0 0 8px rgba(0, 123, 255, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    &gt;
                  </button>
                  
                  {/* Última página */}
                  <button 
                    onClick={goToLastPage} 
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      color: currentPage === totalPages ? '#6c757d' : (isDarkMode ? '#74b9ff' : '#007bff'),
                      border: 'none',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '18px',
                      fontWeight: '900',
                      transition: 'all 0.3s ease',
                      textShadow: currentPage === totalPages ? 'none' : (isDarkMode ? '0 0 8px rgba(116, 185, 255, 0.5)' : '0 0 6px rgba(0, 123, 255, 0.3)')
                    }}
                    title="Última página"
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.backgroundColor = isDarkMode ? 'rgba(52, 73, 94, 0.3)' : 'rgba(227, 242, 253, 0.5)';
                        e.target.style.textShadow = isDarkMode ? '0 0 12px rgba(116, 185, 255, 0.8)' : '0 0 8px rgba(0, 123, 255, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    &gt;&gt;
                  </button>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--border-radius)',
            padding: 0,
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                {editingTurn ? 'Editar Turno' : 'Nuevo Turno'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label>Consultorio *</label>
                <select
                  name="uk_consultorio"
                  value={formData.uk_consultorio}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Seleccionar consultorio</option>
                  {consultorios.map(consultorio => (
                    <option key={consultorio.uk_consultorio} value={consultorio.uk_consultorio}>
                      Consultorio {consultorio.i_numero_consultorio} - {getAreaInfo(consultorio.uk_consultorio)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Paciente (opcional)</label>
                <select
                  name="uk_paciente"
                  value={formData.uk_paciente}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Sin paciente asignado</option>
                  {patients.map(patient => (
                    <option key={patient.uk_paciente} value={patient.uk_paciente}>
                      {patient.s_nombre} {patient.s_apellido} - {patient.c_telefono}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Observaciones</label>
                <textarea
                  name="s_observaciones"
                  value={formData.s_observaciones}
                  onChange={handleInputChange}
                  rows="3"
                  className="form-control"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTurn ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminFooter isDarkMode={isDarkMode} />
      <Chatbot />
    </div>
  );
};

export default TurnManager;