// frontend/src/components/products/UrgencyIndicators.tsx
import React, { useState, useEffect } from 'react';

interface UrgencyIndicatorsProps {
  stockCount?: number;
  showTimer?: boolean;
  showViewers?: boolean;
  productId?: number;
}

const UrgencyIndicators: React.FC<UrgencyIndicatorsProps> = ({
  stockCount = 15,
  showTimer = true,
  showViewers = true,
  productId = 1
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 47,
    seconds: 30
  });
  const [viewers, setViewers] = useState(12);

  // Countdown timer
  useEffect(() => {
    if (!showTimer) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset cuando llega a 0
          return { hours: 2, minutes: 47, seconds: 30 };
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer]);

  // Simulate viewers count changing
  useEffect(() => {
    if (!showViewers) return;

    const interval = setInterval(() => {
      setViewers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return Math.max(8, Math.min(25, newValue)); // Between 8-25 viewers
      });
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [showViewers]);

  const isLowStock = stockCount <= 10;
  const isCriticalStock = stockCount <= 5;

  return (
    <div className="space-y-3">
      {/* Low Stock Warning */}
      {isLowStock && (
        <div className={`relative overflow-hidden p-4 rounded-xl border-2 ${
          isCriticalStock
            ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-300'
            : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
        }`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse"></div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCriticalStock ? 'bg-red-500' : 'bg-orange-500'
              }`}>
                <svg className="w-6 h-6 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              {isCriticalStock && (
                <div className="absolute inset-0 w-10 h-10 bg-red-500 rounded-full animate-ping opacity-75"></div>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-bold text-sm ${isCriticalStock ? 'text-red-800' : 'text-orange-800'}`}>
                {isCriticalStock ? '¡Últimas unidades!' : '¡Stock limitado!'}
              </p>
              <p className={`text-xs ${isCriticalStock ? 'text-red-700' : 'text-orange-700'}`}>
                Solo quedan <span className="font-black text-lg">{stockCount}</span> unidades disponibles
              </p>
            </div>
            {isCriticalStock && (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                ⚡ CRÍTICO
              </div>
            )}
          </div>
        </div>
      )}

      {/* Limited Time Offer Timer */}
      {showTimer && (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-pink-600 p-4 rounded-xl border-2 border-blue-400 shadow-lg shadow-blue-500/50">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">🔥 Oferta por tiempo limitado</p>
                  <p className="text-white/80 text-xs">-30% de descuento termina en:</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Hours */}
              <div className="flex-1 bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30">
                <div className="text-center">
                  <p className="text-3xl font-black text-white tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </p>
                  <p className="text-white/70 text-xs font-semibold mt-1">Horas</p>
                </div>
              </div>

              <span className="text-white text-2xl font-bold">:</span>

              {/* Minutes */}
              <div className="flex-1 bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30">
                <div className="text-center">
                  <p className="text-3xl font-black text-white tabular-nums">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </p>
                  <p className="text-white/70 text-xs font-semibold mt-1">Minutos</p>
                </div>
              </div>

              <span className="text-white text-2xl font-bold">:</span>

              {/* Seconds */}
              <div className="flex-1 bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30">
                <div className="text-center">
                  <p className="text-3xl font-black text-white tabular-nums animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </p>
                  <p className="text-white/70 text-xs font-semibold mt-1">Segundos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Viewers Counter */}
      {showViewers && (
        <div className="relative overflow-hidden bg-gradient-to-r from-cyan-50 to-pink-50 p-3 rounded-xl border-2 border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="flex-1">
              <p className="text-cyan-900 font-bold text-sm flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-black text-lg text-cyan-600">{viewers}</span>
                <span className="ml-1">personas viendo este producto ahora</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Free Shipping Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="text-green-900 font-black text-base">✈️ Envío GRATIS a todo el mundo</p>
              <p className="text-green-700 text-xs font-semibold">Entrega estimada: 5-10 días hábiles</p>
            </div>
          </div>
          <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transform -rotate-2">
            GRATIS
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
              +89
            </div>
          </div>
          <p className="text-sm text-blue-900 font-semibold flex-1">
            <span className="font-black">+150 personas</span> compraron esta funda hoy
          </p>
        </div>
      </div>
    </div>
  );
};

export default UrgencyIndicators;
