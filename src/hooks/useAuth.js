import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Hook personalizado para autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }

    return context;
};

// Hook para verificar permisos específicos
export const usePermissions = () => {
    const { user, isSuperAdmin, isSupervisorOrAdmin } = useAuth();

    const hasPermission = (permission) => {
        if (!user) return false;

        switch (permission) {
            case 'admin':
                return isSuperAdmin();
            case 'supervisor':
                return isSupervisorOrAdmin();
            case 'manage_users':
                return isSuperAdmin();
            case 'manage_turns':
                return isSupervisorOrAdmin();
            case 'view_statistics':
                return isSupervisorOrAdmin();
            case 'manage_areas':
                return isSupervisorOrAdmin();
            case 'manage_consultorios':
                return isSupervisorOrAdmin();
            default:
                return false;
        }
    };

    const canAccess = (route) => {
        if (!user) return false;

        const routePermissions = {
            '/admin/dashboard': ['supervisor'],
            '/admin/turns': ['supervisor'],
            '/admin/users': ['admin'],
            '/admin/areas': ['supervisor'],
            '/admin/consultorios': ['supervisor'],
            '/admin/statistics': ['supervisor'],
            '/admin/settings': ['admin']
        };

        const requiredPermissions = routePermissions[route];
        if (!requiredPermissions) return true; // Ruta pública

        return requiredPermissions.some(permission => hasPermission(permission));
    };

    return {
        hasPermission,
        canAccess,
        isAdmin: isSuperAdmin(),
        isSupervisor: isSupervisorOrAdmin(),
        user
    };
};

// Hook para manejo de sesión
export const useSession = () => {
    const { user, loading, error, login, loginByUsuario, logout, updateUser, changePassword } = useAuth();

    const loginWithEmail = async (email, password, remember = false) => {
        try {
            const result = await login(email, password, remember);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const loginWithUsuario = async (usuario, password, remember = false) => {
        try {
            const result = await loginByUsuario(usuario, password, remember);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const updateProfile = async (userData) => {
        try {
            const result = await updateUser(userData);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const changeUserPassword = async (currentPassword, newPassword) => {
        try {
            const result = await changePassword(currentPassword, newPassword);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const logoutUser = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        loginWithEmail,
        loginWithUsuario,
        updateProfile,
        changeUserPassword,
        logoutUser
    };
};

export default useAuth;