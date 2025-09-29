import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './ColorSelector.css';

const ColorSelector = ({ value, onChange, disabled = false, label = "Seleccionar Color" }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Paleta de colores predefinidos para áreas médicas
  const predefinedColors = [
    { name: 'Rojo Médico', value: '#FF6B6B', category: 'medical' },
    { name: 'Azul Cardiología', value: '#4ECDC4', category: 'medical' },
    { name: 'Azul Claro', value: '#45B7D1', category: 'medical' },
    { name: 'Verde Medicina', value: '#96CEB4', category: 'medical' },
    { name: 'Amarillo Pediatría', value: '#FFEAA7', category: 'medical' },
    { name: 'Púrpura Neurología', value: '#DDA0DD', category: 'medical' },
    { name: 'Verde Agua', value: '#98D8C8', category: 'medical' },
    { name: 'Dorado Suave', value: '#F7DC6F', category: 'medical' },
    { name: 'Lavanda', value: '#BB8FCE', category: 'medical' },
    { name: 'Azul Cielo', value: '#85C1E9', category: 'medical' },
    { name: 'Naranja Suave', value: '#F8C471', category: 'medical' },
    { name: 'Verde Esmeralda', value: '#82E0AA', category: 'medical' },
    { name: 'Rosa Ginecología', value: '#F1948A', category: 'medical' },
    { name: 'Azul Oftalmología', value: '#85C1E9', category: 'medical' },
    { name: 'Púrpura Psiquiatría', value: '#D7BDE2', category: 'medical' },
    { name: 'Verde Mint', value: '#A3E4D7', category: 'medical' },
    { name: 'Amarillo Pálido', value: '#F9E79F', category: 'medical' },
    { name: 'Rosa Pálido', value: '#FADBD8', category: 'medical' },
    { name: 'Gris Suave', value: '#D5DBDB', category: 'neutral' },
    { name: 'Azul Pálido', value: '#AED6F1', category: 'medical' }
  ];

  const handleColorSelect = (colorValue) => {
    onChange(colorValue);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e) => {
    onChange(e.target.value);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getCurrentColorName = () => {
    const currentColor = predefinedColors.find(color => color.value === value);
    return currentColor ? currentColor.name : 'Color personalizado';
  };

  return (
    <div className={`color-selector-container ${disabled ? 'disabled' : ''}`}>
      <label className="color-selector-label">{label}</label>
      
      {/* Botón principal con preview del color */}
      <div className="color-selector-button-wrapper">
        <button
          type="button"
          className={`color-selector-button ${isOpen ? 'open' : ''}`}
          onClick={toggleDropdown}
          disabled={disabled}
        >
          <div 
            className="color-preview"
            style={{ backgroundColor: value || '#f0f0f0' }}
          />
          <span className="color-name">
            {value ? getCurrentColorName() : 'Sin seleccionar'}
          </span>
          <span className="color-value">{value}</span>
          <svg 
            className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}
            width="12" 
            height="12" 
            viewBox="0 0 12 12"
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>

        {/* Input de color personalizado pequeño */}
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={handleCustomColorChange}
          disabled={disabled}
          className="custom-color-input"
          title="Seleccionar color personalizado"
        />
      </div>

      {/* Dropdown con colores predefinidos */}
      {isOpen && (
        <div className="color-dropdown">
          <div className="color-grid">
            {predefinedColors.map((color, index) => (
              <button
                key={index}
                type="button"
                className={`color-option ${value === color.value ? 'selected' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorSelect(color.value)}
                title={color.name}
              />
            ))}
          </div>
          
          {/* Opción de limpiar selección */}
          <div className="color-actions">
            <button
              type="button"
              className="clear-color-button"
              onClick={() => handleColorSelect('')}
            >
              Limpiar selección
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {isOpen && <div className="color-dropdown-overlay" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

ColorSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string
};

export default ColorSelector;