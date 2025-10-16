import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import ImprovedAdminDashboard from '../components/admin/ImprovedAdminDashboard';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminAccess = useCallback(async () => {
    try {
      if (!authService.isAuthenticated()) {
        toast.error('Debes iniciar sesión');
        navigate('/login');
        return;
      }

      const userData = await authService.getMe();

      if (userData.role !== 'ADMIN') {
        toast.error('No tienes permisos de administrador');
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      toast.error('Error verificando permisos');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Usar el token de autenticación normal (no adminToken separado)
  const token = authService.getToken();

  console.log('🔑 Token para dashboard:', token);

  return (
    <ImprovedAdminDashboard
      onClose={handleClose}
      adminToken={token || ''}
    />
  );
};

export default AdminPage;
