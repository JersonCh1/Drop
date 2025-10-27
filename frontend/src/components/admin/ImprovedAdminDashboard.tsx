// frontend/src/components/admin/ImprovedAdminDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductsManager from './ProductsManager';
import SuppliersManager from './SuppliersManager';
import ProductImporter from './ProductImporter';
import AnalyticsDashboard from './AnalyticsDashboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface Order {
  id: string;
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

interface AdminDashboardProps {
  onClose: () => void;
  adminToken: string;
}

const ImprovedAdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, adminToken }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'products' | 'suppliers' | 'import'>('analytics');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (response.data.success) {
        const ordersData = response.data.data;
        setOrders(ordersData);

        // Calcular estadísticas
        const total = ordersData.length;
        const revenue = ordersData.reduce((sum: number, order: Order) => sum + order.total, 0);
        const pending = ordersData.filter((o: Order) => o.status === 'PENDING').length;
        const completed = ordersData.filter((o: Order) => o.status === 'DELIVERED').length;

        setStats({
          totalOrders: total,
          totalRevenue: revenue,
          pendingOrders: pending,
          completedOrders: completed
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      toast.success(`Estado actualizado a ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-300',
      'PROCESSING': 'bg-purple-100 text-purple-800 border-purple-300',
      'SHIPPED': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-300',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'PROCESSING': 'En Proceso',
      'SHIPPED': 'Enviada',
      'DELIVERED': 'Entregada',
      'CANCELLED': 'Cancelada'
    };
    return texts[status] || status;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-500">Gestiona tu tienda</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analytics</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Órdenes</span>
                {stats.pendingOrders > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.pendingOrders}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Productos</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('suppliers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'suppliers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Proveedores</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Importar</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <AnalyticsDashboard />
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pendientes</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completadas</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedOrders}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Todas las Órdenes</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                              >
                                {order.orderNumber}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.customerFirstName} {order.customerLastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.customerEmail}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${order.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)} cursor-pointer`}
                              >
                                <option value="PENDING">Pendiente</option>
                                <option value="CONFIRMED">Confirmada</option>
                                <option value="PROCESSING">En Proceso</option>
                                <option value="SHIPPED">Enviada</option>
                                <option value="DELIVERED">Entregada</option>
                                <option value="CANCELLED">Cancelada</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Ver Detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <ProductsManager adminToken={adminToken} />
            )}

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
              <SuppliersManager />
            )}

            {/* Import Tab */}
            {activeTab === 'import' && (
              <ProductImporter />
            )}
          </>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSelectedOrder(null)}></div>

            <div className="relative bg-white rounded-lg max-w-4xl w-full shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">{selectedOrder.orderNumber}</h3>
                    <p className="text-blue-100 mt-1">
                      {new Date(selectedOrder.createdAt).toLocaleString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 hover:bg-blue-800 rounded text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Información del Cliente */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h4 className="font-semibold text-blue-900">Información del Cliente</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Nombre completo:</span>
                        <p className="font-medium text-gray-900">{selectedOrder.customerFirstName} {selectedOrder.customerLastName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium text-gray-900">{selectedOrder.customerEmail}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Teléfono:</span>
                        <p className="font-medium text-gray-900">{(selectedOrder as any).customerPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dirección de Envío */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h4 className="font-semibold text-green-900">Dirección de Envío</h4>
                    </div>
                    <div className="text-sm text-gray-900">
                      <p className="font-medium">{(selectedOrder as any).shippingAddress}</p>
                      <p>{(selectedOrder as any).shippingCity}, {(selectedOrder as any).shippingState}</p>
                      <p>CP: {(selectedOrder as any).shippingPostalCode}</p>
                      <p className="font-medium mt-1">{(selectedOrder as any).shippingCountry}</p>
                      {(selectedOrder as any).notes && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <span className="text-gray-600">Notas:</span>
                          <p className="text-gray-700">{(selectedOrder as any).notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estado y Método de Pago */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="font-semibold text-purple-900">Estado</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Estado de la orden:</span>
                        <p className="font-medium"><span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusText(selectedOrder.status)}
                        </span></p>
                      </div>
                      <div>
                        <span className="text-gray-600">Estado del pago:</span>
                        <p className="font-medium text-gray-900">{selectedOrder.paymentStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-cyan-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <h4 className="font-semibold text-cyan-900">Método de Pago</h4>
                    </div>
                    <div className="text-sm">
                      <div className="mb-2">
                        <span className="text-gray-600">Método:</span>
                        <p className="font-medium text-gray-900 capitalize">
                          {(selectedOrder as any).paymentMethod === 'yape' && '📱 Yape'}
                          {(selectedOrder as any).paymentMethod === 'plin' && '💸 Plin'}
                          {(selectedOrder as any).paymentMethod === 'mercadopago' && '💳 MercadoPago'}
                          {(selectedOrder as any).paymentMethod === 'stripe' && '💳 Tarjeta'}
                          {(selectedOrder as any).paymentMethod === 'manual' && '💵 Manual'}
                          {!(selectedOrder as any).paymentMethod && 'N/A'}
                        </p>
                      </div>
                      {(selectedOrder as any).notes && (selectedOrder as any).notes.includes('Código de operación') && (
                        <div className="mt-2 pt-2 border-t border-cyan-200">
                          <span className="text-gray-600">Código:</span>
                          <p className="font-mono font-bold text-green-700 text-lg">
                            {(selectedOrder as any).notes.match(/Código de operación.*?:\s*(\w+)/)?.[1] || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      <h4 className="font-semibold text-orange-900">Tracking</h4>
                    </div>
                    <div className="text-sm">
                      {(selectedOrder as any).trackingNumber ? (
                        <>
                          <p className="text-gray-600">Número de rastreo:</p>
                          <p className="font-mono font-medium text-gray-900">{(selectedOrder as any).trackingNumber}</p>
                          {(selectedOrder as any).trackingUrl && (
                            <a
                              href={(selectedOrder as any).trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Ver seguimiento →
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500 italic">Sin información de tracking</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Productos */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Productos Ordenados
                    </h4>
                  </div>
                  <div className="p-4">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modelo/Color</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cant.</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.productModel && <div>{item.productModel}</div>}
                              {item.productColor && <div className="text-xs text-gray-500">{item.productColor}</div>}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">${item.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totales */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">${(selectedOrder as any).subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Envío:</span>
                      <span className="font-medium text-gray-900">${(selectedOrder as any).shippingCost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-blue-600">${selectedOrder.total.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                {/* Botón de WhatsApp */}
                <div className="mt-6">
                  <a
                    href={`https://wa.me/${(selectedOrder as any).customerPhone?.replace(/[^0-9]/g, '')}?text=Hola ${selectedOrder.customerFirstName}, tu orden ${selectedOrder.orderNumber} está siendo procesada.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Contactar Cliente por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedAdminDashboard;
