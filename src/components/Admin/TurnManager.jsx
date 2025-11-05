import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  FaHistory
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

const TurnManager = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [turns, setTurns] = useState([]);
  const [patients, setPatients] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal de confirmación de cancelación
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [turnToCancel, setTurnToCancel] = useState(null);

  // Estados para el modal de notificación de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [attendedTurn, setAttendedTurn] = useState(null);

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

  const [selectedStartDate, setSelectedStartDate] = useState(getCurrentDate());
  const [selectedEndDate, setSelectedEndDate] = useState(getCurrentDate());
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedArea, setSelectedArea] = useState('todas');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [areaDropdownPosition, setAreaDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Estados de paginación
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

  // Efecto para actualizar la fecha automáticamente cada día
  useEffect(() => {
    // Función para actualizar la fecha si ha cambiado
    const updateDateIfNeeded = () => {
      const currentDate = getCurrentDate();
      // Si ambas fechas son iguales y diferentes a la fecha actual, actualizarlas
      if (selectedStartDate === selectedEndDate && selectedStartDate !== currentDate) {
        setSelectedStartDate(currentDate);
        setSelectedEndDate(currentDate);
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

      setTurns(turnsData || []);
    } catch (error) {
      setError('Error cargando turnos: ' + error.message);
      console.error('Error cargando turnos:', error);
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
        await turnService.deleteTurn(turn.uk_turno);
        await loadTurns();
        alert('Turno eliminado correctamente');
      } catch (error) {
        alert('Error eliminando turno: ' + error.message);
        console.error('Error eliminando turno:', error);
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
      setAttendedTurn(turn);
      setShowSuccessModal(true);
      setError(null);

      // Auto-cerrar el modal después de 3 segundos
      setTimeout(() => {
        setShowSuccessModal(false);
        setAttendedTurn(null);
      }, 3000);
    } catch (error) {
      setError('Error marcando turno como atendido: ' + error.message);
      console.error('Error marcando turno como atendido:', error);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setAttendedTurn(null);
  };

  const handleCancelTurn = (turn) => {
    setTurnToCancel(turn);
    setShowCancelModal(true);
  };

  const confirmCancelTurn = async () => {
    if (!turnToCancel) return;

    try {
      await turnService.cancelTurn(turnToCancel.uk_turno);
      await loadTurns();
      setShowCancelModal(false);
      setTurnToCancel(null);
      // Mostrar mensaje de éxito (opcional)
      setError(null);
    } catch (error) {
      setError('Error cancelando turno: ' + error.message);
      console.error('Error cancelando turno:', error);
      setShowCancelModal(false);
      setTurnToCancel(null);
    }
  };

  const cancelCancelTurn = () => {
    setShowCancelModal(false);
    setTurnToCancel(null);
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
        alert(t('admin:turns.messages.updateSuccess'));
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

  // Generar lista de consultorios con área
  const getCombinedAreaConsultorioList = () => {
    const combined = [];

    // Agregar todos los consultorios con su área
    consultorios.forEach(consultorio => {
      const area = areas.find(a => a.uk_area === consultorio.uk_area);
      if (area) {
        combined.push({
          type: 'consultorio',
          id: consultorio.uk_consultorio,
          name: `Consultorio ${consultorio.i_numero_consultorio}`,
          displayName: `Consultorio ${consultorio.i_numero_consultorio} - ${area.s_nombre_area}`,
          areaName: area.s_nombre_area,
          icon: getAreaIcon(area.s_nombre_area),
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
        className: '',
        displayName: t('admin:turns.filters.allOffices')
      };
    }

    const combined = getCombinedAreaConsultorioList();
    const selected = combined.find(item => item.id === selectedArea);

    if (selected) {
      return {
        icon: selected.icon,
        className: selected.className,
        displayName: selected.displayName
      };
    }

    // Fallback
    return {
      icon: FaHospital,
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
    return <TestSpinner message={t('admin:common.loading')} />;
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
            <h1 className="page-title">{t('admin:turns.title')}</h1>
            <p className="page-subtitle">
              {t('admin:turns.subtitle', { count: turns.length })}
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/admin/historial')}
              title="Ver Historial de Turnos"
            >
              <FaHistory /> Historial
            </button>
            <button className="btn btn-secondary" onClick={loadTurns}>
              <FaSync /> {t('common:buttons.refresh')}
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
                  const today = getCurrentDate();
                  setSelectedStartDate(today);
                  setSelectedEndDate(today);
                }}
                className="btn btn-secondary"
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  minHeight: 'auto',
                  height: 'auto',
                  lineHeight: '1'
                }}
                title="Reiniciar a hoy"
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
                  <span>{selectedStatus === 'todos' ? t('admin:turns.filters.allStatuses') : turnStatuses.find(s => s.value === selectedStatus)?.label}</span>
                </div>
                <div className="dropdown-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
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
                      <span>{t('admin:turns.filters.allStatuses')}</span>
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
            <label>{t('admin:turns.filters.areaAndOffice')}</label>
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
                    className={`area-icon ${getSelectedItemInfo().className}`}
                    style={{
                      background: 'none',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '0',
                      padding: '0',
                      boxShadow: 'none'
                    }}
                  >
                    {React.createElement(getSelectedItemInfo().icon)}
                  </div>
                  <span>{getSelectedItemInfo().displayName}</span>
                </div>
                <div className="dropdown-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
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
                        <FaHospital />
                      </div>
                      <span>{t('admin:turns.filters.allOffices')}</span>
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
                          className={`area-icon ${item.className}`}
                          style={{
                            background: 'none',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            padding: '0',
                            boxShadow: 'none'
                          }}
                        >
                          {React.createElement(item.icon)}
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
              <FaFilter /> {t('admin:turns.filters.applyFilters')}
            </button>
          </div>
        </div>

        {/* Turns Table */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaClipboardList />
              {t('admin:turns.listTitle', 'Lista de Turnos')}
            </h3>
            <div className="card-actions">
            </div>
          </div>

          <div className="card-content" style={{ padding: 0 }}>
            {turns.length === 0 ? (
              <div className="empty-state">
                <FaCalendarCheck />
                <h3>{t('admin:turns.messages.noTurnsFound')}</h3>
                <p>{t('admin:turns.messages.noTurnsForFilters')}</p>
              </div>
            ) : (
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
                            {getPatientName(turn.uk_paciente)}
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
                            {React.createElement(getStatusIcon(turn.s_estado), {
                              className: 'status-icon-inline',
                              size: 12
                            })}
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
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                  title="Marcar como atendido"
                                >
                                  <FaCheck />
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
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Filas vacías para mantener altura consistente en páginas 2+ */}
                    {currentPage > 1 && currentTurns.length < turnsPerPage &&
                      Array.from({ length: turnsPerPage - currentTurns.length }).map((_, index) => (
                        <tr key={`empty-${index}`} style={{ height: '57px', opacity: 0 }}>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
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
                  {t('common:buttons.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTurn ? t('common:buttons.update') : t('common:buttons.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de notificación de éxito */}
      {showSuccessModal && attendedTurn && (
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
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--border-radius)',
            padding: 0,
            maxWidth: '420px',
            width: '90%',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {/* Contenido del modal */}
            <div style={{ padding: '32px 24px' }}>
              {/* Icono de éxito grande */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(40, 167, 69, 0.3)',
                  animation: 'successPulse 0.6s ease-out'
                }}>
                  <FaCheck style={{ color: 'white', fontSize: '32px' }} />
                </div>
              </div>

              {/* Título */}
              <h3 style={{
                margin: '0 0 12px 0',
                color: 'var(--text-primary)',
                fontSize: '22px',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                ¡Éxito!
              </h3>

              {/* Mensaje principal */}
              <p style={{
                margin: '0 0 20px 0',
                color: 'var(--text-secondary)',
                fontSize: '15px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                El turno <strong>#{attendedTurn.i_numero_turno}</strong> ha sido marcado como atendido correctamente
              </p>

              {/* Información del turno */}
              <div style={{
                background: isDarkMode ? 'rgba(119, 184, 206, 0.08)' : 'rgba(216, 240, 244, 0.4)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: `1px solid ${isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.25)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaUser style={{ color: '#77b8ce', fontSize: '14px' }} />
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                    {getPatientName(attendedTurn.uk_paciente)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaHospital style={{ color: '#77b8ce', fontSize: '14px' }} />
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                    {getConsultorioInfo(attendedTurn.uk_consultorio)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaClock style={{ color: '#77b8ce', fontSize: '14px' }} />
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                    {new Date(attendedTurn.d_fecha).toLocaleDateString('es-ES')} - {attendedTurn.t_hora}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de progreso de auto-cierre */}
            <div style={{
              height: '4px',
              background: isDarkMode ? 'rgba(119, 184, 206, 0.1)' : 'rgba(216, 240, 244, 0.5)',
              borderRadius: '0 0 var(--border-radius) var(--border-radius)',
              overflow: 'hidden',
              marginTop: '8px'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                animation: 'autoCloseProgress 3s linear forwards'
              }} />
            </div>

            {/* Botón de acción */}
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                type="button"
                onClick={closeSuccessModal}
                style={{
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                  width: '100%',
                  maxWidth: '200px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para cancelar turno */}
      {showCancelModal && turnToCancel && (
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
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--border-radius)',
            padding: 0,
            maxWidth: '450px',
            width: '90%',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {/* Header del modal */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isDarkMode ? 'rgba(234, 93, 75, 0.1)' : 'rgba(234, 93, 75, 0.05)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(234, 93, 75, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea5d4b',
                fontSize: '20px'
              }}>
                <FaExclamationTriangle />
              </div>
              <h3 style={{
                margin: 0,
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Confirmar Cancelación
              </h3>
            </div>

            {/* Contenido del modal */}
            <div style={{ padding: '24px' }}>
              <p style={{
                margin: '0 0 16px 0',
                color: 'var(--text-primary)',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                ¿Estás seguro de cancelar el turno <strong>#{turnToCancel.i_numero_turno}</strong>?
              </p>

              {/* Información del turno */}
              <div style={{
                background: isDarkMode ? 'rgba(119, 184, 206, 0.1)' : 'rgba(216, 240, 244, 0.5)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: `1px solid ${isDarkMode ? 'rgba(119, 184, 206, 0.2)' : 'rgba(119, 184, 206, 0.3)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FaUser style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Paciente:</strong> {getPatientName(turnToCancel.uk_paciente)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FaHospital style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Consultorio:</strong> {getConsultorioInfo(turnToCancel.uk_consultorio)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaClock style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Fecha y hora:</strong> {new Date(turnToCancel.d_fecha).toLocaleDateString('es-ES')} - {turnToCancel.t_hora}
                  </span>
                </div>
              </div>

              <p style={{
                margin: '0',
                color: 'var(--text-muted)',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Botones de acción */}
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={cancelCancelTurn}
                className="btn btn-secondary"
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                No, mantener turno
              </button>
              <button
                type="button"
                onClick={confirmCancelTurn}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: '#ea5d4b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(234, 93, 75, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#d94435';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(234, 93, 75, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ea5d4b';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(234, 93, 75, 0.3)';
                }}
              >
                Sí, cancelar turno
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminFooter isDarkMode={isDarkMode} />
      <Chatbot />
    </div>
  );
};

export default TurnManager;