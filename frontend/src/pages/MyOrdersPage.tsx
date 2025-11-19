import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  productName: string;
  variantName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  trackingCode: string | null;
  createdAt: string;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
}

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authService.getMyOrders(page, 10);
      setOrders(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setOrders([]);
      toast.error(error.message || 'Error cargando órdenes');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error('Debes iniciar sesión');
      navigate('/login');
      return;
    }

    loadOrders();
  }, [navigate, loadOrders]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Procesando' },
      SHIPPED: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Enviado' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregado' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Órdenes</h1>
        <Link
          to="/profile"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Volver al Perfil
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">No tienes órdenes aún</h2>
          <p className="text-gray-600 mb-6">
            Comienza a comprar y tus órdenes aparecerán aquí
          </p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver Productos
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">Orden #{order.orderNumber}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Fecha: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Productos:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center py-2 border-b last:border-b-0"
                        >
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-600">{item.variantName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {item.quantity} x {formatPrice(item.price)}
                            </p>
                            <p className="text-sm text-gray-600">
                              = {formatPrice(item.quantity * item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Dirección de envío:</p>
                      <p className="font-medium">{order.shippingAddress}</p>
                    </div>
                    {order.trackingCode && (
                      <div>
                        <p className="text-sm text-gray-600">Código de rastreo:</p>
                        <p className="font-mono font-medium">{order.trackingCode}</p>
                      </div>
                    )}
                  </div>

                  {order.trackingCode && (
                    <Link
                      to={`/track/${order.trackingCode}`}
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      🔍 Rastrear Envío
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Anterior
              </button>
              <span className="px-4 py-2">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyOrdersPage;
