import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verificar si hay un usuario autenticado al cargar la aplicación
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Verificar tanto localStorage como sessionStorage
                let token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
                let savedUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');

                if (token && savedUser) {
                    // Verificar que el token sea válido
                    const isValid = await authService.verifyToken();
                    if (isValid) {
                        setUser(JSON.parse(savedUser));
                    } else {
                        // Token inválido, limpiar datos de ambos storages
                        authService.clearAuthData();
                    }
                }
            } catch (error) {
                console.error('Error verificando estado de autenticación:', error);
                authService.clearAuthData();
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Función para iniciar sesión por email
    const login = async (email, password, remember = false) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.login(email, password);

            // Guardar datos de autenticación
            authService.saveAuthData(response, remember);
            setUser(response.user);
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Función para iniciar sesión por nombre de usuario
    const loginByUsuario = async (usuario, password, remember = false) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.loginByUsuario(usuario, password);

            // Guardar datos de autenticación
            authService.saveAuthData(response, remember);
            setUser(response.user);
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Función para cerrar sesión
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            // Limpiar datos locales de ambos storages independientemente del resultado
            authService.clearAuthData();
            setUser(null);
        }
    };

    // Función para actualizar datos del usuario
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        const remember = localStorage.getItem('auth_remember') === 'true';
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('auth_user', JSON.stringify(updatedUser));
    };

    // Función para login rápido (sin contraseña) - usado en recuperación
    const quickLogin = (authData, remember = true) => {
        try {
            // Guardar datos de autenticación usando el servicio
            authService.saveAuthData(authData, remember);
            // Actualizar el estado del usuario en el contexto
            setUser(authData.user);
            return { success: true };
        } catch (error) {
            console.error('Error en quick login:', error);
            return { success: false, message: 'Error al iniciar sesión' };
        }
    };

    // Función para cambiar contraseña
    const changePassword = async (passwordActual, passwordNuevo) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.changePassword(passwordActual, passwordNuevo);
            return { success: true, data: response };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener estadísticas del usuario
    const getEstadisticas = async () => {
        try {
            const response = await authService.getEstadisticas();
            return { success: true, data: response };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener estadísticas';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    // Limpiar error
    const clearError = () => {
        setError(null);
    };

    // Verificar si el usuario está autenticado
    const isAuthenticated = () => {
        return authService.isAuthenticated();
    };

    // Obtener usuario actual
    const getCurrentUser = () => {
        return authService.getCurrentUser();
    };

    // Verificar si es administrador principal
    const isSuperAdmin = () => {
        return authService.isSuperAdmin();
    };

    // Verificar si es supervisor o administrador
    const isSupervisorOrAdmin = () => {
        return authService.isSupervisorOrAdmin();
    };

    const value = {
        user,
        loading,
        error,
        login,
        loginByUsuario,
        quickLogin,
        logout,
        updateUser,
        changePassword,
        getEstadisticas,
        clearError,
        isAuthenticated: isAuthenticated(),
        getCurrentUser,
        isSuperAdmin,
        isSupervisorOrAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};