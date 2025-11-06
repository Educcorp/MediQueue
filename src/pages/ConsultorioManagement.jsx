import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import AdminFooter from '../components/Common/AdminFooter';
import Chatbot from '../components/Common/Chatbot';
import TestSpinner from '../components/Common/TestSpinner';
import ColorSelector from '../components/Common/ColorSelector';
import IconSelector from '../components/Common/IconSelectorPopup';
import Tutorial from '../components/Common/Tutorial';
import areaService from '../services/areaService';
import consultorioService from '../services/consultorioService';
import useTutorial from '../hooks/useTutorial';
import { getAvailableConsultoriosTutorialSteps } from '../utils/tutorialSteps';
import { RECORD_STATUS_LABELS } from '../utils/constants';
import '../styles/UnifiedAdminPages.css';

// React Icons
import {
  FaHospital,
  FaBuilding,
  FaPlus,
  FaSync,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaEye,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaStethoscope,
  FaBaby,
  FaHeartbeat,
  FaUserMd,
  FaFemale,
  FaBone,
  FaBrain,
  FaMale,
  FaFlask,
  FaProcedures,
  FaDoorOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaAmbulance,
  FaSyringe,
  FaPrescriptionBottle,
  FaXRay,
  FaMicroscope,
  FaLungs,
  FaTooth,
  FaHandHoldingHeart,
  FaWheelchair,
  FaCrutch,
  FaThermometer,
  FaHeadSideCough,
  FaVials,
  FaLock,
  FaUnlock,
  FaQuestionCircle
} from 'react-icons/fa';

const ConsultorioManagement = () => {
  const { t } = useTranslation(['consultorio', 'common']);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Hook del tutorial
  const {
    showTutorial,
    hasCompletedTutorial,
    completeTutorial,
    skipTutorial,
    startTutorial
  } = useTutorial('admin-consultorios');

  const [areas, setAreas] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
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

  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showConsultorioModal, setShowConsultorioModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [editingConsultorio, setEditingConsultorio] = useState(null);
  const [selectedAreaForConsultorio, setSelectedAreaForConsultorio] = useState(null);
  const [formData, setFormData] = useState({
    s_nombre_area: '',
    s_letra: '',
    s_color: '',
    s_icono: '',
    i_numero_consultorio: '',
    uk_area: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [letraError, setLetraError] = useState('');

  // Estados para modales de notificación
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({
    message: '',
    data: null,
    type: '' // 'area', 'consultorio'
  });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({ message: '' });

  // Estados para modales de confirmación
  const [showDeleteAreaModal, setShowDeleteAreaModal] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [showDeleteConsultorioModal, setShowDeleteConsultorioModal] = useState(false);
  const [consultorioToDelete, setConsultorioToDelete] = useState(null);
  const [showToggleAreaModal, setShowToggleAreaModal] = useState(false);
  const [areaToToggle, setAreaToToggle] = useState(null);
  const [showToggleConsultorioModal, setShowToggleConsultorioModal] = useState(false);
  const [consultorioToToggle, setConsultorioToToggle] = useState(null);

  // Mapa de iconos y colores por nombre de área médica
  const getAreaIcon = (areaName) => {
    const iconMap = {
      'Medicina General': { icon: FaStethoscope, color: 'var(--primary-medical)' },
      'Pediatría': { icon: FaBaby, color: 'var(--info-color)' },
      'Cardiología': { icon: FaHeartbeat, color: 'var(--danger-color)' },
      'Dermatología': { icon: FaUserMd, color: 'var(--warning-color)' },
      'Ginecología': { icon: FaFemale, color: '#E91E63' },
      'Oftalmología': { icon: FaEye, color: 'var(--info-color)' },
      'Ortopedia': { icon: FaBone, color: '#795548' },
      'Psiquiatría': { icon: FaBrain, color: '#9C27B0' },
      'Neurología': { icon: FaBrain, color: '#FF5722' },
      'Urología': { icon: FaMale, color: '#3F51B5' },
      'Endocrinología': { icon: FaFlask, color: 'var(--success-color)' },
      'Gastroenterología': { icon: FaProcedures, color: '#FFC107' }
    };

    return iconMap[areaName] || { icon: FaHospital, color: 'var(--primary-medical)' };
  };

  useEffect(() => {
    // Mostrar spinner brevemente para mejor UX
    setLoading(true);
    setTimeout(() => {
      loadData();
    }, 800);
  }, []);

  const loadData = async () => {
    try {
      setError(null);

      const [areasData, consultoriosData] = await Promise.all([
        areaService.getAllWithInactive().catch(err => {
          console.warn('Error cargando áreas:', err);
          return [];
        }),
        consultorioService.getAllWithInactive().catch(err => {
          console.warn('Error cargando consultorios:', err);
          return [];
        })
      ]);

      setAreas(areasData);
      setConsultorios(consultoriosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError(t('consultorio:errors.loadingData'));
    } finally {
      // Delay mínimo para transición suave del spinner
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleAddArea = () => {
    setEditingArea(null);
    setFormData({
      s_nombre_area: '',
      s_letra: '',
      s_color: '',
      s_icono: '',
      i_numero_consultorio: '',
      uk_area: ''
    });
    setShowAreaModal(true);
  };

  const handleEditArea = (area) => {
    setEditingArea(area);
    setFormData({
      s_nombre_area: area.s_nombre_area,
      s_letra: area.s_letra || '',
      s_color: area.s_color || '',
      s_icono: area.s_icono || '',
      i_numero_consultorio: '',
      uk_area: area.uk_area
    });
    setShowAreaModal(true);
  };

  const handleAddConsultorio = (area) => {
    setEditingConsultorio(null);
    setSelectedAreaForConsultorio(area);
    setFormData({
      s_nombre_area: '',
      s_letra: '',
      s_color: '',
      s_icono: '',
      i_numero_consultorio: '',
      uk_area: area.uk_area
    });
    setShowConsultorioModal(true);
  };

  const handleEditConsultorio = (consultorio) => {
    setEditingConsultorio(consultorio);
    const area = areas.find(a => a.uk_area === consultorio.uk_area);
    setSelectedAreaForConsultorio(area);
    setFormData({
      s_nombre_area: '',
      s_letra: '',
      s_color: '',
      s_icono: '',
      i_numero_consultorio: consultorio.i_numero_consultorio,
      uk_area: consultorio.uk_area
    });
    setShowConsultorioModal(true);
  };

  const handleToggleAreaEstado = (area) => {
    setAreaToToggle(area);
    setShowToggleAreaModal(true);
  };

  const confirmToggleArea = async () => {
    if (!areaToToggle) return;

    try {
      await areaService.toggleEstado(areaToToggle.uk_area);
      await loadData();
      setShowToggleAreaModal(false);

      const accion = areaToToggle.ck_estado === 'ACTIVO' ? 'bloqueada' : 'desbloqueada';

      setSuccessModalData({
        message: `Área ${accion} correctamente`,
        data: {
          nombre: areaToToggle.s_nombre_area,
          accion: accion
        },
        type: 'area-toggle'
      });
      setShowSuccessModal(true);
      setAreaToToggle(null);

      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      setShowToggleAreaModal(false);
      setAreaToToggle(null);

      setErrorModalData({
        message: 'No es posible cambiar el estado del área'
      });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);

      console.error('Error cambiando estado del área:', error);
    }
  };

  const cancelToggleArea = () => {
    setShowToggleAreaModal(false);
    setAreaToToggle(null);
  };

  const handleDeleteArea = (area) => {
    setAreaToDelete(area);
    setShowDeleteAreaModal(true);
  };

  const confirmDeleteArea = async () => {
    if (!areaToDelete) return;

    try {
      await areaService.remove(areaToDelete.uk_area);
      await loadData();
      setShowDeleteAreaModal(false);

      setSuccessModalData({
        message: 'Área eliminada correctamente',
        data: {
          nombre: areaToDelete.s_nombre_area
        },
        type: 'area-delete'
      });
      setShowSuccessModal(true);
      setAreaToDelete(null);

      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      setShowDeleteAreaModal(false);
      setAreaToDelete(null);

      // Manejar diferentes tipos de errores
      let mensaje = 'No es posible eliminar el área';
      if (error.response?.status === 404) {
        mensaje = 'El área no fue encontrada';
      } else if (error.response?.status === 403) {
        mensaje = 'No tienes permisos para eliminar esta área';
      }

      setErrorModalData({ message: mensaje });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);

      console.error('Error eliminando área:', error);
    }
  };

  const cancelDeleteArea = () => {
    setShowDeleteAreaModal(false);
    setAreaToDelete(null);
  };

  const handleToggleConsultorioEstado = (consultorio) => {
    setConsultorioToToggle(consultorio);
    setShowToggleConsultorioModal(true);
  };

  const confirmToggleConsultorio = async () => {
    if (!consultorioToToggle) return;

    try {
      await consultorioService.toggleEstado(consultorioToToggle.uk_consultorio);
      await loadData();
      setShowToggleConsultorioModal(false);

      const accion = consultorioToToggle.ck_estado === 'ACTIVO' ? 'bloqueado' : 'desbloqueado';

      setSuccessModalData({
        message: `Consultorio ${accion} correctamente`,
        data: {
          numero: consultorioToToggle.i_numero_consultorio,
          accion: accion
        },
        type: 'consultorio-toggle'
      });
      setShowSuccessModal(true);
      setConsultorioToToggle(null);

      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      setShowToggleConsultorioModal(false);
      setConsultorioToToggle(null);

      setErrorModalData({
        message: 'No es posible cambiar el estado del consultorio'
      });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);

      console.error('Error cambiando estado del consultorio:', error);
    }
  };

  const cancelToggleConsultorio = () => {
    setShowToggleConsultorioModal(false);
    setConsultorioToToggle(null);
  };

  const handleDeleteConsultorio = (consultorio) => {
    setConsultorioToDelete(consultorio);
    setShowDeleteConsultorioModal(true);
  };

  const confirmDeleteConsultorio = async () => {
    if (!consultorioToDelete) return;

    try {
      await consultorioService.remove(consultorioToDelete.uk_consultorio);
      await loadData();
      setShowDeleteConsultorioModal(false);

      setSuccessModalData({
        message: 'Consultorio eliminado correctamente',
        data: {
          numero: consultorioToDelete.i_numero_consultorio
        },
        type: 'consultorio-delete'
      });
      setShowSuccessModal(true);
      setConsultorioToDelete(null);

      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      setShowDeleteConsultorioModal(false);
      setConsultorioToDelete(null);

      // Manejar diferentes tipos de errores
      let mensaje = 'No es posible eliminar el consultorio';
      if (error.response?.status === 404) {
        mensaje = 'El consultorio no fue encontrado';
      } else if (error.response?.status === 403) {
        mensaje = 'No tienes permisos para eliminar este consultorio';
      }

      setErrorModalData({ message: mensaje });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);

      console.error('Error eliminando consultorio:', error);
    }
  };

  const cancelDeleteConsultorio = () => {
    setShowDeleteConsultorioModal(false);
    setConsultorioToDelete(null);
  };

  const handleSubmitArea = async (e) => {
    e.preventDefault();

    if (!formData.s_nombre_area.trim()) {
      setErrorModalData({ message: 'Por favor complete todos los campos requeridos' });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);
      return;
    }

    if (formData.s_nombre_area.trim().length > 50) {
      setErrorModalData({ message: 'El nombre del área no puede exceder los 50 caracteres' });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);
      return;
    }

    if (letraError) {
      setErrorModalData({ message: 'Por favor corrige el error en la letra identificadora' });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);
      return;
    }

    if (formData.s_color && !/^#[0-9A-Fa-f]{6}$/.test(formData.s_color)) {
      setErrorModalData({ message: 'El formato del color no es válido' });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);
      return;
    }

    try {
      const isUpdate = !!editingArea;
      const areaData = {
        s_nombre_area: formData.s_nombre_area.trim(),
        s_letra: formData.s_letra || null,
        s_color: formData.s_color || null,
        s_icono: formData.s_icono || null
      };

      if (isUpdate) {
        await areaService.update(editingArea.uk_area, areaData);
      } else {
        await areaService.create(areaData);
      }

      await loadData();
      setShowAreaModal(false);

      setSuccessModalData({
        message: isUpdate ? 'Área actualizada correctamente' : 'Área creada correctamente',
        data: {
          nombre: formData.s_nombre_area.trim(),
          letra: formData.s_letra || null,
          color: formData.s_color || null,
          icono: formData.s_icono || null
        },
        type: 'area'
      });
      setShowSuccessModal(true);

      setFormData({
        s_nombre_area: '',
        s_letra: '',
        s_color: '',
        s_icono: '',
        i_numero_consultorio: '',
        uk_area: ''
      });
      setLetraError('');

      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      const errorMessage = editingArea
        ? 'No es posible actualizar el área'
        : 'No es posible crear el área';

      setErrorModalData({ message: errorMessage });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);

      console.error('Error guardando área:', error);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessModalData({ message: '', data: null, type: '' });
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorModalData({ message: '' });
  };

  const handleSubmitConsultorio = async (e) => {
    e.preventDefault();

    if (!formData.i_numero_consultorio) {
      setErrorModalData({ message: 'El número del consultorio es requerido' });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);
      return;
    }

    const numeroConsultorio = parseInt(formData.i_numero_consultorio);
    if (numeroConsultorio < 1 || numeroConsultorio > 999) {
      setErrorModalData({ message: 'El número del consultorio debe estar entre 1 y 999' });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);
      return;
    }

    try {
      const isUpdate = !!editingConsultorio;

      if (isUpdate) {
        await consultorioService.update(editingConsultorio.uk_consultorio, {
          i_numero_consultorio: parseInt(formData.i_numero_consultorio),
          uk_area: formData.uk_area
        });
      } else {
        await consultorioService.create({
          uk_area: formData.uk_area,
          i_numero_consultorio: parseInt(formData.i_numero_consultorio)
        });
      }

      await loadData();
      setShowConsultorioModal(false);

      setSuccessModalData({
        message: isUpdate ? 'Consultorio actualizado correctamente' : 'Consultorio creado correctamente',
        data: {
          numero: parseInt(formData.i_numero_consultorio),
          areaName: selectedAreaForConsultorio?.s_nombre_area || ''
        },
        type: 'consultorio'
      });
      setShowSuccessModal(true);

      setFormData({
        s_nombre_area: '',
        s_letra: '',
        s_color: '',
        s_icono: '',
        i_numero_consultorio: '',
        uk_area: ''
      });

      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      const errorMessage = editingConsultorio
        ? 'No es posible actualizar el consultorio'
        : 'No es posible crear el consultorio';

      setErrorModalData({ message: errorMessage });
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 4000);

      console.error('Error guardando consultorio:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validación específica para número de consultorio
    if (name === 'i_numero_consultorio') {
      // Solo permitir números y limitar a 3 dígitos
      const numericValue = value.replace(/\D/g, '').slice(0, 3);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    // Validación específica para nombre de área
    if (name === 's_nombre_area') {
      // Limitar a 50 caracteres
      const trimmedValue = value.slice(0, 50);
      setFormData(prev => ({
        ...prev,
        [name]: trimmedValue
      }));
      return;
    }

    // Validación específica para letra (máximo 2 letras)
    if (name === 's_letra') {
      // Solo permitir letras y limitar a 2 caracteres, convertir a mayúsculas
      const letterValue = value.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();

      // Verificar unicidad si hay valor
      if (letterValue) {
        // Verificar si la letra ya está en uso por otra área
        const letraEnUso = areas.some(area =>
          area.s_letra === letterValue &&
          area.uk_area !== editingArea?.uk_area
        );

        if (letraEnUso) {
          setLetraError(`La letra "${letterValue}" ya está en uso por otra área`);
        } else {
          setLetraError('');
        }
      } else {
        setLetraError('');
      }

      setFormData(prev => ({
        ...prev,
        [name]: letterValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Nuevas funciones para manejar selección de color e icono
  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      s_color: color
    }));
  };

  const handleIconChange = (icon) => {
    setFormData(prev => ({
      ...prev,
      s_icono: icon
    }));
  };

  // Filtrar áreas por búsqueda
  const filteredAreas = areas.filter(area =>
    area.s_nombre_area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener consultorios por área
  const getConsultoriosByArea = (areaId) => {
    return consultorios.filter(c => c.uk_area === areaId);
  };

  // Calcular estadísticas
  const totalConsultorios = consultorios.length;
  const activeConsultorios = consultorios.filter(c => c.ck_estado === 'ACTIVO').length;
  const totalAreas = areas.length;

  if (loading) {
    return <TestSpinner message="Cargando consultorios..." />;
  }

  return (
    <div className="admin-page-unified">
      <AdminHeader />

      <div className="admin-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-icon">
            <FaHospital />
          </div>
          <div className="page-header-content">
            <h1 className="page-title">{t('consultorio:title')}</h1>
            <p className="page-subtitle">
              {t('consultorio:subtitle', { areas: totalAreas, consultorios: totalConsultorios })}
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={loadData}>
              <FaSync /> Actualizar
            </button>
            <button
              className="btn btn-secondary"
              onClick={startTutorial}
              title="Ver tutorial"
              style={{ padding: '8px 12px' }}
            >
              <FaQuestionCircle />
            </button>
            <button className="btn btn-primary" onClick={handleAddArea}>
              <FaPlus /> Nueva Área
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

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div className="content-card">
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'linear-gradient(135deg, var(--primary-medical), var(--accent-medical))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <FaBuilding />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {totalAreas}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {t('consultorio:stats.areas')}
                </p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'linear-gradient(135deg, var(--success-color), #20c997)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <FaHospital />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {totalConsultorios}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {t('consultorio:stats.totalOffices')}
                </p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'linear-gradient(135deg, var(--info-color), var(--primary-medical))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                <FaCheckCircle />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {activeConsultorios}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {t('consultorio:stats.activeOffices')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="filters-section search-filter-section">
          <div className="filter-group" style={{ flex: '1', maxWidth: '400px' }}>
            <label>{t('consultorio:search.label')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar áreas médicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
              <FaSearch style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </div>
        </div>

        {/* Areas Grid */}
        {filteredAreas.length === 0 ? (
          <div className="content-card">
            <div className="empty-state">
              <FaBuilding />
              <h3>No hay áreas médicas registradas</h3>
              <p>Crea la primera área médica para comenzar a organizar los consultorios</p>
              <button className="btn btn-primary" onClick={handleAddArea}>
                <FaPlus /> Crear Primera Área
              </button>
            </div>
          </div>
        ) : (
          <div className="areas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
            {filteredAreas.map(area => {
              const areaConsultorios = getConsultoriosByArea(area.uk_area);

              // Usar los nuevos campos personalizados si están disponibles
              const areaColor = area.s_color || getAreaIcon(area.s_nombre_area).color;
              const areaIconName = area.s_icono;

              // Función para obtener el componente de icono basado en el nombre
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
                  'FaVials': FaVials
                };
                return iconMap[iconName] || getAreaIcon(area.s_nombre_area).icon;
              };

              const IconComponent = areaIconName ? getIconComponent(areaIconName) : getAreaIcon(area.s_nombre_area).icon;

              // Estilos para áreas inactivas
              const isInactive = area.ck_estado !== 'ACTIVO';

              return (
                <div key={area.uk_area} className="content-card area-card" style={{
                  opacity: isInactive ? 0.7 : 1,
                  position: 'relative',
                  filter: isInactive ? 'grayscale(30%)' : 'none'
                }}>
                  <div className="card-header area-header" style={{
                    background: `linear-gradient(135deg, ${areaColor}20, ${areaColor}10)`,
                    borderBottom: `1px solid ${areaColor}30`,
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--border-radius-sm)',
                        background: `linear-gradient(135deg, ${areaColor}, ${areaColor}dd)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        opacity: isInactive ? 0.6 : 1
                      }}>
                        <IconComponent />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 className="card-title" style={{ margin: 0, fontSize: '18px', color: areaColor }}>
                            {area.s_nombre_area}
                          </h3>
                          {/* Mostrar letra identificadora si existe */}
                          {area.s_letra && (
                            <span style={{
                              background: areaColor,
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase'
                            }}>
                              {area.s_letra}
                            </span>
                          )}
                          {/* Mostrar estado del área */}
                          {area.ck_estado !== 'ACTIVO' && (
                            <span style={{
                              background: 'var(--danger-color)',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FaLock style={{ fontSize: '9px' }} />
                              BLOQUEADA
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                          {areaConsultorios.length} consultorio{areaConsultorios.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="card-actions area-actions">
                      <button
                        className="card-action"
                        onClick={() => handleToggleAreaEstado(area)}
                        title={area.ck_estado === 'ACTIVO' ? 'Bloquear área' : 'Desbloquear área'}
                        style={{ color: area.ck_estado === 'ACTIVO' ? 'var(--warning-color)' : 'var(--success-color)' }}
                      >
                        {area.ck_estado === 'ACTIVO' ? <FaLock /> : <FaUnlock />}
                      </button>
                      <button
                        className="card-action"
                        onClick={() => handleEditArea(area)}
                        title={t('common:buttons.edit')}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="card-action"
                        onClick={() => handleDeleteArea(area)}
                        title={t('common:buttons.delete')}
                        style={{ color: 'var(--danger-color)' }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="card-content">
                    {/* Consultorios List */}
                    {areaConsultorios.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        <FaDoorOpen style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }} />
                        <p>No hay consultorios en esta área</p>
                      </div>
                    ) : (
                      <div className="consultorios-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {areaConsultorios.map(consultorio => {
                          const consultorioInactivo = consultorio.ck_estado !== 'ACTIVO';

                          return (
                            <div key={consultorio.uk_consultorio} className="consultorio-item" style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px',
                              background: consultorioInactivo ? 'var(--bg-secondary)' : 'var(--bg-glass)',
                              borderRadius: 'var(--border-radius-sm)',
                              border: consultorioInactivo ? '1px solid var(--danger-color-light)' : '1px solid var(--border-color)',
                              opacity: consultorioInactivo ? 0.7 : 1
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaDoorOpen style={{
                                  color: consultorioInactivo ? 'var(--text-muted)' : areaColor
                                }} />
                                <span style={{
                                  fontWeight: '600',
                                  textDecoration: consultorioInactivo ? 'line-through' : 'none'
                                }}>
                                  Consultorio #{consultorio.i_numero_consultorio}
                                </span>
                                <span className={`status-badge ${consultorio.ck_estado === 'ACTIVO' ? 'success' : 'danger'}`}>
                                  {RECORD_STATUS_LABELS[consultorio.ck_estado] || consultorio.ck_estado}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => handleToggleConsultorioEstado(consultorio)}
                                  className={consultorio.ck_estado === 'ACTIVO' ? 'btn btn-warning' : 'btn btn-success'}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    color: consultorio.ck_estado === 'ACTIVO' ? '#FFA000' : undefined
                                  }}
                                  title={consultorio.ck_estado === 'ACTIVO' ? 'Bloquear consultorio' : 'Desbloquear consultorio'}
                                >
                                  {consultorio.ck_estado === 'ACTIVO' ? <FaLock /> : <FaUnlock />}
                                </button>
                                <button
                                  onClick={() => handleEditConsultorio(consultorio)}
                                  className="btn"
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    background: '#4299e1',
                                    color: 'white',
                                    border: '1px solid #4299e1'
                                  }}
                                  title="Editar consultorio"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteConsultorio(consultorio)}
                                  className="btn btn-danger"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                  title="Eliminar consultorio"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Consultorio Button */}
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary btn-add-consultorio"
                        onClick={() => handleAddConsultorio(area)}
                        style={{ width: '100%' }}
                      >
                        <FaPlus /> {t('consultorio:buttons.addOffice')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para Área */}
      {showAreaModal && (
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
            maxHeight: '90vh',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                {editingArea ? t('consultorio:modal.editArea') : t('consultorio:modal.newArea')}
              </h3>
              <button
                onClick={() => {
                  setShowAreaModal(false);
                  setLetraError('');
                }}
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

            <div style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 120px)'
            }}>
              <form onSubmit={handleSubmitArea} style={{ padding: '24px' }}>
                <div className="form-group">
                  <label>{t('consultorio:form.areaName')} *</label>
                  <input
                    type="text"
                    name="s_nombre_area"
                    value={formData.s_nombre_area}
                    onChange={handleInputChange}
                    placeholder="Ej: Medicina General, Pediatría..."
                    className="form-control"
                    required
                    maxLength={50}
                  />
                  <small style={{
                    color: formData.s_nombre_area.length > 40 ? 'var(--warning)' : 'var(--text-muted)',
                    fontSize: '12px',
                    marginTop: '4px',
                    display: 'block'
                  }}>
                    {formData.s_nombre_area.length}/50 caracteres
                  </small>
                </div>

                {/* Campos de personalización */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginTop: '20px'
                }}>
                  {/* Letra identificadora */}
                  <div className="form-group">
                    <label>Letra Identificadora</label>
                    <input
                      type="text"
                      name="s_letra"
                      value={formData.s_letra}
                      onChange={handleInputChange}
                      placeholder="Ej: MG, PD..."
                      className={`form-control ${letraError ? 'error' : ''}`}
                      maxLength={2}
                      style={{ textTransform: 'uppercase' }}
                    />
                    {letraError ? (
                      <small style={{
                        color: 'var(--danger-color)',
                        fontSize: '12px',
                        marginTop: '4px',
                        display: 'block'
                      }}>
                        {letraError}
                      </small>
                    ) : (
                      <small style={{
                        color: 'var(--text-muted)',
                        fontSize: '12px',
                        marginTop: '4px',
                        display: 'block'
                      }}>
                        Máximo 2 letras para identificar el área
                      </small>
                    )}
                  </div>

                  {/* Selector de color */}
                  <div className="form-group">
                    <ColorSelector
                      label="Color del Área"
                      value={formData.s_color}
                      onChange={handleColorChange}
                      disabled={false}
                    />
                  </div>
                </div>

                {/* Selector de icono */}
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <IconSelector
                    label="Icono del Área"
                    value={formData.s_icono}
                    onChange={handleIconChange}
                    disabled={false}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAreaModal(false);
                      setLetraError('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!!letraError}
                  >
                    <FaCheck />
                    {editingArea ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Consultorio */}
      {showConsultorioModal && (
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
            maxHeight: '90vh',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                {editingConsultorio ? t('consultorio:modal.editOffice') : `${t('consultorio:modal.newOffice')} - ${selectedAreaForConsultorio?.s_nombre_area}`}
              </h3>
              <button
                onClick={() => setShowConsultorioModal(false)}
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

            <div style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 120px)'
            }}>
              <form onSubmit={handleSubmitConsultorio} style={{ padding: '24px' }}>
                <div className="form-group">
                  <label>{t('consultorio:form.officeNumber')} *</label>
                  <input
                    type="text"
                    name="i_numero_consultorio"
                    value={formData.i_numero_consultorio}
                    onChange={handleInputChange}
                    placeholder="Ej: 101, 102, 103... (máx. 3 dígitos)"
                    className="form-control"
                    required
                    maxLength="3"
                    pattern="[0-9]{1,3}"
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                  <button type="button" onClick={() => setShowConsultorioModal(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FaCheck />
                    {editingConsultorio ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para bloquear/desbloquear área */}
      {showToggleAreaModal && areaToToggle && (
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
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isDarkMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 193, 7, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffc107',
                fontSize: '20px'
              }}>
                {areaToToggle.ck_estado === 'ACTIVO' ? <FaLock /> : <FaUnlock />}
              </div>
              <h3 style={{
                margin: 0,
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {areaToToggle.ck_estado === 'ACTIVO' ? 'Bloquear Área' : 'Desbloquear Área'}
              </h3>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{
                margin: '0 0 16px 0',
                color: 'var(--text-primary)',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                ¿Estás seguro de {areaToToggle.ck_estado === 'ACTIVO' ? 'bloquear' : 'desbloquear'} el área <strong>{areaToToggle.s_nombre_area}</strong>?
              </p>

              <div style={{
                background: isDarkMode ? 'rgba(119, 184, 206, 0.1)' : 'rgba(216, 240, 244, 0.5)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: `1px solid ${isDarkMode ? 'rgba(119, 184, 206, 0.2)' : 'rgba(119, 184, 206, 0.3)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaBuilding style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Área:</strong> {areaToToggle.s_nombre_area}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={cancelToggleArea}
                className="btn btn-secondary"
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmToggleArea}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: areaToToggle.ck_estado === 'ACTIVO' ? '#ffc107' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: areaToToggle.ck_estado === 'ACTIVO' ? '0 2px 8px rgba(255, 193, 7, 0.3)' : '0 2px 8px rgba(40, 167, 69, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = areaToToggle.ck_estado === 'ACTIVO' ? '0 4px 12px rgba(255, 193, 7, 0.4)' : '0 4px 12px rgba(40, 167, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = areaToToggle.ck_estado === 'ACTIVO' ? '0 2px 8px rgba(255, 193, 7, 0.3)' : '0 2px 8px rgba(40, 167, 69, 0.3)';
                }}
              >
                Sí, {areaToToggle.ck_estado === 'ACTIVO' ? 'bloquear' : 'desbloquear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar área */}
      {showDeleteAreaModal && areaToDelete && (
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
                Confirmar Eliminación
              </h3>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{
                margin: '0 0 16px 0',
                color: 'var(--text-primary)',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                ¿Estás seguro de eliminar el área <strong>{areaToDelete.s_nombre_area}</strong>?
              </p>

              <div style={{
                background: isDarkMode ? 'rgba(119, 184, 206, 0.1)' : 'rgba(216, 240, 244, 0.5)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: `1px solid ${isDarkMode ? 'rgba(119, 184, 206, 0.2)' : 'rgba(119, 184, 206, 0.3)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaBuilding style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Área:</strong> {areaToDelete.s_nombre_area}
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

            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={cancelDeleteArea}
                className="btn btn-secondary"
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteArea}
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
                Sí, eliminar área
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para bloquear/desbloquear consultorio */}
      {showToggleConsultorioModal && consultorioToToggle && (
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
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isDarkMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 193, 7, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffc107',
                fontSize: '20px'
              }}>
                {consultorioToToggle.ck_estado === 'ACTIVO' ? <FaLock /> : <FaUnlock />}
              </div>
              <h3 style={{
                margin: 0,
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {consultorioToToggle.ck_estado === 'ACTIVO' ? 'Bloquear Consultorio' : 'Desbloquear Consultorio'}
              </h3>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{
                margin: '0 0 16px 0',
                color: 'var(--text-primary)',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                ¿Estás seguro de {consultorioToToggle.ck_estado === 'ACTIVO' ? 'bloquear' : 'desbloquear'} el consultorio <strong>#{consultorioToToggle.i_numero_consultorio}</strong>?
              </p>

              <div style={{
                background: isDarkMode ? 'rgba(119, 184, 206, 0.1)' : 'rgba(216, 240, 244, 0.5)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: `1px solid ${isDarkMode ? 'rgba(119, 184, 206, 0.2)' : 'rgba(119, 184, 206, 0.3)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaDoorOpen style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Consultorio:</strong> #{consultorioToToggle.i_numero_consultorio}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={cancelToggleConsultorio}
                className="btn btn-secondary"
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmToggleConsultorio}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: consultorioToToggle.ck_estado === 'ACTIVO' ? '#ffc107' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: consultorioToToggle.ck_estado === 'ACTIVO' ? '0 2px 8px rgba(255, 193, 7, 0.3)' : '0 2px 8px rgba(40, 167, 69, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = consultorioToToggle.ck_estado === 'ACTIVO' ? '0 4px 12px rgba(255, 193, 7, 0.4)' : '0 4px 12px rgba(40, 167, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = consultorioToToggle.ck_estado === 'ACTIVO' ? '0 2px 8px rgba(255, 193, 7, 0.3)' : '0 2px 8px rgba(40, 167, 69, 0.3)';
                }}
              >
                Sí, {consultorioToToggle.ck_estado === 'ACTIVO' ? 'bloquear' : 'desbloquear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar consultorio */}
      {showDeleteConsultorioModal && consultorioToDelete && (
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
                Confirmar Eliminación
              </h3>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{
                margin: '0 0 16px 0',
                color: 'var(--text-primary)',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                ¿Estás seguro de eliminar el consultorio <strong>#{consultorioToDelete.i_numero_consultorio}</strong>?
              </p>

              <div style={{
                background: isDarkMode ? 'rgba(119, 184, 206, 0.1)' : 'rgba(216, 240, 244, 0.5)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: `1px solid ${isDarkMode ? 'rgba(119, 184, 206, 0.2)' : 'rgba(119, 184, 206, 0.3)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaDoorOpen style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    <strong>Consultorio:</strong> #{consultorioToDelete.i_numero_consultorio}
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

            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={cancelDeleteConsultorio}
                className="btn btn-secondary"
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteConsultorio}
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
                Sí, eliminar consultorio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notificación de éxito */}
      {showSuccessModal && successModalData.data && (
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
            <div style={{ padding: '32px 24px' }}>
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

              <h3 style={{
                margin: '0 0 12px 0',
                color: 'var(--text-primary)',
                fontSize: '22px',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                ¡Éxito!
              </h3>

              <p style={{
                margin: '0 0 20px 0',
                color: 'var(--text-secondary)',
                fontSize: '15px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {successModalData.message}
              </p>

              <div style={{
                background: isDarkMode ? 'rgba(119, 184, 206, 0.08)' : 'rgba(216, 240, 244, 0.4)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: `1px solid ${isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.25)'}`
              }}>
                {successModalData.type === 'area' && (
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
                      <FaBuilding style={{ color: '#77b8ce', fontSize: '14px' }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                      {successModalData.data.nombre}
                    </span>
                  </div>
                )}
                {successModalData.type === 'consultorio' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isDarkMode ? 'rgba(119, 184, 206, 0.15)' : 'rgba(119, 184, 206, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FaDoorOpen style={{ color: '#77b8ce', fontSize: '14px' }} />
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                        Consultorio #{successModalData.data.numero}
                      </span>
                    </div>
                    {successModalData.data.areaName && (
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
                          <FaBuilding style={{ color: '#77b8ce', fontSize: '14px' }} />
                        </div>
                        <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                          {successModalData.data.areaName}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {successModalData.type === 'area-toggle' && (
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
                      <FaBuilding style={{ color: '#77b8ce', fontSize: '14px' }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                      {successModalData.data.nombre}
                    </span>
                  </div>
                )}
                {(successModalData.type === 'area-delete' || successModalData.type === 'consultorio-delete' || successModalData.type === 'consultorio-toggle') && (
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
                      {successModalData.type.includes('area') ? <FaBuilding style={{ color: '#77b8ce', fontSize: '14px' }} /> : <FaDoorOpen style={{ color: '#77b8ce', fontSize: '14px' }} />}
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                      {successModalData.data.nombre || `Consultorio #${successModalData.data.numero}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

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

      {/* Modal de notificación de error */}
      {showErrorModal && (
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
            <div style={{ padding: '32px 24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(220, 53, 69, 0.3)',
                  animation: 'successPulse 0.6s ease-out'
                }}>
                  <FaExclamationTriangle style={{ color: 'white', fontSize: '32px' }} />
                </div>
              </div>

              <h3 style={{
                margin: '0 0 12px 0',
                color: 'var(--text-primary)',
                fontSize: '22px',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                Error
              </h3>

              <p style={{
                margin: '0 0 24px 0',
                color: 'var(--text-secondary)',
                fontSize: '16px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {errorModalData.message}
              </p>
            </div>

            <div style={{
              height: '4px',
              background: isDarkMode ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.15)',
              borderRadius: '0 0 var(--border-radius) var(--border-radius)',
              overflow: 'hidden',
              marginTop: '8px'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                animation: 'autoCloseProgress 4s linear forwards'
              }} />
            </div>

            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                type="button"
                onClick={closeErrorModal}
                style={{
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                  width: '100%',
                  maxWidth: '200px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminFooter isDarkMode={isDarkMode} />
      <Chatbot />

      {/* Tutorial Component */}
      <Tutorial
        steps={getAvailableConsultoriosTutorialSteps()}
        show={showTutorial}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />
    </div>
  );
};

export default ConsultorioManagement;