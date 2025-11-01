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
  FaFlask
} from 'react-icons/fa';
import {
  MdPregnantWoman,
  MdPsychology
} from 'react-icons/md';

// Función para obtener el icono del área
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTurn, setSelectedTurn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Estados de filtros
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Establecer rango de fecha de último mes por defecto
  const getLastMonthDate = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedStartDate, setSelectedStartDate] = useState(getLastMonthDate());
  const [selectedEndDate, setSelectedEndDate] = useState(getCurrentDate());
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedArea, setSelectedArea] = useState('todas');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [areaDropdownPosition, setAreaDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const turnsPerPage = 10;
  
  const statusButtonRef = useRef(null);
  const areaButtonRef = useRef(null);

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

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-status-select')) {
        setStatusDropdownOpen(false);
      }
      if (!event.target.closest('.custom-area-select')) {
        setAreaDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      loadData();
    }, 500);
  }, []);

  // Cargar turnos cuando cambien los filtros
  useEffect(() => {
    loadTurns();
  }, [selectedStartDate, selectedEndDate, selectedStatus, selectedArea]);

  const loadData = async () => {
    try {
      setError(null);

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
      setTimeout(() => setLoading(false), 300);
    }
  };

  const loadTurns = async () => {
    try {
      let turnsData;
      const filters = {};

      if (selectedArea !== 'todas') {
        filters.uk_consultorio = selectedArea;
      }

      if (selectedStatus !== 'todos') {
        filters.estado = selectedStatus;
      }

      turnsData = await turnService.getTurnsByDateRange(selectedStartDate, selectedEndDate, filters);
      
      // Ordenar por fecha de creación descendente (más recientes primero)
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

  const getCombinedAreaConsultorioList = () => {
    const combined = [];
    consultorios.forEach(consultorio => {
      const area = areas.find(a => a.uk_area === consultorio.uk_area);
      if (area) {
        combined.push({
          type: 'consultorio',
          id: consultorio.uk_consultorio,
          name: `Consultorio ${consultorio.i_numero_consultorio}`,
          displayName: `Consultorio ${consultorio.i_numero_consultorio} - ${area.s_nombre_area}`,
          areaName: area.s_nombre_area,
          icon: getAreaIcon(area.s_nombre_area)
        });
      }
    });
    return combined;
  };

  const getSelectedItemInfo = () => {
    if (selectedArea === 'todas') {
      return {
        icon: FaHospital,
        displayName: 'Todos los consultorios'
      };
    }
    
    const combined = getCombinedAreaConsultorioList();
    const selected = combined.find(item => item.id === selectedArea);
    
    if (selected) {
      return {
        icon: selected.icon,
        displayName: selected.displayName
      };
    }
    
    return {
      icon: FaHospital,
      displayName: 'Todos los consultorios'
    };
  };

  const handleViewDetails = (turn) => {
    setSelectedTurn(turn);
    setShowDetailModal(true);
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
              Registro completo de todos los turnos del sistema - {turns.length} registros encontrados
            </p>
          </div>
          <div className="page-actions">
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
              <label style={{ margin: 0 }}>Rango de Fechas</label>
              <button
                type="button"
                onClick={() => {
                  setSelectedStartDate(getLastMonthDate());
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
                title="Último mes"
              >
                <FaSync style={{ fontSize: '10px' }} />
              </button>
            </div>
            <div className="date-range-container" style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'nowrap',
              width: '100%'
            }}>
              <div className="date-input-wrapper" style={{ flex: '1', minWidth: '0' }}>
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setSelectedStartDate(newStartDate);
                    if (newStartDate > selectedEndDate) {
                      setSelectedEndDate(newStartDate);
                    }
                  }}
                  className="form-control"
                  style={{ width: '100%' }}
                />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500' }}>a</span>
              <div className="date-input-wrapper" style={{ flex: '1', minWidth: '0' }}>
                <input
                  type="date"
                  value={selectedEndDate}
                  onChange={(e) => {
                    const newEndDate = e.target.value;
                    setSelectedEndDate(newEndDate);
                    if (newEndDate < selectedStartDate) {
                      setSelectedStartDate(newEndDate);
                    }
                  }}
                  min={selectedStartDate}
                  className="form-control"
                  style={{ width: '100%' }}
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
                  <FaChevronDown />
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
            <label>Área/Consultorio</label>
            <div className="custom-area-select">
              <div 
                ref={areaButtonRef}
                className="area-select-trigger"
                onClick={() => {
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
                  <div className="area-icon" style={{ background: 'none', border: 'none', padding: 0 }}>
                    {React.createElement(getSelectedItemInfo().icon)}
                  </div>
                  <span>{getSelectedItemInfo().displayName}</span>
                </div>
                <div className="dropdown-arrow">
                  <FaChevronDown />
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
                      <div className="area-icon" style={{ background: 'none', border: 'none', padding: 0 }}>
                        <FaHospital />
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
                        <div className="area-icon" style={{ background: 'none', border: 'none', padding: 0 }}>
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
        </div>

        {/* History List */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaClipboardList />
              Registros de Turnos
            </h3>
          </div>

          <div className="card-content" style={{ padding: 0 }}>
            {turns.length === 0 ? (
              <div className="empty-state">
                <FaHistory />
                <h3>No hay registros</h3>
                <p>No se encontraron turnos para los filtros seleccionados</p>
              </div>
            ) : (
              <>
                <div className="history-list">
                  {currentTurns.map(turn => {
                    const patientInfo = getPatientInfo(turn.uk_paciente);
                    const areaName = getAreaInfo(turn.uk_consultorio);
                    const AreaIcon = getAreaIcon(areaName);

                    return (
                      <div key={turn.uk_turno} className="history-item">
                        <div className="history-item-header">
                          <div className="history-item-title">
                            <div className="turn-number-badge">
                              #{turn.i_numero_turno}
                            </div>
                            <div className="history-patient-info">
                              <div className="patient-name">
                                <FaUser style={{ fontSize: '14px', color: 'var(--text-muted)' }} />
                                <strong>{getPatientName(turn.uk_paciente)}</strong>
                              </div>
                              {patientInfo && (
                                <div className="patient-details">
                                  {patientInfo.c_telefono && (
                                    <span className="detail-chip">📞 {patientInfo.c_telefono}</span>
                                  )}
                                  {patientInfo.c_dni && (
                                    <span className="detail-chip">🆔 {patientInfo.c_dni}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="history-item-actions">
                            <span className={`status-badge ${getStatusColor(turn.s_estado)}`}>
                              {React.createElement(getStatusIcon(turn.s_estado), { 
                                className: 'status-icon-inline',
                                size: 12 
                              })}
                              {turnStatuses.find(s => s.value === turn.s_estado)?.label || turn.s_estado}
                            </span>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleViewDetails(turn)}
                              title="Ver detalles"
                            >
                              <FaInfoCircle />
                            </button>
                          </div>
                        </div>

                        <div className="history-item-body">
                          <div className="history-info-grid">
                            <div className="info-item">
                              <FaCalendarAlt className="info-icon" />
                              <div className="info-content">
                                <span className="info-label">Fecha del turno</span>
                                <span className="info-value">
                                  {new Date(turn.d_fecha).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="info-item">
                              <FaClock className="info-icon" />
                              <div className="info-content">
                                <span className="info-label">Hora</span>
                                <span className="info-value">{turn.t_hora}</span>
                              </div>
                            </div>

                            <div className="info-item">
                              <AreaIcon className="info-icon" />
                              <div className="info-content">
                                <span className="info-label">Área</span>
                                <span className="info-value">{areaName}</span>
                              </div>
                            </div>

                            <div className="info-item">
                              <FaHospital className="info-icon" />
                              <div className="info-content">
                                <span className="info-label">Consultorio</span>
                                <span className="info-value">{getConsultorioInfo(turn.uk_consultorio)}</span>
                              </div>
                            </div>

                            {turn.uk_usuario_registro && (
                              <div className="info-item">
                                <FaUserMd className="info-icon" />
                                <div className="info-content">
                                  <span className="info-label">Registrado por</span>
                                  <span className="info-value">Admin (ID: {turn.uk_usuario_registro})</span>
                                </div>
                              </div>
                            )}

                            {turn.d_fecha_creacion && (
                              <div className="info-item">
                                <FaClock className="info-icon" />
                                <div className="info-content">
                                  <span className="info-label">Fecha de registro</span>
                                  <span className="info-value">
                                    {new Date(turn.d_fecha_creacion).toLocaleString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {turn.s_observaciones && (
                            <div className="history-observations">
                              <strong>Observaciones:</strong>
                              <p>{turn.s_observaciones}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Paginación */}
                {turns.length > turnsPerPage && (
                  <div className="pagination-bar">
                    <div className="pagination-info">
                      <span>Mostrando {startIndex + 1} - {Math.min(endIndex, turns.length)} de {turns.length} registros</span>
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
                <h4>Información de Registro</h4>
                <div className="detail-grid">
                  {selectedTurn.uk_usuario_registro && (
                    <div className="detail-row">
                      <span className="detail-label">Registrado por:</span>
                      <span className="detail-value">Admin (ID: {selectedTurn.uk_usuario_registro})</span>
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
                      <span className="detail-value">Admin (ID: {selectedTurn.uk_usuario_modificacion})</span>
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
