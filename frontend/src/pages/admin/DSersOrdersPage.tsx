import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DSersOrder {
  orderNumber: string;
  orderDate: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: Array<{
    product: string;
    variant: string;
    quantity: number;
    aliexpressUrl?: string;
  }>;
  total: number;
}

const DSersOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<DSersOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingCSV, setDownloadingCSV] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dsers/pending`);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      alert('Error al cargar órdenes pendientes');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      setDownloadingCSV(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dsers/csv`, {
        responseType: 'blob'
      });

      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dsers-orders-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert('CSV descargado! Ahora impórtalo en DSers');
    } catch (error) {
      console.error('Error descargando CSV:', error);
      alert('Error al descargar CSV');
    } finally {
      setDownloadingCSV(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">Cargando órdenes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🚀 Órdenes DSers
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona y procesa órdenes con DSers + AliExpress
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{orders.length}</div>
              <div className="text-sm text-gray-500">Órdenes Pendientes</div>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-3">📋 CÓMO PROCESAR ÓRDENES:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Haz click en "Descargar CSV" abajo</li>
            <li>Abre DSers en tu navegador: <a href="https://www.dsers.com" target="_blank" rel="noopener noreferrer" className="underline">dsers.com</a></li>
            <li>Ve a <strong>Import List</strong> → <strong>Upload CSV</strong></li>
            <li>Sube el archivo descargado</li>
            <li>Click en <strong>Map Suppliers</strong></li>
            <li>Click en <strong>Push to AliExpress</strong></li>
            <li>DSers comprará automáticamente en AliExpress</li>
          </ol>
        </div>

        {/* Botón Descargar CSV */}
        <div className="text-center mb-8">
          <button
            onClick={downloadCSV}
            disabled={downloadingCSV || orders.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {downloadingCSV ? '⏳ Descargando...' : `📥 Descargar CSV (${orders.length} órdenes)`}
          </button>
        </div>

        {/* Lista de Órdenes */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              ¡No hay órdenes pendientes!
            </h2>
            <p className="text-gray-500">
              Todas las órdenes han sido procesadas
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${order.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">👤 Cliente:</h4>
                    <p className="text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-600">{order.email}</p>
                    <p className="text-sm text-gray-600">{order.phone}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">📍 Dirección:</h4>
                    <p className="text-sm text-gray-600">{order.address}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">📦 Productos:</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{item.product}</p>
                          {item.variant && (
                            <p className="text-sm text-gray-600">{item.variant}</p>
                          )}
                          {item.aliexpressUrl && (
                            <a
                              href={item.aliexpressUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Ver en AliExpress →
                            </a>
                          )}
                        </div>
                        <div className="text-gray-700 font-semibold">
                          x{item.quantity}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer con ayuda */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <h3 className="font-bold text-yellow-900 mb-2">💡 AYUDA:</h3>
          <p className="text-yellow-800 text-sm">
            Si tienes problemas, contacta soporte o revisa la documentación en{' '}
            <code className="bg-yellow-200 px-2 py-1 rounded">COMO_USAR_DSERS.md</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DSersOrdersPage;
