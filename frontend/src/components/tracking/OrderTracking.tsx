// frontend/src/components/tracking/OrderTracking.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// API URL desde variable de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface OrderStatus {
  id: number;
  order_number: string;
  status: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  total: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  tracking_number?: string;
  tracking_url?: string;
  items: any[];
}

const OrderTracking: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [orderData, setOrderData] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Si hay un número de orden en la URL, úsalo
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderParam = urlParams.get('order');
    if (orderParam) {
      setOrderNumber(orderParam);
    }
  }, []);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await fetch(`${API_URL}/tracking/${orderNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (result.success) {
        setOrderData(result.data);
        toast.success('Orden encontrada!');
      } else {
        setError(result.message || 'Orden no encontrada');
        toast.error('No se encontró la orden');
      }
    } catch (err) {
      setError('Error al buscar la orden. Por favor intenta de nuevo.');
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-indigo-100 text-indigo-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmada';
      case 'processing': return 'En Proceso';
      case 'shipped': return 'Enviada';
      case 'delivered': return 'Entregada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'processing': return '📦';
      case 'shipped': return '🚚';
      case 'delivered': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const getStatusStep = (status: string): number => {
    const steps: { [key: string]: number } = {
      'pending': 1,
      'confirmed': 2,
      'processing': 3,
      'shipped': 4,
      'delivered': 5
    };
    return steps[status.toLowerCase()] || 1;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📦 Rastrea tu Orden
          </h1>
          <p className="text-gray-600">
            Ingresa tu número de orden y email para ver el estado de tu pedido
          </p>
        </div>

        {/* Search Form */}
        {!orderData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Orden
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="ORD-XXXXX-XXXXX"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de confirmación
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Buscando...' : 'Rastrear Orden'}
              </button>
            </form>
          </div>
        )}

        {/* Order Details */}
        {orderData && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Orden {orderData.order_number}
                  </h2>
                  <p className="text-gray-600">
                    {new Date(orderData.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(orderData.status)}`}>
                  {getStatusIcon(orderData.status)} {getStatusText(orderData.status)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {['Pendiente', 'Confirmada', 'En Proceso', 'Enviada', 'Entregada'].map((step, index) => {
                    const stepNumber = index + 1;
                    const currentStep = getStatusStep(orderData.status);
                    const isActive = stepNumber <= currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isActive ? 'bg-blue-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? '✓' : stepNumber}
                        </div>
                        <span className={`text-xs text-center ${
                          isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-0 h-1 bg-gray-300 w-full rounded"></div>
                  <div 
                    className="absolute top-0 left-0 h-1 bg-blue-500 rounded transition-all duration-500"
                    style={{ width: `${(getStatusStep(orderData.status) - 1) * 25}%` }}
                  ></div>
                </div>
              </div>

              {/* Tracking Info */}
              {orderData.tracking_number && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    🚚 Información de Envío
                  </h3>
                  <p className="text-blue-800">
                    Número de seguimiento: <span className="font-mono font-bold">{orderData.tracking_number}</span>
                  </p>
                  {orderData.tracking_url && (
                    <a 
                      href={orderData.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      Rastrear en el sitio del transportista →
                    </a>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Historial de la Orden</h3>
                
                {orderData.delivered_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Orden Entregada</p>
                      <p className="text-sm text-gray-600">
                        {new Date(orderData.delivered_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                )}

                {orderData.shipped_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Orden Enviada</p>
                      <p className="text-sm text-gray-600">
                        {new Date(orderData.shipped_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Orden Creada</p>
                    <p className="text-sm text-gray-600">
                      {new Date(orderData.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Productos en tu Orden</h3>
              <div className="space-y-3">
                {orderData.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      {item.product_model && item.product_color && (
                        <p className="text-sm text-gray-600">
                          {item.product_model} - {item.product_color}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.total}</p>
                      <p className="text-sm text-gray-600">Cant: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${orderData.total} USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setOrderData(null);
                    setOrderNumber('');
                    setEmail('');
                  }}
                  className="bg-gray-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-gray-700"
                >
                  Buscar Otra Orden
                </button>
                <a
                  href={`https://wa.me/51999888777?text=Hola!%20Necesito%20ayuda%20con%20mi%20orden%20${orderData.order_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 text-center"
                >
                  💬 Contactar Soporte
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;