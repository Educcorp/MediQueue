import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
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

const IconSelector = ({ value, onChange, disabled = false, label }) => {
  const { t } = useTranslation(['consultorio']);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef(null);

  // Mapa de iconos médicos disponibles
  const availableIcons = useMemo(() => [
    { name: 'FaStethoscope', component: FaStethoscope, label: t('consultorio:iconSelector.icons.stethoscope'), category: 'general' },
    { name: 'FaBaby', component: FaBaby, label: t('consultorio:iconSelector.icons.baby'), category: 'pediatria' },
    { name: 'FaHeartbeat', component: FaHeartbeat, label: t('consultorio:iconSelector.icons.heartbeat'), category: 'cardiologia' },
    { name: 'FaUserMd', component: FaUserMd, label: t('consultorio:iconSelector.icons.doctor'), category: 'general' },
    { name: 'FaFemale', component: FaFemale, label: t('consultorio:iconSelector.icons.female'), category: 'ginecologia' },
    { name: 'FaEye', component: FaEye, label: t('consultorio:iconSelector.icons.eye'), category: 'oftalmologia' },
    { name: 'FaBone', component: FaBone, label: t('consultorio:iconSelector.icons.bone'), category: 'ortopedia' },
    { name: 'FaBrain', component: FaBrain, label: t('consultorio:iconSelector.icons.brain'), category: 'neurologia' },
    { name: 'FaMale', component: FaMale, label: t('consultorio:iconSelector.icons.male'), category: 'urologia' },
    { name: 'FaFlask', component: FaFlask, label: t('consultorio:iconSelector.icons.flask'), category: 'laboratorio' },
    { name: 'FaProcedures', component: FaProcedures, label: t('consultorio:iconSelector.icons.procedures'), category: 'general' },
    { name: 'FaDoorOpen', component: FaDoorOpen, label: t('consultorio:iconSelector.icons.door'), category: 'general' },
    { name: 'FaHospital', component: FaHospital, label: t('consultorio:iconSelector.icons.hospital'), category: 'general' },
    { name: 'FaAmbulance', component: FaAmbulance, label: t('consultorio:iconSelector.icons.ambulance'), category: 'emergencias' },
    { name: 'FaSyringe', component: FaSyringe, label: t('consultorio:iconSelector.icons.syringe'), category: 'general' },
    { name: 'FaPrescriptionBottle', component: FaPrescriptionBottle, label: t('consultorio:iconSelector.icons.prescriptionBottle'), category: 'farmacia' },
    { name: 'FaXRay', component: FaXRay, label: t('consultorio:iconSelector.icons.xray'), category: 'radiologia' },
    { name: 'FaMicroscope', component: FaMicroscope, label: t('consultorio:iconSelector.icons.microscope'), category: 'laboratorio' },
    { name: 'FaLungs', component: FaLungs, label: t('consultorio:iconSelector.icons.lungs'), category: 'neumologia' },
    { name: 'FaTooth', component: FaTooth, label: t('consultorio:iconSelector.icons.tooth'), category: 'odontologia' },
    { name: 'FaHandHoldingHeart', component: FaHandHoldingHeart, label: t('consultorio:iconSelector.icons.heartHolding'), category: 'cardiologia' },
    { name: 'FaWheelchair', component: FaWheelchair, label: t('consultorio:iconSelector.icons.wheelchair'), category: 'rehabilitacion' },
    { name: 'FaCrutch', component: FaCrutch, label: t('consultorio:iconSelector.icons.crutch'), category: 'ortopedia' },
    { name: 'FaThermometer', component: FaThermometer, label: t('consultorio:iconSelector.icons.thermometer'), category: 'general' },
    { name: 'FaHeadSideCough', component: FaHeadSideCough, label: t('consultorio:iconSelector.icons.cough'), category: 'neumologia' },
    { name: 'FaVials', component: FaVials, label: t('consultorio:iconSelector.icons.vials'), category: 'laboratorio' }
  ], [t]);

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
    general: t('consultorio:iconSelector.categories.general'),
    pediatria: t('consultorio:iconSelector.categories.pediatria'),
    cardiologia: t('consultorio:iconSelector.categories.cardiologia'),
    ginecologia: t('consultorio:iconSelector.categories.ginecologia'),
    oftalmologia: t('consultorio:iconSelector.categories.oftalmologia'),
    ortopedia: t('consultorio:iconSelector.categories.ortopedia'),
    neurologia: t('consultorio:iconSelector.categories.neurologia'),
    urologia: t('consultorio:iconSelector.categories.urologia'),
    laboratorio: t('consultorio:iconSelector.categories.laboratorio'),
    emergencias: t('consultorio:iconSelector.categories.emergencias'),
    farmacia: t('consultorio:iconSelector.categories.farmacia'),
    radiologia: t('consultorio:iconSelector.categories.radiologia'),
    neumologia: t('consultorio:iconSelector.categories.neumologia'),
    odontologia: t('consultorio:iconSelector.categories.odontologia'),
    rehabilitacion: t('consultorio:iconSelector.categories.rehabilitacion')
  };

  // Componente Modal Popup
  const IconPopup = () => (
    <div className="icon-popup-overlay" onClick={handleClose}>
      <div className="icon-popup-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header del popup */}
        <div className="icon-popup-header">
          <h3>{t('consultorio:iconSelector.title')}</h3>
          <button
            className="icon-popup-close"
            onClick={handleClose}
            title={t('common:buttons.close')}
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
              placeholder={t('consultorio:iconSelector.searchPlaceholder')}
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
              <h4>{t('consultorio:iconSelector.noIconsFound')}</h4>
              <p>{t('consultorio:iconSelector.tryOtherTerms')}</p>
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