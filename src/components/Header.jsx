import React from 'react'
import '../styles/Header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <a href="/" className="logo">
            Medi<span>Queue</span>
          </a>
          
          <nav className="nav">
            <a href="/" className="nav-link">Inicio</a>
            <a href="/turnos" className="nav-link">Mis Turnos</a>
            <a href="/especialidades" className="nav-link">Especialidades</a>
            <a href="/perfil" className="nav-link">Mi Perfil</a>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
