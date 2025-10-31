import React from 'react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedMethod, onSelectMethod }) => {

  const paymentMethods = [
    {
      id: 'izipay',
      name: 'Tarjeta',
      description: 'Visa, Mastercard, Amex',
      icon: '💳',
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      hoverGradient: 'from-blue-700 via-indigo-700 to-purple-700',
      badge: 'Recomendado',
      badgeColor: 'bg-green-500',
      commission: 'BCP'
    },
    {
      id: 'yape',
      name: 'Yape',
      description: 'Instant\u00e1neo y f\u00e1cil',
      icon: '📱',
      gradient: 'from-purple-600 via-pink-600 to-rose-600',
      hoverGradient: 'from-purple-700 via-pink-700 to-rose-700',
      badge: 'Gratis',
      badgeColor: 'bg-purple-500',
      commission: 'Sin comisi\u00f3n'
    },
    {
      id: 'plin',
      name: 'Plin',
      description: 'Todos los bancos',
      icon: '💸',
      gradient: 'from-cyan-600 via-sky-600 to-blue-600',
      hoverGradient: 'from-cyan-700 via-sky-700 to-blue-700',
      badge: 'Gratis',
      badgeColor: 'bg-cyan-500',
      commission: 'Sin comisi\u00f3n'
    },
    {
      id: 'mercadopago',
      name: 'MercadoPago',
      description: 'Pago online',
      icon: '⚡',
      gradient: 'from-blue-600 via-cyan-600 to-teal-600',
      hoverGradient: 'from-blue-700 via-cyan-700 to-teal-700',
      badge: 'Popular',
      badgeColor: 'bg-blue-500',
      commission: 'Variable'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header con animación */}
      <div className="text-center space-y-2 animate-fade-in">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          Elige tu método de pago
        </h3>
        <p className="text-sm text-gray-600 flex items-center justify-center">
          <svg className="w-4 h-4 mr-2 text-green-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Protección SSL 256-bit • Transacciones 100% seguras
        </p>
      </div>

      {/* Grid de métodos de pago - Estilo futurista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map((method, index) => {
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelectMethod(method.id)}
              className={`
                relative group overflow-hidden
                rounded-2xl p-6
                transition-all duration-500 ease-out
                transform hover:scale-105 hover:-translate-y-1
                ${isSelected
                  ? 'scale-105 shadow-2xl ring-4 ring-offset-2 ring-blue-500'
                  : 'shadow-lg hover:shadow-2xl'
                }
              `}
              style={{
                animation: `fadeInUp 0.${index + 5}s ease-out`,
                animationFillMode: 'both'
              }}
            >
              {/* Fondo con gradiente animado */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${isSelected ? method.gradient : 'from-gray-50 to-gray-100'}
                transition-all duration-500
                ${!isSelected && 'group-hover:from-gray-100 group-hover:to-gray-200'}
              `}>
                {/* Efecto de brillo animado */}
                <div className={`
                  absolute inset-0 opacity-0 group-hover:opacity-100
                  bg-gradient-to-r from-transparent via-white/20 to-transparent
                  transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                  transition-all duration-1000
                `} />
              </div>

              {/* Contenido */}
              <div className="relative z-10 space-y-4">
                {/* Badge y icono */}
                <div className="flex items-start justify-between">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center text-4xl
                    transform transition-all duration-300
                    ${isSelected
                      ? 'bg-white/20 backdrop-blur-sm scale-110 rotate-6'
                      : 'bg-white/80 group-hover:scale-110 group-hover:rotate-6'
                    }
                  `}>
                    <span className="animate-bounce">{method.icon}</span>
                  </div>

                  {/* Badge */}
                  <div className={`
                    ${method.badgeColor} text-white text-xs font-bold
                    px-3 py-1 rounded-full
                    transform transition-all duration-300
                    ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
                  `}>
                    {method.badge}
                  </div>
                </div>

                {/* Información */}
                <div className="space-y-1">
                  <h4 className={`
                    text-xl font-black
                    ${isSelected ? 'text-white' : 'text-gray-900'}
                    transition-colors duration-300
                  `}>
                    {method.name}
                  </h4>
                  <p className={`
                    text-sm font-medium
                    ${isSelected ? 'text-white/90' : 'text-gray-600'}
                    transition-colors duration-300
                  `}>
                    {method.description}
                  </p>
                </div>

                {/* Comisión */}
                <div className={`
                  flex items-center justify-between
                  pt-3 border-t
                  ${isSelected ? 'border-white/30' : 'border-gray-300'}
                  transition-colors duration-300
                `}>
                  <span className={`
                    text-xs font-semibold
                    ${isSelected ? 'text-white/80' : 'text-gray-500'}
                  `}>
                    Comisión
                  </span>
                  <span className={`
                    text-sm font-black
                    ${isSelected ? 'text-white' : 'text-gray-900'}
                  `}>
                    {method.commission}
                  </span>
                </div>

                {/* Check mark para seleccionado */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {/* Borde brillante al hover */}
                <div className={`
                  absolute inset-0 rounded-2xl
                  transition-all duration-300
                  ${isSelected
                    ? 'ring-2 ring-white/50'
                    : 'ring-0 group-hover:ring-2 group-hover:ring-gray-400/50'
                  }
                `} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Indicadores de confianza */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Encriptación SSL</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Verificado</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">+10,000 pagos</span>
        </div>
      </div>

      {/* CSS para animaciones */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentMethodSelector;
