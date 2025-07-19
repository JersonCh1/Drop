// frontend/src/components/products/ProductCard.tsx
import React from 'react';
import { useCart, CartItem } from '../../context/CartContext';
import analyticsService from '../../services/analyticsService';

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
  const { addItem, openCart } = useCart();

  const handleAddToCart = () => {
    const item = createCartItem();
    addItem(item);
    openCart();

    // Track analytics
    analyticsService.trackAddToCart(
      item.productId,
      1,
      item.price,
      item.name
    );
  };

  const handleModelChange = (model: string) => {
    onModelChange(model);
    analyticsService.trackCustomEvent('product_option_changed', {
      option_type: 'model',
      option_value: model,
      product_name: 'Carcasa iPhone Premium'
    });
  };

  const handleColorChange = (color: string) => {
    onColorChange(color);
    analyticsService.trackCustomEvent('product_option_changed', {
      option_type: 'color',
      option_value: color,
      product_name: 'Carcasa iPhone Premium'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Carcasa iPhone Premium</h2>
        <div className="flex items-center space-x-4 mb-4">
          <p className="text-3xl font-bold text-blue-600">${price}</p>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-600 ml-2">(4.8) 234 reseñas</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Modelo de iPhone
          </label>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Color
          </label>
          <div className="grid grid-cols-2 gap-3">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedColor === color
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full border ${getColorClasses(color)}`}></div>
                  <span>{color}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Precio base:</span>
            <span className="font-medium">${price}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-600">Envío:</span>
            <span className="font-medium text-green-600">GRATIS</span>
          </div>
          <div className="border-t mt-3 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-blue-600">${price}</span>
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-105"
        >
          Agregar al Carrito - ${price}
        </button>

        {/* Quick Actions */}
        <div className="flex space-x-3">
          <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            💝 Lista de Deseos
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            📤 Compartir
          </button>
        </div>

        {/* Product Features */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Características Destacadas
          </h3>
          <ul className="space-y-3">
            <FeatureItem 
              icon="🛡️" 
              title="Protección Militar"
              description="Resistente a caídas desde 2 metros"
            />
            <FeatureItem 
              icon="🔌" 
              title="Acceso Total"
              description="Todos los puertos y botones accesibles"
            />
            <FeatureItem 
              icon="💎" 
              title="Material Premium"
              description="TPU flexible y PC resistente"
            />
            <FeatureItem 
              icon="🚚" 
              title="Envío Express"
              description="Entrega en 5-10 días hábiles"
            />
          </ul>
        </div>

        {/* Trust Badges */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-1 text-green-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Garantía 30 días</span>
            </div>
            <div className="flex items-center space-x-1 text-green-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Compra Segura</span>
            </div>
            <div className="flex items-center space-x-1 text-green-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span className="font-medium">Envío Gratis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para características
interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <li className="flex items-start space-x-3">
    <span className="text-lg">{icon}</span>
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </li>
);

// Función para obtener clases de color
const getColorClasses = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    'Negro': 'bg-gray-900',
    'Azul': 'bg-blue-500',
    'Rosa': 'bg-pink-400',
    'Transparente': 'bg-gray-100 border-gray-300',
    'Verde': 'bg-green-500',
    'Morado': 'bg-purple-500'
  };
  
  return colorMap[color] || 'bg-gray-300';
};

export default ProductCard;