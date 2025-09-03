import React, { useState } from 'react';
import useTurns from '../hooks/useTurns';
import '../styles/HomePage.css';

const HomePage = () => {
  const { nextTurn, lastTurns, loading } = useTurns();
  const [showHeader, setShowHeader] = useState(true);

  return (
    <div className="main-outer-container">
      <div className="turns-homepage">
        <div className="main-turn">
          {loading ? (
            <div className="main-loading">Cargando...</div>
          ) : nextTurn ? (
            <>
              <div className="turn-id-big">{nextTurn.id}</div>
              <div className="turn-room-big">{nextTurn.consultorio}</div>
            </>
          ) : (
            <div className="main-no-turn">No hay turno siguiente</div>
          )}
        </div>
        <div className="sidebar">
          <div className="sidebar-list">
            {loading ? (
              <div className="sidebar-loading">Cargando...</div>
            ) : (
              lastTurns.map((turn, idx) => (
                <div className="sidebar-turn" key={turn.id}>
                  <span className="turn-id">{turn.id}</span>
                  <span className="turn-room">{turn.consultorio}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
