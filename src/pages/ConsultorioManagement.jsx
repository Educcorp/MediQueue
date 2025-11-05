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
import areaService from '../services/areaService';
import consultorioService from '../services/consultorioService';
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
  FaUnlock
} from 'react-icons/fa';

const ConsultorioManagement = () => {
  const { t } = useTranslation(['consultorio', 'common']);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleToggleAreaEstado = async (area) => {
    const nuevoEstado = area.ck_estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const accion = nuevoEstado === 'ACTIVO' ? 'desbloquear' : 'bloquear';

    if (window.confirm(`¿Estás seguro de ${accion} el área "${area.s_nombre_area}"?`)) {
      try {
        await areaService.toggleEstado(area.uk_area);
        await loadData();
        alert(`Área ${accion === 'bloquear' ? 'bloqueada' : 'desbloqueada'} correctamente`);
      } catch (error) {
        console.error('Error cambiando estado del área:', error);
        const mensaje = error.response?.data?.message || error.message || 'Error desconocido al cambiar el estado del área';
        alert('Error cambiando estado del área: ' + mensaje);
      }
    }
  };

  const handleDeleteArea = async (area) => {
    const consultoriosEnArea = consultorios.filter(c => c.uk_area === area.uk_area);
    const mensaje = consultoriosEnArea.length > 0
      ? `¿Estás seguro de eliminar el área "${area.s_nombre_area}"?\n\nEsto eliminará también ${consultoriosEnArea.length} consultorio(s) y todos los turnos asociados.`
      : `¿Estás seguro de eliminar el área "${area.s_nombre_area}"?`;

    if (window.confirm(mensaje)) {
      try {
        // Nota: el servicio expone "remove" para eliminación hard.
        await areaService.remove(area.uk_area);
        await loadData();
        alert('Área eliminada correctamente');
      } catch (error) {
        console.error('Error eliminando área:', error);

        // Manejar diferentes tipos de errores
        if (error.response?.status === 404) {
          alert('El área no fue encontrada');
        } else if (error.response?.status === 403) {
          alert('No tienes permisos para eliminar esta área');
        } else {
          // Error genérico
          const mensaje = error.response?.data?.message || error.message || 'Error desconocido al eliminar el área';
          alert('Error eliminando área: ' + mensaje);
        }
      }
    }
  };

  const handleToggleConsultorioEstado = async (consultorio) => {
    const nuevoEstado = consultorio.ck_estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const accion = nuevoEstado === 'ACTIVO' ? 'desbloquear' : 'bloquear';

    if (window.confirm(`¿Estás seguro de ${accion} el consultorio #${consultorio.i_numero_consultorio}?`)) {
      try {
        await consultorioService.toggleEstado(consultorio.uk_consultorio);
        await loadData();
        alert(`Consultorio ${accion === 'bloquear' ? 'bloqueado' : 'desbloqueado'} correctamente`);
      } catch (error) {
        console.error('Error cambiando estado del consultorio:', error);
        const mensaje = error.response?.data?.message || error.message || 'Error desconocido al cambiar el estado del consultorio';
        alert('Error cambiando estado del consultorio: ' + mensaje);
      }
    }
  };

  const handleDeleteConsultorio = async (consultorio) => {
    if (window.confirm(`¿Estás seguro de eliminar el consultorio #${consultorio.i_numero_consultorio}?\n\nEsto eliminará también todos los turnos asociados a este consultorio.`)) {
      try {
        await consultorioService.remove(consultorio.uk_consultorio);
        await loadData();
        alert('Consultorio eliminado correctamente');
      } catch (error) {
        console.error('Error eliminando consultorio:', error);

        // Manejar diferentes tipos de errores
        if (error.response?.status === 404) {
          alert('El consultorio no fue encontrado');
        } else if (error.response?.status === 403) {
          alert('No tienes permisos para eliminar este consultorio');
        } else {
          // Error genérico
          const mensaje = error.response?.data?.message || error.message || 'Error desconocido al eliminar el consultorio';
          alert('Error eliminando consultorio: ' + mensaje);
        }
      }
    }
  };

  const handleSubmitArea = async (e) => {
    e.preventDefault();

    if (!formData.s_nombre_area.trim()) {
      alert('El nombre del área es requerido');
      return;
    }

    if (formData.s_nombre_area.trim().length > 50) {
      alert('El nombre del área no puede exceder los 50 caracteres');
      return;
    }

    // Validar letra si se proporciona
    if (letraError) {
      alert('Por favor corrige el error en la letra identificadora');
      return;
    }

    // Validación adicional de color
    if (formData.s_color && !/^#[0-9A-Fa-f]{6}$/.test(formData.s_color)) {
      alert('El formato del color no es válido');
      return;
    }

    try {
      const areaData = {
        s_nombre_area: formData.s_nombre_area.trim(),
        s_letra: formData.s_letra || null,
        s_color: formData.s_color || null,
        s_icono: formData.s_icono || null
      };

      if (editingArea) {
        await areaService.update(editingArea.uk_area, areaData);
        alert('Área actualizada correctamente');
      } else {
        await areaService.create(areaData);
        alert('Área creada correctamente');
      }

      await loadData();
      setShowAreaModal(false);
      setFormData({
        s_nombre_area: '',
        s_letra: '',
        s_color: '',
        s_icono: '',
        i_numero_consultorio: '',
        uk_area: ''
      });
      setLetraError('');
    } catch (error) {
      alert('Error guardando área: ' + error.message);
      console.error('Error guardando área:', error);
    }
  };

  const handleSubmitConsultorio = async (e) => {
    e.preventDefault();

    if (!formData.i_numero_consultorio) {
      alert('El número del consultorio es requerido');
      return;
    }

    const numeroConsultorio = parseInt(formData.i_numero_consultorio);
    if (numeroConsultorio < 1 || numeroConsultorio > 999) {
      alert('El número del consultorio debe estar entre 1 y 999 (máximo 3 dígitos)');
      return;
    }

    try {
      if (editingConsultorio) {
        await consultorioService.update(editingConsultorio.uk_consultorio, {
          i_numero_consultorio: parseInt(formData.i_numero_consultorio),
          uk_area: formData.uk_area
        });
        alert('Consultorio actualizado correctamente');
      } else {
        await consultorioService.create({
          uk_area: formData.uk_area,
          i_numero_consultorio: parseInt(formData.i_numero_consultorio)
        });
        alert('Consultorio creado correctamente');
      }

      await loadData();
      setShowConsultorioModal(false);
      setFormData({
        s_nombre_area: '',
        s_letra: '',
        s_color: '',
        s_icono: '',
        i_numero_consultorio: '',
        uk_area: ''
      });
    } catch (error) {
      alert('Error guardando consultorio: ' + error.message);
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
        <div className="filters-section">
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
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
                <div key={area.uk_area} className="content-card" style={{
                  opacity: isInactive ? 0.7 : 1,
                  position: 'relative',
                  filter: isInactive ? 'grayscale(30%)' : 'none'
                }}>
                  <div className="card-header" style={{
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
                    <div className="card-actions">
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {areaConsultorios.map(consultorio => {
                          const consultorioInactivo = consultorio.ck_estado !== 'ACTIVO';

                          return (
                            <div key={consultorio.uk_consultorio} style={{
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
                        className="btn btn-secondary"
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

      <AdminFooter isDarkMode={isDarkMode} />
      <Chatbot />
    </div>
  );
};

export default ConsultorioManagement;