# 📊 Facebook Pixel - Guía de Configuración

## ¿Qué es Facebook Pixel?

**Facebook Pixel** es un código de seguimiento que instalas en tu sitio web para:

1. **Rastrear visitantes** → Saber quién visita tu tienda
2. **Rastrear acciones** → Qué hacen (ven productos, agregan al carrito, compran)
3. **Crear audiencias** → Personas que visitaron pero no compraron
4. **Medir conversiones** → Cuántas ventas generaron tus ads
5. **Optimizar ads** → Facebook aprende qué anuncios funcionan mejor
6. **Retargeting** → Mostrar ads a gente que ya visitó tu tienda

---

## 🚀 Cómo Funciona

```
Usuario → Ve tu ad en Facebook → Entra a casepro.es → Ve una carcasa
          ↓
Facebook Pixel registra: "Este usuario vio el producto X"
          ↓
No compra y se va
          ↓
Facebook le muestra ads de CASEPRO recordándole el producto
          ↓
Regresa y compra ✅
          ↓
Facebook Pixel registra: "Este usuario compró - el ad funcionó"
```

---

## 📋 Paso 1: Crear Facebook Pixel

### 1. Ir a Facebook Business Manager

1. **Ir a**: https://business.facebook.com/
2. **Iniciar sesión** con tu cuenta de Facebook
3. Si no tienes Business Manager, créalo gratis

### 2. Crear el Pixel

1. En el menú lateral, ir a **"Eventos de Datos" → "Pixels"**
2. Click en **"Agregar"** o **"Crear un Pixel"**
3. Nombre: `CASEPRO Pixel`
4. **Copiar el Pixel ID** (son 15-16 dígitos, ejemplo: `123456789012345`)

---

## 🔧 Paso 2: Configurar el Pixel en tu Tienda

### Opción 1: Manual (Recomendada)

1. **Abrir** el archivo:
   ```
   frontend/public/index.html
   ```

2. **Buscar** esta línea (alrededor de la línea 64):
   ```html
   fbq('init', 'YOUR_PIXEL_ID'); // Reemplaza con tu Pixel ID
   ```

3. **Reemplazar** `YOUR_PIXEL_ID` con tu Pixel ID real:
   ```html
   fbq('init', '123456789012345'); // Tu Pixel ID
   ```

4. **Buscar** también esta línea (alrededor de la línea 68):
   ```html
   src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
   ```

5. **Reemplazar** `YOUR_PIXEL_ID`:
   ```html
   src="https://www.facebook.com/tr?id=123456789012345&ev=PageView&noscript=1"
   ```

6. **Guardar** el archivo

### Opción 2: Con Variable de Entorno

1. **Crear** una variable de entorno en `frontend/.env`:
   ```env
   REACT_APP_FACEBOOK_PIXEL_ID=123456789012345
   ```

2. **Modificar** `frontend/public/index.html`:
   ```html
   <script>
     const PIXEL_ID = '%REACT_APP_FACEBOOK_PIXEL_ID%' || 'YOUR_PIXEL_ID';
     fbq('init', PIXEL_ID);
   </script>
   ```

---

## 🎯 Paso 3: Eventos Rastreados Automáticamente

Tu tienda ya está configurada para rastrear estos eventos:

### 1. **PageView** (Ver Página)
- **Cuándo**: Cada vez que alguien visita cualquier página
- **Uso**: Contar visitantes totales

### 2. **ViewContent** (Ver Producto)
- **Cuándo**: Cuando alguien ve un producto específico
- **Datos**: ID, nombre, precio, categoría del producto
- **Uso**: Crear audiencias de "Personas que vieron X producto"

### 3. **AddToCart** (Agregar al Carrito)
- **Cuándo**: Cuando alguien agrega un producto al carrito
- **Datos**: ID, nombre, precio, cantidad
- **Uso**: Crear audiencias de "Personas interesadas en comprar"

### 4. **InitiateCheckout** (Iniciar Pago)
- **Cuándo**: Cuando alguien hace clic en "Pagar"
- **Datos**: Productos, total, moneda
- **Uso**: Identificar personas que casi compraron

### 5. **AddPaymentInfo** (Agregar Método de Pago)
- **Cuándo**: Cuando alguien selecciona su método de pago
- **Datos**: Total, moneda
- **Uso**: Personas muy cerca de comprar

### 6. **Purchase** (Compra Completada)
- **Cuándo**: Cuando alguien completa una compra exitosamente
- **Datos**: ID de orden, productos, total, moneda
- **Uso**: Medir conversiones y optimizar ads

---

## ✅ Paso 4: Verificar que Funciona

### Método 1: Facebook Pixel Helper (Recomendado)

1. **Instalar extensión**: https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc
2. **Ir a** https://casepro.es
3. **Click en el ícono** del Pixel Helper en Chrome
4. Debería mostrar:
   ```
   ✅ Pixel activo
   📊 PageView detectado
   ```

### Método 2: Test Events (Facebook)

1. **Ir a** Facebook Business Manager → **Eventos de Datos** → **Pixels**
2. **Click en tu Pixel** → **Test Events**
3. **Abrir** https://casepro.es en otra pestaña
4. Deberías ver eventos apareciendo en tiempo real:
   - `PageView`
   - `ViewContent` (si ves un producto)
   - `AddToCart` (si agregas algo al carrito)

### Método 3: Consola del Navegador

1. **Abrir** https://casepro.es
2. **Presionar** F12 (DevTools)
3. **Ir a** la pestaña "Console"
4. Deberías ver mensajes como:
   ```
   📊 Facebook Pixel: PageView tracked
   📊 Facebook Pixel: ViewContent tracked Funda MagSafe...
   ```

---

## 🎯 Paso 5: Crear Audiencias Personalizadas

Una vez que el Pixel esté rastreando, puedes crear audiencias:

### Audiencia 1: Visitantes del Sitio

1. **Ir a** Business Manager → **Audiencias**
2. **Crear Audiencia** → **Personalizada** → **Sitio Web**
3. **Configurar**:
   - Evento: `PageView`
   - Últimos: `30 días`
   - Nombre: `Visitantes CASEPRO - 30 días`

### Audiencia 2: Personas que Vieron Productos

1. **Crear Audiencia** → **Personalizada** → **Sitio Web**
2. **Configurar**:
   - Evento: `ViewContent`
   - Últimos: `14 días`
   - Nombre: `Vieron Productos - 14 días`

### Audiencia 3: Abandonaron Carrito

1. **Crear Audiencia** → **Personalizada** → **Sitio Web**
2. **Configurar**:
   - Incluir: `AddToCart` (últimos 7 días)
   - Excluir: `Purchase` (últimos 7 días)
   - Nombre: `Carrito Abandonado - 7 días`

### Audiencia 4: Casi Compraron

1. **Crear Audiencia** → **Personalizada** → **Sitio Web**
2. **Configurar**:
   - Incluir: `InitiateCheckout` (últimos 3 días)
   - Excluir: `Purchase` (últimos 3 días)
   - Nombre: `Casi Compraron - 3 días`

### Audiencia 5: Compradores

1. **Crear Audiencia** → **Personalizada** → **Sitio Web**
2. **Configurar**:
   - Evento: `Purchase`
   - Últimos: `180 días`
   - Nombre: `Compradores CASEPRO - 6 meses`

---

## 📱 Paso 6: Crear Campañas con las Audiencias

### Campaña 1: Retargeting a Visitantes

**Objetivo**: Convertir visitantes en compradores

- **Audiencia**: Visitantes CASEPRO - 30 días
- **Excluir**: Compradores (últimos 6 meses)
- **Presupuesto**: S/ 10-15/día
- **Creativos**: Carousel con 5-8 productos top
- **Texto**: "¿Viste algo que te gustó? 🛡️ Protege tu iPhone con CASEPRO. Envío gratis a todo Perú 📦"

### Campaña 2: Retargeting Carrito Abandonado

**Objetivo**: Recuperar ventas perdidas

- **Audiencia**: Carrito Abandonado - 7 días
- **Presupuesto**: S/ 15-20/día
- **Creativos**: Video/imagen del producto + descuento
- **Texto**: "¡Tu carcasa te espera! 💙 Completa tu compra HOY y obtén 10% OFF con código: VUELVE10"
- **Call-to-action**: "Comprar ahora"

### Campaña 3: Upsell a Compradores

**Objetivo**: Vender más a clientes existentes

- **Audiencia**: Compradores - 6 meses
- **Presupuesto**: S/ 10/día
- **Creativos**: Nuevos modelos o accesorios complementarios
- **Texto**: "¡Gracias por confiar en CASEPRO! 🙏 Descubre nuestras nuevas carcasas exclusivas. Cliente VIP: 15% OFF en tu próxima compra 🌟"

---

## 📊 Paso 7: Medir Conversiones

### Crear Columnas Personalizadas

En **Ads Manager**, crea columnas personalizadas para ver:

1. **Costo por Compra** (Purchase)
   - Métrica: Costo / Compras

2. **ROAS** (Return on Ad Spend)
   - Métrica: Valor de compras / Monto gastado

3. **Tasa de Conversión**
   - Métrica: Compras / Clics × 100

### KPIs a Monitorear

- **CTR** (Click-Through Rate): 1-3% es bueno
- **Costo por Clic**: S/ 0.50 - S/ 2.00
- **Costo por Compra**: S/ 15 - S/ 40 (ideal para tu negocio)
- **ROAS**: Mínimo 2.5x (ganar S/ 2.50 por cada S/ 1 invertido)

---

## 🔥 Paso 8: Optimización Avanzada

### Evento Personalizado: Ver Categoría

Si quieres rastrear cuando alguien ve una categoría específica:

```typescript
import { trackCustomEvent } from '../services/facebookPixel';

// En tu componente de categoría
trackCustomEvent('ViewCategory', {
  category_name: 'iPhone 15 Pro Max',
  category_id: '123'
});
```

### Rastrear Búsquedas

Ya está implementado el evento `Search`. Para usarlo:

```typescript
import { trackSearch } from '../services/facebookPixel';

// Cuando el usuario busca
trackSearch('carcasa transparente');
```

### Valor del Cliente (LTV)

Para rastrear el valor de vida del cliente:

```typescript
// En el evento Purchase
trackPurchase({
  orderId: '12345',
  items: [...],
  total: 150,
  currency: 'PEN',
  // Agregar parámetros personalizados
  customData: {
    customer_lifetime_value: 450, // Si es su tercera compra
    purchase_count: 3
  }
});
```

---

## 🎓 Buenas Prácticas

### 1. **Tiempo de Espera**
- El Pixel necesita 50-100 conversiones (compras) para optimizarse
- No hagas cambios drásticos antes de 3-5 días

### 2. **Presupuesto Inicial**
- Empieza con S/ 200-300/semana
- Aumenta gradualmente según resultados

### 3. **Pruebas A/B**
- Prueba 2-3 creativos diferentes
- Mantén el que tenga mejor ROAS

### 4. **Frecuencia de Ads**
- Ideal: 1-3 veces por semana por persona
- Si > 5, estás saturando la audiencia

### 5. **Audiencias Lookalike**
- Una vez tengas 100+ compradores, crea Lookalike 1%
- Facebook encontrará personas similares a tus compradores

---

## 🔧 Troubleshooting

### El Pixel no aparece en Facebook

**Causa**: No has guardado los cambios o el Pixel ID es incorrecto

**Solución**:
1. Verificar que `YOUR_PIXEL_ID` fue reemplazado correctamente
2. Hacer deploy del frontend actualizado
3. Limpiar caché del navegador (Ctrl + Shift + Del)

### Los eventos no se registran

**Causa**: JavaScript bloqueado o error en el código

**Solución**:
1. Abrir consola (F12) y buscar errores
2. Verificar que no hay bloqueadores de ads
3. Probar en modo incógnito

### Los eventos se duplican

**Causa**: El código del Pixel está dos veces

**Solución**:
1. Buscar en `index.html` si hay dos `fbq('init'`
2. Eliminar uno

### No puedo crear audiencias

**Causa**: El Pixel necesita mínimo 100 personas

**Solución**:
- Esperar a tener más tráfico
- O reducir el periodo (ej. 7 días en vez de 30)

---

## 📈 Resultados Esperados

### Primera Semana
- 500-1,000 PageViews
- 50-100 ViewContent
- 10-20 AddToCart
- 5-10 InitiateCheckout
- 2-5 Purchases

### Primer Mes
- 3,000-5,000 PageViews
- 300-500 ViewContent
- 80-120 AddToCart
- 30-50 InitiateCheckout
- 15-30 Purchases

### Con Ads (S/ 300/semana)
- +2,000 PageViews adicionales
- +10-20 Purchases adicionales
- ROAS esperado: 2-4x

---

## 🎯 Próximos Pasos

1. ✅ **Configurar Pixel** → Reemplazar `YOUR_PIXEL_ID`
2. ✅ **Verificar funcionamiento** → Pixel Helper
3. ✅ **Crear audiencias** → Después de 3-5 días
4. ✅ **Lanzar primera campaña** → Retargeting a visitantes
5. ✅ **Optimizar** → Ajustar según ROAS

---

## 📞 Recursos Útiles

- **Facebook Pixel Helper**: https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc
- **Business Manager**: https://business.facebook.com/
- **Documentación Oficial**: https://developers.facebook.com/docs/facebook-pixel
- **Centro de Ayuda**: https://www.facebook.com/business/help/742478679120153

---

## 🔐 Privacidad y GDPR

Si tienes usuarios de Europa:

1. **Agregar banner de cookies** en el sitio
2. **Solo activar Pixel** si el usuario acepta
3. **Política de privacidad** actualizada mencionando Facebook Pixel

Para Perú y Latinoamérica, no es obligatorio pero es buena práctica.

---

**¡Listo! Ahora tienes Facebook Pixel completamente configurado y listo para optimizar tus ventas.** 🚀

**CASEPRO - Protección Profesional**
