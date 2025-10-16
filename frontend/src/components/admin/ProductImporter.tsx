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

  // Get token from either admin or regular auth
  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');

  // Load suppliers and categories
  useEffect(() => {
    loadSuppliers();
    loadCategories();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/suppliers?active=true', {
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
      const response = await fetch('http://localhost:3001/api/categories', {
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
      const response = await fetch('http://localhost:3001/api/suppliers/import-product', {
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
        setImportedProduct(result.data.product);
        toast.success('Producto importado exitosamente. Revisa los datos antes de guardar.');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error importing product:', error);
      toast.error(error.message || 'Error al importar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!importedProduct) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(importedProduct)
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

  return (
    <div className="space-y-6">
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
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Importando...' : 'Importar Producto'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Product Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={importedProduct.name}
                  onChange={(e) => setImportedProduct({ ...importedProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={importedProduct.description}
                  onChange={(e) => setImportedProduct({ ...importedProduct, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
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
