// frontend/src/components/cart/CartSidebar.tsx
import React from 'react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

interface CartSidebarProps {
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ onCheckout }) => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalPrice,
    shippingCost,
    finalTotal,
    clearCart
  } = useCart();

  const { formatPrice } = useCurrency();

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (items.length > 0) {
      onCheckout();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-50" 
        onClick={closeCart}
      ></div>
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">
              Carrito ({items.length} {items.length === 1 ? 'producto' : 'productos'})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
                <p className="text-gray-600 mb-6">Agrega productos para comenzar tu compra</p>
                <button
                  onClick={closeCart}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-600">📱</span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">{item.model} - {item.color}</p>
                        <p className="text-sm font-semibold text-blue-600">{formatPrice(item.price)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Clear Cart */}
                <button
                  onClick={clearCart}
                  className="w-full text-red-600 text-sm py-2 border border-red-200 rounded-md hover:bg-red-50 mb-4"
                >
                  Vaciar Carrito
                </button>

                {/* Indicador de Envío Gratis - MUY NOTABLE */}
                {(() => {
                  const FREE_SHIPPING_THRESHOLD = 80; // S/80
                  const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;
                  const progress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
                  const hasFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

                  return (
                    <div className={`mb-6 p-4 rounded-xl border-2 transition-all duration-300 ${
                      hasFreeShipping
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-lg shadow-green-200/50'
                        : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-400'
                    }`}>
                      {hasFreeShipping ? (
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-green-700 text-base">
                              🎉 ¡Felicidades! Envío GRATIS
                            </p>
                            <p className="text-sm text-green-600">
                              Usa el código: <span className="font-bold bg-green-200 px-2 py-0.5 rounded">ENVIOGRATIS</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-blue-800 text-sm">
                                ¡Casi lo logras! 🚚
                              </p>
                              <p className="text-xs text-blue-700">
                                Agrega <span className="font-extrabold text-lg text-blue-900">{formatPrice(remaining)}</span> más para ENVÍO GRATIS
                              </p>
                            </div>
                          </div>

                          {/* Barra de Progreso */}
                          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-blue-600 mt-1">
                            <span>S/0</span>
                            <span className="font-bold">S/80 = GRATIS</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío:</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6">
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Proceder al Checkout - {formatPrice(finalTotal)}
              </button>
              <button
                onClick={closeCart}
                className="w-full mt-3 text-gray-600 py-2 hover:text-gray-800 transition-colors"
              >
                Continuar Comprando
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;