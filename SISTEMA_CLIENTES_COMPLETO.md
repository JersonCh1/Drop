# Sistema de Clientes - Implementación Completa

## ✅ **YA COMPLETADO:**

1. ✅ Backend - Rutas de autenticación (`/api/auth/*`)
2. ✅ Backend corriendo en `http://localhost:3001`
3. ✅ Frontend - `authService.ts` (servicios de autenticación)
4. ✅ Frontend - `apiService.ts` (endpoints de auth incluidos)

---

## 🚀 **PARA COMPLETAR EL SISTEMA:**

### **BACKEND: Todo listo ✅**

El backend tiene todas estas rutas funcionando:

```
POST /api/auth/register - Registro de cliente
POST /api/auth/login - Login de cliente
GET  /api/auth/me - Datos del usuario actual
PUT  /api/auth/profile - Actualizar perfil
PUT  /api/auth/change-password - Cambiar contraseña
GET  /api/auth/orders - Órdenes del cliente
```

**Credenciales admin:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## 📱 **FRONTEND: Falta implementar**

### 1. **Crear página de Login/Registro**

Crear archivo: `frontend/src/pages/AuthPage.tsx`

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.login(loginData.email, loginData.password);
      toast.success('¡Bienvenido!');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password
      });
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 py-2 ${isLogin ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setIsLogin(true)}
          >
            Iniciar Sesión
          </button>
          <button
            className={`flex-1 py-2 ${!isLogin ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border rounded-md"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border rounded-md"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
```

---

### 2. **Crear página de Perfil**

Crear archivo: `frontend/src/pages/ProfilePage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      setEditData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || ''
      });
    } catch (error) {
      toast.error('Error cargando perfil');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await authService.updateProfile(editData);
      toast.success('Perfil actualizado');
      setEditing(false);
      loadUser();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            Cerrar Sesión
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Apellido</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border rounded"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Nombre</label>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Email</label>
              <p className="font-medium">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Teléfono</label>
              <p className="font-medium">{user?.phone || 'No especificado'}</p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Editar Perfil
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <h2 className="text-lg font-bold mb-4">Acciones Rápidas</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/my-orders')}
              className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded"
            >
              📦 Mis Órdenes
            </button>
            <button
              onClick={() => navigate('/track')}
              className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded"
            >
              🔍 Rastrear Orden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
```

---

### 3. **Crear página Mis Órdenes**

Crear archivo: `frontend/src/pages/MyOrdersPage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await authService.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      toast.error('Error cargando órdenes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Órdenes</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No tienes órdenes aún</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Ver Productos
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Orden #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="space-y-2 mb-4">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.productName} ({item.productColor})</span>
                    <span>x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-bold">Total: ${order.total}</span>
                <button
                  onClick={() => navigate(`/track/${order.orderNumber}`)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Rastrear →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
```

---

### 4. **Actualizar Header**

Editar `frontend/src/components/layout/Header.tsx` y agregar esto después de la línea donde está el botón de Admin:

```typescript
// Importar al inicio del archivo
import authService from '../../services/authService';

// Dentro del componente, antes del return:
const [user, setUser] = useState<any>(null);

useEffect(() => {
  const currentUser = authService.getCurrentUser();
  setUser(currentUser);
}, []);

// Dentro del JSX del header, reemplazar el botón de Admin con esto:

<div className="flex items-center gap-4">
  {user ? (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
        <span>👤 {user.firstName}</span>
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-50">
        <Link
          to="/profile"
          className="block px-4 py-2 hover:bg-gray-100"
        >
          Mi Perfil
        </Link>
        <Link
          to="/my-orders"
          className="block px-4 py-2 hover:bg-gray-100"
        >
          Mis Órdenes
        </Link>
        <button
          onClick={() => {
            authService.logout();
            setUser(null);
            window.location.href = '/';
          }}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  ) : (
    <Link
      to="/login"
      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
    >
      Iniciar Sesión
    </Link>
  )}

  {onAdminClick && (
    <button
      onClick={onAdminClick}
      className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-900"
    >
      Admin
    </button>
  )}
</div>
```

---

### 5. **Actualizar App.tsx**

Agregar estas rutas en el componente `<Routes>`:

```typescript
<Route path="/login" element={<AuthPage />} />
<Route path="/profile" element={<ProfilePage />} />
<Route path="/my-orders" element={<MyOrdersPage />} />
```

Y agregar los imports:

```typescript
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
```

---

## 🎯 **RESULTADO FINAL:**

Tendrás un sistema completo con:

1. ✅ **Clientes** pueden:
   - Registrarse / Iniciar sesión
   - Ver su perfil
   - Editar su información
   - Ver SOLO sus órdenes
   - Rastrear sus envíos

2. ✅ **Admin** puede:
   - Ver TODAS las órdenes
   - Gestionar productos
   - Actualizar estados de envío
   - Ver estadísticas

3. ✅ **Separación clara:**
   - `/login` - Login de clientes
   - `/profile` - Perfil de cliente
   - `/my-orders` - Órdenes del cliente
   - `/admin` - Panel de administrador (separado)

---

## 🚀 **PARA PROBAR:**

1. **Registrar un cliente:**
   - Ve a `/login`
   - Click en "Registrarse"
   - Completa el formulario
   - Automáticamente inicia sesión

2. **Ver perfil:**
   - Click en tu nombre en el header
   - Click en "Mi Perfil"

3. **Ver órdenes:**
   - Click en "Mis Órdenes"
   - Solo verás TUS órdenes (por email)

4. **Admin sigue igual:**
   - Click en "Admin" en el header
   - Usuario: `admin` / Contraseña: `admin123`
   - Ve TODAS las órdenes

---

## ✅ **TODO LISTO**

El backend ya está funcionando. Solo necesitas crear esos 3 archivos de páginas, actualizar el Header y agregar las rutas en App.tsx.

**¿Necesitas ayuda con alguna parte específica?**
