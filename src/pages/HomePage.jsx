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
              <div className="brand-logo">MQ</div>
              <div className="brand-title">
                <span className="brand-name">MediQueue</span>
                <span className="brand-tag">Tu turno, sin filas</span>
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
              <span className="pill">Siguiente turno</span>
            </div>
            {loading ? (
              <div className="main-loading">Cargando...</div>
            ) : nextTurn ? (
              <>
                <div className="turn-id-big">{nextTurn.id}</div>
                <div className="turn-room-big">Consultorio {nextTurn.consultorio}</div>
              </>
            ) : (
              <div className="main-no-turn">No hay turno siguiente</div>
            )}
          </div>
        </div>


        <div className="sidebar">
          <div className="sidebar-title">Turnos Activos</div>
          <div className="sidebar-list">
            {loading ? (
              <div className="sidebar-loading">Cargando...</div>
            ) : activeTurns.length > 0 ? (
              activeTurns.map((turn) => (
                <div className="sidebar-turn" key={turn.numero_turno}>
                  <div className="turn-info">
                    <span className="turn-id">#{turn.numero_turno}</span>
                    <span className="turn-patient">{turn.nombre_paciente} {turn.apellido_paciente}</span>
                    <span className="turn-room">Consultorio {turn.numero_consultorio}</span>
                  </div>
                  <div className="turn-status">
                    <span className={`status-badge ${turn.estado === 'Llamando' ? 'status-calling' : 'status-waiting'}`}>
                      {turn.estado}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="sidebar-empty">No hay turnos activos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
