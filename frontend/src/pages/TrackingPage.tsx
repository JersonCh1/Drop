import React, { useState } from 'react';

interface OrderStatus {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  total: number;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: {
    productName: string;
    productModel?: string;
    productColor?: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  customerEmail: string;
  estimatedDelivery?: string;
}

const TrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      setError('Por favor ingresa el número de orden');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        ...(email.trim() && { email: email.trim() })
      });

      const response = await fetch(`${API_URL}/orders/track?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success && result.data) {
        setOrder(result.data);
        setError('');
      } else {
        setError(result.message || 'No se encontró la orden. Verifica el número de orden e intenta de nuevo.');
        setOrder(null);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Error al buscar la orden. Por favor intenta de nuevo.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: string; description: string }> = {
      PENDING: {
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '⏳',
        description: 'Tu orden está siendo procesada'
      },
      CONFIRMED: {
        label: 'Confirmada',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: '✅',
        description: 'Tu pago ha sido confirmado'
      },
      PROCESSING: {
        label: 'En Proceso',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: '📦',
        description: 'Estamos preparando tu pedido'
      },
      SHIPPED: {
        label: 'Enviado',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        icon: '🚚',
        description: 'Tu pedido está en camino'
      },
      DELIVERED: {
        label: 'Entregado',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '🎉',
        description: 'Tu pedido ha sido entregado'
      },
      CANCELLED: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '❌',
        description: 'Esta orden fue cancelada'
      },
      REFUNDED: {
        label: 'Reembolsado',
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: '💵',
        description: 'El monto ha sido reembolsado'
      }
    };

    return statusMap[status] || statusMap.PENDING;
  };

  const getPaymentStatusLabel = (status: string) => {
    const paymentMap: Record<string, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      FAILED: 'Fallido',
      REFUNDED: 'Reembolsado',
      CANCELLED: 'Cancelado'
    };
    return paymentMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            Rastrear mi Orden
          </h1>
          <p className="text-gray-600 text-lg">
            Ingresa tu número de orden para ver el estado de tu pedido
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Número de Orden *
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="Ej: ORD-ABC123"
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg font-mono tracking-wide uppercase"
                disabled={loading}
              />
              <p className="text-xs text-gray-600 mt-2">
                Puedes encontrar tu número de orden en el email de confirmación
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email (Opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                disabled={loading}
              />
              <p className="text-xs text-gray-600 mt-2">
                Para mayor seguridad, puedes ingresar el email usado en la compra
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3 text-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Rastrear Orden</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start">
              <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-bold text-red-900 mb-1">No se encontró la orden</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full text-5xl mb-4">
                  {getStatusInfo(order.status).icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Orden {order.orderNumber}
                </h2>
                <div className={`inline-flex items-center px-6 py-3 rounded-full border-2 text-lg font-bold ${getStatusInfo(order.status).color}`}>
                  {getStatusInfo(order.status).label}
                </div>
                <p className="text-gray-600 mt-3 text-lg">
                  {getStatusInfo(order.status).description}
                </p>
              </div>

              {/* Timeline */}
              <div className="relative border-l-4 border-gray-200 ml-6 space-y-8">
                {/* Order Created */}
                <div className="relative pl-8">
                  <div className="absolute -left-4 top-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Orden Creada</h3>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>

                {/* Payment Status */}
                {order.paymentStatus === 'PAID' && (
                  <div className="relative pl-8">
                    <div className="absolute -left-4 top-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Pago Confirmado</h3>
                    <p className="text-sm text-gray-600">Tu pago ha sido procesado exitosamente</p>
                  </div>
                )}

                {/* Processing */}
                {['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                  <div className="relative pl-8">
                    <div className="absolute -left-4 top-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">En Proceso</h3>
                    <p className="text-sm text-gray-600">Estamos preparando tu pedido para envío</p>
                  </div>
                )}

                {/* Shipped */}
                {['SHIPPED', 'DELIVERED'].includes(order.status) && (
                  <div className="relative pl-8">
                    <div className="absolute -left-4 top-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Enviado</h3>
                    <p className="text-sm text-gray-600">
                      {order.shippedAt ? formatDate(order.shippedAt) : 'Tu pedido ha sido enviado'}
                    </p>
                    {order.trackingNumber && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-700">
                          Código de tracking: <span className="font-mono text-blue-600">{order.trackingNumber}</span>
                        </p>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold mt-1"
                          >
                            Rastrear paquete
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Delivered */}
                {order.status === 'DELIVERED' && (
                  <div className="relative pl-8">
                    <div className="absolute -left-4 top-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Entregado</h3>
                    <p className="text-sm text-gray-600">
                      {order.deliveredAt ? formatDate(order.deliveredAt) : 'Tu pedido ha sido entregado'}
                    </p>
                  </div>
                )}

                {/* Expected Delivery */}
                {order.estimatedDelivery && !['DELIVERED', 'CANCELLED'].includes(order.status) && (
                  <div className="relative pl-8">
                    <div className="absolute -left-4 top-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-700 mb-1">Entrega Estimada</h3>
                    <p className="text-sm text-gray-600">{order.estimatedDelivery}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Productos en tu Orden
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {item.productModel} {item.productColor && `- ${item.productColor}`} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-lg text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Pago: <span className="font-semibold">{getPaymentStatusLabel(order.paymentStatus)}</span>
                </p>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Dirección de Envío
              </h3>
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-900 font-semibold">{order.shippingAddress}</p>
                <p className="text-gray-700">{order.shippingCity}, {order.shippingState}</p>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-3">¿Necesitas ayuda?</h3>
              <p className="mb-6 text-blue-100">
                Si tienes alguna pregunta sobre tu orden, no dudes en contactarnos
              </p>
              <a
                href={`mailto:soporte@tutienda.com?subject=Consulta sobre orden ${order.orderNumber}`}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contactar Soporte
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
