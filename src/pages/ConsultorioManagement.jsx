import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import AdminFooter from '../components/Common/AdminFooter';
import TestSpinner from '../components/Common/TestSpinner';
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
  FaEye as FaEyeMed,
  FaBone,
  FaBrain,
  FaMale,
  FaFlask,
  FaProcedures,
  FaDoorOpen,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const ConsultorioManagement = () => {
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
    i_numero_consultorio: '',
    uk_area: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mapa de iconos y colores por nombre de área médica
  const getAreaIcon = (areaName) => {
    const iconMap = {
      'Medicina General': { icon: FaStethoscope, color: 'var(--primary-medical)' },
      'Pediatría': { icon: FaBaby, color: 'var(--info-color)' },
      'Cardiología': { icon: FaHeartbeat, color: 'var(--danger-color)' },
      'Dermatología': { icon: FaUserMd, color: 'var(--warning-color)' },
      'Ginecología': { icon: FaFemale, color: '#E91E63' },
      'Oftalmología': { icon: FaEyeMed, color: 'var(--info-color)' },
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
        areaService.getAll().catch(err => {
          console.warn('Error cargando áreas:', err);
          return [];
        }),
        consultorioService.getAll().catch(err => {
          console.warn('Error cargando consultorios:', err);
          return [];
        })
      ]);

      setAreas(areasData);
      setConsultorios(consultoriosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error cargando datos del sistema');
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
      i_numero_consultorio: '',
      uk_area: ''
    });
    setShowAreaModal(true);
  };

  const handleEditArea = (area) => {
    setEditingArea(area);
    setFormData({
      s_nombre_area: area.s_nombre_area,
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
      i_numero_consultorio: consultorio.i_numero_consultorio,
      uk_area: consultorio.uk_area
    });
    setShowConsultorioModal(true);
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

    try {
      if (editingArea) {
        await areaService.update(editingArea.uk_area, {
          s_nombre_area: formData.s_nombre_area.trim()
        });
        alert('Área actualizada correctamente');
      } else {
        await areaService.create({
          s_nombre_area: formData.s_nombre_area.trim()
        });
        alert('Área creada correctamente');
      }

      await loadData();
      setShowAreaModal(false);
      setFormData({ s_nombre_area: '', i_numero_consultorio: '', uk_area: '' });
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

    try {
      if (editingConsultorio) {
        await consultorioService.update(editingConsultorio.uk_consultorio, {
          i_numero_consultorio: parseInt(formData.i_numero_consultorio)
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
      setFormData({ s_nombre_area: '', i_numero_consultorio: '', uk_area: '' });
    } catch (error) {
      alert('Error guardando consultorio: ' + error.message);
      console.error('Error guardando consultorio:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
            <h1 className="page-title">Gestión de Consultorios</h1>
            <p className="page-subtitle">
              Administra áreas médicas y consultorios del sistema - {totalAreas} áreas, {totalConsultorios} consultorios
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
                  Áreas Médicas
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
                  Total Consultorios
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
                  Consultorios Activos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="filters-section">
          <div className="filter-group" style={{ flex: '1', maxWidth: '400px' }}>
            <label>Buscar Áreas Médicas</label>
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
              const areaIcon = getAreaIcon(area.s_nombre_area);
              const IconComponent = areaIcon.icon;

              return (
                <div key={area.uk_area} className="content-card">
                  <div className="card-header" style={{
                    background: `linear-gradient(135deg, ${areaIcon.color}20, ${areaIcon.color}10)`,
                    borderBottom: `1px solid ${areaIcon.color}30`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--border-radius-sm)',
                        background: `linear-gradient(135deg, ${areaIcon.color}, ${areaIcon.color}dd)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <IconComponent />
                      </div>
                      <div>
                        <h3 className="card-title" style={{ margin: 0, fontSize: '18px', color: areaIcon.color }}>
                          {area.s_nombre_area}
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                          {areaConsultorios.length} consultorio{areaConsultorios.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        className="card-action"
                        onClick={() => handleEditArea(area)}
                        title="Editar área"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="card-action"
                        onClick={() => handleDeleteArea(area)}
                        title="Eliminar área"
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
                        {areaConsultorios.map(consultorio => (
                          <div key={consultorio.uk_consultorio} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: 'var(--bg-glass)',
                            borderRadius: 'var(--border-radius-sm)',
                            border: '1px solid var(--border-color)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaDoorOpen style={{ color: areaIcon.color }} />
                              <span style={{ fontWeight: '600' }}>
                                Consultorio #{consultorio.i_numero_consultorio}
                              </span>
                              <span className={`status-badge ${consultorio.ck_estado === 'ACTIVO' ? 'success' : 'secondary'}`}>
                                {RECORD_STATUS_LABELS[consultorio.ck_estado] || consultorio.ck_estado}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => handleEditConsultorio(consultorio)}
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '12px' }}
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
                        ))}
                      </div>
                    )}

                    {/* Add Consultorio Button */}
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleAddConsultorio(area)}
                        style={{ width: '100%' }}
                      >
                        <FaPlus /> Agregar Consultorio
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
                {editingArea ? 'Editar Área Médica' : 'Nueva Área Médica'}
              </h3>
              <button
                onClick={() => setShowAreaModal(false)}
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

            <form onSubmit={handleSubmitArea} style={{ padding: '24px' }}>
              <div className="form-group">
                <label>Nombre del Área Médica *</label>
                <input
                  type="text"
                  name="s_nombre_area"
                  value={formData.s_nombre_area}
                  onChange={handleInputChange}
                  placeholder="Ej: Medicina General, Pediatría, Cardiología..."
                  className="form-control"
                  required
                  maxLength={100}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowAreaModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaCheck />
                  {editingArea ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
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
                {editingConsultorio ? 'Editar Consultorio' : `Nuevo Consultorio - ${selectedAreaForConsultorio?.s_nombre_area}`}
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

            <form onSubmit={handleSubmitConsultorio} style={{ padding: '24px' }}>
              <div className="form-group">
                <label>Número del Consultorio *</label>
                <input
                  type="number"
                  name="i_numero_consultorio"
                  value={formData.i_numero_consultorio}
                  onChange={handleInputChange}
                  placeholder="Ej: 101, 102, 103..."
                  className="form-control"
                  required
                  min="1"
                  max="9999"
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
      )}

      <AdminFooter isDarkMode={isDarkMode} />
    </div>
  );
};

export default ConsultorioManagement;