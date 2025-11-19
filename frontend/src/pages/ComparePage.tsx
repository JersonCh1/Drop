import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCurrency } from '../context/CurrencyContext';
import SEOHead from '../components/SEO/SEOHead';
import productService from '../services/productService';

const ComparePage: React.FC = () => {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();
  const { formatPrice } = useCurrency();

  if (compareProducts.length === 0) {
    return (
      <>
        <SEOHead
          title="Comparar Productos - iPhone Cases"
          description="Compara características y precios de nuestras carcasas iPhone"
        />

        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
          <div className="text-center max-w-md px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No hay productos para comparar</h2>
            <p className="text-gray-600 mb-8">
              Añade productos al comparador para ver sus características lado a lado
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              <span>Explorar Productos</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const features = [
    { key: 'name', label: 'Nombre' },
    { key: 'basePrice', label: 'Precio Base' },
    { key: 'brand', label: 'Marca' },
    { key: 'compatibility', label: 'Compatibilidad' },
    { key: 'stockCount', label: 'Stock' },
    { key: 'variants', label: 'Variantes' },
    { key: 'inStock', label: 'Disponibilidad' }
  ];

  return (
    <>
      <SEOHead
        title="Comparar Productos - iPhone Cases"
        description="Compara características y precios de nuestras carcasas iPhone"
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Comparar Productos</h1>
              <p className="text-gray-600">
                Comparando {compareProducts.length} producto{compareProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={clearCompare}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Limpiar todo
            </button>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                      Característica
                    </th>
                    {compareProducts.map((product) => (
                      <th key={product.id} className="px-6 py-4 text-center min-w-[250px]">
                        <div className="relative">
                          <button
                            onClick={() => removeFromCompare(product.id)}
                            className="absolute top-0 right-0 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                            aria-label="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                          <Link to={`/products/${product.slug}`}>
                            <img
                              src={productService.getMainImage(product)}
                              alt={product.name}
                              className="w-full h-48 object-cover rounded-lg mb-3 hover:opacity-80 transition-opacity"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {features.map((feature, index) => (
                    <tr key={feature.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                        {feature.label}
                      </td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="px-6 py-4 text-center text-sm text-gray-700">
                          {feature.key === 'name' && (
                            <Link
                              to={`/products/${product.slug}`}
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              {product.name}
                            </Link>
                          )}
                          {feature.key === 'basePrice' && (
                            <span className="text-2xl font-bold text-green-600">
                              {formatPrice(product.basePrice)}
                            </span>
                          )}
                          {feature.key === 'brand' && (product.brand || 'N/A')}
                          {feature.key === 'compatibility' && (
                            <div className="text-xs">
                              {(() => {
                                if (!product.compatibility) return 'N/A';
                                const compatStr = Array.isArray(product.compatibility)
                                  ? product.compatibility.join(', ')
                                  : product.compatibility;
                                try {
                                  const parsed = JSON.parse(compatStr);
                                  return Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
                                } catch {
                                  return compatStr;
                                }
                              })()}
                            </div>
                          )}
                          {feature.key === 'stockCount' && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.stockCount > 10
                                  ? 'bg-green-100 text-green-800'
                                  : product.stockCount > 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {product.stockCount} unidades
                            </span>
                          )}
                          {feature.key === 'variants' && (
                            <span className="text-sm">{product.variants?.length || 0} variantes</span>
                          )}
                          {feature.key === 'inStock' && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                product.inStock
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {product.inStock ? 'En Stock' : 'Agotado'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Action Row */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">
                      Acción
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 text-center">
                        <Link
                          to={`/products/${product.slug}`}
                          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          Ver Detalle
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Seguir Comprando</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComparePage;
