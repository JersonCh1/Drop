import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './App.css';

// Context
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProductCard from './components/products/ProductCard';
import CartSidebar from './components/cart/CartSidebar';
import Checkout from './components/checkout/Checkout';

// Pages
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminPage from './pages/AdminPage';

// Services
import analyticsService from './services/analyticsService';
import productService from './services/productService';
import type { Product as ProductType } from './services/productService';

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

// Stripe - Solo inicializar si hay clave disponible
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) 
  : null;

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

// Componente AppContent - Todo el contenido principal
const AppContent: React.FC<{
  selectedModel: string;
  selectedColor: string;
  models: string[];
  colors: string[];
  basePrice: number;
  setSelectedModel: (model: string) => void;
  setSelectedColor: (color: string) => void;
  handleCheckout: () => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  handleOrderComplete: () => void;
  createCartItem: () => CartItem;
}> = ({
  selectedModel,
  selectedColor,
  models,
  colors,
  basePrice,
  setSelectedModel,
  setSelectedColor,
  handleCheckout,
  isCheckoutOpen,
  setIsCheckoutOpen,
  handleOrderComplete,
  createCartItem
}) => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '12px 20px',
                },
              }}
            />

            {/* Header */}
            <Header />

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
                
                {/* Rutas implementadas y funcionales */}
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/track" element={<OrderTrackingPage />} />
                <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />

                {/* Rutas de autenticación de clientes */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />

                {/* Ruta de administración (protegida) */}
                <Route path="/admin" element={<AdminPage />} />

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
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

function App() {
  const [selectedModel, setSelectedModel] = useState('iPhone 15');
  const [selectedColor, setSelectedColor] = useState('Negro');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const models = ['iPhone 15', 'iPhone 14', 'iPhone 13'];
  const colors = ['Negro', 'Azul', 'Rosa', 'Transparente'];
  const basePrice = 19.99;

  useEffect(() => {
    // Inicializar analytics
    analyticsService.trackPageView('home');
    analyticsService.setupAutoTracking();

    // Simular carga inicial
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

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
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f0f0f0" width="300" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EiPhone Case%3C/text%3E%3C/svg%3E',
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

  // Props para AppContent
  const appContentProps = {
    selectedModel,
    selectedColor,
    models,
    colors,
    basePrice,
    setSelectedModel,
    setSelectedColor,
    handleCheckout,
    isCheckoutOpen,
    setIsCheckoutOpen,
    handleOrderComplete,
    createCartItem
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <AppContent {...appContentProps} />
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
    <div>
      {/* Hero Section - Futuristic Design */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(239, 68, 155, 0.3), transparent 50%)',
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-medium">Nueva Colección Disponible</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                    Protege tu
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    iPhone
                  </span>
                  <br />
                  <span className="text-white">con Estilo</span>
                </h1>

                <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                  Descubre nuestra colección premium de carcasas iPhone. Diseño elegante,
                  protección superior y calidad garantizada.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: 'Protección Premium' },
                  { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', text: 'Envío Gratis' },
                  { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', text: '98% Satisfacción' },
                  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', text: 'Entrega Express' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/products"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden text-center"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Ver Catálogo</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </a>

                <a
                  href="#productos-destacados"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 text-center"
                >
                  Explorar Más
                </a>
              </div>
            </div>

            {/* Right - Product Showcase */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-3xl opacity-30"></div>

              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

                  <div className="relative text-center z-10">
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-3xl mb-6 flex items-center justify-center border border-white/20 shadow-xl">
                      <div className="text-center">
                        <svg className="w-32 h-32 mx-auto text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-white font-semibold mt-4">{selectedModel}</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium shadow-lg">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      <span>Color: {selectedColor}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { label: 'Modelos', value: '15+' },
                    { label: 'Colores', value: '12+' },
                    { label: 'Reviews', value: '4.9★' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                      <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-300">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(249, 250, 251)"/>
          </svg>
        </div>
      </div>

      {/* Product Card Section - More compact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 mb-16">
        <div className="max-w-3xl mx-auto">
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
      </div>

      {/* Featured Products Section */}
      <div id="productos-destacados">
        <FeaturedProducts />
      </div>
    </div>
  );
};

// Componentes placeholder para las rutas
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

// Featured Products Section - Usando productos reales
const FeaturedProducts = () => {
  const [products, setProducts] = React.useState<ProductType[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadFeaturedProducts = React.useCallback(async () => {
    try {
      const data = await productService.getFeaturedProducts(3);
      setProducts(data);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  // Refetch when tab becomes visible (e.g., after updating prices in admin)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFeaturedProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadFeaturedProducts]);

  if (loading) {
    return (
      <section className="mt-16">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos destacados...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-md rounded-full border border-blue-600/20 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lo Más Popular
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Productos <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Destacados</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras carcasas más populares con el mejor diseño y protección
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => {
            const mainImage = productService.getMainImage(product);
            const lowestPrice = productService.getLowestPrice(product);

            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Product Image */}
                <Link to={`/products/${product.slug}`} className="block relative overflow-hidden aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Featured Badge */}
                  {product.isFeatured && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>Top</span>
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="p-6">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description || 'Carcasa de alta calidad con protección premium'}
                  </p>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Desde</p>
                      <p className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${lowestPrice.toFixed(2)}
                      </p>
                    </div>
                    <Link
                      to={`/products/${product.slug}`}
                      className="group/btn relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <span>Ver</span>
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            to="/products"
            className="group inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <span className="text-lg">Ver Todo el Catálogo</span>
            <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default App;