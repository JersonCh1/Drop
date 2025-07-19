// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface AdminUser {
  username: string;
  role: 'administrator';
  token: string;
}

interface AuthState {
  user: User | null;
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  // Customer Auth
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  
  // Admin Auth
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  
  // Utils
  checkAuth: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  adminUser: null,
  isAuthenticated: false,
  isAdminAuthenticated: false,
  isLoading: true
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Verificar token de usuario regular
      const userToken = localStorage.getItem('authToken');
      if (userToken) {
        try {
          const userData = await authService.verifyToken(userToken);
          setState(prev => ({
            ...prev,
            user: userData,
            isAuthenticated: true
          }));
        } catch (error) {
          // Token inválido
          localStorage.removeItem('authToken');
        }
      }

      // Verificar token de admin
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        try {
          const adminData = await authService.verifyAdminToken(adminToken);
          setState(prev => ({
            ...prev,
            adminUser: {
              username: adminData.username,
              role: adminData.role,
              token: adminToken
            },
            isAdminAuthenticated: true
          }));
        } catch (error) {
          // Token de admin inválido
          localStorage.removeItem('adminToken');
        }
      }

    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await authService.login(email, password);
      
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        setState(prev => ({
          ...prev,
          user: response.user,
          isAuthenticated: true
        }));

        toast.success(`¡Bienvenido/a, ${response.user.firstName}!`, {
          icon: '👋',
          duration: 4000,
        });

        return true;
      } else {
        toast.error(response.message || 'Error al iniciar sesión');
        return false;
      }

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Error de conexión');
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await authService.register(userData);
      
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        setState(prev => ({
          ...prev,
          user: response.user,
          isAuthenticated: true
        }));

        toast.success(`¡Cuenta creada exitosamente! Bienvenido/a, ${response.user.firstName}!`, {
          icon: '🎉',
          duration: 5000,
        });

        return true;
      } else {
        toast.error(response.message || 'Error al registrarse');
        return false;
      }

    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error.message || 'Error de conexión');
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = (): void => {
    localStorage.removeItem('authToken');
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false
    }));

    toast.success('Sesión cerrada correctamente', {
      icon: '👋',
      duration: 3000,
    });
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await authService.adminLogin(username, password);
      
      if (response.success) {
        localStorage.setItem('adminToken', response.token);
        setState(prev => ({
          ...prev,
          adminUser: {
            username: response.user.username,
            role: response.user.role,
            token: response.token
          },
          isAdminAuthenticated: true
        }));

        toast.success(`¡Bienvenido al panel de administración!`, {
          icon: '🔐',
          duration: 4000,
        });

        return true;
      } else {
        toast.error(response.message || 'Credenciales incorrectas');
        return false;
      }

    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.message || 'Error de conexión');
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const adminLogout = (): void => {
    localStorage.removeItem('adminToken');
    setState(prev => ({
      ...prev,
      adminUser: null,
      isAdminAuthenticated: false
    }));

    toast.success('Sesión de administrador cerrada', {
      icon: '🔒',
      duration: 3000,
    });
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          user: response.user
        }));

        toast.success('Perfil actualizado correctamente', {
          icon: '✅',
          duration: 3000,
        });

        return true;
      } else {
        toast.error(response.message || 'Error al actualizar perfil');
        return false;
      }

    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Error de conexión');
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    adminLogin,
    adminLogout,
    checkAuth,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;