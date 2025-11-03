// frontend/src/components/admin/ProductsManager.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  category_name?: string;
  category?: { name: string };
  isActive: boolean;
  isFeatured: boolean;
  isHeroBanner: boolean;
  stockCount: number;
  images: any[];
  variants: any[];
  createdAt: string;
  compatibility?: string[];
}

interface ProductsManagerProps {
  adminToken: string;
}

const ProductsManager: React.FC<ProductsManagerProps> = ({ adminToken }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Enviar token de admin para ver TODOS los productos (incluidos inactivos)
      const response = await axios.get(`${API_URL}/products?limit=100`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await axios.delete(`${API_URL}/products/${deletingProduct.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      toast.success('Producto eliminado correctamente');
      setDeletingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      await axios.put(
        `${API_URL}/products/${product.id}`,
        { isFeatured: !product.isFeatured },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      toast.success(product.isFeatured ? 'Removido de destacados' : 'Marcado como destacado');
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto');
    }
  };

  const handleSetHeroBanner = async (product: Product) => {
    try {
      await axios.post(
        `${API_URL}/products/${product.id}/set-hero-banner`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      toast.success('Producto establecido como banner principal');
      loadProducts();
    } catch (error) {
      console.error('Error setting hero banner:', error);
      toast.error('Error al establecer banner principal');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
          <p className="text-gray-600">{products.length} productos en total</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Producto
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variantes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center max-w-xs">
                      <div className="h-10 w-10 flex-shrink-0">
                        {product.images[0] ? (
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={product.images[0].url}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate" title={product.name}>
                          {product.name.length > 40 ? product.name.substring(0, 40) + '...' : product.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>${typeof product.basePrice === 'number' ? product.basePrice.toFixed(2) : parseFloat(String(product.basePrice)).toFixed(2)}</span>
                          {product.isFeatured && <span className="text-yellow-600">⭐</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ${typeof product.basePrice === 'number' ? product.basePrice.toFixed(2) : parseFloat(String(product.basePrice)).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.variants.length}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-xs font-medium"
                        title="Editar producto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                        title="Ver detalles"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleToggleFeatured(product)}
                        className={`inline-flex items-center justify-center px-3 py-2 rounded-md transition-colors text-xs font-medium ${
                          product.isFeatured
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                        title={product.isFeatured ? 'Quitar destacado' : 'Marcar destacado'}
                      >
                        <svg className="w-4 h-4" fill={product.isFeatured ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleSetHeroBanner(product)}
                        className={`inline-flex items-center justify-center px-3 py-2 rounded-md transition-colors text-xs font-medium ${
                          product.isHeroBanner
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
                        }`}
                        title={product.isHeroBanner ? 'Banner Principal Activo' : 'Usar como Banner Principal'}
                      >
                        <svg className="w-4 h-4" fill={product.isHeroBanner ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setDeletingProduct(product)}
                        className="inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                        title="Eliminar producto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-500 mb-4">Comienza creando tu primer producto</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Crear Producto
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ProductFormModal
          adminToken={adminToken}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadProducts();
          }}
        />
      )}

      {editingProduct && (
        <ProductFormModal
          adminToken={adminToken}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setDeletingProduct(null)}></div>

            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                Eliminar Producto
              </h3>

              <p className="text-center text-gray-600 mb-2">
                ¿Estás seguro de que deseas eliminar este producto?
              </p>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="font-semibold text-gray-900">{deletingProduct.name}</p>
                <p className="text-sm text-gray-600">
                  Precio: ${typeof deletingProduct.basePrice === 'number' ? deletingProduct.basePrice.toFixed(2) : parseFloat(String(deletingProduct.basePrice)).toFixed(2)}
                </p>
              </div>

              <p className="text-sm text-red-600 text-center mb-6">
                Esta acción no se puede deshacer.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeletingProduct(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Product Form Modal Component
interface ProductFormModalProps {
  adminToken: string;
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ adminToken, product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    basePrice: string | number;
    categoryId: string;
    compatibility: string[];
    isFeatured: boolean;
    inStock: boolean;
    stockCount: string | number;
  }>({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    basePrice: product ? String(product.basePrice || '') : '',
    categoryId: 'cat_iphone_cases',
    compatibility: product?.compatibility || [],
    isFeatured: product?.isFeatured || false,
    inStock: product?.isActive || true,
    stockCount: product ? String(product.stockCount || '') : ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(product?.images?.[0]?.url || '');

  const handleImagePreview = () => {
    if (imageUrl) {
      setImagePreview(imageUrl);
      toast.success('Vista previa cargada');
    } else {
      toast.error('Por favor ingresa una URL de imagen');
    }
  };

  const handleUnsplashAutomatic = () => {
    const searchTerm = formData.name || 'iphone case';
    const unsplashUrl = `https://source.unsplash.com/800x800/?${encodeURIComponent(searchTerm)}`;
    setImageUrl(unsplashUrl);
    setImagePreview(unsplashUrl);
    toast.success('Imagen automática de Unsplash cargada');
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview('');
    toast.success('Imagen removida');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Preparar datos para enviar
      const dataToSend = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        basePrice: parseFloat(formData.basePrice as any) || 0,
        categoryId: formData.categoryId,
        brand: formData.name.split(' ')[0] || 'Generic',
        model: 'Universal',
        compatibility: JSON.stringify(formData.compatibility || []),
        isFeatured: formData.isFeatured,
        inStock: formData.inStock,
        stockCount: parseInt(formData.stockCount as any) || 0,
        imageUrl: imagePreview || null
      };

      console.log('Enviando datos:', dataToSend);

      if (product) {
        // Update
        await axios.put(
          `${API_URL}/products/${product.id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        toast.success('Producto actualizado');
      } else {
        // Create
        const response = await axios.post(
          `${API_URL}/products`,
          dataToSend,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        // Si hay imagen, agregarla al producto creado
        if (imagePreview && response.data?.product?.id) {
          await axios.post(
            `${API_URL}/products/${response.data.product.id}/images`,
            {
              url: imagePreview,
              altText: formData.name,
              position: 0,
              isMain: true
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
        }

        toast.success('Producto creado con imagen');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      console.error('Response:', error.response?.data);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Error al guardar producto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
          <h3 className="text-xl font-bold mb-4">
            {product ? 'Editar Producto' : 'Crear Producto'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Base *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value === '' ? '' : parseFloat(e.target.value) || '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stockCount}
                  onChange={(e) => setFormData({ ...formData, stockCount: e.target.value === '' ? '' : parseInt(e.target.value) || '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-4 pt-7">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Destacado</span>
                </label>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Imagen del Producto</h4>

              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="URL de la imagen (ej: https://imgur.com/imagen.jpg)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleImagePreview}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Vista Previa
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleUnsplashAutomatic}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 text-sm font-medium flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  Usar Unsplash Automático
                </button>

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EError al cargar%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      title="Eliminar imagen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  💡 Tip: Puedes usar URLs de Unsplash, Imgur, o cualquier imagen pública en internet
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Product Detail Modal
interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold">{product.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Imágenes ({product.images.length})</h4>
              <div className="grid grid-cols-2 gap-2">
                {product.images.map((img, idx) => (
                  <img key={idx} src={img.url} alt={img.altText} className="w-full h-32 object-cover rounded" />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Detalles</h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Precio:</dt>
                  <dd className="font-semibold">${typeof product.basePrice === 'number' ? product.basePrice.toFixed(2) : parseFloat(String(product.basePrice)).toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Stock:</dt>
                  <dd>{product.stockCount}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Variantes:</dt>
                  <dd>{product.variants.length}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Categoría:</dt>
                  <dd>{product.category_name}</dd>
                </div>
              </dl>
            </div>
          </div>

          {product.description && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Descripción</h4>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsManager;
