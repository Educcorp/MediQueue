import React from 'react'
import '../styles/AppointmentCard.css'

const AppointmentCard = ({ appointment }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado':
        return 'var(--color-accent)'
      case 'pendiente':
        return 'var(--color-accent-red)'
      case 'completado':
        return 'var(--color-dark)'
      default:
        return 'var(--color-accent)'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado'
      case 'pendiente':
        return 'Pendiente'
      case 'completado':
        return 'Completado'
      default:
        return 'Confirmado'
    }
  }

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <div className="appointment-icon">📋</div>
        <div className="appointment-status" style={{ backgroundColor: getStatusColor(appointment.status) }}>
          {getStatusText(appointment.status)}
        </div>
      </div>
      
      <div className="appointment-content">
        <div className="appointment-info">
          <div className="info-row">
            <span className="info-label">👤 Paciente:</span>
            <span className="info-value">{appointment.patientName}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">🏥 Especialidad:</span>
            <span className="info-value">{appointment.specialty}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">👨‍⚕️ Doctor:</span>
            <span className="info-value">{appointment.doctor}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">📅 Fecha:</span>
            <span className="info-value">{formatDate(appointment.date)}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">⏰ Hora:</span>
            <span className="info-value highlight-time">{appointment.time}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">🚪 Consultorio:</span>
            <span className="info-value">{appointment.room}</span>
          </div>
        </div>
        
        <div className="appointment-actions">
          <button className="action-btn primary">📱 Confirmar Asistencia</button>
          <button className="action-btn secondary">⏰ Cambiar Horario</button>
          <button className="action-btn danger">❌ Cancelar Turno</button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentCard
