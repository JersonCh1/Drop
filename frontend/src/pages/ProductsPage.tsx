// frontend/src/pages/ProductsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import productService, { Product } from '../services/productService';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import WishlistButton from '../components/wishlist/WishlistButton';
import CompareButton from '../components/compare/CompareButton';
import LazyImage from '../components/common/LazyImage';
import AdvancedFilters from '../components/products/AdvancedFilters';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();

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
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/categories`);
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.map((cat: any) => ({ id: cat.id, name: cat.name })));
        }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Todos los Productos</h1>
          <p className="text-gray-600">
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
  const mainImage = productService.getMainImage(product);
  const lowestPrice = productService.getLowestPrice(product);
  const isAvailable = productService.isAvailable(product);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <Link to={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-100">
          <LazyImage
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {/* Action Buttons - Show on hover */}
          <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <WishlistButton productId={product.id} variant="icon" size="md" />
            <CompareButton product={product} variant="icon" size="md" />
          </div>

          {product.isFeatured && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-semibold">
              ⭐ Destacado
            </div>
          )}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold">
                Agotado
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description || 'Carcasa de alta calidad para tu iPhone'}
        </p>

        {product.compatibility && (() => {
          try {
            const compatArray = typeof product.compatibility === 'string'
              ? JSON.parse(product.compatibility)
              : product.compatibility;

            if (Array.isArray(compatArray) && compatArray.length > 0) {
              return (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {compatArray.slice(0, 2).map(model => (
                      <span
                        key={model}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {model}
                      </span>
                    ))}
                    {compatArray.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
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

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              ${lowestPrice.toFixed(2)}
            </span>
            {product.variants.length > 0 && (
              <p className="text-xs text-gray-500">
                {product.variants.length} variantes
              </p>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={!isAvailable}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isAvailable ? 'Agregar' : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
