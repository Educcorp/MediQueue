import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TakeTurn from './pages/TakeTurn'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ModernAdminDashboard from './pages/ModernAdminDashboard'
import DashboardDemo from './components/Common/DashboardDemo'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminSettingsPage from './pages/AdminSettingsPage'
import ConsultorioManagement from './pages/ConsultorioManagement'
import PatientManagement from './pages/PatientManagement'
import StatisticsPage from './pages/StatisticsPage'
import TurnManager from './components/Admin/TurnManager'
import ProtectedRoute from './components/Common/ProtectedRoute'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AboutPage from './pages/AboutPage'
import CookieBanner from './components/Common/CookieBanner'
import Chatbot from './components/Common/Chatbot'
import './styles/App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Ruta pública principal */}
        <Route path="/" element={<HomePage />} />

        {/* Ruta para tomar turnos */}
        <Route path="/tomar-turno" element={<TakeTurn />} />

        {/* Rutas públicas de privacidad y cookies */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/equipo" element={<AboutPage />} />

        {/* Rutas de administración */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/demo" element={<DashboardDemo />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <ModernAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard-classic"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Ruta para gestión de usuarios administradores */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta para gestión de turnos */}
        <Route
          path="/admin/turns"
          element={
            <ProtectedRoute>
              <TurnManager />
            </ProtectedRoute>
          }
        />

        {/* Ruta para gestión de consultorios */}
        <Route
          path="/admin/consultorios"
          element={
            <ProtectedRoute>
              <ConsultorioManagement />
            </ProtectedRoute>
          }
        />

        {/* Ruta para gestión de pacientes */}
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute>
              <PatientManagement />
            </ProtectedRoute>
          }
        />

        {/* Ruta para estadísticas */}
        <Route
          path="/admin/statistics"
          element={
            <ProtectedRoute>
              <StatisticsPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta para configuración */}
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta 404 - Página no encontrada */}
        <Route
          path="*"
          element={
            <div style={{
              padding: '40px',
              textAlign: 'center',
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
              <h2>404 - Página no encontrada</h2>
              <p>La página que buscas no existe.</p>
              <button onClick={() => window.location.href = '/'}>
                Ir al inicio
              </button>
            </div>
          }
        />
      </Routes>

      {/* Cookie Banner - Se muestra globalmente */}
      <CookieBanner />

      {/* Chatbot Médico - Asistente virtual disponible en toda la aplicación */}
      <Chatbot />
    </div>
  )
}

export default App
