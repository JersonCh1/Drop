# 🎯 Guía Completa: Facebook/Instagram Ads para CASEPRO
## Optimizado para Conversiones y Ventas

**Pixel ID Instalado:** `873256788597707`
**Objetivo:** Maximizar ventas de carcasas iPhone con ROAS óptimo

---

## 📊 PASO 1: Verificar Configuración del Pixel

### 1.1 Verificar Eventos en Facebook Events Manager

1. **Ir a Events Manager**
   - URL: https://business.facebook.com/events_manager2
   - Buscar tu Pixel ID: `873256788597707`

2. **Eventos que deben aparecer (ya implementados):**
   - ✅ **PageView** - Visitantes al sitio
   - ✅ **ViewContent** - Ver productos
   - ✅ **AddToCart** - Agregar al carrito
   - ✅ **InitiateCheckout** - Iniciar checkout
   - ✅ **AddPaymentInfo** - Agregar info de pago
   - ✅ **Purchase** - Compra completada (EVENTO CLAVE)

3. **Verificar que los eventos tienen datos:**
   - Haz una compra de prueba en tu tienda
   - Espera 15-20 minutos
   - Verifica que aparezca en "Test Events" con los valores correctos

### 1.2 Configurar Conversiones API (Opcional pero RECOMENDADO)

Para evitar pérdida de datos por bloqueadores de ads:

**Backend:** Ya tienes `/api/meta/conversion` listo
**Configuración:**
- Genera un Access Token en Events Manager
- Configura variables de entorno en Railway:
  ```bash
  META_PIXEL_ID=873256788597707
  META_ACCESS_TOKEN=tu_token_aqui
  ```

---

## 💰 PASO 2: Configurar Dominio Verificado (CRÍTICO)

Facebook requiere dominio verificado para trackear conversiones:

### 2.1 Verificar Dominio en Business Manager

1. **Ir a Business Settings**
   - URL: https://business.facebook.com/settings/
   - Ve a "Brand Safety" → "Domains"

2. **Agregar dominio:** `casepro.es`

3. **Método de verificación:** Meta Tag
   ```html
   <meta name="facebook-domain-verification" content="[tu-codigo]" />
   ```
   Ya está preparado en `index.html`

4. **Configurar Eventos en el Dominio**
   - Selecciona `casepro.es`
   - Agrega tu Pixel `873256788597707`
   - Configura como "Priority domain for ads"

### 2.2 Configurar Agregated Event Measurement

1. En Events Manager → Aggregated Event Measurement
2. Priorizar eventos (orden de importancia):
   - **1. Purchase** (más importante)
   - **2. InitiateCheckout**
   - **3. AddToCart**
   - **4. ViewContent**
   - **5. PageView**

---

## 🎨 PASO 3: Crear Audiencias Personalizadas (Custom Audiences)

### 3.1 Audiencias de Retargeting (Alta Conversión)

#### Audiencia 1: "Carritos Abandonados" (PRIORIDAD ALTA)
```
- Evento: InitiateCheckout
- Período: Últimos 7 días
- Excluir: Purchase (últimos 7 días)
```
**Por qué funciona:** Personas que ya mostraron intención de compra

#### Audiencia 2: "Agregaron al Carrito"
```
- Evento: AddToCart
- Período: Últimos 14 días
- Excluir: Purchase (últimos 14 días)
```

#### Audiencia 3: "Visitantes de Producto"
```
- Evento: ViewContent
- Período: Últimos 30 días
- Excluir: Purchase (últimos 30 días)
```

#### Audiencia 4: "Compradores"
```
- Evento: Purchase
- Período: Últimos 90 días
```
**Uso:** Lookalike y exclusión de campañas de prospecting

### 3.2 Audiencias Lookalike (Para Escalar)

Una vez tengas 50+ conversiones:

1. **Lookalike 1% - Compradores**
   - Fuente: Audiencia de Compradores
   - País: Perú (o tu mercado principal)
   - Tamaño: 1%

2. **Lookalike 2-3% - Compradores**
   - Para escalar cuando Lookalike 1% se sature

3. **Lookalike 1% - AddToCart**
   - Fuente: Audiencia de AddToCart
   - Para cold traffic

---

## 🚀 PASO 4: Crear Campañas Optimizadas para Conversiones

### ESTRUCTURA RECOMENDADA (3 Campañas)

---

## 📢 CAMPAÑA 1: Retargeting - Hot Traffic
**Objetivo:** Recuperar carritos abandonados (ROI más alto)

### Configuración de Campaña
```
Nombre: CASEPRO - Retargeting Hot
Objetivo: Conversiones
Evento de conversión: Purchase
Presupuesto: $10-15/día (empezar bajo)
```

### Ad Sets (3 niveles de temperatura)

#### Ad Set 1.1: Carritos Abandonados (MUY CALIENTE)
```
Audiencia: Custom Audience "Carritos Abandonados"
Ubicaciones: Feed Instagram + Stories + Feed Facebook
Optimización: Conversiones (Purchase)
Ventana de conversión: 1 día después del clic
Presupuesto: $5/día
```

**Creative recomendado:**
- **Título:** "¡Tu Carrito te está esperando! 🛒"
- **Texto:** "Completa tu pedido ahora y recibe ENVÍO GRATIS en pedidos +$80. Protege tu iPhone hoy mismo."
- **CTA:** "Comprar Ahora"
- **Formato:** Carrusel mostrando productos del carrito (Dynamic Ads)

#### Ad Set 1.2: Agregaron al Carrito (CALIENTE)
```
Audiencia: Custom Audience "Agregaron al Carrito"
Ubicaciones: Feed Instagram + Stories
Presupuesto: $3/día
```

**Creative recomendado:**
- **Título:** "¿Olvidaste algo? 😊"
- **Texto:** "Las carcasas que viste siguen disponibles. Protección premium para tu iPhone desde $25."
- **CTA:** "Ver Ahora"

#### Ad Set 1.3: Visitantes de Producto (TIBIO)
```
Audiencia: Custom Audience "Visitantes de Producto"
Presupuesto: $2/día
```

---

## 📢 CAMPAÑA 2: Prospecting - Cold Traffic
**Objetivo:** Adquirir nuevos clientes

### Configuración de Campaña
```
Nombre: CASEPRO - Prospecting Cold
Objetivo: Conversiones
Evento: Purchase
Presupuesto: $15-20/día
CBO (Campaign Budget Optimization): Activado
```

### Ad Sets (Testing de Audiencias)

#### Ad Set 2.1: Lookalike 1% Compradores
```
Audiencia: Lookalike 1% de "Compradores"
Edad: 18-45
Países: Perú (o tu mercado)
Ubicaciones: Feed Instagram + Reels + Stories
Presupuesto: Automático (CBO)
```

#### Ad Set 2.2: Intereses - Tech Lovers
```
Targeting:
  - Intereses: iPhone, Apple, Tecnología, Accesorios móviles
  - Comportamientos: Compradores online frecuentes
Edad: 25-45
Género: Todos
Presupuesto: Automático (CBO)
```

#### Ad Set 2.3: Intereses - Fashion & Lifestyle
```
Targeting:
  - Intereses: Moda, Diseño, Lifestyle, Shopping online
  - Device: Solo usuarios de iPhone
Edad: 18-35
Género: Todos
```

**Creatives para Cold Traffic:**

**Formato 1: Video Corto (15s)**
- Mostrar el "antes y después" (iPhone sin carcasa vs con carcasa)
- Destacar durabilidad y caídas
- CTA: "Protege tu iPhone ahora"

**Formato 2: Carrusel de Productos**
- 5-7 modelos diferentes
- Destacar variedad de colores y estilos
- Precio visible: "Desde $25"

**Formato 3: Imagen Única**
- Hero image del producto más vendedor
- Texto: "Protección Premium + Estilo. Envío Gratis +$80"
- Diseño minimalista, limpio

---

## 📢 CAMPAÑA 3: Dynamic Product Ads (DPA)
**Objetivo:** Remarketing automático con productos vistos

### Configuración de Campaña
```
Nombre: CASEPRO - DPA Retargeting
Objetivo: Conversiones
Tipo: Catálogo (Dynamic Ads)
Evento: Purchase
```

### Requisito Previo: Crear Product Catalog

1. **Ir a Commerce Manager**
   - URL: https://business.facebook.com/commerce/

2. **Crear Data Source**
   - Tipo: Catalog
   - Método: Pixel (eventos ViewContent, AddToCart)

3. **Crear Product Feed (automático)**
   - URL del feed: `https://casepro.es/api/facebook/product-feed`
   - Actualización: Diaria

4. **Configurar Product Set**
   - Todos los productos
   - Filtro: En stock = true

### Ad Set Configuración
```
Audiencia: Visitaron productos pero no compraron (últimos 30 días)
Optimización: Conversiones (Purchase)
Ubicaciones: Todas las ubicaciones automáticas
Presupuesto: $5/día
```

**Creative automático:**
- Facebook mostrará automáticamente los productos que cada persona vio
- Formato: Carrusel dinámico
- Texto: "[Nombre del Producto] - Protección premium para tu iPhone. ¡Envío Gratis!"

---

## 📈 PASO 5: Estrategia de Presupuesto y Escalado

### Fase 1: Testing (Días 1-7)
```
Total: $30-40/día
- Retargeting: $10/día
- Prospecting: $15/día
- DPA: $5/día
```

**Objetivo:** Identificar qué ad sets tienen mejor ROAS (Return on Ad Spend)

### Fase 2: Optimización (Días 8-14)
```
Total: $50-70/día
- Pausar ad sets con ROAS < 1.5
- Duplicar presupuesto en ad sets con ROAS > 3
- Crear variaciones de creatives ganadores
```

### Fase 3: Escalado (Día 15+)
```
Total: $100+/día
- Escalar ad sets ganadores incrementando 20% cada 3 días
- Lanzar Lookalike 2-3% cuando Lookalike 1% se sature
- Expandir a nuevos países (Colombia, Chile, México)
```

### Regla de Oro: ROAS Target
```
- ROAS Mínimo Aceptable: 2.0 (por cada $1 gastado, generas $2 en ventas)
- ROAS Objetivo: 3.0-4.0
- ROAS Excelente: 5.0+
```

---

## 🎨 PASO 6: Creatives que Convierten (Ad Copy Ejemplos)

### Template 1: Pain Point → Solution
```
Título: "¿Cansado de Pantallas Rotas? 💔"

Texto Principal:
"Tu iPhone es una inversión de $1000+. ¿Por qué arriesgarlo?

✅ Protección militar contra caídas
✅ Diseño premium que no agrega volumen
✅ 100% compatible con carga inalámbrica
✅ Envío GRATIS en pedidos +$80

Miles de clientes ya protegen su iPhone con CASEPRO.

👉 Elige tu modelo y color ahora."

CTA: Comprar Ahora
```

### Template 2: Social Proof
```
Título: "4.8★ - Más de 10,000 iPhones Protegidos 🛡️"

Texto Principal:
"Lo que dicen nuestros clientes:

'Se cayó desde el 2do piso y no pasó nada. Increíble.' - María L.
'Diseño hermoso y súper resistente.' - Carlos R.
'Mejor inversión para mi iPhone 15 Pro.' - Ana G.

Protección profesional que puedes confiar.
Envío gratis en pedidos +$80.

¿Listo para proteger tu iPhone?"

CTA: Ver Modelos
```

### Template 3: Urgency + Offer
```
Título: "🔥 ÚLTIMA OPORTUNIDAD: ENVÍO GRATIS"

Texto Principal:
"Solo por HOY: Envío gratis en TODAS las carcasas.

⚡ Stock limitado del iPhone 15 Pro Max
⚡ Entrega en 3-5 días
⚡ Garantía 100% satisfacción

No esperes a que sea tarde. Protege tu iPhone ahora.

👉 Elige tu carcasa y ahorra en envío."

CTA: Aprovechar Oferta
```

### Template 4: Video Script (15 segundos)
```
Segundo 0-3: [Muestra iPhone cayendo en cámara lenta]
Voz: "Tu peor pesadilla..."

Segundo 3-7: [iPhone con carcasa CASEPRO rebota sin daño]
Voz: "...evitada. CASEPRO protege tu iPhone de caídas de hasta 3 metros."

Segundo 7-12: [Muestra diferentes colores y modelos]
Voz: "Protección militar + Diseño premium. Compatible con todos los iPhone."

Segundo 12-15: [CTA en pantalla]
Texto: "ENVÍO GRATIS +$80"
Voz: "Visita CASEPRO.es"

CTA: Comprar Ahora
```

---

## 🎯 PASO 7: Optimización y A/B Testing

### Qué testear:

#### 1. Creatives (Prioridad ALTA)
```
A/B Test 1: Video vs Imagen
A/B Test 2: Producto solo vs Lifestyle (persona usando)
A/B Test 3: Fondo blanco vs Fondo colorido
A/B Test 4: Mostrar precio vs No mostrar precio
```

#### 2. Copy (Prioridad MEDIA)
```
A/B Test 1: Título con urgencia vs Sin urgencia
A/B Test 2: Copy largo (5+ líneas) vs Copy corto (2-3 líneas)
A/B Test 3: Emojis vs Sin emojis
A/B Test 4: Beneficios vs Características técnicas
```

#### 3. Call to Action
```
"Comprar Ahora" vs "Ver Modelos" vs "Protege tu iPhone"
```

#### 4. Ubicaciones (Placement Testing)
```
Feed Instagram vs Stories vs Reels
Facebook Feed vs Marketplace vs Audience Network
```

### Reglas de Testing:
- **Cambiar 1 variable a la vez**
- **Esperar mínimo 3-5 días antes de tomar decisiones**
- **Mínimo 100 impresiones por variante**
- **Pausar anuncios con CTR < 1%**
- **Pausar anuncios con CPM > $15 en Perú**

---

## 📊 PASO 8: Métricas Clave a Monitorear (KPIs)

### Dashboard Diario (Revisar cada mañana)

#### Métricas de Performance:
```
1. ROAS (Return on Ad Spend)
   - Fórmula: (Ingresos por Ads / Gasto en Ads)
   - Target: 3.0+ (por cada $1 gastado, generas $3)

2. CPA (Costo por Compra)
   - Target: < $15 (Perú)
   - Fórmula: Gasto Total / Número de Compras

3. CTR (Click-Through Rate)
   - Target: > 1.5% (Retargeting), > 0.8% (Cold)
   - Fórmula: (Clics / Impresiones) × 100

4. CR (Conversion Rate)
   - Target: > 2%
   - Fórmula: (Compras / Clics) × 100

5. CPM (Costo por 1000 Impresiones)
   - Target: < $10 (Perú)

6. Frecuencia
   - Target: < 3 (evitar ad fatigue)
```

### Herramientas de Monitoreo:

1. **Facebook Ads Manager**
   - URL: https://business.facebook.com/adsmanager
   - Crear Custom Reports con tus KPIs

2. **Google Analytics 4** (ya instalado)
   - Verificar que las conversiones de Facebook coincidan

3. **Triple Whale / Hyros** (opcional, para tracking avanzado)

---

## 🛠️ PASO 9: Product Feed para Dynamic Ads

Necesitas crear el endpoint del product feed:

### Backend: `/api/facebook/product-feed`

Crear archivo: `backend/src/routes/facebookProductFeed.js`

```javascript
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: { variants: true }
    });

    // Formato XML para Facebook Product Catalog
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>CASEPRO - iPhone Cases</title>
    <link>https://casepro.es</link>
    <description>Carcasas premium para iPhone</description>
`;

    products.forEach(product => {
      product.variants.forEach(variant => {
        xml += `
    <item>
      <g:id>${variant.id}</g:id>
      <g:title>${product.name} - ${variant.color}</g:title>
      <g:description>${product.description || 'Carcasa premium para iPhone'}</g:description>
      <g:link>https://casepro.es/product/${product.slug}</g:link>
      <g:image_link>${variant.imageUrl || product.mainImage}</g:image_link>
      <g:brand>CASEPRO</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${variant.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${variant.price} USD</g:price>
      <g:google_product_category>Electronics &gt; Phone Cases</g:google_product_category>
      <g:product_type>Phone Cases > iPhone Cases</g:product_type>
    </item>`;
      });
    });

    xml += `
  </channel>
</rss>`;

    res.set('Content-Type', 'text/xml');
    res.send(xml);

  } catch (error) {
    console.error('Error generando product feed:', error);
    res.status(500).send('Error');
  }
});

module.exports = router;
```

**Registrar ruta en `server.js`:**
```javascript
const facebookProductFeed = require('./routes/facebookProductFeed');
app.use('/api/facebook/product-feed', facebookProductFeed);
```

---

## 🎓 PASO 10: Recursos Adicionales y Mejores Prácticas

### Frecuencia de Actualización de Creatives
```
- Retargeting Ads: Cambiar cada 7-10 días (evitar fatiga)
- Cold Traffic Ads: Cambiar cada 14-21 días
- Siempre tener 3-4 variantes rotando
```

### Estacionalidad y Eventos
```
- Black Friday / Cyber Monday: Aumentar presupuesto 3-5x
- Día de la Madre/Padre: Crear creatives específicos
- Lanzamiento de nuevos iPhones: Promocionar compatibilidad
```

### Compliance y Políticas de Facebook
```
❌ Evitar:
- Afirmaciones médicas ("protege tu salud")
- Lenguaje discriminatorio
- "Haz clic aquí" en el copy (usar en botón CTA)
- Texto excesivo en imagen (máx 20%)

✅ Permitido:
- Testimonios reales
- Garantías específicas
- Comparaciones genéricas (no con marcas específicas)
```

### Herramientas Útiles:

1. **Facebook Creative Hub**
   - URL: https://www.facebook.com/ads/creativehub
   - Mockups de anuncios antes de lanzar

2. **Meta Business Suite**
   - URL: https://business.facebook.com/
   - Gestión centralizada

3. **Canva** (para creatives)
   - Templates de ads optimizados para Facebook/Instagram

4. **AdEspresso** (opcional)
   - A/B testing avanzado y analytics

---

## 📋 CHECKLIST FINAL: Antes de Lanzar Campañas

- [ ] Pixel verificado y recibiendo eventos
- [ ] Dominio verificado en Business Manager
- [ ] Aggregated Event Measurement configurado (Purchase como #1)
- [ ] Custom Audiences creadas (Carritos Abandonados, etc.)
- [ ] Lookalike Audiences creadas (si tienes 50+ conversiones)
- [ ] Product Catalog creado y sincronizado
- [ ] Método de pago válido en Ads Manager
- [ ] Presupuesto diario definido ($30+ recomendado para empezar)
- [ ] Creatives preparados (3-5 variantes por campaña)
- [ ] Textos de anuncios escritos y revisados
- [ ] UTM parameters configurados para tracking
- [ ] Google Analytics conectado para verificar ventas

---

## 💡 CONSEJOS PRO

### 1. Empieza con Retargeting
"No gastes todo tu presupuesto en cold traffic desde día 1. El retargeting tiene 5-10x mejor ROAS."

### 2. Paciencia con el Learning Phase
"Facebook necesita ~50 conversiones por ad set para optimizar. No hagas cambios drásticos en los primeros 7 días."

### 3. Creative es el 70% del éxito
"Un mal creative con buen targeting falla. Un buen creative con targeting regular gana."

### 4. Test, Test, Test
"Siempre ten 2-3 variantes de creatives corriendo. El ganador de hoy puede ser el perdedor de mañana."

### 5. Monitorea la Frecuencia
"Si la frecuencia > 4, tu audiencia ya vio el anuncio demasiado. Renueva el creative o expande la audiencia."

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **HOY:** Verificar que el Pixel esté recibiendo eventos correctamente
2. **MAÑANA:** Crear Custom Audiences de retargeting
3. **DÍA 3:** Lanzar Campaña 1 (Retargeting) con $10/día
4. **DÍA 7:** Analizar resultados y crear Campaña 2 (Prospecting)
5. **DÍA 14:** Escalar ad sets con ROAS > 3

---

## 🎯 META A 30 DÍAS

```
Con $900 en gasto publicitario ($30/día × 30 días):

Target Conservador (ROAS 2.5):
- Ingresos: $2,250
- Beneficio Neto: ~$1,350

Target Optimista (ROAS 4.0):
- Ingresos: $3,600
- Beneficio Neto: ~$2,700

Órdenes esperadas: 40-60
Costo por adquisición: $15-22
```

---

**¡Éxito con tus campañas de Facebook Ads! 🚀**

*Actualizado: 2025-12-12*
*CASEPRO - Protección Profesional para iPhone*
