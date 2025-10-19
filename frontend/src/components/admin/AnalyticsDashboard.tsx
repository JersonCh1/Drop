import React, { useState, useEffect } from 'react';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageOrderValue: number;
  ordersToday: number;
  revenueToday: number;
  conversionRate: number;
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  salesByMonth: {
    month: string;
    sales: number;
    revenue: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
  }[];
}

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/analytics/dashboard?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error al cargar estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Dashboard de Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Visualiza el rendimiento de tu tienda en tiempo real
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2 bg-white rounded-lg border border-gray-200 p-1">
          {['today', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range === 'today' && 'Hoy'}
              {range === 'week' && 'Semana'}
              {range === 'month' && 'Mes'}
              {range === 'year' && 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium opacity-80">Ingresos Totales</span>
          </div>
          <div className="text-4xl font-extrabold mb-2">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="flex items-center text-sm opacity-90">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>+{((stats.revenueToday / stats.totalRevenue) * 100).toFixed(1)}% hoy</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-sm font-medium opacity-80">Órdenes Totales</span>
          </div>
          <div className="text-4xl font-extrabold mb-2">
            {stats.totalOrders.toLocaleString()}
          </div>
          <div className="flex items-center text-sm opacity-90">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{stats.ordersToday} hoy</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium opacity-80">Clientes</span>
          </div>
          <div className="text-4xl font-extrabold mb-2">
            {stats.totalCustomers.toLocaleString()}
          </div>
          <div className="flex items-center text-sm opacity-90">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Base de clientes</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium opacity-80">Ticket Promedio</span>
          </div>
          <div className="text-4xl font-extrabold mb-2">
            {formatCurrency(stats.averageOrderValue)}
          </div>
          <div className="flex items-center text-sm opacity-90">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Por orden</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Month Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Ventas por Mes</h3>
          <div className="space-y-4">
            {stats.salesByMonth.map((item, index) => {
              const maxRevenue = Math.max(...stats.salesByMonth.map(m => m.revenue));
              const percentage = (item.revenue / maxRevenue) * 100;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.month}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.revenue)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({item.sales} órdenes)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Órdenes por Estado</h3>
          <div className="space-y-3">
            {stats.ordersByStatus.map((item, index) => {
              const totalOrders = stats.ordersByStatus.reduce((sum, s) => sum + s.count, 0);
              const percentage = (item.count / totalOrders) * 100;

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-lg hover:from-blue-50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sales} ventas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Órdenes Recientes</h3>
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-600">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
