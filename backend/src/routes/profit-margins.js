// backend/src/routes/profit-margins.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dropshipping-super-secret-key-2024';

// Middleware para verificar admin
function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token requerido'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
}

/**
 * 💰 SISTEMA DE MÁRGENES DE GANANCIA POR CATEGORÍA
 *
 * Permite configurar diferentes márgenes de ganancia para diferentes categorías
 * Ejemplo:
 * - iPhone Cases: 40%
 * - Electronics: 25%
 * - Accessories: 50%
 * - Luxury Items: 100%
 */

// GET /api/profit-margins - Listar todos los márgenes configurados
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const margins = await prisma.profitMargin.findMany({
      orderBy: { category: 'asc' }
    });

    res.json({
      success: true,
      data: margins
    });
  } catch (error) {
    console.error('❌ Error listando márgenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar márgenes',
      error: error.message
    });
  }
});

// GET /api/profit-margins/:category - Obtener margen de una categoría específica
router.get('/:category', verifyAdmin, async (req, res) => {
  try {
    const { category } = req.params;

    const margin = await prisma.profitMargin.findUnique({
      where: { category }
    });

    if (!margin) {
      // Si no existe, retornar margen por defecto
      return res.json({
        success: true,
        data: {
          category,
          margin: 40, // Margen por defecto
          isDefault: true,
          message: 'Usando margen por defecto (40%)'
        }
      });
    }

    res.json({
      success: true,
      data: {
        ...margin,
        isDefault: false
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo margen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener margen',
      error: error.message
    });
  }
});

// POST /api/profit-margins - Crear o actualizar margen para una categoría
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { category, margin, minMargin, maxMargin, description } = req.body;

    if (!category || margin === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Categoría y margen son requeridos'
      });
    }

    if (margin < 0 || margin > 500) {
      return res.status(400).json({
        success: false,
        message: 'Margen debe estar entre 0% y 500%'
      });
    }

    // Verificar si ya existe
    const existing = await prisma.profitMargin.findUnique({
      where: { category }
    });

    let profitMargin;

    if (existing) {
      // Actualizar
      profitMargin = await prisma.profitMargin.update({
        where: { category },
        data: {
          margin: parseFloat(margin),
          minMargin: minMargin ? parseFloat(minMargin) : null,
          maxMargin: maxMargin ? parseFloat(maxMargin) : null,
          description: description || null
        }
      });

      console.log(`✅ Margen actualizado para ${category}: ${margin}%`);
    } else {
      // Crear nuevo
      profitMargin = await prisma.profitMargin.create({
        data: {
          category,
          margin: parseFloat(margin),
          minMargin: minMargin ? parseFloat(minMargin) : null,
          maxMargin: maxMargin ? parseFloat(maxMargin) : null,
          description: description || null
        }
      });

      console.log(`✅ Margen creado para ${category}: ${margin}%`);
    }

    res.json({
      success: true,
      message: existing ? 'Margen actualizado exitosamente' : 'Margen creado exitosamente',
      data: profitMargin
    });
  } catch (error) {
    console.error('❌ Error guardando margen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar margen',
      error: error.message
    });
  }
});

// DELETE /api/profit-margins/:category - Eliminar margen (vuelve al default)
router.delete('/:category', verifyAdmin, async (req, res) => {
  try {
    const { category } = req.params;

    await prisma.profitMargin.delete({
      where: { category }
    });

    console.log(`🗑️ Margen eliminado para ${category}`);

    res.json({
      success: true,
      message: `Margen para ${category} eliminado. Se usará el margen por defecto (40%)`
    });
  } catch (error) {
    console.error('❌ Error eliminando margen:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Margen no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar margen',
      error: error.message
    });
  }
});

// PUT /api/profit-margins/:category/toggle - Activar/desactivar margen
router.put('/:category/toggle', verifyAdmin, async (req, res) => {
  try {
    const { category } = req.params;

    const margin = await prisma.profitMargin.findUnique({
      where: { category }
    });

    if (!margin) {
      return res.status(404).json({
        success: false,
        message: 'Margen no encontrado'
      });
    }

    const updated = await prisma.profitMargin.update({
      where: { category },
      data: {
        isActive: !margin.isActive
      }
    });

    console.log(`${updated.isActive ? '✅' : '❌'} Margen ${updated.isActive ? 'activado' : 'desactivado'} para ${category}`);

    res.json({
      success: true,
      message: `Margen ${updated.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: updated
    });
  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message
    });
  }
});

// POST /api/profit-margins/calculate - Calcular precio de venta basado en categoría
router.post('/calculate', async (req, res) => {
  try {
    const { supplierPrice, category, customMargin } = req.body;

    if (!supplierPrice) {
      return res.status(400).json({
        success: false,
        message: 'Precio de proveedor es requerido'
      });
    }

    let margin = 40; // Default

    // Si se proporciona margen personalizado, usarlo
    if (customMargin !== undefined) {
      margin = parseFloat(customMargin);
    }
    // Si no, buscar margen de la categoría
    else if (category) {
      const profitMargin = await prisma.profitMargin.findUnique({
        where: { category }
      });

      if (profitMargin && profitMargin.isActive) {
        margin = profitMargin.margin;
      }
    }

    const price = parseFloat(supplierPrice);
    const salePrice = price * (1 + margin / 100);
    const profit = salePrice - price;

    res.json({
      success: true,
      data: {
        supplierPrice: price.toFixed(2),
        margin: margin,
        salePrice: salePrice.toFixed(2),
        profit: profit.toFixed(2),
        profitPercentage: margin,
        category: category || 'Default',
        formula: `${price.toFixed(2)} × (1 + ${margin}%) = ${salePrice.toFixed(2)}`
      }
    });
  } catch (error) {
    console.error('❌ Error calculando precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular precio',
      error: error.message
    });
  }
});

// POST /api/profit-margins/bulk-update - Actualizar múltiples márgenes a la vez
router.post('/bulk-update', verifyAdmin, async (req, res) => {
  try {
    const { margins } = req.body;

    if (!margins || !Array.isArray(margins)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de márgenes'
      });
    }

    const results = {
      updated: 0,
      created: 0,
      errors: 0
    };

    for (const item of margins) {
      try {
        const existing = await prisma.profitMargin.findUnique({
          where: { category: item.category }
        });

        if (existing) {
          await prisma.profitMargin.update({
            where: { category: item.category },
            data: {
              margin: parseFloat(item.margin),
              description: item.description || null
            }
          });
          results.updated++;
        } else {
          await prisma.profitMargin.create({
            data: {
              category: item.category,
              margin: parseFloat(item.margin),
              description: item.description || null
            }
          });
          results.created++;
        }
      } catch (error) {
        console.error(`Error con ${item.category}:`, error);
        results.errors++;
      }
    }

    console.log(`✅ Actualización masiva completada: ${results.updated} actualizados, ${results.created} creados, ${results.errors} errores`);

    res.json({
      success: true,
      message: 'Actualización masiva completada',
      data: results
    });
  } catch (error) {
    console.error('❌ Error en actualización masiva:', error);
    res.status(500).json({
      success: false,
      message: 'Error en actualización masiva',
      error: error.message
    });
  }
});

// GET /api/profit-margins/presets/common - Obtener presets comunes
router.get('/presets/common', verifyAdmin, (req, res) => {
  const commonPresets = [
    {
      category: 'iPhone Cases',
      margin: 40,
      description: 'Fundas para iPhone - Margen estándar'
    },
    {
      category: 'Electronics',
      margin: 25,
      description: 'Electrónicos - Margen conservador'
    },
    {
      category: 'Accessories',
      margin: 50,
      description: 'Accesorios - Margen alto'
    },
    {
      category: 'Luxury Items',
      margin: 100,
      description: 'Artículos de lujo - Margen premium'
    },
    {
      category: 'Clothing',
      margin: 60,
      description: 'Ropa y textiles'
    },
    {
      category: 'Home & Garden',
      margin: 45,
      description: 'Hogar y jardín'
    },
    {
      category: 'Sports & Outdoors',
      margin: 35,
      description: 'Deportes y aire libre'
    },
    {
      category: 'Beauty & Health',
      margin: 55,
      description: 'Belleza y salud'
    }
  ];

  res.json({
    success: true,
    data: commonPresets,
    message: 'Estos son presets sugeridos. Ajústalos según tu estrategia de precios.'
  });
});

module.exports = router;
