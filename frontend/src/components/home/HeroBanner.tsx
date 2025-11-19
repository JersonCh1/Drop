// frontend/src/components/home/HeroBanner.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface HeroProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  images: Array<{ url: string; isMain: boolean }>;
  variants: Array<{
    id: string;
    name: string;
    color?: string;
    price: number;
    sku: string;
    stockQuantity: number;
  }>;
  category: { name: string };
}

const HeroBanner: React.FC = () => {
  const [heroProduct, setHeroProduct] = useState<HeroProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const { addItem } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [, forceUpdate] = useState({});

  // Re-render cuando cambia la moneda
  useEffect(() => {
    forceUpdate({});
  }, [currency]);

  useEffect(() => {
    loadHeroProduct();
  }, []);

  const loadHeroProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/hero-banner/current`);
      if (response.data.success && response.data.data) {
        setHeroProduct(response.data.data);
        // Pre-seleccionar la primera variante
        if (response.data.data.variants && response.data.data.variants.length > 0) {
          setSelectedVariant(response.data.data.variants[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading hero product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!heroProduct) {
      toast.error('Error: Producto no disponible');
      return;
    }

    const variant = heroProduct.variants.find(v => v.id === selectedVariant) || heroProduct.variants[0];

    if (!variant) {
      toast.error('Por favor selecciona una variante');
      return;
    }

    const mainImage = heroProduct.images.find(img => img.isMain)?.url || heroProduct.images[0]?.url || '/placeholder.jpg';

    try {
      addItem({
        id: variant.id,
        productId: heroProduct.id,
        variantId: variant.id,
        name: heroProduct.name,
        price: variant.price,
        model: variant.name || 'Default',
        color: variant.color || 'Default',
        quantity: 1,
        image: mainImage,
        sku: variant.sku || heroProduct.slug,
        maxQuantity: variant.stockQuantity || 99
      });

      toast.success(`${heroProduct.name} agregado al carrito!`, {
        icon: '🛒',
        duration: 4000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  // Si está cargando o no hay producto, mostrar el hero estático por defecto
  if (loading || !heroProduct) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-white">
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Protege tu
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  iPhone
                </span>
                <br />
                <span className="text-white">con Estilo</span>
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                Descubre nuestra colección premium de carcasas iPhone. Diseño elegante,
                protección superior y calidad garantizada.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden text-center"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Ver Catálogo</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Hero Banner Dinámico con el producto seleccionado
  const mainImage = heroProduct.images.find(img => img.isMain)?.url || heroProduct.images[0]?.url;
  const currentVariant = heroProduct.variants.find(v => v.id === selectedVariant) || heroProduct.variants[0];
  const currentPrice = currentVariant?.price || heroProduct.basePrice;

  // Obtener colores únicos
  const uniqueColors = Array.from(new Set(heroProduct.variants.map(v => v.color).filter(Boolean)));

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left - Product Info */}
          <div className="space-y-8 text-white">
            <div className="inline-block">
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                ⭐ Producto Destacado
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                {heroProduct.name}
              </span>
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed">
              {heroProduct.description || 'Protección y estilo para tu iPhone'}
            </p>

            {/* Precio */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Precio desde</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {formatPrice(currentPrice)}
                </span>
              </div>
            </div>

            {/* Selector de Variantes */}
            {heroProduct.variants.length > 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-300">
                  Selecciona tu variante:
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  {heroProduct.variants.map((variant) => (
                    <option key={variant.id} value={variant.id} className="bg-gray-900">
                      {variant.name} - {formatPrice(variant.price)}
                      {variant.stockQuantity === 0 ? ' (Agotado)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Color badges si hay colores únicos */}
            {uniqueColors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-white backdrop-blur-sm"
                  >
                    {color}
                  </span>
                ))}
              </div>
            )}

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!currentVariant || currentVariant.stockQuantity === 0}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>Agregar al Carrito</span>
                  <span className="text-2xl">🛒</span>
                </span>
              </button>

              <Link
                to={`/products/${heroProduct.slug}`}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 text-center"
              >
                Ver Detalles
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: 'Protección Premium' },
                { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', text: 'Envío Gratis' },
                { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', text: '98% Satisfacción' },
                { icon: 'M13 10V3L4 14h7v7l9-11h-7z', text: 'Entrega Express' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Product Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl blur-3xl opacity-30"></div>

            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>

                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={heroProduct.name}
                    className="relative z-10 w-full h-full object-contain p-8"
                  />
                ) : (
                  <div className="relative text-center z-10">
                    <svg className="w-64 h-64 mx-auto text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { label: 'Categoría', value: heroProduct.category?.name || 'Premium' },
                  { label: 'Stock', value: currentVariant?.stockQuantity ? `${currentVariant.stockQuantity}+` : 'Disponible' },
                  { label: 'Rating', value: '4.9★' }
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
    </section>
  );
};

export default HeroBanner;
