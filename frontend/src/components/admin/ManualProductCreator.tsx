// frontend/src/components/admin/ManualProductCreator.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ManualProductCreator: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [supplierUrl, setSupplierUrl] = useState('');
  const [supplierPrice, setSupplierPrice] = useState(0);
  const [profitMargin, setProfitMargin] = useState(400); // 400% = 5x markup
  const [salePrice, setSalePrice] = useState(0);
  const [images, setImages] = useState<string[]>(['']);
  const [isHero, setIsHero] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // Variant state
  const [variantName, setVariantName] = useState('');
  const [variantColor, setVariantColor] = useState('');
  const [variantStock, setVariantStock] = useState(100);

  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    loadCategories();
    loadSuppliers();
  }, []);

  useEffect(() => {
    // Auto-calcular precio de venta
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

  const loadSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/suppliers`);
      const result = await response.json();
      setSuppliers(result.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const removeImageField = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName || !categoryId || !supplierPrice || salePrice <= 0) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      // Filtrar imágenes vacías
      const validImages = images.filter(img => img.trim() !== '');

      if (validImages.length === 0) {
        toast.error('Agrega al menos una imagen');
        setLoading(false);
        return;
      }

      // Crear slug simple
      const slug = productName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const productData = {
        name: productName,
        slug: slug,
        description: description || `${productName} - Protección profesional para tus dispositivos`,
        categoryId: categoryId,
        supplierId: supplierId || null,
        supplierUrl: supplierUrl || null,
        supplierPrice: supplierPrice,
        basePrice: salePrice,
        profitMargin: profitMargin,
        isActive: true,
        isFeatured: isFeatured,
        isHeroBanner: isHero,
        images: validImages.map((url, index) => ({
          url: url,
          isMain: index === 0,
          position: index
        })),
        variants: [{
          name: variantName || 'Default',
          color: variantColor || null,
          price: salePrice,
          sku: `${slug}-${Date.now()}`,
          stockQuantity: variantStock
        }]
      };

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('¡Producto creado exitosamente!');

        // Reset form
        setProductName('');
        setDescription('');
        setSupplierUrl('');
        setSupplierPrice(0);
        setSalePrice(0);
        setImages(['']);
        setVariantName('');
        setVariantColor('');
        setIsHero(false);
        setIsFeatured(false);
      } else {
        toast.error(result.message || 'Error al crear producto');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          🚀 Crear Producto Manualmente
        </h2>
        <p className="text-gray-600 mb-8">
          Agrega productos desde AliExpress o cualquier proveedor de forma manual
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del Producto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej: iPhone 15 Pro Max Tempered Glass Screen Protector"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción detallada del producto..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Categoría y Proveedor */}
          <div className="grid grid-cols-2 gap-4">
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
                Proveedor
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar proveedor</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* URL del Proveedor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL del Producto (AliExpress, etc.)
            </label>
            <input
              type="url"
              value={supplierUrl}
              onChange={(e) => setSupplierUrl(e.target.value)}
              placeholder="https://www.aliexpress.com/item/..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Precios */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">💰 Configuración de Precios</h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Costo Proveedor * ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={supplierPrice}
                  onChange={(e) => setSupplierPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Margen (%)
                </label>
                <input
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseInt(e.target.value) || 0)}
                  placeholder="400"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  400% = 5x markup
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio Venta ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-green-50 font-bold"
                  readOnly
                />
              </div>
            </div>

            {supplierPrice > 0 && (
              <div className="bg-green-100 p-3 rounded">
                <p className="text-sm font-semibold text-green-800">
                  💵 Ganancia por venta: ${(salePrice - supplierPrice).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URLs de Imágenes *
            </label>
            {images.map((img, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={img}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              + Agregar imagen
            </button>
          </div>

          {/* Variante */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">🎨 Variante del Producto</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre Variante
                </label>
                <input
                  type="text"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="Ej: Para iPhone 15 Pro Max"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={variantColor}
                  onChange={(e) => setVariantColor(e.target.value)}
                  placeholder="Transparente, Negro, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  value={variantStock}
                  onChange={(e) => setVariantStock(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Opciones especiales */}
          <div className="flex gap-6">
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

          {/* Submit */}
          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Creando producto...' : '🚀 Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualProductCreator;
