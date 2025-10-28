// frontend/src/components/admin/CJProductImporter.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Supplier {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CJProduct {
  pid: string;
  productNameEn: string;
  productImage: string;
  sellPrice: number;
  productWeight: number;
  productType: string;
  variants?: any[];
}

const CJProductImporter: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cjSupplier, setCjSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CJProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CJProduct | null>(null);

  // Form state
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [supplierPrice, setSupplierPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [profitMargin, setProfitMargin] = useState(50);
  const [images, setImages] = useState<string[]>([]);

  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    loadCategories();
    loadCJSupplier();
  }, []);

  useEffect(() => {
    if (supplierPrice > 0) {
      const calculated = supplierPrice * (1 + profitMargin / 100);
      setSalePrice(parseFloat(calculated.toFixed(2)));
    }
  }, [supplierPrice, profitMargin]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error cargando categorías');
      const result = await response.json();
      setCategories(result.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar categorías');
    }
  };

  const loadCJSupplier = async () => {
    try {
      const response = await fetch(`${API_URL}/suppliers?active=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error cargando proveedores');
      const result = await response.json();
      const cj = result.data?.find((s: Supplier) => s.slug === 'cj-dropshipping');
      setCjSupplier(cj || null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Ingresa un término de búsqueda');
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`${API_URL}/cj-dropshipping/search?keyword=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error buscando en CJ');

      const result = await response.json();

      if (result.success && result.products?.length > 0) {
        setSearchResults(result.products);
        toast.success(`${result.products.length} productos encontrados`);
      } else {
        setSearchResults([]);
        toast.error('No se encontraron productos');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al buscar productos en CJ');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectProduct = async (product: CJProduct) => {
    setSelectedProduct(product);

    // Cargar detalles completos del producto
    try {
      const response = await fetch(`${API_URL}/cj-dropshipping/product/${product.pid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error obteniendo detalles');

      const result = await response.json();

      if (result.success && result.product) {
        const details = result.product;

        setProductName(details.productNameEn || product.productNameEn);
        setDescription(details.description || `Producto importado desde CJ Dropshipping: ${details.productNameEn}`);
        setSupplierPrice(parseFloat(details.sellPrice) || parseFloat(product.sellPrice) || 0);
        setImages(details.productImage ? [details.productImage] : [product.productImage]);

        toast.success('Detalles cargados');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al cargar detalles del producto');
    }
  };

  const handleSaveProduct = async () => {
    // Validación
    if (!productName || !selectedCategory || !cjSupplier || supplierPrice <= 0 || salePrice <= 0) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    if (!selectedProduct) {
      toast.error('Selecciona un producto de CJ primero');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: productName,
        slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description,
        basePrice: salePrice,
        salePrice: salePrice,
        supplierPrice: supplierPrice,
        categoryId: selectedCategory,
        supplierId: cjSupplier.id,
        stock: 9999, // CJ tiene stock ilimitado
        isActive: true,
        isFeatured: false,
        externalId: selectedProduct.pid, // ID de CJ
        cjProductId: selectedProduct.pid,
        images: images.length > 0 ? images : [selectedProduct.productImage],
        tags: ['cj-dropshipping', 'importado'],
        specifications: {
          peso: selectedProduct.productWeight || 0,
          tipo: selectedProduct.productType || '',
          proveedor: 'CJ Dropshipping'
        }
      };

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar producto');
      }

      const result = await response.json();

      toast.success('Producto guardado exitosamente!');

      // Limpiar form
      setSelectedProduct(null);
      setProductName('');
      setDescription('');
      setSupplierPrice(0);
      setSalePrice(0);
      setImages([]);
      setSearchResults([]);
      setSearchQuery('');

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  if (!cjSupplier) {
    return (
      <div className="p-8 bg-red-50 rounded-lg border-2 border-red-200">
        <h3 className="text-xl font-bold text-red-700 mb-2">CJ Dropshipping no configurado</h3>
        <p className="text-red-600">
          Necesitas crear el proveedor "CJ Dropshipping" en el panel de proveedores primero.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Importador CJ Dropshipping</h1>
        <p className="text-blue-100">Busca productos en CJ Dropshipping y agrégalos a tu tienda</p>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">1. Buscar Productos en CJ</h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ej: iPhone case, wireless earbuds, phone holder..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Resultados */}
        {searchResults.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((product) => (
              <div
                key={product.pid}
                onClick={() => handleSelectProduct(product)}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  selectedProduct?.pid === product.pid
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <img
                  src={product.productImage}
                  alt={product.productNameEn}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.productNameEn}</h3>
                <div className="text-sm text-gray-600">
                  <p>Precio: ${product.sellPrice}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {product.pid}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form de Producto */}
      {selectedProduct && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">2. Configurar Producto</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio del Proveedor (CJ) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={supplierPrice}
                  onChange={(e) => setSupplierPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Margen de Ganancia (%) *
                </label>
                <input
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio de Venta (Calculado) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border-2 border-green-300 bg-green-50 rounded-lg font-bold text-green-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ganancia: ${(salePrice - supplierPrice).toFixed(2)} por unidad
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>ID de CJ:</strong> {selectedProduct.pid}
                </p>
              </div>
            </div>
          </div>

          {/* Preview de imagen */}
          {images.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vista Previa
              </label>
              <img
                src={images[0]}
                alt="Preview"
                className="w-64 h-64 object-cover rounded-lg border-2 border-gray-300"
              />
            </div>
          )}

          {/* Botón Guardar */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveProduct}
              disabled={loading}
              className="w-full px-6 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar Producto en la Tienda'}
            </button>
          </div>
        </div>
      )}

      {/* Ayuda */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-2">Cómo funciona:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>Busca productos en CJ Dropshipping usando palabras clave</li>
          <li>Selecciona el producto que quieres importar</li>
          <li>Configura el nombre, categoría y margen de ganancia</li>
          <li>Guarda el producto en tu tienda</li>
          <li>Cuando un cliente compre, automáticamente se crea la orden en CJ</li>
        </ol>
      </div>
    </div>
  );
};

export default CJProductImporter;
