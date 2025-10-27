// frontend/src/components/admin/ProfitMarginsManager.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ProfitMargin {
  id: string;
  category: string;
  margin: number;
  minMargin?: number;
  maxMargin?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Preset {
  category: string;
  margin: number;
  description: string;
}

const ProfitMarginsManager: React.FC = () => {
  const [margins, setMargins] = useState<ProfitMargin[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [newCategory, setNewCategory] = useState('');
  const [newMargin, setNewMargin] = useState(40);
  const [newDescription, setNewDescription] = useState('');

  // Calculator state
  const [calcSupplierPrice, setCalcSupplierPrice] = useState(10);
  const [calcCategory, setCalcCategory] = useState('');
  const [calcResult, setCalcResult] = useState<any>(null);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    loadMargins();
    loadPresets();
  }, []);

  const loadMargins = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/profit-margins`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMargins(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading margins:', error);
      toast.error('Error cargando márgenes');
    } finally {
      setLoading(false);
    }
  };

  const loadPresets = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/profit-margins/presets/common`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPresets(response.data.data);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const handleSaveMargin = async () => {
    if (!newCategory || !newMargin) {
      toast.error('Categoría y margen son requeridos');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/profit-margins`,
        {
          category: newCategory,
          margin: newMargin,
          description: newDescription || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setNewCategory('');
        setNewMargin(40);
        setNewDescription('');
        loadMargins();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error guardando margen');
    }
  };

  const handleDeleteMargin = async (category: string) => {
    if (!confirm(`¿Eliminar margen para ${category}?`)) return;

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/profit-margins/${category}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        loadMargins();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error eliminando margen');
    }
  };

  const handleToggleActive = async (category: string) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/profit-margins/${category}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        loadMargins();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error actualizando estado');
    }
  };

  const handleCalculate = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/profit-margins/calculate`,
        {
          supplierPrice: calcSupplierPrice,
          category: calcCategory || undefined
        }
      );

      if (response.data.success) {
        setCalcResult(response.data.data);
      }
    } catch (error: any) {
      toast.error('Error calculando precio');
    }
  };

  const applyPreset = (preset: Preset) => {
    setNewCategory(preset.category);
    setNewMargin(preset.margin);
    setNewDescription(preset.description);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💰 Márgenes de Ganancia por Categoría
        </h1>
        <p className="text-gray-600">
          Configura diferentes márgenes de ganancia para cada categoría de productos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Nueva Configuración */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Configurar Margen</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="iPhone Cases"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margen de Ganancia (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={newMargin}
                    onChange={(e) => setNewMargin(Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={newMargin}
                    onChange={(e) => setNewMargin(Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold"
                  />
                  <span className="text-lg font-bold text-blue-600">%</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Ejemplo: $10 → ${(10 * (1 + newMargin / 100)).toFixed(2)} (Ganancia: ${(10 * newMargin / 100).toFixed(2)})
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Margen estándar para fundas"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSaveMargin}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                💾 Guardar Configuración
              </button>
            </div>
          </div>

          {/* Tabla de Márgenes Configurados */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Márgenes Configurados ({margins.length})</h2>

            {margins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay márgenes configurados todavía.</p>
                <p className="text-sm mt-2">Usa los presets de abajo o crea uno personalizado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Margen</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ejemplo</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {margins.map((margin) => (
                      <tr key={margin.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{margin.category}</div>
                            {margin.description && (
                              <div className="text-sm text-gray-500">{margin.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold">
                            {margin.margin}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          $10 → ${(10 * (1 + margin.margin / 100)).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleActive(margin.category)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              margin.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {margin.isActive ? '✓ Activo' : '✗ Inactivo'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteMargin(margin.category)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Presets y Calculadora */}
        <div className="space-y-6">
          {/* Calculadora */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">🧮 Calculadora de Precios</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Proveedor</label>
                <input
                  type="number"
                  value={calcSupplierPrice}
                  onChange={(e) => setCalcSupplierPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría (opcional)</label>
                <select
                  value={calcCategory}
                  onChange={(e) => setCalcCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">-- Default (40%) --</option>
                  {margins.map((m) => (
                    <option key={m.id} value={m.category}>
                      {m.category} ({m.margin}%)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Calcular
              </button>

              {calcResult && (
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio Proveedor:</span>
                      <span className="font-bold">${calcResult.supplierPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Margen:</span>
                      <span className="font-bold text-green-600">{calcResult.margin}%</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-blue-200">
                      <span className="text-gray-900 font-semibold">Precio Venta:</span>
                      <span className="font-bold text-xl text-blue-600">${calcResult.salePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ganancia:</span>
                      <span className="font-bold text-green-600">${calcResult.profit}</span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      {calcResult.formula}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Presets */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">⚡ Presets Comunes</h3>

            <div className="space-y-2">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{preset.category}</div>
                      <div className="text-xs text-gray-500">{preset.description}</div>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{preset.margin}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Guía */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Guía de Márgenes</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>25-35%:</strong> Productos competitivos</li>
              <li>• <strong>40-50%:</strong> Estándar (recomendado)</li>
              <li>• <strong>60-80%:</strong> Productos exclusivos</li>
              <li>• <strong>100%+:</strong> Productos premium</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitMarginsManager;
