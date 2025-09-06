import React from 'react'
import '../styles/SpecialtyGrid.css'

const SpecialtyGrid = ({ specialties }) => {
  return (
    <div className="specialty-grid">
      {specialties.map((specialty) => (
        <div 
          key={specialty.id} 
          className="specialty-card"
          style={{ 
            '--specialty-color': specialty.color,
            '--specialty-hover-color': specialty.color === '#544e52' ? '#77b8ce' : specialty.color
          }}
        >
          <div className="specialty-icon">{specialty.icon}</div>
          <h3 className="specialty-name">{specialty.name}</h3>
          <div className="specialty-info">
            <p>👨‍⚕️ Dr. Disponible</p>
            <p>⏰ Horarios: 8:00 - 18:00</p>
            <p>📅 Turnos Disponibles</p>
          </div>
          <button className="specialty-button">
            📅 Agendar Turno
          </button>
        </div>
      ))}
    </div>
  )
}

export default SpecialtyGrid
