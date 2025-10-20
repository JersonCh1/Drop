# Configuración de Tracking Pixels (Facebook & TikTok)

Esta guía te ayudará a configurar los tracking pixels de Facebook (Meta) y TikTok en tu tienda de dropshipping.

## ¿Qué son los Tracking Pixels?

Los tracking pixels son pequeños códigos que rastrean las acciones de los usuarios en tu sitio web. Esto te permite:

- **Medir conversiones**: Saber cuántas personas compran después de ver tus anuncios
- **Optimizar campañas**: Facebook y TikTok optimizan automáticamente tus anuncios basándose en conversiones
- **Retargeting**: Mostrar anuncios a personas que visitaron tu sitio pero no compraron
- **Crear audiencias similares**: Encontrar nuevos clientes similares a tus compradores

## Eventos que se Rastrean Automáticamente

Tu tienda ya está configurada para rastrear estos eventos importantes:

| Evento | Cuándo se Dispara | Para Qué Sirve |
|--------|-------------------|----------------|
| **PageView** | Al cargar cualquier página | Medir tráfico general |
| **ViewContent** | Al ver un producto | Retargeting a personas interesadas |
| **AddToCart** | Al agregar al carrito | Optimizar para agregar al carrito |
| **InitiateCheckout** | Al abrir el checkout | Optimizar para inicios de checkout |
| **Purchase** | Al completar una compra | Medir conversiones reales (ROI) |
| **Search** | Al buscar productos | Entender qué buscan los usuarios |
| **Lead** | Al dar email (newsletter) | Captura de leads |

## Configuración Paso a Paso

### 1. Facebook (Meta) Pixel

#### Obtener tu Pixel ID

1. Ve a [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Si no tienes un pixel, haz clic en "Conectar orígenes de datos" → "Web" → "Facebook Pixel"
3. Dale un nombre (ej: "Mi Tienda iPhone")
4. Copia el **Pixel ID** (es un número de 15-16 dígitos)

#### Agregar a tu Tienda

1. Abre el archivo `frontend/.env`
2. Agrega tu Pixel ID:
   ```env
   REACT_APP_META_PIXEL_ID=1234567890123456
   ```
3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

#### Verificar que Funciona

1. Instala la extensión [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Abre tu tienda en Chrome
3. Haz clic en la extensión - debe mostrar tu Pixel ID y los eventos que se disparan
4. Agrega un producto al carrito - deberías ver el evento "AddToCart"

### 2. TikTok Pixel

#### Obtener tu Pixel ID

1. Ve a [TikTok Ads Manager](https://ads.tiktok.com/)
2. Ve a "Assets" → "Event"
3. Haz clic en "Web Events" → "Manage"
4. Si no tienes un pixel, crea uno nuevo
5. Copia el **Pixel ID** (código alfanumérico)

#### Agregar a tu Tienda

1. Abre el archivo `frontend/.env`
2. Agrega tu Pixel ID:
   ```env
   REACT_APP_TIKTOK_PIXEL_ID=ABCDEFGH123456789
   ```
3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

#### Verificar que Funciona

1. Instala la extensión [TikTok Pixel Helper](https://chrome.google.com/webstore/detail/tiktok-pixel-helper/aelgobmabdmlfmiblddjfnjodalhidnn)
2. Abre tu tienda en Chrome
3. Haz clic en la extensión - debe mostrar tu Pixel ID
4. Navega por tu tienda - los eventos deberían aparecer en el helper

## Modo de Prueba vs Producción

### Durante Desarrollo (localhost)

Los pixels funcionan incluso en localhost, pero los eventos aparecerán marcados como "test" en tus dashboards. Esto es PERFECTO para:

- Verificar que los eventos se disparan correctamente
- Probar el flujo de compra completo
- No contaminar tus datos de producción

### En Producción

Una vez que deploys tu tienda:

1. Los mismos Pixel IDs funcionan automáticamente
2. Los eventos ahora se marcarán como "production"
3. Las conversiones contarán para tus campañas de anuncios

## Uso con Campañas de Anuncios

### Facebook Ads

1. **Crear Campaña de Conversión**:
   - Objetivo: "Conversiones"
   - Pixel de conversión: Selecciona tu pixel
   - Evento de conversión: "Purchase" (compras)

2. **Optimización Automática**:
   - Facebook aprenderá quién es más probable que compre
   - Mostrará tus anuncios a esas personas
   - Mejorará el ROAS (Return on Ad Spend)

3. **Audiencias Personalizadas**:
   - Retargeting a quienes agregaron al carrito pero no compraron
   - Excluir a quienes ya compraron
   - Crear audiencias similares a tus compradores

### TikTok Ads

1. **Crear Campaña de Conversión**:
   - Objetivo: "Website Conversions"
   - Pixel: Selecciona tu pixel
   - Evento de optimización: "Complete Payment"

2. **Ventajas del Pixel de TikTok**:
   - Algoritmo aprende rápidamente
   - Excelente para productos visuales (como fundas iPhone)
   - Retargeting económico

## Verificar Datos en Tiempo Real

### Facebook Events Manager

1. Ve a [Events Manager](https://business.facebook.com/events_manager)
2. Selecciona tu pixel
3. Ve a la pestaña "Test Events"
4. Realiza acciones en tu tienda (agregar al carrito, comprar)
5. Deberías ver los eventos aparecer en 1-2 segundos

### TikTok Events Manager

1. Ve a [TikTok Events Manager](https://ads.tiktok.com/i18n/events_manager)
2. Selecciona tu pixel
3. Ve a "Event Debugging"
4. Realiza acciones en tu tienda
5. Los eventos aparecerán en tiempo real

## Solución de Problemas

### Los eventos no aparecen

1. **Verifica el Pixel ID**:
   ```bash
   # En la consola del navegador (F12)
   localStorage.getItem('REACT_APP_META_PIXEL_ID')
   ```

2. **Revisa la consola del navegador**:
   - Abre DevTools (F12)
   - Ve a Console
   - Busca mensajes de "Tracking pixels inicializados"

3. **Verifica que reiniciaste el servidor**:
   ```bash
   # Detén el servidor (Ctrl+C)
   # Inícialo de nuevo
   npm run dev
   ```

### Los eventos se duplican

Esto es normal durante desarrollo. Ocurre porque React recarga los componentes. En producción no sucede.

### Quiero desactivar temporalmente los pixels

Simplemente comenta las líneas en tu `.env`:

```env
# REACT_APP_META_PIXEL_ID=1234567890123456
# REACT_APP_TIKTOK_PIXEL_ID=ABCDEFGH123456789
```

## Mejores Prácticas

### 1. Deja los Pixels 7-14 días antes de las campañas

Facebook y TikTok necesitan datos para aprender. Instala los pixels ANTES de lanzar anuncios.

### 2. No cambies los Pixel IDs frecuentemente

Cada vez que cambias un pixel, pierdes el historial de aprendizaje.

### 3. Usa el mismo pixel en todas tus tiendas (si vendes productos similares)

Más datos = mejor optimización.

### 4. Monitorea regularmente

- Revisa Events Manager semanalmente
- Verifica que Purchase events se estén registrando
- Compara con tus ventas reales (deberían coincidir)

## Estructura del Código

Si quieres personalizar el tracking:

```
frontend/src/
├── utils/
│   └── trackingPixels.ts          # Manager principal de pixels
├── App.tsx                         # Inicialización de pixels
├── components/
│   ├── products/
│   │   └── ProductCard.tsx        # Track ViewContent, AddToCart
│   └── checkout/
│       └── Checkout.tsx           # Track InitiateCheckout, Purchase
└── pages/
    └── ProductDetailPage.tsx      # Track ViewContent, AddToCart
```

### Agregar eventos personalizados

```typescript
import { trackingPixels } from './utils/trackingPixels';

// Trackear un evento personalizado
trackingPixels.trackCustomEvent('NewsletterSignup', {
  email: 'user@example.com'
});
```

## Privacidad y GDPR

Los pixels respetan la privacidad del usuario:

- No se almacena información personal identificable
- Los usuarios pueden bloquear pixels con ad blockers
- Compatible con regulaciones de privacidad

Para cumplir con GDPR, considera agregar un banner de cookies (no incluido en este MVP).

## Recursos Adicionales

- [Facebook Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [TikTok Pixel Documentation](https://ads.tiktok.com/help/article?aid=10000357)
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [TikTok Ads Help Center](https://ads.tiktok.com/help/)

## Soporte

Si tienes problemas con la configuración:

1. Verifica esta guía paso a paso
2. Revisa la consola del navegador (F12)
3. Usa las extensiones Pixel Helper
4. Verifica que los Pixel IDs sean correctos

---

**¡Listo!** Con los tracking pixels configurados, podrás medir y optimizar tus campañas de Facebook y TikTok Ads de forma profesional.
