import React, { useState, useEffect } from 'react';
import wishlistService from '../../services/wishlistService';
import toast from 'react-hot-toast';

interface WishlistButtonProps {
  productId: string;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  variant = 'icon',
  size = 'md',
  className = ''
}) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if product is in wishlist on mount
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const isInWishlist = await wishlistService.checkInWishlist(productId);
        setInWishlist(isInWishlist);
      } catch (error) {
        // User not logged in, that's fine
      } finally {
        setChecking(false);
      }
    };

    checkWishlist();
  }, [productId]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);

    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(productId);
        setInWishlist(false);
        toast.success('Eliminado de favoritos');
      } else {
        await wishlistService.addToWishlist(productId);
        setInWishlist(true);
        toast.success('Añadido a favoritos');
      }
    } catch (error: any) {
      if (error.message.includes('autenticado') || error.message.includes('sesión')) {
        toast.error('Debes iniciar sesión para añadir a favoritos');
      } else {
        toast.error(inWishlist ? 'Error al eliminar de favoritos' : 'Error al añadir a favoritos');
      }
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (checking) {
    return null; // or a loading skeleton
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggleWishlist}
        disabled={loading}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-all duration-300 ${
          inWishlist
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'} shadow-md ${className}`}
        aria-label={inWishlist ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
      >
        {loading ? (
          <svg className={`${iconSizes[size]} animate-spin`} fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className={iconSizes[size]}
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
      </button>
    );
  }

  // Button variant
  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        inWishlist
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <svg
        className="w-5 h-5"
        fill={inWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{inWishlist ? 'En favoritos' : 'Añadir a favoritos'}</span>
    </button>
  );
};

export default WishlistButton;
