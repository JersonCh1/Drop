import React, { useState, useEffect } from 'react';
import { XMarkIcon, ShoppingBagIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'purchase' | 'viewing' | 'review';
  message: string;
  location?: string;
  time: string;
  icon: 'bag' | 'eye' | 'check';
}

// Datos simulados de notificaciones
const mockNotifications: Omit<Notification, 'id' | 'time'>[] = [
  {
    type: 'purchase',
    message: 'Juan de Lima',
    location: 'compró una carcasa iPhone 14 Pro',
    icon: 'bag'
  },
  {
    type: 'viewing',
    message: '5 personas',
    location: 'están viendo este producto ahora',
    icon: 'eye'
  },
  {
    type: 'purchase',
    message: 'María de Arequipa',
    location: 'compró 2 carcasas iPhone 13',
    icon: 'bag'
  },
  {
    type: 'review',
    message: 'Carlos de Cusco',
    location: 'dejó una reseña de 5 estrellas',
    icon: 'check'
  },
  {
    type: 'purchase',
    message: 'Ana de Trujillo',
    location: 'compró una carcasa iPhone 15 Pro Max',
    icon: 'bag'
  },
  {
    type: 'viewing',
    message: '12 personas',
    location: 'vieron este producto en la última hora',
    icon: 'eye'
  },
  {
    type: 'purchase',
    message: 'Pedro de Chiclayo',
    location: 'compró una carcasa iPhone 14',
    icon: 'bag'
  },
  {
    type: 'review',
    message: 'Lucía de Piura',
    location: 'dejó una reseña positiva',
    icon: 'check'
  },
  {
    type: 'purchase',
    message: 'Diego de Ica',
    location: 'compró una carcasa iPhone 13 Pro',
    icon: 'bag'
  },
  {
    type: 'viewing',
    message: '8 personas',
    location: 'agregaron este producto al carrito',
    icon: 'bag'
  }
];

const SocialProof: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Función para generar tiempo aleatorio reciente
  const getRandomTime = () => {
    const minutes = Math.floor(Math.random() * 30) + 1;
    if (minutes === 1) return 'hace 1 minuto';
    if (minutes < 60) return `hace ${minutes} minutos`;
    return 'hace 1 hora';
  };

  // Función para mostrar una nueva notificación
  const showNotification = () => {
    const notification = mockNotifications[currentIndex];
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...notification,
      time: getRandomTime()
    };

    setNotifications([newNotification]);
    setIsVisible(true);

    // Ocultar después de 5 segundos
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setNotifications([]);
      }, 300); // Tiempo para la animación de salida
    }, 5000);

    // Mover al siguiente índice
    setCurrentIndex((prev) => (prev + 1) % mockNotifications.length);
  };

  useEffect(() => {
    // Verificar si el usuario ya cerró las notificaciones
    const dismissed = localStorage.getItem('socialProofDismissed');
    if (dismissed) {
      return;
    }

    // Mostrar primera notificación después de 15 segundos
    const initialTimer = setTimeout(() => {
      showNotification();
    }, 15000);

    // Mostrar notificaciones cada 45 segundos
    const interval = setInterval(() => {
      if (!isVisible) {
        showNotification();
      }
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('socialProofDismissed', 'true');
    setTimeout(() => {
      setNotifications([]);
    }, 300);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setNotifications([]);
    }, 300);
  };

  const getIcon = (iconType: 'bag' | 'eye' | 'check') => {
    switch (iconType) {
      case 'bag':
        return <ShoppingBagIcon className="w-5 h-5" />;
      case 'eye':
        return <EyeIcon className="w-5 h-5" />;
      case 'check':
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <ShoppingBagIcon className="w-5 h-5" />;
    }
  };

  const getIconBgColor = (iconType: 'bag' | 'eye' | 'check') => {
    switch (iconType) {
      case 'bag':
        return 'bg-blue-500';
      case 'eye':
        return 'bg-cyan-500';
      case 'check':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            transform transition-all duration-300 ease-out
            ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
          `}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 mb-2 relative overflow-hidden">
            {/* Animated gradient border top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-pink-500 animate-gradient-x"></div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar notificación"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`${getIconBgColor(notification.icon)} rounded-full p-2 flex-shrink-0 text-white`}>
                {getIcon(notification.icon)}
              </div>

              {/* Content */}
              <div className="flex-1 pr-6">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">
                  {notification.message}
                </p>
                {notification.location && (
                  <p className="text-xs text-gray-600">
                    {notification.location}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {notification.time}
                </p>
              </div>
            </div>

            {/* Dismiss forever button */}
            <button
              onClick={handleDismiss}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              No mostrar más
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-shrink"
                style={{ animationDuration: '5s' }}
              ></div>
            </div>
          </div>
        </div>
      ))}

      {/* Custom animations */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-shrink {
          animation: shrink linear forwards;
        }
      `}</style>
    </div>
  );
};

export default SocialProof;
