// frontend/src/components/admin/AliExpressImporter.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  variants: any[];
  shipping: {
    freeShipping: boolean;
    estimatedDays: string;
  };
  supplier: {
    name: string;
    rating: number;
    orders: number;
  };
}

const AliExpressImporter: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // Form state
  const [aliexpressUrl, setAliexpressUrl] = useState('');
  const [extractedData, setExtractedData] = useState<ProductData | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [supplierPrice, setSupplierPrice] = useState(0); // Precio manual del proveedor
  const [profitMargin, setProfitMargin] = useState(400); // 400% = 5x markup
  const [salePrice, setSalePrice] = useState(0);
  const [isHero, setIsHero] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Auto-calcular precio de venta basado en precio manual del proveedor
    if (supplierPrice > 0) {
      const calculated = supplierPrice * (1 + profitMargin / 100);
      setSalePrice(parseFloat(calculated.toFixed(2)));
    }
  }, [supplierPrice, profitMargin]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const result = await response.json();
      setCategories(result.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleExtractProduct = async () => {
    if (!aliexpressUrl.trim()) {
      toast.error('Por favor ingresa una URL de AliExpress');
      return;
    }

    if (!aliexpressUrl.includes('aliexpress.com') && !aliexpressUrl.includes('aliexpress.us')) {
      toast.error('URL inválida. Debe ser de AliExpress');
      return;
    }

    setExtracting(true);
    setExtractedData(null);

    try {
      const response = await fetch(`${API_URL}/aliexpress/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: aliexpressUrl })
      });

      const result = await response.json();

      if (result.success && result.product) {
        setExtractedData(result.product);
        toast.success('¡Datos extraídos correctamente!');
      } else {
        toast.error(result.message || 'Error extrayendo datos');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al extraer producto');
    } finally {
      setExtracting(false);
    }
  };

  const handleImportProduct = async () => {
    if (!categoryId) {
      toast.error('Por favor selecciona una categoría');
      return;
    }

    if (!supplierPrice || supplierPrice <= 0) {
      toast.error('Por favor ingresa el precio del proveedor');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/aliexpress/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: aliexpressUrl,
          categoryId: categoryId,
          supplierPrice: supplierPrice,
          profitMargin: profitMargin,
          isHeroBanner: isHero,
          isFeatured: isFeatured
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('¡Producto importado exitosamente!');

        // Reset form
        setAliexpressUrl('');
        setExtractedData(null);
        setCategoryId('');
        setSupplierPrice(0);
        setProfitMargin(400);
        setSalePrice(0);
        setIsHero(false);
        setIsFeatured(false);
      } else {
        toast.error(result.message || 'Error al importar producto');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al importar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            🚀 Importar de AliExpress
          </h2>
          <p className="text-gray-600">
            Pega el link del producto y todo se importa automáticamente
          </p>
        </div>

        {/* Step 1: URL Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            📎 URL del Producto de AliExpress
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={aliexpressUrl}
              onChange={(e) => setAliexpressUrl(e.target.value)}
              placeholder="https://www.aliexpress.com/item/..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={extracting || loading}
            />
            <button
              onClick={handleExtractProduct}
              disabled={extracting || loading || !aliexpressUrl}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {extracting ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Extrayendo...
                </>
              ) : (
                <>🔍 Extraer Datos</>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Abre el producto en AliExpress y copia la URL de la barra de direcciones
          </p>
        </div>

        {/* Step 2: Extracted Data Preview */}
        {extractedData && (
          <div className="mb-8 border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <h3 className="text-xl font-bold mb-4 text-blue-900">
              ✅ Datos Extraídos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Product Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Nombre:</label>
                  <p className="text-gray-900">{extractedData.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    💵 Precio del Proveedor (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={supplierPrice || ''}
                    onChange={(e) => setSupplierPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Ej: 2.50"
                    className="w-full px-4 py-2 text-lg font-bold border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Copia el precio que ves en AliExpress
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Envío:</label>
                  <p className={extractedData.shipping.freeShipping ? 'text-green-600 font-semibold' : 'text-gray-700'}>
                    {extractedData.shipping.freeShipping ? '✅ Gratis' : 'Con costo'}
                    {' - '}
                    {extractedData.shipping.estimatedDays} días
                  </p>
                </div>

                {extractedData.supplier.name && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Proveedor:</label>
                    <p className="text-gray-900">
                      {extractedData.supplier.name}
                      {extractedData.supplier.rating > 0 && (
                        <span className="ml-2 text-yellow-600">
                          ⭐ {extractedData.supplier.rating}%
                        </span>
                      )}
                    </p>
                    {extractedData.supplier.orders > 0 && (
                      <p className="text-sm text-gray-600">
                        {extractedData.supplier.orders.toLocaleString()} pedidos
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-gray-700">Variantes:</label>
                  <p className="text-gray-900">{extractedData.variants.length} variantes encontradas</p>
                </div>
              </div>

              {/* Right: Images */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Imágenes ({extractedData.images.length}):</label>
                <div className="grid grid-cols-3 gap-2">
                  {extractedData.images.slice(0, 6).map((img, index) => (
                    <img
                      key={index}
                      src={img.startsWith('//') ? `https:${img}` : img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-300"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Description Preview */}
            {extractedData.description && (
              <div className="mt-4">
                <label className="text-sm font-semibold text-gray-700">Descripción:</label>
                <p className="text-sm text-gray-600 line-clamp-3">{extractedData.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Configuration */}
        {extractedData && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">⚙️ Configuración del Producto</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Margen (%)
                  </label>
                  <input
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    400% = 5x markup
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio Venta
                  </label>
                  <div className="px-4 py-3 bg-green-50 border-2 border-green-300 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">
                      ${salePrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {supplierPrice > 0 && salePrice > 0 && (
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">
                    💵 Ganancia por venta: ${(salePrice - supplierPrice).toFixed(2)}
                    {' '}
                    ({Math.round((salePrice - supplierPrice) / supplierPrice * 100)}% ROI)
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    🚚 Envío: Gratis desde AliExpress • 📦 Días estimados: 15-30
                  </p>
                </div>
              )}
            </div>

            {/* Opciones especiales */}
            <div className="flex gap-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHero}
                  onChange={(e) => setIsHero(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm font-semibold">🌟 Producto Estrella (Hero Banner)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm font-semibold">⭐ Producto Destacado</span>
              </label>
            </div>

            {/* Import Button */}
            <button
              onClick={handleImportProduct}
              disabled={loading || !categoryId}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Importando...
                </>
              ) : (
                <>🚀 Importar Producto a CASEPRO</>
              )}
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4">
          <h4 className="font-bold text-blue-900 mb-2">📘 ¿Cómo funciona?</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Busca un producto en AliExpress que quieras vender</li>
            <li>Copia la URL completa del producto</li>
            <li>Pégala arriba y click en "Extraer Datos"</li>
            <li>Revisa la información extraída automáticamente</li>
            <li>Selecciona categoría y ajusta el margen de ganancia</li>
            <li>Click en "Importar" y listo! El producto estará en tu tienda</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AliExpressImporter;
