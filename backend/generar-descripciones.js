// backend/generar-descripciones.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Detectar el tipo de producto basado en su nombre
 */
function detectProductType(productName) {
  const name = productName.toLowerCase();

  if (name.includes('magsafe') || name.includes('magnét')) {
    return 'magsafe';
  }
  if (name.includes('transparente') || name.includes('crystal') || name.includes('clear')) {
    return 'transparente';
  }
  if (name.includes('cuero') || name.includes('leather') || name.includes('piel')) {
    return 'cuero';
  }
  if (name.includes('antigolpes') || name.includes('shockproof') || name.includes('armadura')) {
    return 'antigolpes';
  }
  if (name.includes('silicona') || name.includes('silicone') || name.includes('soft')) {
    return 'silicona';
  }
  if (name.includes('botón ai') || name.includes('ai control') || name.includes('camera button')) {
    return 'ai_control';
  }

  return 'general';
}

/**
 * Extraer modelos compatibles de las variantes
 */
function extractCompatibleModels(variants) {
  const models = new Set();

  variants.forEach(v => {
    if (v.material && v.material.toLowerCase().includes('iphone')) {
      models.add(v.material);
    }
  });

  if (models.size === 0) {
    return 'iPhone';
  }

  const modelList = Array.from(models).slice(0, 5); // Primeros 5 modelos
  if (models.size > 5) {
    return modelList.join(', ') + ' y más';
  }

  return modelList.join(', ');
}

/**
 * Generar descripción según el tipo de producto
 */
function generateDescription(product, type) {
  const models = extractCompatibleModels(product.variants);
  const shippingTime = product.shippingTime || '15-30 días';

  const descriptions = {
    magsafe: `
🧲 Funda MagSafe Premium para ${models}

✨ CARACTERÍSTICAS DESTACADAS:
✅ Compatible con carga inalámbrica MagSafe
✅ Imanes ultra fuertes (16 imanes de neodimio)
✅ Protección antigolpes con bordes elevados
✅ Material: Silicona premium soft-touch
✅ Protección 360° para cámara y pantalla
✅ No interfiere con la señal del teléfono

📦 INCLUYE:
- Funda MagSafe de alta calidad
- Garantía CASEPRO de satisfacción

💎 BENEFICIOS:
- Carga inalámbrica sin quitar la funda
- Compatible con accesorios MagSafe oficiales
- Diseño delgado que no agrega volumen
- Fácil de instalar y quitar

🚚 ENVÍO GRATIS a todo Perú
📍 Tiempo de entrega: ${shippingTime}
🛡️ Protección profesional CASEPRO
`,

    transparente: `
💎 Funda Transparente Crystal Clear para ${models}

✨ CARACTERÍSTICAS DESTACADAS:
✅ Totalmente transparente - muestra el diseño original
✅ Material TPU flexible y resistente a impactos
✅ Anti-amarillamiento con tecnología UV premium
✅ Protección contra caídas y rayones profundos
✅ Bordes elevados protegen cámara y pantalla
✅ Acabado mate que repele huellas dactilares

📦 INCLUYE:
- Funda transparente premium
- Garantía CASEPRO de satisfacción

💎 BENEFICIOS:
- Mantiene el diseño y color original de tu iPhone
- No se pone amarilla con el tiempo
- Protección sin comprometer la estética
- Tacto suave y agarre seguro

🚚 ENVÍO GRATIS a todo Perú
📍 Tiempo de entrega: ${shippingTime}
🛡️ Protección profesional CASEPRO
`,

    cuero: `
👔 Funda de Cuero Premium para ${models}

✨ CARACTERÍSTICAS DESTACADAS:
✅ Cuero sintético de alta calidad con acabado profesional
✅ Interior forrado con microfibra suave
✅ Protección completa contra golpes y rayones
✅ Diseño slim - no agrega volumen excesivo
✅ Bordes elevados protegen cámara y pantalla
✅ Acabado elegante y profesional

📦 INCLUYE:
- Funda de cuero premium
- Garantía CASEPRO de satisfacción

💎 BENEFICIOS:
- Look profesional y elegante
- Material duradero que mejora con el uso
- Tacto premium y agarre seguro
- Perfecta para uso diario y profesional

🚚 ENVÍO GRATIS a todo Perú
📍 Tiempo de entrega: ${shippingTime}
🛡️ Protección profesional CASEPRO
`,

    antigolpes: `
🛡️ Funda Antigolpes Grado Militar para ${models}

✨ CARACTERÍSTICAS DESTACADAS:
✅ Certificación de protección militar (MIL-STD-810G)
✅ Doble capa: TPU flexible + Policarbonato rígido
✅ Esquinas reforzadas con tecnología Air-Cushion
✅ Protección 360° incluye cámara y pantalla
✅ Resiste caídas de hasta 3 metros de altura
✅ Botones táctiles precisos y fáciles de presionar

📦 INCLUYE:
- Funda antigolpes grado militar
- Garantía CASEPRO de satisfacción

💎 BENEFICIOS:
- Máxima protección sin comprometer el diseño
- Absorción de impactos en todas las direcciones
- Perfecta para uso rudo y deportes extremos
- Durabilidad probada en condiciones extremas

🚚 ENVÍO GRATIS a todo Perú
📍 Tiempo de entrega: ${shippingTime}
🛡️ Protección profesional CASEPRO
`,

    silicona: `
🎨 Funda de Silicona Premium para ${models}

✨ CARACTERÍSTICAS DESTACADAS:
✅ Silicona líquida premium soft-touch
✅ Tacto suave como terciopelo
✅ Protección antigolpes con bordes elevados
✅ Interior forrado con microfibra
✅ Resistente a rayones y manchas
✅ No se deforma ni pierde color

📦 INCLUYE:
- Funda de silicona premium
- Garantía CASEPRO de satisfacción

💎 BENEFICIOS:
- Agarre seguro y cómodo
- Fácil de limpiar y mantener
- No resbala de las manos
- Colores vibrantes que no se desvanecen

🚚 ENVÍO GRATIS a todo Perú
📍 Tiempo de entrega: ${shippingTime}
🛡️ Protección profesional CASEPRO
`,

    ai_control: `
🤖 Funda Innovadora con Botón AI Control para ${models}

✨ CARACTERÍSTICAS DESTACADAS:
✅ Botón AI Control integrado y funcional
✅ Compatible con funciones de cámara avanzada
✅ Protección completa sin sacrificar funcionalidad
✅ Material premium resistente a impactos
✅ Bordes elevados protegen cámara y pantalla
✅ Diseño ergonómico para uso con una mano

📦 INCLUYE:
- Funda con botón AI Control
- Garantía CASEPRO de satisfacción

💎 BENEFICIOS:
- Acceso rápido a funciones de cámara
- No necesitas quitar la funda para usarlo
- Diseño moderno y tecnológico
- Perfecta para amantes de la fotografía móvil

🚚 ENVÍO GRATIS a todo Perú
📍 Tiempo de entrega: ${shippingTime}
🛡️ Protección profesional CASEPRO
`,

    general: `
📱 Funda Profesional para ${models}

✨ CARACTERÍSTICAS DESTACADAS:
✅ Protección completa contra golpes y rayones
✅ Material de alta calidad resistente y duradero
✅ Bordes elevados protegen cámara y pantalla
✅ Diseño ergonómico con acabado premium
✅ Botones táctiles precisos y fáciles de presionar
✅ Acceso perfecto a todos los puertos

📦 INCLUYE:
- Funda premium de alta calidad
- Garantía CASEPRO de satisfacción

💎 BENEFICIOS:
- Protección profesional sin comprometer el diseño
- Fácil de instalar y quitar
- Compatible con cargadores inalámbricos
- Durabilidad comprobada

🚚 ENVÍO GRATIS a todo Perú
📍 Tiempo de entrega: ${shippingTime}
🛡️ Protección profesional CASEPRO
`
  };

  return (descriptions[type] || descriptions.general).trim();
}

async function generateDescriptions() {
  console.log('📝 GENERACIÓN DE DESCRIPCIONES PERSONALIZADAS\n');
  console.log('='.repeat(80));

  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true
      },
      where: {
        OR: [
          { description: { contains: 'Protección profesional de CASEPRO' } },
          { description: null },
          { description: '' }
        ]
      }
    });

    console.log(`\n📦 Productos a actualizar: ${products.length}\n`);

    let updated = 0;

    for (const product of products) {
      const type = detectProductType(product.name);
      const newDescription = generateDescription(product, type);

      console.log(`✅ ${product.name}`);
      console.log(`   Tipo detectado: ${type}`);
      console.log(`   Descripción: ${newDescription.substring(0, 100)}...`);
      console.log('');

      await prisma.product.update({
        where: { id: product.id },
        data: { description: newDescription }
      });

      updated++;
    }

    console.log('='.repeat(80));
    console.log(`\n✅ COMPLETADO: ${updated} productos actualizados\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

generateDescriptions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
