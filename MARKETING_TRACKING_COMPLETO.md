# 🎯 Sistema de Tracking de Marketing - COMPLETO

## ✅ ¿Qué se ha implementado?

Tu tienda **CASEPRO** ahora tiene un sistema completo de tracking para marketing digital:

### 1. **Facebook Pixel** ✅
- Código base instalado en `frontend/public/index.html`
- Servicio de tracking en `frontend/src/services/facebookPixel.ts`
- Eventos automáticos integrados en toda la app

### 2. **Google Tag Manager** ✅
- Código base instalado en `frontend/public/index.html`
- ID temporal: `GTM-CASEPRO` (debes cambiarlo por tu ID real)

### 3. **Google Analytics 4** ✅
- Ya estaba configurado
- ID: `G-2SDNCXM179`

---

## 📊 Eventos Rastreados Automáticamente

### Frontend → Facebook Pixel

| Evento | Dónde se dispara | Qué rastrea |
|--------|------------------|-------------|
| **PageView** | Todas las páginas | Visitantes totales |
| **ViewContent** | ProductDetailPage | Usuario vio un producto |
| **AddToCart** | CartContext | Usuario agregó al carrito |
| **InitiateCheckout** | Checkout (abrir) | Usuario fue a pagar |
| **AddPaymentInfo** | Checkout (método de pago) | Usuario seleccionó pago |
| **Purchase** | Pago exitoso | Compra completada ✅ |

---

## 🚀 Pasos para Activar Todo (5-10 minutos)

### Paso 1: Obtener tu Facebook Pixel ID

1. **Ir a**: https://business.facebook.com/
2. **Crear** cuenta Business Manager (si no tienes)
3. **Ir a** Eventos de Datos → Pixels
4. **Crear Pixel** → Copiar el ID (15 dígitos, ej: `123456789012345`)

### Paso 2: Reemplazar Pixel ID en el código

**Abrir**: `frontend/public/index.html`

**Buscar** (línea ~64):
```javascript
fbq('init', 'YOUR_PIXEL_ID'); // Reemplaza con tu Pixel ID
```

**Reemplazar** con:
```javascript
fbq('init', '123456789012345'); // Tu Pixel ID real
```

**Buscar** también (línea ~68):
```html
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
```

**Reemplazar** con:
```html
src="https://www.facebook.com/tr?id=123456789012345&ev=PageView&noscript=1"
```

### Paso 3: (Opcional) Obtener tu Google Tag Manager ID

1. **Ir a**: https://tagmanager.google.com/
2. **Crear** cuenta (si no tienes)
3. **Crear contenedor** → Web
4. **Copiar** el ID (ej: `GTM-ABC123`)

**Buscar en** `frontend/public/index.html` (línea ~42):
```javascript
})(window,document,'script','dataLayer','GTM-CASEPRO');</script>
```

**Reemplazar** `GTM-CASEPRO` con tu ID real:
```javascript
})(window,document,'script','dataLayer','GTM-ABC123');</script>
```

**Buscar** también (línea ~115):
```html
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-CASEPRO"
```

**Reemplazar** con:
```html
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-ABC123"
```

### Paso 4: Deploy de los cambios

```bash
cd frontend
npm run build
git add .
git commit -m "feat: Configurar Facebook Pixel y Google Tag Manager"
git push
```

Vercel/Railway desplegará automáticamente (5-10 min).

### Paso 5: Verificar que funciona

**Opción 1 - Facebook Pixel Helper** (Recomendada):
1. Instalar extensión: https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc
2. Ir a https://casepro.es
3. Click en el ícono → Debe mostrar ✅ Pixel activo

**Opción 2 - Consola del navegador**:
1. Ir a https://casepro.es
2. Presionar F12 → Consola
3. Deberías ver: `📊 Facebook Pixel: PageView tracked`

**Opción 3 - Facebook Test Events**:
1. Ir a Business Manager → Eventos de Datos → Tu Pixel
2. Click en "Test Events"
3. Abrir https://casepro.es en otra pestaña
4. Ver eventos en tiempo real

---

## 📈 Cómo Usar los Datos

### 1. Crear Audiencias en Facebook

Una vez tengas tráfico (50-100 visitantes), crear audiencias:

#### Audiencia: Carrito Abandonado
```
Incluir: AddToCart (últimos 7 días)
Excluir: Purchase (últimos 7 días)
Nombre: "Carrito Abandonado - 7 días"
```

**Usar para**: Retargeting con descuento 10% OFF

#### Audiencia: Visitantes sin compra
```
Incluir: PageView (últimos 30 días)
Excluir: Purchase (últimos 30 días)
Nombre: "Visitantes sin compra - 30 días"
```

**Usar para**: Ads mostrando productos más populares

#### Audiencia: Compradores
```
Incluir: Purchase (últimos 180 días)
Nombre: "Compradores CASEPRO - 6 meses"
```

**Usar para**: Upsell (venderles más productos)

### 2. Medir ROI de tus Ads

En Facebook Ads Manager:

**Crear columna personalizada** → ROAS:
```
Valor de compras / Monto gastado
```

**Meta**: ROAS > 2.5x (ganar S/ 2.50 por cada S/ 1 invertido)

**Ejemplo**:
- Gastas: S/ 100 en ads
- Ventas generadas: S/ 300
- ROAS: 3x ✅ (¡Buen resultado!)

### 3. Optimizar Campañas

**Si ROAS < 2.0**:
- ❌ Pausar ads que no funcionan
- ✅ Aumentar presupuesto en ads que sí funcionan
- 🎨 Probar nuevos creativos (imágenes/videos)

**Si ROAS > 3.0**:
- 🚀 Aumentar presupuesto gradualmente
- 📊 Crear Lookalike Audience (Facebook encuentra personas similares)

---

## 🎯 Campañas Recomendadas

### Campaña 1: Retargeting - Carrito Abandonado

**Audiencia**: Carrito Abandonado - 7 días
**Presupuesto**: S/ 15/día
**Objetivo**: Conversiones → Compras
**Creativos**: Carousel con productos que dejaron
**Texto**:
```
¡Tu carcasa te espera! 💙

Completa tu compra HOY y obtén 10% OFF
Código: VUELVE10

Envío gratis a todo Perú 📦
```

**Resultado esperado**: ROAS 3-5x

### Campaña 2: Prospección - Lookalike

**Audiencia**: Lookalike 1% de Compradores
**Presupuesto**: S/ 20/día
**Objetivo**: Conversiones → Compras
**Creativos**: Video corto (15 seg) mostrando carcasas
**Texto**:
```
🛡️ Protección Profesional para tu iPhone

✅ Carcasas Premium
✅ Envío GRATIS
✅ Garantía de satisfacción

¡Protege tu inversión HOY! 👇
```

**Resultado esperado**: ROAS 2-3x

### Campaña 3: Upsell - Compradores

**Audiencia**: Compradores - 6 meses
**Presupuesto**: S/ 10/día
**Objetivo**: Conversiones → Compras
**Creativos**: Nuevos modelos o colores
**Texto**:
```
¡Gracias por confiar en CASEPRO! 🙏

¿Cambiaste de iPhone? Descubre nuestras
nuevas carcasas para iPhone 15/16

Cliente VIP: 15% OFF
Código: VIP15
```

**Resultado esperado**: ROAS 4-6x (clientes recurrentes)

---

## 📊 Dashboard de Métricas

### Métricas Diarias (Facebook Ads Manager)

| Métrica | Bueno | Excelente |
|---------|-------|-----------|
| CTR (Click-Through Rate) | 1-2% | 3%+ |
| Costo por clic | S/ 1-2 | S/ 0.50-1 |
| Costo por compra | S/ 20-40 | S/ 10-20 |
| ROAS | 2-3x | 4x+ |
| Tasa de conversión | 1-2% | 3%+ |

### Ejemplo de resultados

**Campaña**: Carrito Abandonado
**Presupuesto**: S/ 100
**Alcance**: 5,000 personas
**Clics**: 150 (CTR: 3%)
**Compras**: 8
**Ingresos**: S/ 320
**ROAS**: 3.2x ✅

---

## 🔥 Trucos Avanzados

### 1. Dynamic Product Ads (DPA)

Una vez tengas el Pixel funcionando bien (100+ eventos):

1. **Crear catálogo** en Facebook
2. **Importar productos** desde tu API
3. **Crear campaña DPA** → Muestra automáticamente el producto exacto que vio cada persona

**Resultado**: ROAS 5-10x (¡muy efectivo!)

### 2. Secuencia de Retargeting

**Día 1**: Usuario ve producto → No compra
**Día 2**: Mostrar ad recordándole el producto
**Día 3**: Si no compró, ofrecer 5% OFF
**Día 5**: Si no compró, ofrecer 10% OFF
**Día 7**: Último ad con 15% OFF

### 3. Exclusiones Inteligentes

**SIEMPRE excluir compradores** de campaigns de prospección:
```
Nueva campaña
↓
Incluir: Todos (o Lookalike)
Excluir: Compradores - 180 días
```

**¿Por qué?** No gastes mostrando ads a quienes ya compraron

---

## 📚 Documentación Completa

Revisa estos archivos para más detalles:

1. **`FACEBOOK_PIXEL_SETUP.md`** → Guía completa de Facebook Pixel
2. **`GOOGLE_TAG_MANAGER_SETUP.md`** → Guía completa de GTM
3. **`BRANDING_Y_MARKETING.md`** → Estrategia de marketing general
4. **`PLAN_DE_ACCION_HOY.md`** → Checklist para empezar

---

## ✅ Checklist Final

### Configuración Técnica
- [ ] Reemplazar `YOUR_PIXEL_ID` en `index.html`
- [ ] (Opcional) Reemplazar `GTM-CASEPRO` en `index.html`
- [ ] Hacer commit y push
- [ ] Esperar deploy (5-10 min)
- [ ] Verificar con Facebook Pixel Helper

### Configuración en Facebook
- [ ] Crear cuenta Business Manager
- [ ] Crear Facebook Pixel
- [ ] Verificar que eventos se están recibiendo (Test Events)
- [ ] Esperar 2-3 días para tener datos
- [ ] Crear primeras audiencias (Visitantes, Carrito Abandonado)

### Primera Campaña
- [ ] Preparar 3-5 creativos (imágenes/videos)
- [ ] Crear campaña de Retargeting a Visitantes
- [ ] Presupuesto inicial: S/ 10-15/día
- [ ] Monitorear ROAS diariamente
- [ ] Ajustar según resultados

---

## 🎓 Próximos Pasos

### Esta Semana
1. ✅ Configurar Facebook Pixel
2. ✅ Crear cuenta Business Manager
3. ✅ Verificar que eventos funcionan
4. ✅ Esperar tener 50-100 visitantes

### Próxima Semana
5. ✅ Crear primeras audiencias
6. ✅ Preparar creativos para ads
7. ✅ Lanzar primera campaña (S/ 10/día)

### Mes 1
8. ✅ Optimizar campañas según ROAS
9. ✅ Escalar las que funcionan
10. ✅ Crear Lookalike Audiences

---

## 💰 Inversión Esperada vs Resultados

### Mes 1 - Testing
- **Inversión en ads**: S/ 300-500
- **Ventas esperadas**: S/ 750-1,500
- **ROAS esperado**: 2.5-3x
- **Ganancia neta**: S/ 200-500

### Mes 2 - Optimización
- **Inversión en ads**: S/ 800-1,000
- **Ventas esperadas**: S/ 2,400-4,000
- **ROAS esperado**: 3-4x
- **Ganancia neta**: S/ 800-1,500

### Mes 3 - Escalado
- **Inversión en ads**: S/ 1,500-2,000
- **Ventas esperadas**: S/ 6,000-10,000
- **ROAS esperado**: 4-5x
- **Ganancia neta**: S/ 2,500-4,500

---

## 🆘 Soporte

### Si algo no funciona:

1. **Revisar consola del navegador** (F12) para errores
2. **Verificar IDs** en `index.html` (Pixel ID, GTM ID)
3. **Limpiar caché** del navegador (Ctrl + Shift + Del)
4. **Usar modo incógnito** para probar
5. **Revisar** Facebook Pixel Helper

### Recursos útiles:

- **Facebook Pixel Helper**: https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc
- **Facebook Business Help**: https://www.facebook.com/business/help
- **GTM Documentation**: https://support.google.com/tagmanager

---

## 🎉 ¡Felicitaciones!

Tu tienda ahora tiene un sistema de tracking profesional que te permitirá:

✅ Medir el ROI de cada centavo invertido en ads
✅ Crear audiencias personalizadas para retargeting
✅ Optimizar campañas basándote en datos reales
✅ Escalar tus ventas de forma predecible

**¡Es hora de vender! 💰**

---

**CASEPRO - Protección Profesional**
*Última actualización: 2025*
