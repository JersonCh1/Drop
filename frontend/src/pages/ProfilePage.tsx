import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const loadUser = useCallback(async () => {
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
      authService.logout();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error('Debes iniciar sesión');
      navigate('/login');
      return;
    }

    loadUser();
  }, [navigate, loadUser]);

  const handleSave = async () => {
    try {
      await authService.updateProfile(editData);
      toast.success('Perfil actualizado exitosamente');
      setEditing(false);
      loadUser();
    } catch (error: any) {
      toast.error(error.message || 'Error actualizando perfil');
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Cerrar Sesión
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                <p className="font-medium text-lg">{user?.firstName} {user?.lastName}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <p className="font-medium text-lg">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                <p className="font-medium text-lg">{user?.phone || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Rol</label>
                <p className="font-medium text-lg capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Editar Perfil
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              to="/my-orders"
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="text-2xl">📦</span>
              <div>
                <div className="font-medium">Mis Órdenes</div>
                <div className="text-sm text-gray-600">Ver historial de compras</div>
              </div>
            </Link>

            <Link
              to="/track"
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="text-2xl">🔍</span>
              <div>
                <div className="font-medium">Rastrear Orden</div>
                <div className="text-sm text-gray-600">Seguimiento de envíos</div>
              </div>
            </Link>

            <Link
              to="/products"
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="text-2xl">🛍️</span>
              <div>
                <div className="font-medium">Productos</div>
                <div className="text-sm text-gray-600">Ver catálogo</div>
              </div>
            </Link>

            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="text-2xl">🏠</span>
              <div>
                <div className="font-medium">Inicio</div>
                <div className="text-sm text-gray-600">Volver a la tienda</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
