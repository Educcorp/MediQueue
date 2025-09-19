import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '../components/Common/AdminHeader';
import areaService from '../services/areaService';
import consultorioService from '../services/consultorioService';
import { RECORD_STATUS_LABELS } from '../utils/constants';

const ConsultorioManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [showConsultorioForm, setShowConsultorioForm] = useState({});
  const [editingArea, setEditingArea] = useState(null);
  const [editingConsultorio, setEditingConsultorio] = useState(null);
  const [formData, setFormData] = useState({
    s_nombre_area: '',
    i_numero_consultorio: '',
    uk_area: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Paleta de colores para las primeras 8 áreas médicas
  const areaColorPalette = [
    { color: '#4CAF50', gradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }, // Verde - Medicina General
    { color: '#2196F3', gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' }, // Azul - Pediatría
    { color: '#FF9800', gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }, // Naranja - Cardiología
    { color: '#E91E63', gradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)' }, // Rosa - Dermatología
    { color: '#9C27B0', gradient: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)' }, // Púrpura - Ginecología
    { color: '#00BCD4', gradient: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)' }, // Cian - Oftalmología
    { color: '#795548', gradient: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)' }, // Marrón - Ortopedia
    { color: '#607D8B', gradient: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)' }  // Azul Gris - Psiquiatría
  ];

  // Mapa de iconos y colores por nombre de área
  const areaUI = {
    'Medicina General': { icono: 'fas fa-stethoscope', color: areaColorPalette[0].color, gradient: areaColorPalette[0].gradient },
    'Pediatría': { icono: 'fas fa-baby', color: areaColorPalette[1].color, gradient: areaColorPalette[1].gradient },
    'Cardiología': { icono: 'fas fa-heartbeat', color: areaColorPalette[2].color, gradient: areaColorPalette[2].gradient },
    'Dermatología': { icono: 'fas fa-user-md', color: areaColorPalette[3].color, gradient: areaColorPalette[3].gradient },
    'Ginecología': { icono: 'fas fa-female', color: areaColorPalette[4].color, gradient: areaColorPalette[4].gradient },
    'Oftalmología': { icono: 'fas fa-eye', color: areaColorPalette[5].color, gradient: areaColorPalette[5].gradient },
    'Ortopedia': { icono: 'fas fa-bone', color: areaColorPalette[6].color, gradient: areaColorPalette[6].gradient },
    'Psiquiatría': { icono: 'fas fa-brain', color: areaColorPalette[7].color, gradient: areaColorPalette[7].gradient },
    'Neurología': { icono: 'fas fa-brain', color: '#FF5722', gradient: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)' },
    'Urología': { icono: 'fas fa-male', color: '#3F51B5', gradient: 'linear-gradient(135deg, #3F51B5 0%, #303F9F 100%)' },
    'Endocrinología': { icono: 'fas fa-flask', color: '#8BC34A', gradient: 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)' },
    'Gastroenterología': { icono: 'fas fa-stomach', color: '#FFC107', gradient: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)' }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const handleAddArea = () => {
    setEditingArea(null);
    setFormData({
      s_nombre_area: '',
      i_numero_consultorio: '',
      uk_area: ''
    });
    setShowAreaForm(true);
  };

  const handleEditArea = (area) => {
    setEditingArea(area);
    setFormData({
      s_nombre_area: area.s_nombre_area,
      i_numero_consultorio: '',
      uk_area: area.uk_area
    });
    setShowAreaForm(true);
  };

  const handleAddConsultorio = (areaId) => {
    setEditingConsultorio(null);
    setFormData({
      s_nombre_area: '',
      i_numero_consultorio: '',
      uk_area: areaId
    });
    setShowConsultorioForm(prev => ({ ...prev, [areaId]: true }));
  };

  const handleEditConsultorio = (consultorio) => {
    setEditingConsultorio(consultorio);
    setFormData({
      s_nombre_area: '',
      i_numero_consultorio: consultorio.i_numero_consultorio,
      uk_area: consultorio.uk_area
    });
    setShowConsultorioForm(prev => ({ ...prev, [consultorio.uk_area]: true }));
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
      setShowAreaForm(false);
      setFormData({
        s_nombre_area: '',
        i_numero_consultorio: '',
        uk_area: ''
      });
    } catch (error) {
      let errorMessage = 'Error guardando área: ' + error.message;

      // Manejar errores específicos
      if (error.response?.status === 409) {
        errorMessage = 'Ya existe un área con ese nombre. Por favor, elige otro nombre.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Por favor, intenta nuevamente.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
      console.error('Error guardando área:', error);
    }
  };

  const handleSubmitConsultorio = async (e) => {
    e.preventDefault();

    if (!formData.i_numero_consultorio || !formData.uk_area) {
      alert('El número de consultorio y área son requeridos');
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
          i_numero_consultorio: parseInt(formData.i_numero_consultorio),
          uk_area: formData.uk_area
        });
        alert('Consultorio creado correctamente');
      }

      await loadData();
      setShowConsultorioForm(prev => ({ ...prev, [formData.uk_area]: false }));
      setFormData({
        s_nombre_area: '',
        i_numero_consultorio: '',
        uk_area: ''
      });
    } catch (error) {
      let errorMessage = 'Error guardando consultorio: ' + error.message;

      // Manejar errores específicos
      if (error.response?.status === 409) {
        errorMessage = 'Ya existe un consultorio con ese número en esta área. Por favor, elige otro número.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Por favor, intenta nuevamente.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
      console.error('Error guardando consultorio:', error);
    }
  };

  const handleDeleteArea = async (area) => {
    if (window.confirm(`¿Estás seguro de eliminar el área "${area.s_nombre_area}"?`)) {
      try {
        await areaService.remove(area.uk_area);
        await loadData();
        alert('Área eliminada correctamente');
      } catch (error) {
        alert('Error eliminando área: ' + error.message);
        console.error('Error eliminando área:', error);
      }
    }
  };

  const handleDeleteConsultorio = async (consultorio) => {
    if (window.confirm(`¿Estás seguro de eliminar el consultorio ${consultorio.i_numero_consultorio}?`)) {
      try {
        await consultorioService.remove(consultorio.uk_consultorio);
        await loadData();
        alert('Consultorio eliminado correctamente');
      } catch (error) {
        alert('Error eliminando consultorio: ' + error.message);
        console.error('Error eliminando consultorio:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar áreas por término de búsqueda
  const filteredAreas = areas.filter(area =>
    area.s_nombre_area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener consultorios por área
  const getConsultoriosByArea = (areaId) => {
    return consultorios.filter(c => c.uk_area === areaId);
  };

  const getAreaUI = (areaName) => {
    // Si el área está en el mapa predefinido, usar esos datos
    if (areaUI[areaName]) {
      return areaUI[areaName];
    }

    // Para áreas no predefinidas, asignar colores de la paleta de manera cíclica
    const areaNames = areas.map(area => area.s_nombre_area);
    const areaIndex = areaNames.indexOf(areaName);

    if (areaIndex >= 0 && areaIndex < areaColorPalette.length) {
      // Usar colores de la paleta para las primeras 8 áreas
      return {
        icono: 'fas fa-hospital',
        color: areaColorPalette[areaIndex].color,
        gradient: areaColorPalette[areaIndex].gradient
      };
    }

    // Para áreas adicionales, usar colores aleatorios pero consistentes
    const fallbackColors = [
      '#FF5722', '#3F51B5', '#8BC34A', '#FFC107', '#FF6F00',
      '#E1BEE7', '#B2DFDB', '#C8E6C9', '#FFCDD2', '#F8BBD9'
    ];

    const colorIndex = areaIndex % fallbackColors.length;
    return {
      icono: 'fas fa-hospital',
      color: fallbackColors[colorIndex],
      gradient: `linear-gradient(135deg, ${fallbackColors[colorIndex]} 0%, ${fallbackColors[colorIndex]}CC 100%)`
    };
  };

  if (loading) {
    return (
      <div className="consultorio-management loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando consultorios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consultorio-management">
      <AdminHeader />

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={loadData} className="retry-btn">
            Reintentar
          </button>
        </div>
      )}

      <main className="management-content">
        <div className="content-header">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-hospital"></i>
              </div>
              <div className="stat-info">
                <h3>{areas.length}</h3>
                <p>Áreas Médicas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-door-open"></i>
              </div>
              <div className="stat-info">
                <h3>{consultorios.length}</h3>
                <p>Total Consultorios</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{areas.filter(a => a.ck_estado === 'ACTIVO').length}</h3>
                <p>Áreas Activas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{areas.filter(a => a.ck_estado === 'INACTIVO').length}</h3>
                <p>Áreas Inactivas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y acciones */}
        <div className="search-and-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar áreas..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          <div className="actions-bar">
            <button onClick={handleAddArea} className="btn primary">
              <i className="fas fa-plus"></i>
              Añadir Área
            </button>
            <button onClick={loadData} className="btn secondary">
              <i className="fas fa-sync-alt"></i>
              Actualizar
            </button>
          </div>
        </div>

        {/* Paleta de colores de demostración - solo se muestra si hay menos de 8 áreas */}
        {areas.length < 8 && (
          <div className="color-palette-demo">
            <h3>Paleta de Colores para Áreas Médicas</h3>
            <p className="palette-description">
              Las primeras 8 áreas tendrán colores únicos asignados automáticamente:
            </p>
            <div className="palette-grid">
              {areaColorPalette.map((palette, index) => {
                const areaNames = ['Medicina General', 'Pediatría', 'Cardiología', 'Dermatología', 'Ginecología', 'Oftalmología', 'Ortopedia', 'Psiquiatría'];
                return (
                  <div key={index} className="palette-item" style={{ background: palette.gradient }}>
                    <span className="palette-number">{index + 1}</span>
                    <span className="palette-name">{areaNames[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="areas-grid">
          {filteredAreas.map((area) => {
            const areaConsultorios = getConsultoriosByArea(area.uk_area);
            const { icono, color, gradient } = getAreaUI(area.s_nombre_area);

            return (
              <div key={area.uk_area} className="area-card">
                <div className="area-header" style={{ background: gradient }}>
                  <div className="area-icon">
                    <i className={icono}></i>
                  </div>
                  <div className="area-info">
                    <h2>{area.s_nombre_area}</h2>
                    <p>{areaConsultorios.length} consultorios</p>
                    <span className={`status-badge ${area.ck_estado === 'ACTIVO' ? 'active' : 'inactive'}`}>
                      {RECORD_STATUS_LABELS[area.ck_estado]}
                    </span>
                  </div>
                  <div className="area-tools">
                    <button
                      className="btn small"
                      onClick={() => handleEditArea(area)}
                      title="Editar área"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn danger small"
                      onClick={() => handleDeleteArea(area)}
                      title="Eliminar área"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="consultorios-list">
                  {areaConsultorios.map((consultorio) => (
                    <div key={consultorio.uk_consultorio} className="consultorio-item">
                      <div className="consultorio-info">
                        <div className="consultorio-number">
                          <i className="fas fa-door-open"></i>
                          <span>Consultorio {consultorio.i_numero_consultorio}</span>
                        </div>
                        <span className={`status-badge ${consultorio.ck_estado === 'ACTIVO' ? 'active' : 'inactive'}`}>
                          {RECORD_STATUS_LABELS[consultorio.ck_estado]}
                        </span>
                      </div>
                      <div className="consultorio-actions">
                        <button
                          className="btn small"
                          onClick={() => handleEditConsultorio(consultorio)}
                          title="Editar consultorio"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn danger small"
                          onClick={() => handleDeleteConsultorio(consultorio)}
                          title="Eliminar consultorio"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="consultorio-add-container">
                    <button
                      className="btn primary"
                      onClick={() => handleAddConsultorio(area.uk_area)}
                    >
                      <i className="fas fa-plus"></i>
                      Añadir Consultorio
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAreas.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-hospital"></i>
            <p>{searchTerm ? 'No se encontraron áreas' : 'No hay áreas registradas'}</p>
          </div>
        )}
      </main>

      {/* Modal para crear/editar área */}
      {showAreaForm && (
        <div className="modal-overlay" onClick={() => setShowAreaForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingArea ? 'Editar Área' : 'Nueva Área Médica'}</h3>
              <button className="btn small" onClick={() => setShowAreaForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitArea} className="modal-body">
              <div className="form-group">
                <label>Nombre del Área *</label>
                <input
                  type="text"
                  name="s_nombre_area"
                  value={formData.s_nombre_area}
                  onChange={handleInputChange}
                  placeholder="Ej: Medicina General"
                  required
                  maxLength={100}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowAreaForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  <i className="fas fa-check"></i>
                  {editingArea ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear/editar consultorio */}
      {Object.entries(showConsultorioForm).map(([areaId, isOpen]) => {
        if (!isOpen) return null;

        const area = areas.find(a => a.uk_area === areaId);
        if (!area) return null;

        return (
          <div key={areaId} className="modal-overlay" onClick={() => setShowConsultorioForm(prev => ({ ...prev, [areaId]: false }))}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {editingConsultorio ? 'Editar Consultorio' : 'Nuevo Consultorio'} · {area.s_nombre_area}
                </h3>
                <button
                  className="btn small"
                  onClick={() => setShowConsultorioForm(prev => ({ ...prev, [areaId]: false }))}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmitConsultorio} className="modal-body">
                <div className="form-group">
                  <label>Número de Consultorio *</label>
                  <input
                    type="number"
                    name="i_numero_consultorio"
                    value={formData.i_numero_consultorio}
                    onChange={handleInputChange}
                    placeholder="Ej: 1"
                    required
                    min="1"
                    max="999"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowConsultorioForm(prev => ({ ...prev, [areaId]: false }))}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn primary">
                    <i className="fas fa-check"></i>
                    {editingConsultorio ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })}

      <style>{`
        .consultorio-management {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .consultorio-management.loading {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-container {
          text-align: center;
          color: #718096;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-banner {
          background: #fed7d7;
          color: #c53030;
          padding: 15px 20px;
          margin: 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(197, 48, 48, 0.1);
        }

        .retry-btn {
          background: #c53030;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          background: #9c2626;
          transform: translateY(-1px);
        }

        .management-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-logo-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-logo-image {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .header-logo-text-group {
          display: flex;
          align-items: baseline;
        }

        .header-logo-text {
          font-size: 1.5em;
          font-weight: 700;
          color: #2d3748;
        }

        .header-logo-text2 {
          font-size: 1.5em;
          font-weight: 700;
          color: #667eea;
        }

        .header-subtitle h1 {
          margin: 0;
          color: #2d3748;
          font-size: 1.8em;
        }

        .header-subtitle p {
          margin: 5px 0 0 0;
          color: #718096;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .back-btn {
          background: #f1f5f9;
          border: 1px solid #cbd5e0;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-btn:hover {
          background: #e2e8f0;
        }

        .admin-name {
          color: #4a5568;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logout-btn {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(197, 48, 48, 0.3);
        }

        .management-content {
          padding: 40px 20px;
        }

        .content-header {
          margin-bottom: 30px;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5em;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-info h3 {
          margin: 0;
          font-size: 2em;
          font-weight: 700;
          color: #2d3748;
        }

        .stat-info p {
          margin: 0;
          color: #718096;
          font-weight: 500;
        }

        .search-and-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .search-bar {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }

        .actions-bar {
          display: flex;
          gap: 15px;
        }

        .color-palette-demo {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .color-palette-demo h3 {
          margin: 0 0 10px 0;
          color: #2d3748;
          font-size: 1.2em;
          font-weight: 600;
        }

        .palette-description {
          margin: 0 0 20px 0;
          color: #718096;
          font-size: 0.95em;
          line-height: 1.5;
        }

        .palette-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .palette-item {
          padding: 15px;
          border-radius: 8px;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .palette-item:hover {
          transform: translateY(-2px);
        }

        .palette-number {
          background: rgba(255, 255, 255, 0.2);
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.9em;
          min-width: 30px;
          text-align: center;
        }

        .palette-name {
          flex: 1;
          font-size: 0.95em;
        }

        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn.primary {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
        }

        .btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
        }

        .btn.secondary {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          color: #4a5568;
        }

        .btn.secondary:hover {
          background: #edf2f7;
        }

        .btn.danger {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: white;
        }

        .btn.danger:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(197, 48, 48, 0.3);
        }

        .btn.small {
          padding: 8px 12px;
          font-size: 0.9em;
        }

        .areas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .area-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .area-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .area-header {
          padding: 20px;
          color: white;
          display: flex;
          align-items: center;
          gap: 15px;
          position: relative;
          overflow: hidden;
        }

        .area-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .area-card:hover .area-header::before {
          opacity: 1;
        }

        .area-icon {
          font-size: 2em;
          position: relative;
          z-index: 1;
        }

        .area-info {
          position: relative;
          z-index: 1;
        }

        .area-info h2 {
          margin: 0;
          font-size: 1.5em;
          font-weight: 700;
        }

        .area-info p {
          margin: 5px 0;
          opacity: 0.9;
        }

        .area-tools {
          margin-left: auto;
          display: flex;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #c6f6d5;
          color: #22543d;
        }

        .status-badge.inactive {
          background: #fed7d7;
          color: #742a2a;
        }

        .consultorios-list {
          padding: 20px;
        }

        .consultorio-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 10px;
          transition: all 0.3s ease;
        }

        .consultorio-item:hover {
          background: #f8fafc;
          border-color: #cbd5e0;
        }

        .consultorio-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .consultorio-number {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #2d3748;
        }

        .consultorio-actions {
          display: flex;
          gap: 8px;
        }

        .consultorio-add-container {
          margin-top: 15px;
          text-align: center;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #718096;
        }

        .empty-state i {
          font-size: 3em;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-card {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          color: #2d3748;
        }

        .modal-body {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #4a5568;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1em;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .header-left {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }

          .header-right {
            flex-direction: column;
            gap: 10px;
          }

          .search-and-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .actions-bar {
            justify-content: center;
          }

          .areas-grid {
            grid-template-columns: 1fr;
          }

          .consultorio-item {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }

          .consultorio-actions {
            justify-content: center;
          }

          .modal-card {
            width: 95%;
            margin: 10px;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ConsultorioManagement;
