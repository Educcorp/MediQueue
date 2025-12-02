import React, { useState, useEffect } from 'react'
import { FaBars, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa'
import '../styles/Header.css'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Auto-ocultar header después de 10 segundos
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 10000)

    return () => clearTimeout(hideTimer)
  }, [isVisible])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Botón flotante para mostrar/ocultar header */}
      <button 
        className={`header-toggle-button ${isVisible ? 'hidden' : ''}`}
        onClick={toggleVisibility}
        aria-label="Mostrar menú"
        title="Ver turnos"
      >
        {isVisible ? <FaEyeSlash /> : <FaEye />}
      </button>

      <header className={`header ${isVisible ? 'visible' : 'hidden'} ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <a href="/" className="logo" onClick={handleLinkClick}>
              Medi<span>Queue</span>
            </a>
            
            <button 
              className="hamburger-menu" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            <nav className={`nav ${isOpen ? 'open' : ''}`}>
              <a href="/" className="nav-link" onClick={handleLinkClick}>Inicio</a>
              <a href="/tomar-turnos" className="nav-link" onClick={handleLinkClick}>Tomar Turno</a>
              <a href="/turnos" className="nav-link" onClick={handleLinkClick}>Mis Turnos</a>
              <a href="/admin/login" className="nav-link admin-link" onClick={handleLinkClick}>Admin</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Overlay para cerrar el menú en móvil */}
      {isOpen && <div className="nav-overlay" onClick={toggleMenu}></div>}
    </>
  )
}

export default Header
