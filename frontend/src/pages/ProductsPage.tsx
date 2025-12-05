// frontend/src/pages/ProductsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import productService, { Product } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import WishlistButton from '../components/wishlist/WishlistButton';
import CompareButton from '../components/compare/CompareButton';
import LazyImage from '../components/common/LazyImage';
import AdvancedFilters from '../components/products/AdvancedFilters';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Filtros
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    priceMin: Number(searchParams.get('priceMin')) || 0,
    priceMax: Number(searchParams.get('priceMax')) || 1000,
    rating: Number(searchParams.get('rating')) || 0,
    categories: searchParams.get('categories')?.split(',') || [],
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'DESC'
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const page = parseInt(searchParams.get('page') || '1');

      const response = await productService.getProducts({
        page,
        limit: pagination.limit,
        search: filters.search || undefined,
        categories: filters.categories.length > 0 ? filters.categories : undefined,
        priceMin: filters.priceMin > 0 ? filters.priceMin : undefined,
        priceMax: filters.priceMax < 1000 ? filters.priceMax : undefined,
        rating: filters.rating > 0 ? filters.rating : undefined,
        sortBy: filters.sortBy as any,
        sortOrder: filters.sortOrder as any
      } as any);

      setProducts(response.data);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 12,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      });
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [searchParams, pagination.limit, filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Refetch when tab becomes visible (e.g., after updating prices in admin)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadProducts]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);

    const params = new URLSearchParams();
    params.set('page', '1');
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.priceMin > 0) params.set('priceMin', newFilters.priceMin.toString());
    if (newFilters.priceMax < 1000) params.set('priceMax', newFilters.priceMax.toString());
    if (newFilters.rating > 0) params.set('rating', newFilters.rating.toString());
    if (newFilters.categories.length > 0) params.set('categories', newFilters.categories.join(','));
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder);

    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (product: Product) => {
    const lowestPrice = productService.getLowestPrice(product);
    const mainImage = productService.getMainImage(product);

    addItem({
      id: product.id,
      productId: parseInt(product.id.replace(/[^0-9]/g, '')) || 1,
      name: product.name,
      price: lowestPrice,
      model: product.model || 'Universal',
      color: product.variants[0]?.color || 'Default',
      quantity: 1,
      image: mainImage,
      sku: product.variants[0]?.sku || product.slug,
      maxQuantity: product.stockCount
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decoration matching Hero & Home */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
            Todos los <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Productos</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {pagination.total} productos disponibles
          </p>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          availableCategories={categories}
        />

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros o buscar con otros términos
            </p>
            <button
              onClick={() => {
                const resetFilters = {
                  search: '',
                  priceMin: 0,
                  priceMax: 1000,
                  rating: 0,
                  categories: [],
                  sortBy: 'createdAt',
                  sortOrder: 'DESC'
                };
                setFilters(resetFilters);
                setSearchParams(new URLSearchParams());
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum: number;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 border rounded-md ${
                    pagination.page === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { formatPrice } = useCurrency();
  const mainImage = productService.getMainImage(product);
  const lowestPrice = productService.getLowestPrice(product);
  const isAvailable = productService.isAvailable(product);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group transform hover:scale-105 hover:-translate-y-1">
      <Link to={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <LazyImage
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Action Buttons - Show on hover */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-4">
            <WishlistButton productId={product.id} variant="icon" size="md" />
            <CompareButton product={product} variant="icon" size="md" />
          </div>

          {product.isFeatured && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
              ⭐ Destacado
            </div>
          )}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-xl">
                Agotado
              </span>
            </div>
          )}

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 min-h-[56px]">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {product.description || 'Carcasa de alta calidad para tu iPhone'}
        </p>

        {product.compatibility && (() => {
          try {
            const compatArray = typeof product.compatibility === 'string'
              ? JSON.parse(product.compatibility)
              : product.compatibility;

            if (Array.isArray(compatArray) && compatArray.length > 0) {
              return (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {compatArray.slice(0, 2).map(model => (
                      <span
                        key={model}
                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium"
                      >
                        {model}
                      </span>
                    ))}
                    {compatArray.length > 2 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium">
                        +{compatArray.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            }
          } catch (e) {
            return null;
          }
          return null;
        })()}

        <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Precio desde</p>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {formatPrice(lowestPrice)}
            </span>
            {product.variants.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {product.variants.length} variantes
              </p>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={!isAvailable}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {isAvailable ? '+ Agregar' : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
