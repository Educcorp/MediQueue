import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './IconSelector.css';

// Importar iconos de FontAwesome que son más apropiados para áreas médicas
import {
  FaStethoscope, FaBaby, FaHeartbeat, FaUserMd, FaFemale,
  FaEye, FaBone, FaBrain, FaMale, FaFlask,
  FaProcedures, FaDoorOpen, FaHospital, FaAmbulance,
  FaSyringe, FaPrescriptionBottle, FaXRay, FaMicroscope,
  FaLungs, FaTooth, FaHandHoldingHeart, FaWheelchair,
  FaCrutch, FaThermometer, FaHeadSideCough, FaVials,
  FaSearch, FaCheck, FaTimes, FaPlus
} from 'react-icons/fa';

const IconSelector = ({ value, onChange, disabled = false, label = "Seleccionar Icono" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const [usePortal, setUsePortal] = useState(false);

  // Mapa de iconos médicos disponibles con sus nombres y categorías
  const availableIcons = useMemo(() => [
    { name: 'FaStethoscope', component: FaStethoscope, label: 'Estetoscopio', category: 'general' },
    { name: 'FaBaby', component: FaBaby, label: 'Bebé/Pediatría', category: 'pediatria' },
    { name: 'FaHeartbeat', component: FaHeartbeat, label: 'Latidos/Cardiología', category: 'cardiologia' },
    { name: 'FaUserMd', component: FaUserMd, label: 'Doctor', category: 'general' },
    { name: 'FaFemale', component: FaFemale, label: 'Mujer/Ginecología', category: 'ginecologia' },
    { name: 'FaEye', component: FaEye, label: 'Ojo/Oftalmología', category: 'oftalmologia' },
    { name: 'FaBone', component: FaBone, label: 'Hueso/Ortopedia', category: 'ortopedia' },
    { name: 'FaBrain', component: FaBrain, label: 'Cerebro/Neurología', category: 'neurologia' },
    { name: 'FaMale', component: FaMale, label: 'Hombre/Urología', category: 'urologia' },
    { name: 'FaFlask', component: FaFlask, label: 'Laboratorio', category: 'laboratorio' },
    { name: 'FaProcedures', component: FaProcedures, label: 'Procedimientos', category: 'general' },
    { name: 'FaDoorOpen', component: FaDoorOpen, label: 'Consulta/Puerta', category: 'general' },
    { name: 'FaHospital', component: FaHospital, label: 'Hospital', category: 'general' },
    { name: 'FaAmbulance', component: FaAmbulance, label: 'Ambulancia/Emergencias', category: 'emergencias' },
    { name: 'FaSyringe', component: FaSyringe, label: 'Jeringa/Vacunas', category: 'general' },
    { name: 'FaPrescriptionBottle', component: FaPrescriptionBottle, label: 'Medicamentos', category: 'farmacia' },
    { name: 'FaXRay', component: FaXRay, label: 'Rayos X/Radiología', category: 'radiologia' },
    { name: 'FaMicroscope', component: FaMicroscope, label: 'Microscopio', category: 'laboratorio' },
    { name: 'FaLungs', component: FaLungs, label: 'Pulmones/Neumología', category: 'neumologia' },
    { name: 'FaTooth', component: FaTooth, label: 'Diente/Odontología', category: 'odontologia' },
    { name: 'FaHandHoldingHeart', component: FaHandHoldingHeart, label: 'Cuidado Cardíaco', category: 'cardiologia' },
    { name: 'FaWheelchair', component: FaWheelchair, label: 'Silla de Ruedas/Rehabilitación', category: 'rehabilitacion' },
    { name: 'FaCrutch', component: FaCrutch, label: 'Muleta/Ortopedia', category: 'ortopedia' },
    { name: 'FaThermometer', component: FaThermometer, label: 'Termómetro', category: 'general' },
    { name: 'FaHeadSideCough', component: FaHeadSideCough, label: 'Tos/Respiratorio', category: 'neumologia' },
    { name: 'FaVials', component: FaVials, label: 'Viales/Análisis', category: 'laboratorio' }
  ], []);

  // Filtrar iconos basado en el término de búsqueda
  const filteredIcons = useMemo(() => {
    if (!searchTerm) return availableIcons;
    
    const term = searchTerm.toLowerCase();
    return availableIcons.filter(icon => 
      icon.label.toLowerCase().includes(term) ||
      icon.category.toLowerCase().includes(term) ||
      icon.name.toLowerCase().includes(term)
    );
  }, [searchTerm, availableIcons]);

  // Agrupar iconos por categoría
  const groupedIcons = useMemo(() => {
    const groups = {};
    filteredIcons.forEach(icon => {
      if (!groups[icon.category]) {
        groups[icon.category] = [];
      }
      groups[icon.category].push(icon);
    });
    return groups;
  }, [filteredIcons]);

  // Detectar si está en un modal y calcular posición
  const updatePosition = () => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const isInModal = buttonRef.current.closest('[style*="position: fixed"]') || 
                     buttonRef.current.closest('[style*="z-index: 9999"]') ||
                     buttonRef.current.closest('.modal') ||
                     buttonRef.current.closest('[role="dialog"]');
    
    const needsPortal = !!isInModal;
    setUsePortal(needsPortal);
    
    if (needsPortal) {
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  };

  const handleIconSelect = (iconName) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        updatePosition();
      }
      setIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  // Actualizar posición si el modal cambia de tamaño o se mueve
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  const getCurrentIcon = () => {
    const currentIcon = availableIcons.find(icon => icon.name === value);
    return currentIcon || null;
  };

  const currentIcon = getCurrentIcon();
  const IconComponent = currentIcon?.component;

  const categoryNames = {
    general: 'Medicina General',
    pediatria: 'Pediatría',
    cardiologia: 'Cardiología',
    ginecologia: 'Ginecología',
    oftalmologia: 'Oftalmología',
    ortopedia: 'Ortopedia',
    neurologia: 'Neurología',
    urologia: 'Urología',
    laboratorio: 'Laboratorio',
    emergencias: 'Emergencias',
    farmacia: 'Farmacia',
    radiologia: 'Radiología',
    neumologia: 'Neumología',
    odontologia: 'Odontología',
    rehabilitacion: 'Rehabilitación'
  };

  // Componente del contenido del dropdown
  const DropdownContent = () => (
    <>
      <div 
        className="icon-dropdown" 
        style={usePortal ? {
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 10001,
          animation: 'dropdownSlideIn 0.2s ease-out'
        } : {}}
      >
        {/* Buscador */}
        <div className="icon-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar icono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            autoFocus
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Lista de iconos por categoría */}
        <div className="icon-categories">
          {Object.keys(groupedIcons).length === 0 ? (
            <div className="no-icons-found">
              <FaSearch size={24} />
              <p>No se encontraron iconos</p>
            </div>
          ) : (
            Object.entries(groupedIcons).map(([category, icons]) => (
              <div key={category} className="icon-category">
                <h4 className="category-title">
                  {categoryNames[category] || category}
                </h4>
                <div className="icon-grid">
                  {icons.map((icon) => {
                    const IconComp = icon.component;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        className={`icon-option ${value === icon.name ? 'selected' : ''}`}
                        onClick={() => handleIconSelect(icon.name)}
                        title={`${icon.label} (${icon.name})`}
                      >
                        <IconComp size={20} />
                        <span className="icon-option-label">{icon.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Acciones */}
        <div className="icon-actions">
          <button
            type="button"
            className="clear-icon-button"
            onClick={() => handleIconSelect('')}
          >
            <FaTimes size={12} />
            Limpiar selección
          </button>
        </div>
      </div>
      
      {/* Overlay para cerrar dropdown */}
      <div 
        className="icon-dropdown-overlay" 
        onClick={handleClose}
        style={usePortal ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000
        } : {}}
      />
    </>
  );

  return (
    <div className={`icon-selector-container ${disabled ? 'disabled' : ''}`}>
      <label className="icon-selector-label">{label}</label>
      
      {/* Botón principal con preview del icono */}
      <div className="icon-selector-button-wrapper">
        <button
          ref={buttonRef}
          type="button"
          className={`icon-selector-button ${isOpen ? 'open' : ''}`}
          onClick={toggleDropdown}
          disabled={disabled}
        >
          <div className="icon-preview">
            {IconComponent ? (
              <IconComponent size={20} />
            ) : (
              <div className="icon-placeholder">
                <FaSearch size={16} />
              </div>
            )}
          </div>
          
          <div className="icon-info">
            <span className="icon-name">
              {currentIcon ? currentIcon.label : 'Sin seleccionar'}
            </span>
            {value && (
              <span className="icon-code">{value}</span>
            )}
          </div>
          
          <svg 
            className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}
            width="12" 
            height="12" 
            viewBox="0 0 12 12"
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
      </div>

      {/* Dropdown con iconos (renderizado con portal si está en modal) */}
      {isOpen && (
        usePortal ? createPortal(<DropdownContent />, document.body) : <DropdownContent />
      )}
    </div>
  );
};

IconSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string
};

export default IconSelector;