import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './IconSelectorPopup.css';

// Importar iconos de FontAwesome
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
  const buttonRef = useRef(null);

  // Mapa de iconos médicos disponibles
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

  const handleIconSelect = (iconName) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

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

  // Componente Modal Popup
  const IconPopup = () => (
    <div className="icon-popup-overlay" onClick={handleClose}>
      <div className="icon-popup-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header del popup */}
        <div className="icon-popup-header">
          <h3>Seleccionar Icono del Área</h3>
          <button 
            className="icon-popup-close" 
            onClick={handleClose}
            title="Cerrar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Buscador */}
        <div className="icon-popup-search">
          <div className="search-input-wrapper">
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
        </div>

        {/* Contenido de iconos */}
        <div className="icon-popup-content">
          {Object.keys(groupedIcons).length === 0 ? (
            <div className="no-icons-found">
              <FaSearch size={48} />
              <h4>No se encontraron iconos</h4>
              <p>Prueba con otros términos de búsqueda</p>
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
                        <div className="icon-wrapper">
                          <IconComp size={24} />
                        </div>
                        <span className="icon-label">{icon.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="icon-popup-footer">
          <button
            type="button"
            className="clear-selection-btn"
            onClick={() => handleIconSelect('')}
          >
            <FaTimes size={14} />
            Limpiar selección
          </button>
          <div className="popup-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
            >
              Cancelar
            </button>
            {currentIcon && (
              <button
                type="button"
                className="confirm-btn"
                onClick={handleClose}
              >
                <FaCheck size={14} />
                Confirmar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`icon-selector-container ${disabled ? 'disabled' : ''}`}>
      <label className="icon-selector-label">{label}</label>
      
      {/* Botón principal */}
      <div className="icon-selector-button-wrapper">
        <button
          ref={buttonRef}
          type="button"
          className={`icon-selector-button ${isOpen ? 'open' : ''}`}
          onClick={() => !disabled && setIsOpen(true)}
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
          </div>
          
          <div className="dropdown-arrow">
            <FaSearch size={14} />
          </div>
        </button>
      </div>

      {/* Popup Modal */}
      {isOpen && createPortal(<IconPopup />, document.body)}
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