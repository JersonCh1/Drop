// frontend/src/components/products/ProductCard.tsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CartItem } from '../../context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  selectedModel: string;
  selectedColor: string;
  models: string[];
  colors: string[];
  price: number;
  onModelChange: (model: string) => void;
  onColorChange: (color: string) => void;
  createCartItem: () => CartItem;
}

const ProductCard: React.FC<ProductCardProps> = ({
  selectedModel,
  selectedColor,
  models,
  colors,
  price,
  onModelChange,
  onColorChange,
  createCartItem
}) => {
  const { addItem, isItemInCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [, forceUpdate] = useState({});

  // Re-render cuando cambia la moneda
  useEffect(() => {
    forceUpdate({});
  }, [currency, formatPrice]);

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      const item = createCartItem();

      if (isItemInCart(item.productId, item.variantId)) {
        toast.error('Este producto ya está en tu carrito', {
          icon: '⚠️',
          duration: 3000,
        });
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      addItem(item);

      // Item successfully added
      toast.success(`${item.name} agregado al carrito!`, {
        icon: '🛒',
        duration: 4000,
      });

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error agregando producto al carrito', {
        icon: '❌',
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // formatPrice is now from useCurrency hook

  const getColorClasses = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      'Negro': 'bg-gradient-to-br from-gray-900 to-gray-700',
      'Azul': 'bg-gradient-to-br from-blue-600 to-blue-400',
      'Rosa': 'bg-gradient-to-br from-pink-500 to-pink-300',
      'Transparente': 'bg-gradient-to-br from-gray-100 to-gray-50',
      'Verde': 'bg-gradient-to-br from-green-600 to-green-400',
      'Morado': 'bg-gradient-to-br from-purple-600 to-purple-400',
      'Rojo': 'bg-gradient-to-br from-red-600 to-red-400',
      'Amarillo': 'bg-gradient-to-br from-yellow-500 to-yellow-300'
    };

    return colorMap[color] || 'bg-gradient-to-br from-gray-500 to-gray-400';
  };

  // Check if this specific variant is in cart (based on id which includes model+color)
  const item = createCartItem();
  const isInCart = isItemInCart(item.productId, item.variantId);

  return (
    <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-gray-100 hover:shadow-3xl hover:shadow-blue-200/30 transition-all duration-300">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="space-y-6">
        {/* Product Title */}
        <div className="relative">
          <div className="absolute -left-2 top-0 w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
            Carcasa iPhone Premium
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current drop-shadow-sm" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600">(4.8) · 124 reseñas</span>
          </div>
        </div>

        {/* Price with gradient card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formatPrice(price)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-blue-600 font-medium mt-3 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Envío gratis a todo el mundo
          </p>
        </div>

        {/* Model Selection - Futurista */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Modelo de iPhone
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {models.map((model) => (
              <button
                key={model}
                onClick={() => onModelChange(model)}
                className={`group relative p-4 border-2 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  selectedModel === model
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700 shadow-lg shadow-blue-200/50'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                {selectedModel === model && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {model}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection - Elegante */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Color
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`group relative p-4 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedColor === color
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-200/50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${getColorClasses(color)} shadow-lg ring-2 ${
                      selectedColor === color ? 'ring-blue-400 ring-offset-2' : 'ring-gray-200'
                    }`}></div>
                    {selectedColor === color && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${
                    selectedColor === color ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {color}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features - Premium */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-2xl border border-gray-200">
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
          <h4 className="font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
            Características Premium
          </h4>
          <ul className="space-y-3 relative">
            {[
              'Protección militar contra caídas',
              'Compatible con carga inalámbrica',
              'Acceso completo a puertos y botones',
              'Garantía de satisfacción 30 días'
            ].map((feature, i) => (
              <li key={i} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm text-green-700 font-bold">En stock · Listo para enviar</span>
          </div>
          <span className="text-xs text-green-600 font-medium">⚡ Envío inmediato</span>
        </div>

        {/* Add to Cart Button - Futurista */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isInCart}
            className={`relative w-full group overflow-hidden py-5 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
              isInCart
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-not-allowed'
                : isAdding
                ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            } shadow-2xl ${isInCart ? 'shadow-green-500/50' : 'shadow-blue-500/50'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
            {isAdding ? (
              <div className="relative flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Agregando...</span>
              </div>
            ) : isInCart ? (
              <div className="relative flex items-center justify-center space-x-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Ya en tu carrito</span>
              </div>
            ) : (
              <div className="relative flex items-center justify-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Agregar al Carrito</span>
                <span className="bg-white/20 px-2 py-1 rounded-lg text-sm">{formatPrice(price)}</span>
              </div>
            )}
          </button>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500 flex items-center justify-center space-x-4">
              <span className="flex items-center">🔒 Compra segura</span>
              <span className="flex items-center">💳 Múltiples pagos</span>
              <span className="flex items-center">📞 Soporte 24/7</span>
            </p>
          </div>
        </div>

        {/* Payment Methods - Elegante */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-200">
          <h4 className="text-sm font-bold text-gray-900 mb-4">Métodos de pago aceptados:</h4>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '💳', label: 'Tarjetas' },
              { icon: '💚', label: 'Yape/Plin' },
              { icon: '🏦', label: 'Transfer.' },
              { icon: '📱', label: 'PayPal' }
            ].map((method, i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="text-2xl mb-1">{method.icon}</div>
                <p className="text-xs font-semibold text-gray-700">{method.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators - Premium */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🛡️', title: 'Compra', subtitle: 'Protegida' },
            { icon: '📦', title: 'Envío', subtitle: 'Gratis' },
            { icon: '↩️', title: '30 días', subtitle: 'Garantía' }
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-all duration-200">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-xs font-bold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-600">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
