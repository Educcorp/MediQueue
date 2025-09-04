import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TakeTurn from './pages/TakeTurn'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsersPage from './pages/AdminUsersPage'
import TurnManager from './components/Admin/TurnManager'
import ProtectedRoute from './components/Common/ProtectedRoute'
import './styles/App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Ruta pública principal */}
        <Route path="/" element={<HomePage />} />

        {/* Ruta para tomar turnos */}
        <Route path="/tomar-turno" element={<TakeTurn />} />

        {/* Rutas de administración */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
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
    </div>
  )
}

export default App
