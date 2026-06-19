import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthService } from '../services/AuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al montar, restaurar sesión desde localStorage (si existe y es válida)
    useEffect(() => {
        const savedUser = AuthService.getCurrentUser();
        if (savedUser) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    // Inicia sesión con el backend real mediante JWT
    const login = async (correo, password) => {
        const userData = await AuthService.login(correo, password);
        setUser(userData);
        return userData;
    };

    // Cierra sesión limpiando el estado y el localStorage
    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
