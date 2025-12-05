import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';

// Context
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
import { CompareProvider } from './context/CompareContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ProductCard from './components/products/ProductCard';
import CartSidebar from './components/cart/CartSidebar';
import Checkout from './components/checkout/Checkout';
import HeroBanner from './components/home/HeroBanner';

// Services
import analyticsService from './services/analyticsService';
import productService from './services/productService';
import type { Product as ProductType } from './services/productService';
import { initGA, trackPageView } from './utils/googleAnalytics';

// Marketing
import SocialProof from './components/marketing/SocialProof';
import WhatsAppWidget from './components/chat/WhatsAppWidget';

// Pages - Lazy loading for code splitting
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
const TrackingPage = React.lazy(() => import('./pages/TrackingPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const MyOrdersPage = React.lazy(() => import('./pages/MyOrdersPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const FAQPage = React.lazy(() => import('./pages/FAQPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const ReturnsPage = React.lazy(() => import('./pages/ReturnsPage'));
const CookiesPage = React.lazy(() => import('./pages/CookiesPage'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const DSersOrdersPage = React.lazy(() => import('./pages/admin/DSersOrdersPage'));
const ComparePage = React.lazy(() => import('./pages/ComparePage'));
const LoyaltyPage = React.lazy(() => import('./pages/LoyaltyPage'));
const HealthCheckPage = React.lazy(() => import('./pages/HealthCheckPage'));

// Types
export interface CartItem {
  id: string;
  productId: string | number; // Soporta tanto string (PostgreSQL) como number (SQLite legacy)
  variantId?: string | number;
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
      <CompareProvider>
        <CartProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
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
              <React.Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando...</p>
                  </div>
                </div>
              }>
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
                  <Route path="/track" element={<TrackingPage />} />
                  <Route path="/track/:orderNumber" element={<TrackingPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />

                  {/* Rutas de autenticación de clientes */}
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/loyalty" element={<LoyaltyPage />} />

                  {/* Ruta de administración (protegida) */}
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/dsers" element={<DSersOrdersPage />} />
                  <Route path="/health" element={<HealthCheckPage />} />

                  {/* Páginas informativas */}
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* Páginas legales */}
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/returns" element={<ReturnsPage />} />
                  <Route path="/cookies" element={<CookiesPage />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </React.Suspense>
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

            {/* Social Proof Notifications */}
            <SocialProof />

            {/* WhatsApp Widget */}
            <WhatsAppWidget />
          </div>
        </Router>
        </CartProvider>
      </CompareProvider>
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
    // Inicializar Google Analytics
    initGA();

    // Inicializar analytics interno
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
    // Mapear modelo y color a productId de la base de datos
    const getProductId = () => {
      const modelKey = selectedModel.replace(/\s+/g, '').toLowerCase(); // "iPhone 15" -> "iphone15"
      const colorKey = selectedColor.toLowerCase(); // "Negro" -> "negro"

      // Mapeo basado en los productos en la base de datos (seed.js)
      const productMap: { [key: string]: string } = {
        'iphone15_transparente': 'prod_case_iphone15_trans',
        'iphone15_negro': 'prod_case_iphone15_black',
        'iphone14_silicona': 'prod_case_iphone14_silicone',
        'iphone14_negro': 'prod_case_iphone14_black',
        'iphone13_transparente': 'prod_case_iphone13_trans',
        'iphone13_negro': 'prod_case_iphone13_black',
      };

      const key = `${modelKey}_${colorKey}`;
      return productMap[key] || 'prod_case_iphone15_trans'; // Default
    };

    return {
      id: `${selectedModel}-${selectedColor}`,
      productId: getProductId(), // ID real del producto de la base de datos
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <CurrencyProvider>
              <I18nProvider>
                <Elements stripe={stripePromise}>
                  <AppContent {...appContentProps} />
                </Elements>
              </I18nProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
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
      {/* Hero Banner - Dynamic Product Display */}
      <HeroBanner />

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
  const { formatPrice } = require('./context/CurrencyContext').useCurrency();

  const loadFeaturedProducts = React.useCallback(async () => {
    try {
      const data = await productService.getFeaturedProducts(6); // Mostrar 6 productos
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
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decoration - Más sutil y elegante */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/25 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header - Mejorado con más contraste */}
        <div className="text-center mb-20">
          {/* Badge con fondo más sólido */}
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border-2 border-blue-500/30 shadow-lg shadow-blue-500/20 mb-6">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent tracking-wide">
              LO MÁS POPULAR
            </span>
          </div>

          {/* Título con sombra sutil para mejor legibilidad */}
          <h2 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight drop-shadow-sm">
            Productos <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">Destacados</span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed font-light">
            Descubre nuestras carcasas más populares con el mejor diseño y protección profesional
          </p>
        </div>

        {/* Products Grid - Diseño más elegante */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {products.map((product, index) => {
            const mainImage = productService.getMainImage(product);
            const lowestPrice = productService.getLowestPrice(product);

            return (
              <div
                key={product.id}
                className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-2xl shadow-lg transition-all duration-500 hover:-translate-y-3 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Product Image */}
                <Link to={`/products/${product.slug}`} className="block relative overflow-hidden aspect-square bg-gradient-to-br from-slate-100 to-blue-50/50 dark:from-gray-700 dark:to-gray-600">
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
                <div className="p-6 bg-white/95 dark:bg-gray-800/95">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[56px]">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed min-h-[60px]">
                    {product.description || 'Carcasa de alta calidad con protección premium'}
                  </p>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Desde</p>
                      <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        {formatPrice(lowestPrice)}
                      </p>
                    </div>
                    <Link
                      to={`/products/${product.slug}`}
                      className="group/btn relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
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

        {/* CTA Button - Más elegante y sutil */}
        <div className="text-center">
          <Link
            to="/products"
            className="group relative inline-flex items-center space-x-3 px-12 py-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-400/50 dark:hover:border-blue-500/50 overflow-hidden"
          >
            <span className="relative z-10 text-lg bg-gradient-to-r from-gray-900 via-blue-600 to-cyan-600 dark:from-white dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Ver Todo el Catálogo
            </span>
            <svg className="relative z-10 w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            {/* Shine effect sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default App;