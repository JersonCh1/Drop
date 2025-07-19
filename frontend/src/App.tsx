import React, { useState, useEffect } from 'react';
import './App.css';
import Checkout from './components/checkout/Checkout.tsx';
import AdminDashboard from './components/admin/AdminDashboard.tsx';
import AdminLogin from './components/admin/AdminLogin.tsx';

interface CartItem {
  id: string;
  name: string;
  price: number;
  model: string;
  color: string;
  quantity: number;
  image: string;
}

function App() {
  const [selectedModel, setSelectedModel] = useState('iPhone 15');
  const [selectedColor, setSelectedColor] = useState('Negro');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const models = ['iPhone 15', 'iPhone 14', 'iPhone 13'];
  const colors = ['Negro', 'Azul', 'Rosa', 'Transparente'];
  const price = 19.99;

  // Verificar si hay token de admin guardado
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setAdminToken(savedToken);
    }
  }, []);

  const addToCart = () => {
    const newItem: CartItem = {
      id: `${selectedModel}-${selectedColor}`,
      name: 'Carcasa iPhone Premium',
      price,
      model: selectedModel,
      color: selectedColor,
      quantity: 1,
      image: '/api/placeholder/300/300'
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === newItem.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  const handleAdminClick = () => {
    if (adminToken) {
      // Si ya está autenticado, abrir admin directamente
      setIsAdminOpen(true);
    } else {
      // Si no está autenticado, mostrar login
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    setIsAdminLoginOpen(false);
    setIsAdminOpen(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    setIsAdminOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">iPhone Cases Store</h1>
            <div className="flex items-center space-x-2">
              {/* Admin Button */}
              <button
                onClick={handleAdminClick}
                className={`p-2 hover:text-gray-900 ${adminToken ? 'text-blue-600' : 'text-gray-600'}`}
                title={adminToken ? 'Panel de Administración (Autenticado)' : 'Acceder como Admin'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {adminToken && (
                  <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full"></span>
                )}
              </button>
              
              {/* Logout Button (solo si está autenticado) */}
              {adminToken && (
                <button
                  onClick={handleAdminLogout}
                  className="p-2 text-red-600 hover:text-red-700"
                  title="Cerrar Sesión Admin"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
              
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                </svg>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto bg-gray-300 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">Carcasa {selectedModel}</span>
                </div>
                <p className="text-gray-500 text-sm">Color: {selectedColor}</p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Carcasa iPhone Premium</h2>
            <p className="text-2xl font-semibold text-blue-600 mb-6">${price}</p>
            
            <div className="space-y-6">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo de iPhone
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`p-3 border rounded-md text-sm font-medium transition-colors ${
                        selectedColor === color
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Agregar al Carrito - ${price}
              </button>

              {/* Product Features */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-3">Características:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Protección total contra golpes y caídas</li>
                  <li>• Acceso a todos los puertos y botones</li>
                  <li>• Material resistente y duradero</li>
                  <li>• Diseño elegante y moderno</li>
                  <li>• Envío gratis a toda Latinoamérica</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">Carrito de Compras</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Tu carrito está vacío</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded">
                        <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-600">{item.model} - {item.color}</p>
                          <p className="text-sm font-medium">${item.price} x {item.quantity}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total:</span>
                    <span className="text-xl font-bold">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
                  >
                    Proceder al Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <Checkout 
          cart={cart}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {/* Admin Login */}
      {isAdminLoginOpen && (
        <AdminLogin 
          onLogin={handleAdminLogin}
          onClose={() => setIsAdminLoginOpen(false)}
        />
      )}

      {/* Admin Dashboard */}
      {isAdminOpen && adminToken && (
        <AdminDashboard 
          onClose={() => setIsAdminOpen(false)}
          adminToken={adminToken}
        />
      )}
    </div>
  );
}

export default App;