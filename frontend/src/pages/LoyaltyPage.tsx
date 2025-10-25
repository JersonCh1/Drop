// frontend/src/pages/LoyaltyPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface LoyaltyData {
  points: number;
  totalEarned: number;
  totalSpent: number;
  valueInDollars: string;
  transactions: LoyaltyTransaction[];
  config: {
    PER_DOLLAR: number;
    PER_REVIEW: number;
    PER_REFERRAL: number;
    REDEMPTION_RATE: number;
  };
}

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: string;
  description: string;
  createdAt: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  totalEarned: number;
  currentPoints: number;
}

const LoyaltyPage: React.FC = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (user) {
      loadLoyaltyData();
      loadLeaderboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadLoyaltyData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/loyalty/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setLoyaltyData(data);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
      toast.error('Error al cargar puntos');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/loyalty/leaderboard`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleRedeem = async () => {
    const points = parseInt(redeemAmount);
    if (!points || points <= 0) {
      toast.error('Ingresa una cantidad válida');
      return;
    }

    if (!loyaltyData || points > loyaltyData.points) {
      toast.error('No tienes suficientes puntos');
      return;
    }

    setIsRedeeming(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/loyalty/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ points })
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setRedeemAmount('');
        loadLoyaltyData();
      } else {
        toast.error(data.error || 'Error al canjear puntos');
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      toast.error('Error al canjear puntos');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inicia sesión para ver tus puntos
          </h2>
          <p className="text-gray-600 mb-6">
            Accede a tu cuenta para ganar y canjear puntos de lealtad
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Programa de Lealtad
          </h1>
          <p className="text-gray-600">
            Gana puntos con cada compra y canjéalos por descuentos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Points Overview */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-md p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Puntos Disponibles</p>
                  <p className="text-5xl font-bold">{loyaltyData?.points || 0}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <p className="text-2xl font-bold">{loyaltyData?.totalEarned || 0}</p>
                  <p className="text-xs text-blue-100">Total Ganado</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <p className="text-2xl font-bold">{loyaltyData?.totalSpent || 0}</p>
                  <p className="text-xs text-blue-100">Total Canjeado</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <p className="text-2xl font-bold">${loyaltyData?.valueInDollars || '0.00'}</p>
                  <p className="text-xs text-blue-100">Valor en $</p>
                </div>
              </div>
            </div>

            {/* Redeem Points */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Canjear Puntos
              </h2>
              <p className="text-gray-600 mb-4">
                {loyaltyData?.config.REDEMPTION_RATE} puntos = $1.00 de descuento
              </p>

              <div className="flex gap-3">
                <input
                  type="number"
                  min="0"
                  max={loyaltyData?.points || 0}
                  step="100"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  placeholder="Cantidad de puntos"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleRedeem}
                  disabled={isRedeeming || !redeemAmount}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {isRedeeming ? 'Canjeando...' : 'Canjear'}
                </button>
              </div>

              {redeemAmount && parseInt(redeemAmount) > 0 && (
                <p className="mt-3 text-sm text-gray-600">
                  Recibirás: <span className="font-semibold text-green-600">
                    ${(parseInt(redeemAmount) / (loyaltyData?.config.REDEMPTION_RATE || 100)).toFixed(2)}
                  </span> de descuento
                </p>
              )}
            </div>

            {/* How to Earn Points */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ¿Cómo ganar puntos?
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-600 text-white rounded-full p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Realizar Compras</p>
                    <p className="text-sm text-gray-600">
                      Gana {loyaltyData?.config.PER_DOLLAR} puntos por cada dólar gastado
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="bg-green-600 text-white rounded-full p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dejar Reseñas</p>
                    <p className="text-sm text-gray-600">
                      Gana {loyaltyData?.config.PER_REVIEW} puntos por cada reseña que dejes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="bg-purple-600 text-white rounded-full p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Referir Amigos</p>
                    <p className="text-sm text-gray-600">
                      Gana {loyaltyData?.config.PER_REFERRAL} puntos cuando un amigo haga su primera compra
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Historial de Transacciones
              </h2>

              {loyaltyData?.transactions && loyaltyData.transactions.length > 0 ? (
                <div className="space-y-3">
                  {loyaltyData.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No tienes transacciones aún. ¡Comienza a ganar puntos!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Leaderboard */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏆</span>
                Top 10 Miembros
              </h2>

              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                        entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                        entry.rank === 3 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {entry.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                        <p className="text-xs text-gray-600">{entry.totalEarned} puntos totales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{entry.currentPoints}</p>
                        <p className="text-xs text-gray-500">actuales</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No hay datos disponibles
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Acciones Rápidas
              </h2>

              <div className="space-y-3">
                <Link
                  to="/products"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Comprar Productos
                </Link>
                <Link
                  to="/orders"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Ver Mis Pedidos
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default LoyaltyPage;
