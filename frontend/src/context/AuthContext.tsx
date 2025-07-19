// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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
          // Aquí verificarías el token con el servidor
          console.log('Token encontrado:', userToken);
        } catch (error) {
          localStorage.removeItem('authToken');
        }
      }

      // Verificar token de admin
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        try {
          setState(prev => ({
            ...prev,
            adminUser: {
              username: 'admin',
              role: 'administrator',
              token: adminToken
            },
            isAdminAuthenticated: true
          }));
        } catch (error) {
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

      // Simulación de login - reemplaza con llamada real a API
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('authToken', result.token);
        setState(prev => ({
          ...prev,
          user: result.user,
          isAuthenticated: true
        }));

        toast.success(`¡Bienvenido/a, ${result.user.firstName}!`, {
          icon: '👋',
          duration: 4000,
        });

        return true;
      } else {
        toast.error('Credenciales incorrectas');
        return false;
      }

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Error de conexión');
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('authToken', result.token);
        setState(prev => ({
          ...prev,
          user: result.user,
          isAuthenticated: true
        }));

        toast.success(`¡Cuenta creada exitosamente! Bienvenido/a, ${result.user.firstName}!`, {
          icon: '🎉',
          duration: 5000,
        });

        return true;
      } else {
        toast.error('Error al registrarse');
        return false;
      }

    } catch (error: any) {
      console.error('Register error:', error);
      toast.error('Error de conexión');
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

      const response = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('adminToken', result.token);
        setState(prev => ({
          ...prev,
          adminUser: {
            username: result.user.username,
            role: result.user.role,
            token: result.token
          },
          isAdminAuthenticated: true
        }));

        toast.success(`¡Bienvenido al panel de administración!`, {
          icon: '🔐',
          duration: 4000,
        });

        return true;
      } else {
        toast.error('Credenciales incorrectas');
        return false;
      }

    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error('Error de conexión');
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

      // Simulación - reemplaza con llamada real a API
      toast.success('Perfil actualizado correctamente', {
        icon: '✅',
        duration: 3000,
      });

      return true;

    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error('Error de conexión');
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