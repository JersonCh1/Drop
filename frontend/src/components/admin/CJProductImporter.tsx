// frontend/src/components/admin/CJProductImporter.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CJProduct {
  id?: string;
  pid?: string;
  name?: string;
  productNameEn?: string;
  productImage?: string;
  images?: string | string[];
  price?: number;
  sellPrice?: number;
  description?: string;
  productWeight?: number;
  weight?: number;
  productType?: string;
  categoryName?: string;
  variants?: any[];
}

const CJProductImporter: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search mode: 'keyword' or 'pid'
  const [searchMode, setSearchMode] = useState<'keyword' | 'pid'>('keyword');

  // Search state
  const [searchKeyword, setSearchKeyword] = useState('');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      toast.error(searchMode === 'keyword' ? 'Ingresa una palabra clave' : 'Ingresa el PID del producto');
      return;
    }

    setSearchLoading(true);
    setSearchResults([]);
    setSelectedProduct(null);

    try {
      if (searchMode === 'keyword') {
        // Búsqueda por palabra clave
        const response = await fetch(`${API_URL}/cj/search?keyword=${encodeURIComponent(searchKeyword)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error buscando productos');

        const result = await response.json();

        if (result.success && result.products && result.products.length > 0) {
          setSearchResults(result.products);
          toast.success(`Se encontraron ${result.products.length} productos`);
        } else {
          toast.error('No se encontraron productos con esa palabra clave');
        }
      } else {
        // Búsqueda por PID
        const response = await fetch(`${API_URL}/cj/product/${encodeURIComponent(searchKeyword)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error obteniendo producto');

        const result = await response.json();

        if (result.success && result.product) {
          setSearchResults([result.product]);
          handleSelectProduct(result.product);
          toast.success('Producto encontrado!');
        } else {
          toast.error('No se encontró el producto con ese PID');
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error en la búsqueda');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectProduct = (product: CJProduct) => {
    setSelectedProduct(product);

    // Manejar nombre del producto (soporta ambos formatos)
    const productName = product.name || product.productNameEn || '';
    setProductName(productName);

    // Descripción
    const productDesc = product.description || `Producto importado desde CJ Dropshipping: ${productName}`;
    setDescription(productDesc);

    // Precio (soporta ambos formatos)
    const price = product.price || product.sellPrice || 0;
    setSupplierPrice(price);

    // Imágenes (soporta ambos formatos: string con array JSON o array directo)
    let imageArray: string[] = [];
    if (product.images) {
      if (typeof product.images === 'string') {
        try {
          imageArray = JSON.parse(product.images);
        } catch {
          imageArray = [product.images];
        }
      } else if (Array.isArray(product.images)) {
        imageArray = product.images;
      }
    } else if (product.productImage) {
      imageArray = [product.productImage];
    }
    setImages(imageArray);
  };

  const handleSaveProduct = async () => {
    // Validación
    if (!productName || !selectedCategory || supplierPrice <= 0 || salePrice <= 0) {
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
        supplier: 'CJ_DROPSHIPPING',
        stock: 9999, // CJ tiene stock ilimitado
        isActive: true,
        isFeatured: false,
        cjProductId: selectedProduct.id || selectedProduct.pid || '',
        images: images.length > 0 ? images : (selectedProduct.productImage ? [selectedProduct.productImage] : []),
        variants: selectedProduct.variants || [], // Incluir variantes del producto CJ
        tags: ['cj-dropshipping', 'importado'],
        specifications: {
          peso: selectedProduct.weight || selectedProduct.productWeight || 0,
          tipo: selectedProduct.productType || '',
          categoria: selectedProduct.categoryName || '',
          proveedor: 'CJ Dropshipping',
          pid: selectedProduct.id || selectedProduct.pid || '',
          variantes: selectedProduct.variants?.length || 0
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

      toast.success('¡Producto guardado exitosamente en tu tienda!');

      // Limpiar form
      setSelectedProduct(null);
      setSearchResults([]);
      setProductName('');
      setDescription('');
      setSupplierPrice(0);
      setSalePrice(0);
      setImages([]);
      setSearchKeyword('');

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Importador CJ Dropshipping</h1>
        <p className="text-blue-100">Busca e importa productos directamente desde CJ Dropshipping</p>
      </div>

      {/* Search Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Método de Búsqueda</h2>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setSearchMode('keyword');
              setSearchKeyword('');
              setSearchResults([]);
              setSelectedProduct(null);
            }}
            className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
              searchMode === 'keyword'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-lg">🔍 Buscar por Palabra Clave</div>
            <div className="text-sm mt-1 opacity-90">Busca productos por nombre o descripción</div>
          </button>
          <button
            onClick={() => {
              setSearchMode('pid');
              setSearchKeyword('');
              setSearchResults([]);
              setSelectedProduct(null);
            }}
            className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
              searchMode === 'pid'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-lg">🔖 Buscar por PID</div>
            <div className="text-sm mt-1 opacity-90">Si ya conoces el ID del producto</div>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {searchMode === 'keyword' ? '1. Buscar Productos' : '1. Ingresar PID del Producto'}
        </h2>

        {searchMode === 'keyword' ? (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>Consejo:</strong> Busca por nombre en inglés (ej: "iPhone case", "wireless charger", "bluetooth headphones")
            </p>
          </div>
        ) : (
          <div className="bg-cyan-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
            <p className="text-cyan-800 text-sm mb-2">
              📋 <strong>Cómo obtener el PID:</strong>
            </p>
            <ol className="list-decimal list-inside text-cyan-700 text-sm space-y-1 ml-4">
              <li>Ve a <a href="https://cjdropshipping.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">cjdropshipping.com</a></li>
              <li>Busca el producto y copia su PID de la URL</li>
              <li>Formato: <code className="bg-purple-200 px-2 py-1 rounded">000B9312-456A-4D31-94BD-B083E2A198E8</code></li>
            </ol>
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={searchMode === 'keyword' ? 'Ej: iPhone 15 case' : 'Ej: 000B9312-456A-4D31-94BD-B083E2A198E8'}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {searchLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && searchMode === 'keyword' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Resultados de Búsqueda ({searchResults.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((product) => (
              <div
                key={product.pid}
                onClick={() => handleSelectProduct(product)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedProduct?.pid === product.pid
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <img
                  src={product.productImage}
                  alt={product.productNameEn}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">
                  {product.productNameEn}
                </h3>
                <p className="text-lg font-bold text-green-600">${product.sellPrice}</p>
                <p className="text-xs text-gray-500 mt-1">PID: {product.pid}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Form */}
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
                  <strong>PID de CJ:</strong> <code className="font-mono text-xs">{selectedProduct.pid}</code>
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
              {loading ? 'Guardando...' : '✓ Guardar Producto en la Tienda'}
            </button>
          </div>
        </div>
      )}

      {/* Info Adicional */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-2">💡 Importante:</h3>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>Los productos se importan directamente desde CJ Dropshipping</li>
          <li>CJ maneja el inventario automáticamente (stock ilimitado)</li>
          <li>Cuando un cliente compre, la orden se creará automáticamente en CJ</li>
          <li>CJ se encarga del envío directo al cliente</li>
          <li>Tú solo cobras la diferencia entre el precio de venta y el costo de CJ</li>
        </ul>
      </div>
    </div>
  );
};

export default CJProductImporter;
