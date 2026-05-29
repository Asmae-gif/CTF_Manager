// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredToken, setStoredToken } from '../api/client';
import {
    login as apiLogin,
    logout as apiLogout,
    register as apiRegister,
    me,
    AuthUser,
    ApiAuthResponse,
    LoginCredentials,
    RegisterData,
} from '../api/auth';

interface AuthContextType {
    user: AuthUser | null;
    login: (credentials: LoginCredentials) => Promise<ApiAuthResponse>;
    register: (payload: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Au démarrage : si token existe, charger le user
    useEffect(() => {
        const token = getStoredToken();
        if (token) {
            me()
                .then(data => setUser(data as AuthUser))
                .catch(() => setStoredToken(null))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const res = await apiLogin(credentials);
            setUser(res.user);
            console.log('✅ Login successful. User:', res.user);
            return res;
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    };

    const register = async (payload: RegisterData) => {
        const res = await apiRegister(payload);
        setUser(res.user);
    };

    const logout = async () => {
        await apiLogout(); // appelle POST /auth/logout + setStoredToken(null)
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
