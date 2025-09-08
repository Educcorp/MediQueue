import React, { useState } from 'react';
import useTurns from '../hooks/useTurns';
import '../styles/HomePage.css';

const HomePage = () => {
  const { nextTurn, activeTurns, loading } = useTurns();
  const [showHeader] = useState(true);

  // Función eliminada junto con el botón

  return (
    <div className="main-outer-container">
      {/* Barra de marca */}
      {showHeader && (
        <div className="brand-bar">
          <div className="brand-inner">
            <div className="brand-left">
              <div className="brand-logo">
                <img src="/images/mediqueue_logo.png" alt="MediQueue Logo" className="brand-logo-image" />
              </div>
              <div className="brand-title">
                <span className="brand-name">MediQueue</span>
                <span className="brand-tag">
                  <i className="mdi mdi-clock-outline"></i>
                  Tu turno, sin filas
                </span>
              </div>
            </div>
            <div className="brand-right">
              {/* Botón eliminado según solicitud del usuario */}
            </div>
          </div>
        </div>
      )}

      <div className="turns-homepage">
        <div className="main-turn">
          <div className="current-card">
            <div className="current-header">
              <span className="pill">
                <i className="fas fa-arrow-right"></i>
                Siguiente turno
              </span>
            </div>
            {loading ? (
              <div className="main-loading">Cargando...</div>
            ) : nextTurn ? (
              <>
                <div className="turn-id-big">{nextTurn.id}</div>
                <div className="turn-room-big">
                  <i className="mdi mdi-hospital-building"></i>
                  Consultorio {nextTurn.consultorio}
                </div>
              </>
            ) : (
              <div className="main-no-turn">
                <i className="mdi mdi-calendar-clock"></i>
                No hay turno siguiente
              </div>
            )}
          </div>
        </div>


        <div className="sidebar">
          <div className="sidebar-title">
            <i className="fas fa-list-ul"></i>
            Turnos Activos
          </div>
          <div className="sidebar-list">
            {loading ? (
              <div className="sidebar-loading">Cargando...</div>
            ) : activeTurns.length > 0 ? (
              activeTurns.map((turn) => (
                <div className="sidebar-turn" key={turn.numero_turno}>
                  <div className="turn-info">
                    <span className="turn-id">#{turn.numero_turno}</span>
                    <span className="turn-patient">{turn.nombre_paciente} {turn.apellido_paciente}</span>
                    <span className="turn-room">
                      <i className="mdi mdi-hospital-building"></i>
                      Consultorio {turn.numero_consultorio}
                    </span>
                  </div>
                  <div className="turn-status">
                    <span className={`status-badge ${turn.estado === 'Llamando' ? 'status-calling' : 'status-waiting'}`}>
                      {turn.estado}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="sidebar-empty">
                <i className="mdi mdi-calendar-remove"></i>
                No hay turnos activos
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
