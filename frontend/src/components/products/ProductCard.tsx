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
      // Notificación se muestra automáticamente desde CartContext

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
      'Morado': 'bg-gradient-to-br from-cyan-600 to-cyan-400',
      'Rojo': 'bg-gradient-to-br from-red-600 to-red-400',
      'Amarillo': 'bg-gradient-to-br from-yellow-500 to-yellow-300'
    };

    return colorMap[color] || 'bg-gradient-to-br from-gray-500 to-gray-400';
  };

  // Check if this specific variant is in cart (based on id which includes model+color)
  const item = createCartItem();
  const isInCart = isItemInCart(item.productId, item.variantId);

  return (
    <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-blue-300/50 dark:hover:border-blue-500/50 transition-all duration-500">
      {/* Badge de ENVÍO GRATIS - MUY NOTABLE */}
      <div className="absolute -top-3 -right-3 z-10">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-xl shadow-green-500/50 transform rotate-12 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center space-x-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-extrabold tracking-wide">ENVÍO GRATIS</span>
          </div>
        </div>
      </div>

      {/* Decorative gradient blob - más sutil */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="space-y-6">
        {/* Product Title - Más elegante */}
        <div className="relative">
          <div className="absolute -left-2 top-0 w-1 h-8 bg-gradient-to-b from-blue-500/60 to-cyan-500/60 dark:from-blue-400/60 dark:to-cyan-400/60 rounded-full"></div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
            Carcasa iPhone Premium
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex text-yellow-400 dark:text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current drop-shadow-sm" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">(4.8) · 124 reseñas</span>
          </div>
        </div>

        {/* Price with gradient card - Más sutil */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-900/20 dark:to-cyan-900/10 rounded-2xl p-5 border border-blue-100/50 dark:border-blue-800/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 dark:from-blue-400/20 dark:to-cyan-400/20 rounded-full blur-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {formatPrice(price)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 bg-green-100/80 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg px-3 py-2">
            <p className="text-sm text-green-700 dark:text-green-300 font-bold flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Envío GRATIS en compras +S/80 con código <span className="ml-1 bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded font-extrabold">ENVIOGRATIS</span>
            </p>
          </div>
        </div>

        {/* Model Selection - Más elegante */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    ? 'border-blue-400 dark:border-blue-500 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-900/30 dark:to-cyan-900/20 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/50'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg'
                }`}
              >
                {selectedModel === model && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    ? 'border-blue-400 dark:border-blue-500 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-900/30 dark:to-cyan-900/20 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/50'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${getColorClasses(color)} shadow-lg ring-2 ${
                      selectedColor === color ? 'ring-blue-400 dark:ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : 'ring-gray-200 dark:ring-gray-700'
                    }`}></div>
                    {selectedColor === color && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${
                    selectedColor === color ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {color}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features - Premium - Más sutil */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/20 p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-full blur-2xl"></div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-500/80 to-cyan-500/80 dark:from-blue-500 dark:to-cyan-500 rounded-lg flex items-center justify-center mr-2">
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
                <div className="w-6 h-6 bg-gradient-to-br from-green-500/90 to-emerald-500/90 dark:from-green-500 dark:to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stock Status - Más sutil */}
        <div className="flex items-center justify-between p-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl border border-green-200/50 dark:border-green-800/30">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm text-green-700 dark:text-green-300 font-bold">En stock · Listo para enviar</span>
          </div>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">⚡ Envío inmediato</span>
        </div>

        {/* Add to Cart Button - Más elegante */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isInCart}
            className={`relative w-full group overflow-hidden py-5 px-6 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 ${
              isInCart
                ? 'bg-gradient-to-r from-green-500/90 to-emerald-500/90 dark:from-green-500 dark:to-emerald-500 text-white cursor-not-allowed'
                : isAdding
                ? 'bg-gradient-to-r from-blue-400/90 to-cyan-400/90 dark:from-blue-400 dark:to-cyan-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600'
            } shadow-xl ${isInCart ? 'shadow-green-500/30 dark:shadow-green-500/50' : 'shadow-blue-500/30 dark:shadow-blue-500/50'}`}
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

        {/* Payment Methods - Más sutil */}
        <div className="bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/30 p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Métodos de pago aceptados:</h4>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '💳', label: 'Tarjetas' },
              { icon: '💚', label: 'Yape/Plin' },
              { icon: '🏦', label: 'Transfer.' },
              { icon: '📱', label: 'PayPal' }
            ].map((method, i) => (
              <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-center hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300">
                <div className="text-2xl mb-1">{method.icon}</div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{method.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators - Más sutil */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🛡️', title: 'Compra', subtitle: 'Protegida' },
            { icon: '📦', title: 'Envío', subtitle: 'Gratis' },
            { icon: '↩️', title: '30 días', subtitle: 'Garantía' }
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/30 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-lg hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{item.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
