import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardDemo.css';
import {
  FaArrowRight,
  FaDesktop,
  FaMobile,
  FaPalette,
  FaChartLine,
  FaUsers,
  FaCalendarCheck,
  FaCog
} from 'react-icons/fa';

const DashboardDemo = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-demo">
      <div className="demo-container">
        <div className="demo-header">
          <h1 className="demo-title">
            🚀 Nuevo Dashboard MediQueue
          </h1>
          <p className="demo-subtitle">
            Diseño completamente rediseñado con interfaz moderna, manteniendo la identidad visual médica
          </p>
        </div>

        <div className="demo-comparison">
          <div className="demo-card classic">
            <div className="demo-card-header">
              <h3>Dashboard Clásico</h3>
              <span className="demo-tag legacy">Anterior</span>
            </div>
            <div className="demo-features">
              <div className="demo-feature">
                <FaDesktop /> Diseño tradicional
              </div>
              <div className="demo-feature">
                <FaChartLine /> Estadísticas básicas
              </div>
              <div className="demo-feature">
                <FaCog /> Funcionalidad completa
              </div>
            </div>
            <button 
              className="demo-btn secondary"
              onClick={() => navigate('/admin/dashboard-classic')}
            >
              Ver Dashboard Clásico <FaArrowRight />
            </button>
          </div>

          <div className="demo-card modern">
            <div className="demo-card-header">
              <h3>Dashboard Moderno</h3>
              <span className="demo-tag new">Nuevo</span>
            </div>
            <div className="demo-features">
              <div className="demo-feature">
                <FaPalette /> Glassmorphism elegante
              </div>
              <div className="demo-feature">
                <FaMobile /> Completamente responsive
              </div>
              <div className="demo-feature">
                <FaUsers /> Experiencia mejorada
              </div>
              <div className="demo-feature">
                <FaCalendarCheck /> Métricas visuales
              </div>
            </div>
            <button 
              className="demo-btn primary"
              onClick={() => navigate('/admin/dashboard')}
            >
              Explorar Nuevo Dashboard <FaArrowRight />
            </button>
          </div>
        </div>

        <div className="demo-highlights">
          <h3>✨ Novedades del Diseño Moderno:</h3>
          <div className="highlights-grid">
            <div className="highlight-item">
              <div className="highlight-icon primary">
                <FaPalette />
              </div>
              <div className="highlight-content">
                <h4>Header Rediseñado</h4>
                <p>Navegación intuitiva con búsqueda integrada y perfil de usuario mejorado</p>
              </div>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon success">
                <FaChartLine />
              </div>
              <div className="highlight-content">
                <h4>Tarjetas Estadísticas</h4>
                <p>Visualización moderna de métricas con indicadores de crecimiento y tendencias</p>
              </div>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon info">
                <FaUsers />
              </div>
              <div className="highlight-content">
                <h4>Actividad en Tiempo Real</h4>
                <p>Panel de actividad reciente y acciones rápidas para mayor productividad</p>
              </div>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon warning">
                <FaMobile />
              </div>
              <div className="highlight-content">
                <h4>Diseño Responsive</h4>
                <p>Perfecto funcionamiento en desktop, tablet y dispositivos móviles</p>
              </div>
            </div>
          </div>
        </div>

        <div className="demo-footer">
          <p>
            <strong>Nota:</strong> Ambas versiones mantienen toda la funcionalidad. 
            El dashboard clásico permanece disponible en <code>/admin/dashboard-classic</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemo;
