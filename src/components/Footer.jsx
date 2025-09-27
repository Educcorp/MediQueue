import React from 'react'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaInfoCircle, FaShieldAlt, FaUserShield } from 'react-icons/fa'
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
            <p><FaPhone /> (123) 456-7890</p>
            <p><FaEnvelope /> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=educcorp3@gmail.com&su=Consulta%20MediQueue&body=Hola,%20tengo%20una%20consulta%20sobre%20MediQueue." target="_blank" rel="noopener noreferrer">educcorp3@gmail.com</a></p>
            <p><FaMapMarkerAlt /> Av. Principal 123, Ciudad</p>
          </div>
          
          <div className="footer-section">
            <h4>Horarios</h4>
            <p>Lunes - Viernes: 8:00 - 18:00</p>
            <p>Sábados: 8:00 - 12:00</p>
            <p>Domingos: Cerrado</p>
          </div>
          
          <div className="footer-section">
            <h4>Enlaces</h4>
            <p><a href="/about"><FaInfoCircle /> Acerca de Nosotros</a></p>
            <p><a href="/privacy"><FaShieldAlt /> Política de Privacidad</a></p>
            <p><a href="/admin"><FaUserShield /> Portal de Admin</a></p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 MediQueue. Todos los derechos reservados.</p>
          <p>Desarrollado por <strong>EducCorp</strong></p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
