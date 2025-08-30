import React from 'react'
import '../styles/Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>MediQueue</h3>
            <p>Sistema de gestión de turnos médicos</p>
          </div>
          
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>📞 (123) 456-7890</p>
            <p>📧 info@mediqueue.com</p>
            <p>📍 Av. Principal 123, Ciudad</p>
          </div>
          
          <div className="footer-section">
            <h4>Horarios</h4>
            <p>Lunes - Viernes: 8:00 - 18:00</p>
            <p>Sábados: 8:00 - 12:00</p>
            <p>Domingos: Cerrado</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 MediQueue. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
