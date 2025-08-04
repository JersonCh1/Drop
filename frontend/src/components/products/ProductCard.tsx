// frontend/src/components/products/ProductCard.tsx
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.tsx';
import { CartItem } from '../../context/CartContext.tsx';
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
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      // Crear el item del carrito
      const item = createCartItem();
      
      // Verificar si ya está en el carrito
      if (isItemInCart(item.productId, item.variantId)) {
        toast.error('Este producto ya está en tu carrito', {
          icon: '⚠️',
          duration: 3000,
        });
        return;
      }

      // Simular delay de agregado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Agregar al carrito
      addItem(item);
      
      // Feedback visual exitoso
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

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  const getColorClasses = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      'Negro': 'bg-gray-900 border-gray-700',
      'Azul': 'bg-blue-600 border-blue-500',
      'Rosa': 'bg-pink-400 border-pink-300',
      'Transparente': 'bg-gray-100 border-gray-300',
      'Verde': 'bg-green-600 border-green-500',
      'Morado': 'bg-purple-600 border-purple-500',
      'Rojo': 'bg-red-600 border-red-500',
      'Amarillo': 'bg-yellow-400 border-yellow-300'
    };
    
    return colorMap[color] || 'bg-gray-500 border-gray-400';
  };

  const isInCart = isItemInCart(1); // ProductId 1 para el ejemplo

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-6">
        {/* Product Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Carcasa iPhone Premium
          </h2>
          <div className="flex items-center space-x-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">(4.8) · 124 reseñas</span>
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-blue-600">
              ${formatPrice(price)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              ${formatPrice(price * 1.4)}
            </span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-medium">
              30% OFF
            </span>
          </div>
          <p className="text-sm text-gray-600">Envío gratis a todo el mundo</p>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Modelo de iPhone
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {models.map((model) => (
              <button
                key={model}
                onClick={() => onModelChange(model)}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedModel === model
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Color
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`group relative p-3 border-2 rounded-lg transition-all duration-200 ${
                  selectedColor === color
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className={`w-6 h-6 rounded-full border-2 ${getColorClasses(color)} ${
                      color === 'Transparente' ? 'bg-gradient-to-br from-gray-100 to-gray-200' : ''
                    }`}
                  ></div>
                  <span className={`text-xs font-medium ${
                    selectedColor === color ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {color}
                  </span>
                </div>
                {selectedColor === color && (
                  <div className="absolute top-1 right-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Características:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Protección militar contra caídas</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Compatible con carga inalámbrica</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Acceso completo a puertos y botones</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Garantía de satisfacción 30 días</span>
            </li>
          </ul>
        </div>

        {/* Stock Status */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700 font-medium">En stock · Listo para enviar</span>
        </div>

        {/* Shipping Info */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Envío Gratis Mundial</h4>
              <p className="text-sm text-blue-700 mt-1">
                📦 Tiempo estimado: 5-10 días hábiles<br/>
                🚚 Tracking incluido · 📱 Soporte 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isInCart}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isInCart
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : isAdding
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:transform active:scale-98'
            } shadow-lg hover:shadow-xl`}
          >
            {isAdding ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Agregando...</span>
              </div>
            ) : isInCart ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>En tu carrito</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                </svg>
                <span>Agregar al Carrito · ${formatPrice(price)}</span>
              </div>
            )}
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔒 Compra segura · 💳 Pago al recibir · 📞 Soporte 24/7
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Métodos de pago aceptados:</h4>
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded border text-xs font-medium text-gray-700">
              💳 Tarjetas
            </div>
            <div className="bg-gray-100 p-2 rounded border text-xs font-medium text-gray-700">
              🏦 Transferencia
            </div>
            <div className="bg-gray-100 p-2 rounded border text-xs font-medium text-gray-700">
              📱 PayPal
            </div>
            <div className="bg-gray-100 p-2 rounded border text-xs font-medium text-gray-700">
              💵 Efectivo
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-1">🛡️</div>
              <p className="text-xs text-gray-600 font-medium">Compra Protegida</p>
            </div>
            <div>
              <div className="text-2xl mb-1">📦</div>
              <p className="text-xs text-gray-600 font-medium">Envío Gratis</p>
            </div>
            <div>
              <div className="text-2xl mb-1">↩️</div>
              <p className="text-xs text-gray-600 font-medium">30 días garantía</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;