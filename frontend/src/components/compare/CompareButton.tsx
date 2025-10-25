import React from 'react';
import { useCompare } from '../../context/CompareContext';
import { Product } from '../../services/productService';
import toast from 'react-hot-toast';

interface CompareButtonProps {
  product: Product;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CompareButton: React.FC<CompareButtonProps> = ({
  product,
  variant = 'icon',
  size = 'md',
  className = ''
}) => {
  const { addToCompare, removeFromCompare, isInCompare, compareProducts } = useCompare();
  const inCompare = isInCompare(product.id);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCompare) {
      removeFromCompare(product.id);
      toast.success('Eliminado del comparador');
    } else {
      if (compareProducts.length >= 4) {
        toast.error('Máximo 4 productos para comparar');
        return;
      }
      addToCompare(product);
      toast.success('Añadido al comparador');
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

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggleCompare}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-all duration-300 ${
          inCompare
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-500'
        } hover:scale-110 shadow-md ${className}`}
        aria-label={inCompare ? 'Eliminar del comparador' : 'Añadir al comparador'}
      >
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleCompare}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        inCompare
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-500'
      } ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <span>{inCompare ? 'En comparador' : 'Comparar'}</span>
    </button>
  );
};

export default CompareButton;
