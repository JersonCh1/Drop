// frontend/src/components/products/UpsellCrossSell.tsx
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

interface UpsellProduct {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

interface BundleOffer {
  id: number;
  title: string;
  products: string[];
  discount: number;
  price: number;
  originalPrice: number;
  savings: number;
  badge?: string;
}

const UpsellCrossSell: React.FC = () => {
  const { addItem } = useCart();
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null);

  // Mock data - En producción vendría de una API
  const relatedProducts: UpsellProduct[] = [
    {
      id: 2,
      name: 'Protector de Pantalla Premium',
      price: 12.99,
      originalPrice: 19.99,
      image: 'https://placehold.co/400x400/2c3e50/fff?text=Rugged+Case',
      rating: 4.9,
      reviews: 892,
      inStock: true
    },
    {
      id: 3,
      name: 'Cable USB-C Reforzado',
      price: 15.99,
      originalPrice: 24.99,
      image: 'https://placehold.co/400x400/e74c3c/fff?text=Premium+Case',
      rating: 4.7,
      reviews: 456,
      inStock: true
    },
    {
      id: 4,
      name: 'Soporte Magnético para Auto',
      price: 18.99,
      originalPrice: 29.99,
      image: 'https://placehold.co/400x400/3498db/fff?text=Slim+Case',
      rating: 4.8,
      reviews: 234,
      inStock: true
    },
    {
      id: 5,
      name: 'Auriculares Bluetooth',
      price: 34.99,
      originalPrice: 59.99,
      image: 'https://placehold.co/400x400/2ecc71/fff?text=Wireless+Charger',
      rating: 4.6,
      reviews: 678,
      inStock: false
    }
  ];

  const bundles: BundleOffer[] = [
    {
      id: 1,
      title: 'Pack Protección Completa',
      products: ['Carcasa Premium', 'Protector de Pantalla', 'Cable USB-C'],
      discount: 25,
      price: 49.99,
      originalPrice: 66.97,
      savings: 16.98,
      badge: 'MÁS VENDIDO'
    },
    {
      id: 2,
      title: 'Pack Auto + Carga',
      products: ['Carcasa Premium', 'Soporte para Auto', 'Cable USB-C'],
      discount: 20,
      price: 54.99,
      originalPrice: 68.97,
      savings: 13.98,
      badge: 'OFERTA'
    },
    {
      id: 3,
      title: 'Pack Todo Incluido',
      products: ['Carcasa', 'Protector', 'Cable', 'Soporte Auto', 'Auriculares'],
      discount: 30,
      price: 89.99,
      originalPrice: 128.95,
      savings: 38.96,
      badge: 'MEJOR VALOR'
    }
  ];

  const handleAddToCart = (product: UpsellProduct) => {
    const item = {
      id: `upsell-${product.id}`,
      productId: product.id,
      variantId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      model: 'Universal',
      color: 'N/A'
    };

    addItem(item);
    toast.success(`${product.name} agregado al carrito!`, { icon: '✅' });
  };

  const handleAddBundle = (bundle: BundleOffer) => {
    setSelectedBundle(bundle.id);
    toast.success(`${bundle.title} agregado al carrito!`, { icon: '🎁' });
    setTimeout(() => setSelectedBundle(null), 2000);
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Bundles Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎁 Combos Especiales
            </h3>
            <p className="text-gray-600 text-sm mt-1">Ahorra más comprando en paquete</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="relative group bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Badge */}
              {bundle.badge && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg transform rotate-12">
                  {bundle.badge}
                </div>
              )}

              {/* Discount Badge */}
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                -{bundle.discount}%
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-black text-gray-900 mb-3">{bundle.title}</h4>

                {/* Products included */}
                <ul className="space-y-2 mb-4">
                  {bundle.products.map((product, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {product}
                    </li>
                  ))}
                </ul>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-baseline space-x-2 mb-1">
                    <span className="text-3xl font-black text-purple-600">${bundle.price}</span>
                    <span className="text-lg text-gray-400 line-through">${bundle.originalPrice}</span>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    💰 Ahorras ${bundle.savings.toFixed(2)}
                  </p>
                </div>

                {/* Add to cart button */}
                <button
                  onClick={() => handleAddBundle(bundle)}
                  disabled={selectedBundle === bundle.id}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    selectedBundle === bundle.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {selectedBundle === bundle.id ? (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      ¡Agregado!
                    </span>
                  ) : (
                    '🎁 Agregar Combo'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              🛍️ Completa tu compra
            </h3>
            <p className="text-gray-600 text-sm mt-1">Los clientes también compraron</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                      Agotado
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{product.name}</h4>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({product.reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline space-x-2 mb-3">
                  <span className="text-xl font-black text-blue-600">${product.price}</span>
                  <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                </div>

                {/* Add button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  className={`w-full py-2 rounded-lg font-bold text-xs transition-all duration-300 ${
                    !product.inStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                  }`}
                >
                  {product.inStock ? '+ Agregar' : 'Agotado'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Bought Together */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200 p-6">
        <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center">
          <span className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </span>
          Comprados frecuentemente juntos
        </h3>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-20 h-20 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <span className="text-2xl text-gray-400">+</span>
            <div className="w-20 h-20 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
            <span className="text-2xl text-gray-400">+</span>
            <div className="w-20 h-20 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
              <span className="text-2xl">🔌</span>
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-2xl font-black text-orange-600">$59.97</span>
              <span className="text-lg text-gray-400 line-through">$79.97</span>
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                Ahorra $20
              </span>
            </div>
            <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              🎯 Agregar los 3 al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpsellCrossSell;
