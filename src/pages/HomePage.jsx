import React, { useState } from 'react';
import useTurns from '../hooks/useTurns';
import '../styles/HomePage.css';
import Header from '../components/Header';

const HomePage = () => {
  const { nextTurn, lastTurns, loading } = useTurns();
  const [showHeader, setShowHeader] = useState(true);

  return (
    <div className="main-outer-container">
      {/* Header sobrepuesto */}
      {showHeader && (
        <>
          <div className="header-overlay">
            <Header />
            <button
              className="header-hide-btn"
              aria-label="Ocultar header"
              onClick={() => setShowHeader(false)}
            >
              <span style={{fontSize: '1.5rem', display: 'inline-block', transform: 'rotate(90deg)'}}>❮</span>
            </button>
          </div>
        </>
      )}
      {!showHeader && (
        <button
          className="header-show-btn"
          aria-label="Mostrar header"
          onClick={() => setShowHeader(true)}
        >
          <span style={{fontSize: '1.5rem', display: 'inline-block', transform: 'rotate(-90deg)'}}>❯</span>
        </button>
      )}
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
