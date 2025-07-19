// frontend/src/components/layout/Header.tsx
import React from 'react';
import { useCart } from '../../context/CartContext';

interface HeaderProps {
  onAdminClick: () => void;
  adminToken: string | null;
  onAdminLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick, adminToken, onAdminLogout }) => {
  const { totalItems, openCart } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📱</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">iPhone Cases Store</h1>
            </a>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Inicio
            </a>
            <a href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
              Productos
            </a>
            <a href="/track" className="text-gray-600 hover:text-gray-900 transition-colors">
              Rastrear Orden
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Admin Button */}
            <button
              onClick={onAdminClick}
              className={`p-2 rounded-md transition-colors ${
                adminToken 
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title={adminToken ? 'Panel de Administración (Autenticado)' : 'Acceder como Admin'}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {adminToken && (
                  <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
                )}
              </div>
            </button>
            
            {/* Logout Button (solo si está autenticado) */}
            {adminToken && (
              <button
                onClick={onAdminLogout}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                title="Cerrar Sesión Admin"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
            
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;