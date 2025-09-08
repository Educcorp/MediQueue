import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

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
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('auth_user');
                        localStorage.removeItem('auth_remember');
                        sessionStorage.removeItem('auth_token');
                        sessionStorage.removeItem('auth_user');
                    }
                }
            } catch (error) {
                console.error('Error verificando estado de autenticación:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_remember');
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_user');
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Función para iniciar sesión
    const login = async (email, password, remember = false) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.login(email, password);

            // Guardar token y datos del usuario
            // Si "recordarme" está activado, usar localStorage, sino sessionStorage
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('auth_token', response.token);
            storage.setItem('auth_user', JSON.stringify(response.user));

            // También guardar la preferencia de "recordarme"
            if (remember) {
                localStorage.setItem('auth_remember', 'true');
            } else {
                localStorage.removeItem('auth_remember');
            }

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
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_remember');
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_user');
            setUser(null);
        }
    };

    // Función para actualizar datos del usuario
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    };

    // Limpiar error
    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        updateUser,
        clearError,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
