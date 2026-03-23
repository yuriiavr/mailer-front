import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = useCallback(() => {
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
    }, []);

    const value = useMemo(() => ({
        isAuthenticated,
        login,
        logout,
    }), [isAuthenticated, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};