// frontend/src/services/authService.ts
import { authApi } from './apiService';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  message?: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  user: {
    username: string;
    role: string;
  };
  message?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

class AuthService {
  private tokenKey = 'authToken';
  private adminTokenKey = 'adminToken';
  private userKey = 'user';

  // Customer Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await authApi.login(email, password);
      console.log('📡 Respuesta de login:', response);

      // El backend retorna { success: true, token: '...', user: {...} }
      if (response.success) {
        const token = response.token || (response.data as any)?.token;
        const user = response.user || (response.data as any)?.user;

        if (token && user) {
          // Store token and user data
          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem(this.userKey, JSON.stringify(user));
          console.log('✅ Token y usuario guardados');

          return {
            success: true,
            token,
            user
          };
        }
      }

      throw new Error(response.message || 'Error en el login');
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    try {
      const response = await authApi.register(userData);
      console.log('📡 Respuesta de registro:', response);

      // Verificar si hay token y user en response o en response.data
      if (response.success) {
        const token = response.token || (response.data as any)?.token;
        const user = response.user || (response.data as any)?.user;

        if (token && user) {
          // Store token and user data
          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem(this.userKey, JSON.stringify(user));
          console.log('✅ Registro exitoso - Token y usuario guardados');

          return {
            success: true,
            token,
            user
          };
        }
      }

      throw new Error(response.message || 'Error en el registro');
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      // Set token temporarily for verification
      localStorage.setItem(this.tokenKey, token);

      const response = await authApi.verifyToken();

      if (response.success) {
        return (response.data as any).user;
      }

      throw new Error('Token inválido');
    } catch (error) {
      // Restore original token on error
      const originalToken = localStorage.getItem(this.tokenKey);
      if (originalToken) {
        localStorage.setItem(this.tokenKey, originalToken);
      } else {
        localStorage.removeItem(this.tokenKey);
      }
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    // Optionally call logout endpoint
    authApi.logout().catch(console.error);
  }

  // Admin Authentication
  async adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
    try {
      const response = await authApi.adminLogin(username, password);

      if (response.success && response.data) {
        // Store admin token
        localStorage.setItem(this.adminTokenKey, (response.data as any).token);

        return {
          success: true,
          token: (response.data as any).token,
          user: (response.data as any).user
        };
      }
      
      throw new Error(response.message || 'Credenciales incorrectas');
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async verifyAdminToken(token: string): Promise<any> {
    try {
      // Set admin token temporarily for verification
      localStorage.setItem(this.adminTokenKey, token);

      const response = await authApi.verifyAdminToken();

      if (response.success) {
        return (response.data as any).user;
      }

      throw new Error('Token de admin inválido');
    } catch (error) {
      // Restore original token on error
      const originalToken = localStorage.getItem(this.adminTokenKey);
      if (originalToken) {
        localStorage.setItem(this.adminTokenKey, originalToken);
      } else {
        localStorage.removeItem(this.adminTokenKey);
      }
      throw error;
    }
  }

  adminLogout(): void {
    localStorage.removeItem(this.adminTokenKey);
  }

  // Profile Management
  async getMe(): Promise<any> {
    try {
      const response = await authApi.getMe();
      console.log('📡 Respuesta de getMe:', response);

      // El backend retorna { success: true, user: {...} }
      if (response.success) {
        const user = response.user || (response.data as any)?.user;

        if (user) {
          // Update stored user data
          localStorage.setItem(this.userKey, JSON.stringify(user));
          console.log('✅ Usuario guardado en localStorage:', user);
          return user;
        }
      }

      throw new Error(response.message || 'Error obteniendo usuario');
    } catch (error: any) {
      console.error('❌ Error en getMe:', error);
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async updateProfile(userData: any): Promise<{ success: boolean; user: any; message?: string }> {
    try {
      const response = await authApi.updateProfile(userData);

      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem(this.userKey, JSON.stringify((response.data as any).user));

        return {
          success: true,
          user: (response.data as any).user
        };
      }

      throw new Error(response.message || 'Error actualizando perfil');
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async getMyOrders(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const response = await authApi.getMyOrders(page, limit);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || 'Error obteniendo órdenes');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await authApi.updatePassword({
        currentPassword,
        newPassword
      });

      return {
        success: response.success,
        message: response.message
      };
    } catch (error: any) {
      throw new Error(error.message || 'Error cambiando contraseña');
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await authApi.resetPassword(email);
      
      return {
        success: response.success,
        message: response.message || 'Instrucciones enviadas a tu email'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Error enviando reset');
    }
  }

  // Token Management
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getAdminToken(): string | null {
    return localStorage.getItem(this.adminTokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  isAdminAuthenticated(): boolean {
    const token = this.getAdminToken();
    return !!token; // Admin tokens are simple for now
  }

  getCurrentUser(): any {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Permission checks
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Basic role-based permissions
    switch (user.role) {
      case 'SUPER_ADMIN':
        return true;
      case 'ADMIN':
        return ['read_orders', 'write_orders', 'read_products', 'write_products'].includes(permission);
      case 'CUSTOMER':
        return ['read_profile', 'write_profile', 'read_orders'].includes(permission);
      default:
        return false;
    }
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'SUPER_ADMIN';
  }

  // Auth state management
  onAuthStateChange(callback: (authenticated: boolean, user: any) => void): () => void {
    // Listen for storage changes to detect auth changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === this.tokenKey || e.key === this.userKey) {
        const isAuth = this.isAuthenticated();
        const user = this.getCurrentUser();
        callback(isAuth, user);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  // Session management
  refreshSession(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isAuthenticated()) {
        reject(new Error('No hay sesión activa'));
        return;
      }

      // For now, just verify the current token
      this.verifyToken(this.getToken()!)
        .then(() => resolve())
        .catch(reject);
    });
  }

  // Clear all auth data
  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.adminTokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Development helpers
  getAuthInfo(): any {
    return {
      token: this.getToken(),
      adminToken: this.getAdminToken(),
      user: this.getCurrentUser(),
      isAuthenticated: this.isAuthenticated(),
      isAdminAuthenticated: this.isAdminAuthenticated(),
    };
  }
}

const authService = new AuthService();
export default authService;