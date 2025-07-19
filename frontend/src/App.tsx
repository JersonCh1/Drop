import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './App.css';

// Context
import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

// Components
import Header from './components/layout/Header.tsx';
import Footer from './components/layout/Footer.tsx';
import ProductCard from './components/products/ProductCard.tsx';
import CartSidebar from './components/cart/CartSidebar.tsx';
import Checkout from './components/checkout/Checkout.tsx';
import AdminDashboard from './components/admin/AdminDashboard.tsx';
import AdminLogin from './components/admin/AdminLogin.tsx';

// Services
import analyticsService from './services/analyticsService.ts';

// Types
export interface CartItem {
  id: string;
  productId: number;
  variantId?: number;
  name: string;
  price: number;
  model: string;
  color: string;
  quantity: number;
  image: string;
  sku?: string;
  maxQuantity?: number;
}

// Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [selectedModel, setSelectedModel] = useState('iPhone 15');
  const [selectedColor, setSelectedColor] = useState('Negro');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const models = ['iPhone 15', 'iPhone 14', 'iPhone 13'];
  const colors = ['Negro', 'Azul', 'Rosa', 'Transparente'];
  const basePrice = 19.99;

  // Verificar si hay token de admin guardado
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setAdminToken(savedToken);
    }

    // Inicializar analytics
    analyticsService.trackPageView('home');
    analyticsService.setupAutoTracking();

    // Simular carga inicial
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAdminClick = () => {
    if (adminToken) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('adminToken', token);
    setIsAdminLoginOpen(false);
    setIsAdminOpen(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    setIsAdminOpen(false);
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    analyticsService.trackCheckoutStarted(0, 0, []); // Se actualizará en CartContext
  };

  const handleOrderComplete = () => {
    setIsCheckoutOpen(false);
  };

  // Función para crear item del carrito
  const createCartItem = (): CartItem => {
    return {
      id: `${selectedModel}-${selectedColor}`,
      productId: 1, // ID real del producto
      name: 'Carcasa iPhone Premium',
      price: basePrice,
      model: selectedModel,
      color: selectedColor,
      quantity: 1,
      image: '/api/placeholder/300/300',
      sku: `CASE-${selectedModel.replace(' ', '')}-${selectedColor}`.toUpperCase(),
      maxQuantity: 10
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                  }}
                />

                {/* Header */}
                <Header 
                  onAdminClick={handleAdminClick}
                  adminToken={adminToken}
                  onAdminLogout={handleAdminLogout}
                />

                {/* Main Content */}
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={
                      <HomePage 
                        selectedModel={selectedModel}
                        selectedColor={selectedColor}
                        models={models}
                        colors={colors}
                        price={basePrice}
                        onModelChange={setSelectedModel}
                        onColorChange={setSelectedColor}
                        createCartItem={createCartItem}
                      />
                    } />
                    
                    {/* Rutas futuras */}
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success" element={<OrderSuccessPage />} />
                    <Route path="/track/:orderNumber?" element={<TrackingPage />} />
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>

                <Footer />

                {/* Cart Sidebar */}
                <CartSidebar onCheckout={handleCheckout} />

                {/* Checkout Modal */}
                {isCheckoutOpen && (
                  <Checkout 
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
            </Router>
          </CartProvider>
        </AuthProvider>
      </Elements>
    </QueryClientProvider>
  );
}

// HomePage Component (contenido principal actual)
interface HomePageProps {
  selectedModel: string;
  selectedColor: string;
  models: string[];
  colors: string[];
  price: number;
  onModelChange: (model: string) => void;
  onColorChange: (color: string) => void;
  createCartItem: () => CartItem;
}

const HomePage: React.FC<HomePageProps> = ({
  selectedModel,
  selectedColor,
  models,
  colors,
  price,
  onModelChange,
  onColorChange,
  createCartItem
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <ProductCard 
          selectedModel={selectedModel}
          selectedColor={selectedColor}
          models={models}
          colors={colors}
          price={price}
          onModelChange={onModelChange}
          onColorChange={onColorChange}
          createCartItem={createCartItem}
        />
      </div>

      {/* Featured Products Section */}
      <FeaturedProducts />
    </div>
  );
};

// Componentes placeholder para las rutas
const ProductsPage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">Todos los Productos</h1>
    <p>Página de productos próximamente...</p>
  </div>
);

const ProductDetailPage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">Detalle del Producto</h1>
    <p>Página de detalle próximamente...</p>
  </div>
);

const CartPage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>
    <p>Página del carrito próximamente...</p>
  </div>
);

const CheckoutPage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">Checkout</h1>
    <p>Página de checkout próximamente...</p>
  </div>
);

const OrderSuccessPage = () => (
  <div className="container mx-auto px-4 py-8 text-center">
    <div className="text-6xl mb-4">🎉</div>
    <h1 className="text-3xl font-bold mb-8 text-green-600">¡Orden Exitosa!</h1>
    <p>Tu orden ha sido procesada correctamente.</p>
  </div>
);

const TrackingPage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">Rastrear Orden</h1>
    <p>Página de tracking próximamente...</p>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
      <p className="text-gray-600 mb-8">La página que buscas no existe o ha sido movida.</p>
      <a
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
      >
        Volver al inicio
      </a>
    </div>
  </div>
);

// Featured Products Section
const FeaturedProducts = () => (
  <section className="mt-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
      <p className="text-gray-600">Descubre nuestras carcasas más populares</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { name: 'Carcasa Transparente', model: 'iPhone 15', price: 19.99, image: '/api/placeholder/200/200' },
        { name: 'Carcasa Silicona', model: 'iPhone 14', price: 24.99, image: '/api/placeholder/200/200' },
        { name: 'Carcasa Premium', model: 'iPhone 13', price: 29.99, image: '/api/placeholder/200/200' },
      ].map((product, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            <span className="text-gray-600 text-sm">{product.name}</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{product.model}</p>
          <p className="text-blue-600 font-bold text-xl">${product.price}</p>
          <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            Ver Producto
          </button>
        </div>
      ))}
    </div>
  </section>
);

export default App;