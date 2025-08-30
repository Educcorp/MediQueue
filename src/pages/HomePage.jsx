import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AppointmentCard from '../components/AppointmentCard'
import SpecialtyGrid from '../components/SpecialtyGrid'
import '../styles/HomePage.css'

const HomePage = () => {
  const [currentAppointment, setCurrentAppointment] = useState(null)
  const [specialties] = useState([
    { id: 1, name: 'Pediatría', icon: '👶', color: '#d8f0f4' },
    { id: 2, name: 'Cardiología', icon: '❤️', color: '#d7c0c6' },
    { id: 3, name: 'Traumatología', icon: '🦴', color: '#77b8ce' },
    { id: 4, name: 'Nutricionista', icon: '🥗', color: '#544e52' },
    { id: 5, name: 'Medicina General', icon: '🏥', color: '#ea5d4b' },
    { id: 6, name: 'Oculista', icon: '👁️', color: '#d8f0f4' }
  ])

  // Simular un turno actual (en una aplicación real vendría de una API)
  useEffect(() => {
    const mockAppointment = {
      id: 1,
      patientName: 'Juan Pérez',
      specialty: 'Cardiología',
      doctor: 'Dr. María González',
      date: '2024-01-15',
      time: '14:30',
      room: 'Consultorio 3',
      status: 'confirmado'
    }
    setCurrentAppointment(mockAppointment)
  }, [])

  return (
    <div className="home-page">
      <Header />
      
      <main className="main">
        <div className="container">
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content">
              <h1 className="hero-title">
                Bienvenido a <span className="highlight">MediQueue</span>
              </h1>
              <p className="hero-subtitle">
                Su sistema de gestión de turnos médicos, diseñado para brindarle la mejor experiencia en su visita a la clínica.
              </p>
            </div>
          </section>

          {/* Current Appointment Section */}
          {currentAppointment && (
            <section className="current-appointment-section">
              <h2 className="section-title">Su Turno Actual</h2>
              <AppointmentCard appointment={currentAppointment} />
            </section>
          )}

          {/* Specialties Section */}
          <section className="specialties-section">
            <h2 className="section-title">Nuestras Especialidades</h2>
            <SpecialtyGrid specialties={specialties} />
          </section>

          {/* Quick Actions */}
          <section className="quick-actions-section">
            <h2 className="section-title">Acciones Rápidas</h2>
            <div className="quick-actions-grid">
              <button className="action-button primary">
                📅 Agendar Nuevo Turno
              </button>
              <button className="action-button secondary">
                📋 Ver Historial
              </button>
              <button className="action-button secondary">
                ⏰ Cambiar Horario
              </button>
              <button className="action-button secondary">
                ❌ Cancelar Turno
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
