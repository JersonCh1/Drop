// frontend/src/components/admin/ProductImporter.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Supplier {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ImportedProduct {
  externalId: string | null;
  name: string;
  description: string;
  supplierPrice: number;
  images: string[];
  variants: any[];
  specifications: any;
  shippingTime: string;
  supplierUrl: string;
  platform: string;
  needsManualReview: boolean;
}

const ProductImporter: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [importedProduct, setImportedProduct] = useState<ImportedProduct | null>(null);

  // Form state
  const [productUrl, setProductUrl] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [profitMargin, setProfitMargin] = useState(30);

  // URL Cleaner state
  const [urlToCLean, setUrlToClean] = useState('');
  const [cleanedUrl, setCleanedUrl] = useState('');
  const [cleaningUrl, setCleaningUrl] = useState(false);

  // Get token from either admin or regular auth
  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');

  // Load suppliers and categories
  useEffect(() => {
    loadSuppliers();
    loadCategories();
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const loadSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/suppliers?active=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error cargando proveedores');

      const result = await response.json();
      setSuppliers(result.data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast.error('Error al cargar proveedores');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error cargando categorías');

      const result = await response.json();
      setCategories(result.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar categorías');
    }
  };

  const handleCleanUrl = async () => {
    if (!urlToCLean.trim()) {
      toast.error('Por favor ingresa una URL primero');
      return;
    }

    setCleaningUrl(true);
    setCleanedUrl('');

    try {
      const response = await fetch(`${API_URL}/clean-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: urlToCLean })
      });

      if (!response.ok) {
        throw new Error('Error al limpiar URL');
      }

      const result = await response.json();

      if (result.success) {
        setCleanedUrl(result.data.cleanUrl);
        toast.success(`✅ URL limpia! Eliminados ${result.data.removed} caracteres. Plataforma: ${result.data.platform}`);
      }
    } catch (error: any) {
      console.error('Error cleaning URL:', error);
      toast.error('Error al limpiar URL');
    } finally {
      setCleaningUrl(false);
    }
  };

  const handleCopyCleanedUrl = () => {
    if (!cleanedUrl) {
      toast.error('No hay URL limpia para copiar');
      return;
    }

    navigator.clipboard.writeText(cleanedUrl);
    toast.success('URL copiada al portapapeles!');
  };

  const handleUseCleanedUrl = () => {
    if (!cleanedUrl) {
      toast.error('Primero debes limpiar una URL');
      return;
    }

    setProductUrl(cleanedUrl);
    toast.success('URL limpia copiada al campo de importación');
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productUrl.trim()) {
      toast.error('Por favor ingresa una URL');
      return;
    }

    if (!selectedSupplier) {
      toast.error('Por favor selecciona un proveedor');
      return;
    }

    if (!selectedCategory) {
      toast.error('Por favor selecciona una categoría');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/suppliers/import-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: productUrl,
          supplierId: selectedSupplier,
          categoryId: selectedCategory,
          profitMargin: profitMargin
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al importar producto');
      }

      const result = await response.json();

      if (result.success) {
        // Asegurar que siempre haya un producto con datos válidos
        const product = result.data.product || {};
        const productWithDefaults: ImportedProduct = {
          externalId: product.externalId || null,
          name: product.name || 'Producto Importado (Edita este nombre)',
          description: product.description || 'Descripción del producto (Edita esta descripción)',
          supplierPrice: product.supplierPrice || 0,
          images: product.images || [],
          variants: product.variants || [],
          specifications: product.specifications || {},
          shippingTime: product.shippingTime || '15-30 días hábiles',
          supplierUrl: product.supplierUrl || productUrl,
          platform: product.platform || 'Desconocido',
          needsManualReview: product.needsManualReview !== false
        };

        setImportedProduct(productWithDefaults);

        if (productWithDefaults.needsManualReview || !productWithDefaults.name || productWithDefaults.name.includes('Error')) {
          toast('⚠️ Scraper falló. Por favor edita los datos manualmente.', {
            duration: 5000,
            icon: '⚠️'
          });
        } else {
          toast.success('Producto importado exitosamente. Revisa los datos antes de guardar.');
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error importing product:', error);
      toast.error(error.message || 'Error al importar producto');

      // Crear producto con valores por defecto para permitir edición manual
      const fallbackProduct: ImportedProduct = {
        externalId: null,
        name: 'Producto Importado (Edita este nombre)',
        description: 'Descripción del producto (Edita esta descripción)',
        supplierPrice: 0,
        images: [],
        variants: [],
        specifications: {},
        shippingTime: '15-30 días hábiles',
        supplierUrl: productUrl,
        platform: 'Error al importar',
        needsManualReview: true
      };

      setImportedProduct(fallbackProduct);
      toast('Puedes editar los datos manualmente y guardar', {
        duration: 5000,
        icon: '✏️'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!importedProduct) return;

    // Lista de errores para mostrar todo lo que falta
    const errors: string[] = [];

    // Validar nombre del producto
    if (!importedProduct.name ||
        importedProduct.name.trim() === '' ||
        importedProduct.name.includes('Error') ||
        importedProduct.name.includes('Edita este nombre')) {
      errors.push('❌ Nombre del producto: Debes editar el nombre');
    }

    // Validar descripción
    if (!importedProduct.description ||
        importedProduct.description.trim() === '' ||
        importedProduct.description.includes('Edita esta descripción')) {
      errors.push('❌ Descripción: Debes editar la descripción');
    }

    // Validar categoría
    if (!selectedCategory) {
      errors.push('❌ Categoría: Debes seleccionar una categoría');
    }

    // Validar proveedor
    if (!selectedSupplier) {
      errors.push('❌ Proveedor: Debes seleccionar un proveedor');
    }

    // Validar precio del proveedor
    if (!importedProduct.supplierPrice || importedProduct.supplierPrice === 0) {
      errors.push('❌ Precio del proveedor: Debe ser mayor a $0.00');
    }

    // Si hay errores, mostrarlos todos
    if (errors.length > 0) {
      toast.error(
        <div>
          <strong>Complete los siguientes campos:</strong>
          <ul className="mt-2 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>,
        { duration: 6000 }
      );
      return;
    }

    setLoading(true);

    try {
      // Preparar producto con todos los campos requeridos
      const productToSave = {
        ...importedProduct,
        categoryId: selectedCategory,
        supplierId: selectedSupplier,
        basePrice: parseFloat(calculateSalePrice()),
        profitMargin: profitMargin
      };

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productToSave)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar producto');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Producto guardado exitosamente');
        // Reset form
        setProductUrl('');
        setImportedProduct(null);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  const calculateSalePrice = (): string => {
    if (!importedProduct) return '0.00';
    return (importedProduct.supplierPrice * (1 + profitMargin / 100)).toFixed(2);
  };

  const calculateProfit = (): string => {
    if (!importedProduct) return '0.00';
    const salePrice = parseFloat(calculateSalePrice());
    return (salePrice - importedProduct.supplierPrice).toFixed(2);
  };

  // Helper para verificar si un campo necesita edición
  const needsEdit = (field: string): boolean => {
    if (!importedProduct) return false;

    if (field === 'name') {
      return !importedProduct.name ||
             importedProduct.name.trim() === '' ||
             importedProduct.name.includes('Error') ||
             importedProduct.name.includes('Edita este nombre');
    }

    if (field === 'description') {
      return !importedProduct.description ||
             importedProduct.description.trim() === '' ||
             importedProduct.description.includes('Edita esta descripción');
    }

    if (field === 'price') {
      return !importedProduct.supplierPrice || importedProduct.supplierPrice === 0;
    }

    return false;
  };

  return (
    <div className="space-y-6">
      {/* URL CLEANER - Herramienta Separada */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border-2 border-purple-200">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-gray-900">🧹 Limpiador de URLs</h3>
            <p className="text-xs text-gray-600">Elimina parámetros de tracking antes de importar</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Campo URL Original */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              1️⃣ Pega aquí tu URL con parámetros de tracking
            </label>
            <textarea
              value={urlToCLean}
              onChange={(e) => setUrlToClean(e.target.value)}
              placeholder="Ejemplo: https://www.aliexpress.us/item/3256809318547100.html?spm=a2g0o.home.pcJustForYou.29..."
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              rows={3}
            />
          </div>

          {/* Botón Limpiar */}
          <div className="flex justify-center">
            <button
              onClick={handleCleanUrl}
              disabled={!urlToCLean.trim() || cleaningUrl}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {cleaningUrl ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Limpiando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                  2️⃣ Limpiar URL
                </>
              )}
            </button>
          </div>

          {/* URL Limpia - Resultado */}
          {cleanedUrl && (
            <div className="bg-white p-4 rounded-lg border-2 border-green-400 shadow-inner">
              <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ✅ URL Limpia (Resultado)
              </label>
              <div className="bg-green-50 p-3 rounded font-mono text-sm break-all text-green-800 border border-green-200">
                {cleanedUrl}
              </div>

              {/* Botones de Acción */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={handleCopyCleanedUrl}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  3️⃣ Copiar URL
                </button>
                <button
                  onClick={handleUseCleanedUrl}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  4️⃣ Usar para Importar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 bg-purple-100 p-3 rounded-lg">
          <p className="text-xs text-purple-800">
            <strong>💡 Tip:</strong> Los URLs de AliExpress, Amazon y Alibaba suelen tener muchos parámetros de tracking (como ?spm=, ?gps-id=, etc.) que pueden interferir con el scraper. Esta herramienta los elimina y deja solo el ID del producto.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Importar Producto</h2>
            <p className="text-sm text-gray-600 mt-1">
              Importa productos desde AliExpress, Amazon, CJ Dropshipping, etc.
            </p>
          </div>
        </div>

        {/* Import Form */}
        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del Producto *
            </label>
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://www.aliexpress.com/item/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Soporta: AliExpress, CJ Dropshipping, Amazon y otras plataformas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor *
              </label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar proveedor</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margen de Ganancia (%)
              </label>
              <input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(parseInt(e.target.value) || 0)}
                min="0"
                max="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Importar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Imported Product Preview */}
      {importedProduct && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Producto Importado</h3>
            {importedProduct.needsManualReview && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                ⚠️ Requiere Revisión Manual
              </span>
            )}
          </div>

          {/* Banner de Advertencia cuando hay campos que necesitan edición */}
          {(needsEdit('name') || needsEdit('description') || needsEdit('price') || !selectedCategory || !selectedSupplier) && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-red-800 font-bold text-lg mb-2">⚠️ Scraper Falló - Edición Manual Requerida</h4>
                  <p className="text-red-700 text-sm mb-3">
                    No pudimos extraer la información automáticamente. Por favor, completa los siguientes campos antes de guardar:
                  </p>
                  <ul className="space-y-1 text-sm">
                    {needsEdit('name') && (
                      <li className="flex items-center text-red-700">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <strong>Nombre del producto:</strong> Edita "Producto Importado (Edita este nombre)"
                      </li>
                    )}
                    {needsEdit('description') && (
                      <li className="flex items-center text-red-700">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <strong>Descripción:</strong> Edita "Descripción del producto (Edita esta descripción)"
                      </li>
                    )}
                    {needsEdit('price') && (
                      <li className="flex items-center text-red-700">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <strong>Precio del proveedor:</strong> Ingresa un precio mayor a $0.00
                      </li>
                    )}
                    {!selectedCategory && (
                      <li className="flex items-center text-red-700">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <strong>Categoría:</strong> Selecciona una categoría arriba en el formulario
                      </li>
                    )}
                    {!selectedSupplier && (
                      <li className="flex items-center text-red-700">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <strong>Proveedor:</strong> Selecciona un proveedor arriba en el formulario
                      </li>
                    )}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-xs text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Los campos marcados con borde rojo y fondo rosado requieren tu atención
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Imágenes importadas */}
          {importedProduct.images && importedProduct.images.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                {importedProduct.images.length} Imágenes Importadas Automáticamente
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {importedProduct.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Producto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150?text=Error';
                      }}
                    />
                    <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ✅ Las imágenes se importaron automáticamente desde {importedProduct.platform}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Product Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className={needsEdit('name') ? 'text-red-600' : 'text-gray-700'}>
                    Nombre del Producto {needsEdit('name') && <span className="text-red-500">*</span>}
                  </span>
                </label>
                <input
                  type="text"
                  value={importedProduct.name}
                  onChange={(e) => setImportedProduct({ ...importedProduct, name: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    needsEdit('name')
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Escribe el nombre del producto aquí"
                />
                {needsEdit('name') && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Debes editar el nombre del producto
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className={needsEdit('description') ? 'text-red-600' : 'text-gray-700'}>
                    Descripción {needsEdit('description') && <span className="text-red-500">*</span>}
                  </span>
                </label>
                <textarea
                  value={importedProduct.description}
                  onChange={(e) => setImportedProduct({ ...importedProduct, description: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    needsEdit('description')
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Escribe la descripción del producto aquí"
                />
                {needsEdit('description') && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Debes editar la descripción del producto
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
                <input
                  type="text"
                  value={importedProduct.platform}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL del Proveedor</label>
                <input
                  type="text"
                  value={importedProduct.supplierUrl}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de Envío</label>
                <input
                  type="text"
                  value={importedProduct.shippingTime}
                  onChange={(e) => setImportedProduct({ ...importedProduct, shippingTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Right Column - Pricing */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className={needsEdit('price') ? 'text-red-600' : 'text-gray-700'}>
                    Precio del Proveedor (USD) {needsEdit('price') && <span className="text-red-500">*</span>}
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={importedProduct.supplierPrice}
                  onChange={(e) => setImportedProduct({
                    ...importedProduct,
                    supplierPrice: parseFloat(e.target.value) || 0
                  })}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    needsEdit('price')
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Ej: 25.99"
                />
                {needsEdit('price') ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Debes ingresar un precio mayor a $0.00
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Este es el precio que pagas al proveedor
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Cálculo de Precios</h4>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Precio del Proveedor:</span>
                    <span className="font-semibold text-gray-900">
                      ${importedProduct.supplierPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Margen de Ganancia:</span>
                    <span className="font-semibold text-blue-600">{profitMargin}%</span>
                  </div>

                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-900">Precio de Venta:</span>
                      <span className="font-bold text-lg text-green-600">
                        ${calculateSalePrice()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ganancia por Unidad:</span>
                    <span className="font-semibold text-green-600">${calculateProfit()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Notas Importantes</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Revisa cuidadosamente toda la información antes de guardar</li>
                  <li>Las imágenes deben descargarse manualmente si es necesario</li>
                  <li>Verifica los tiempos de envío y disponibilidad</li>
                  <li>Actualiza la descripción para tu mercado</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setImportedProduct(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProduct}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Cómo Funciona
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>1. Copia la URL:</strong> Visita AliExpress, Amazon o CJ Dropshipping y copia la URL del producto que deseas importar.
          </p>
          <p>
            <strong>2. Selecciona datos:</strong> Elige el proveedor, categoría y margen de ganancia para el producto.
          </p>
          <p>
            <strong>3. Importa:</strong> Haz clic en "Importar Producto" y el sistema extraerá automáticamente la información.
          </p>
          <p>
            <strong>4. Revisa y edita:</strong> Verifica los datos importados, edita lo necesario y ajusta los precios.
          </p>
          <p>
            <strong>5. Guarda:</strong> Cuando todo esté correcto, guarda el producto en tu catálogo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductImporter;
