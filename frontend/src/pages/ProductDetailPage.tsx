// frontend/src/pages/ProductDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService, { Product, ProductVariant } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import ProductReviews from '../components/products/ProductReviews';
import WishlistButton from '../components/wishlist/WishlistButton';
import CompareButton from '../components/compare/CompareButton';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const loadProduct = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    try {
      const data = await productService.getProductBySlug(slug);
      if (data) {
        setProduct(data);
        // Seleccionar primera variante disponible
        const availableVariants = productService.getAvailableVariants(data);
        if (availableVariants.length > 0) {
          setSelectedVariant(availableVariants[0]);
        }

        // Product loaded successfully
      } else {
        toast.error('Producto no encontrado');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Refetch when tab becomes visible (e.g., after updating prices in admin)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProduct();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadProduct]);

  const handleAddToCart = () => {
    if (!product) return;

    const price = selectedVariant
      ? parseFloat(selectedVariant.price)
      : productService.getLowestPrice(product);

    const mainImage = productService.getMainImage(product);

    const item = {
      id: selectedVariant ? selectedVariant.id : product.id,
      productId: parseInt(product.id.replace(/[^0-9]/g, '')) || 1,
      variantId: selectedVariant ? parseInt(selectedVariant.id.replace(/[^0-9]/g, '')) : undefined,
      name: product.name,
      price,
      model: product.model || selectedVariant?.name || 'Universal',
      color: selectedVariant?.color || 'Default',
      quantity,
      image: mainImage,
      sku: selectedVariant?.sku || product.slug,
      maxQuantity: selectedVariant?.stockQuantity || product.stockCount
    };

    addItem(item);
    // Item added to cart successfully
  };

  const currentPrice = selectedVariant
    ? parseFloat(selectedVariant.price)
    : (product ? productService.getLowestPrice(product) : 0);

  const currentStock = selectedVariant
    ? selectedVariant.stockQuantity
    : product?.stockCount || 0;

  const isAvailable = product && productService.isAvailable(product);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link to="/" className="hover:text-blue-600">Inicio</Link></li>
            <li>/</li>
            <li><Link to="/products" className="hover:text-blue-600">Productos</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images[selectedImageIndex]?.url || 'https://placehold.co/600x600?text=No+Image'}
                  alt={product.images[selectedImageIndex]?.altText || product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image';
                  }}
                />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-8">

              {/* Title and Price */}
              <div className="mb-6">
                {product.isFeatured && (
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    ⭐ Producto Destacado
                  </span>
                )}

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                <div className="flex items-baseline space-x-3 mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {formatPrice(currentPrice)}
                  </span>
                  {selectedVariant?.comparePrice && parseFloat(selectedVariant.comparePrice) > currentPrice && (
                    <span className="text-2xl text-gray-400 line-through">
                      {formatPrice(parseFloat(selectedVariant.comparePrice))}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {isAvailable ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">Disponible</span>
                      </div>
                      <span className="text-sm text-gray-600">Listo para enviar</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 bg-red-50 px-3 py-1.5 rounded-lg inline-flex">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Agotado</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'Carcasa de alta calidad para proteger tu iPhone.'}
                </p>
              </div>

              {/* Compatibility */}
              {product.compatibility && product.compatibility.length > 0 && (() => {
                // Convertir a array si es string
                const compatArray = Array.isArray(product.compatibility)
                  ? product.compatibility
                  : (typeof product.compatibility === 'string'
                      ? JSON.parse(product.compatibility)
                      : []);

                return (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Compatibilidad</h3>
                    <div className="flex flex-wrap gap-2">
                      {compatArray.map((model: string) => (
                        <span
                          key={model}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium"
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Variant Selection */}
              {product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Selecciona una opción:
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variants.filter(v => v.isActive).map(variant => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stockQuantity === 0}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          selectedVariant?.id === variant.id
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${variant.stockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-medium text-gray-900">{variant.color}</div>
                        <div className="text-sm text-gray-600">{formatPrice(parseFloat(variant.price))}</div>
                        {variant.stockQuantity === 0 && (
                          <div className="text-xs text-red-600 mt-1">Agotado</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Cantidad:</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-md hover:bg-gray-50 font-semibold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(currentStock, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center border border-gray-300 rounded-md py-2 font-semibold"
                    min="1"
                    max={currentStock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="w-10 h-10 border border-gray-300 rounded-md hover:bg-gray-50 font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
              >
                {isAvailable ? 'Agregar al Carrito' : 'Producto Agotado'}
              </button>

              {/* Wishlist and Compare Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <WishlistButton productId={product.id} variant="button" />
                <CompareButton product={product} variant="button" />
              </div>

              {/* Additional Info */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-start text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-900">Envío internacional</span>
                    <p className="text-xs text-gray-500 mt-1">Tiempo estimado: 15-30 días hábiles</p>
                  </div>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-900">Garantía de satisfacción</span>
                    <p className="text-xs text-gray-500 mt-1">30 días de garantía en todos los productos</p>
                  </div>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-900">Pago seguro</span>
                    <p className="text-xs text-gray-500 mt-1">Métodos de pago seguros y verificados</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <ProductReviews productId={product.id} />
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
