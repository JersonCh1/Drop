# 🏷️ Google Tag Manager - Guía de Configuración

## ¿Qué es Google Tag Manager (GTM)?

**Google Tag Manager** es un sistema de gestión de etiquetas que te permite:

1. **Agregar/modificar scripts** sin tocar código
2. **Gestionar múltiples pixels** desde un solo lugar (Facebook, TikTok, Google Ads)
3. **Testing A/B** más fácil
4. **Rastrear eventos personalizados** sin programar
5. **Versiones y rollback** si algo falla

---

## 🚀 Beneficios de GTM

### Sin GTM (Actual)
```
Quieres agregar TikTok Pixel
↓
Editar index.html
↓
Hacer commit y push
↓
Esperar deploy (5-10 min)
↓
Si hay error, repetir todo
```

### Con GTM
```
Quieres agregar TikTok Pixel
↓
Ir a GTM web
↓
Agregar tag (2 min)
↓
Publicar (instantáneo)
↓
Si hay error, revertir (1 click)
```

---

## 📋 Paso 1: Crear Cuenta de Google Tag Manager

### 1. Ir a Google Tag Manager

1. **Ir a**: https://tagmanager.google.com/
2. **Iniciar sesión** con tu cuenta de Google
3. Click en **"Crear cuenta"**

### 2. Configurar Cuenta

**Nombre de la cuenta**: `CASEPRO`
**País**: `Perú`

### 3. Configurar Contenedor

**Nombre del contenedor**: `casepro.es`
**Plataforma**: `Web`

### 4. Copiar el Código

Después de crear, te mostrará dos códigos:

**Código 1 (en el `<head>`)**:
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
```

**Código 2 (después del `<body>`)**:
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

**Nota**: `GTM-XXXXXX` será tu ID único (ej: `GTM-ABC123`)

---

## 🔧 Paso 2: Instalar GTM en tu Sitio

### Tu sitio YA TIENE GTM instalado con ID temporal

Abre `frontend/public/index.html` y busca estas líneas:

**Línea ~37-42** (en el `<head>`):
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-CASEPRO');</script>
<!-- End Google Tag Manager -->
```

**Línea ~114-117** (después del `<body>`):
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-CASEPRO"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### Reemplazar el ID temporal

1. **Reemplazar** `GTM-CASEPRO` con tu ID real (ej: `GTM-ABC123`)
2. **Buscar y reemplazar** en ambos lugares (hay 2 ocurrencias)
3. **Guardar** el archivo

---

## ✅ Paso 3: Verificar que Funciona

### Método 1: Vista Previa de GTM

1. **Ir a** https://tagmanager.google.com/
2. **Seleccionar tu contenedor** (casepro.es)
3. Click en **"Vista previa"** (arriba a la derecha)
4. **Ingresar** la URL: `https://casepro.es`
5. Click en **"Connect"**

Deberías ver:
- ✅ Tag Manager Connected
- 📊 Tags disparados

### Método 2: Extensión de Chrome

1. **Instalar**: [Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. **Ir a** https://casepro.es
3. **Click** en el ícono de Tag Assistant
4. Debería mostrar:
   ```
   ✅ Google Tag Manager detectado
   ID: GTM-XXXXXX
   ```

### Método 3: Consola del Navegador

1. **Ir a** https://casepro.es
2. **Presionar** F12 → Consola
3. **Escribir**: `dataLayer`
4. Debería mostrar un array con eventos

---

## 🎯 Paso 4: Configurar Tags Principales

### Tag 1: Facebook Pixel (Migrar)

Como ya tienes Facebook Pixel en el HTML, puedes moverlo a GTM:

1. **En GTM** → **Tags** → **Nuevo**
2. **Nombre**: `Facebook Pixel - Base`
3. **Tipo de etiqueta**: `HTML personalizado`
4. **HTML**:
   ```html
   <script>
     !function(f,b,e,v,n,t,s)
     {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
     n.callMethod.apply(n,arguments):n.queue.push(arguments)};
     if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
     n.queue=[];t=b.createElement(e);t.async=!0;
     t.src=v;s=b.getElementsByTagName(e)[0];
     s.parentNode.insertBefore(t,s)}(window, document,'script',
     'https://connect.facebook.net/en_US/fbevents.js');
     fbq('init', 'TU_PIXEL_ID');
     fbq('track', 'PageView');
   </script>
   ```
5. **Activador**: `All Pages`
6. **Guardar**

### Tag 2: Google Analytics 4 (Ya está en HTML)

Puedes dejarlo en HTML o moverlo a GTM:

1. **En GTM** → **Tags** → **Nuevo**
2. **Nombre**: `GA4 - Configuración`
3. **Tipo de etiqueta**: `Google Analytics: GA4 Configuration`
4. **ID de medición**: `G-2SDNCXM179`
5. **Activador**: `All Pages`
6. **Guardar**

### Tag 3: TikTok Pixel (Nuevo)

Si quieres agregar TikTok Pixel:

1. **En GTM** → **Tags** → **Nuevo**
2. **Nombre**: `TikTok Pixel - Base`
3. **Tipo de etiqueta**: `HTML personalizado`
4. **HTML**:
   ```html
   <script>
     !function (w, d, t) {
       w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
       ttq.load('TU_TIKTOK_PIXEL_ID');
       ttq.page();
     }(window, document, 'ttq');
   </script>
   ```
5. **Activador**: `All Pages`
6. **Guardar**

---

## 🎨 Paso 5: Configurar Eventos Personalizados

### Evento 1: Compra Completada (Purchase)

1. **En GTM** → **Activadores** → **Nuevo**
2. **Nombre**: `Purchase Event`
3. **Tipo**: `Evento personalizado`
4. **Nombre del evento**: `purchase`
5. **Guardar**

Luego crear el Tag:

1. **En GTM** → **Tags** → **Nuevo**
2. **Nombre**: `Facebook Pixel - Purchase`
3. **Tipo**: `HTML personalizado`
4. **HTML**:
   ```html
   <script>
     fbq('track', 'Purchase', {
       value: {{DLV - Purchase Value}},
       currency: {{DLV - Currency}}
     });
   </script>
   ```
5. **Activador**: `Purchase Event`
6. **Guardar**

### Variables del Data Layer

Para que funcionen los eventos, necesitas crear variables:

1. **En GTM** → **Variables** → **Nueva**
2. **Nombre**: `DLV - Purchase Value`
3. **Tipo**: `Variable de capa de datos`
4. **Nombre de variable**: `purchaseValue`
5. **Guardar**

Repetir para:
- `DLV - Currency` → `currency`
- `DLV - Order ID` → `orderId`

---

## 📊 Paso 6: Publicar Cambios

1. **En GTM** → Click en **"Enviar"** (arriba a la derecha)
2. **Nombre de versión**: `v1.0 - Setup inicial`
3. **Descripción**: `Facebook Pixel + GA4 + TikTok Pixel`
4. Click en **"Publicar"**

✅ ¡Los cambios están LIVE inmediatamente!

---

## 🔥 Paso 7: Casos de Uso Avanzados

### 1. Rastrear Scroll al 50%

**Activador**:
- Tipo: `Profundidad de desplazamiento`
- Porcentajes de scroll vertical: `50`

**Tag**:
- Tipo: `Google Analytics: GA4 Event`
- Nombre del evento: `scroll_50`

### 2. Rastrear Clics en WhatsApp

**Activador**:
- Tipo: `Clic - Todos los elementos`
- Condición: `Click URL contains whatsapp`

**Tag**:
- Tipo: `Google Analytics: GA4 Event`
- Nombre del evento: `whatsapp_click`

### 3. Rastrear Tiempo en Página

**Activador**:
- Tipo: `Temporizador`
- Intervalo: `30000` (30 segundos)

**Tag**:
- Tipo: `Google Analytics: GA4 Event`
- Nombre del evento: `time_on_page_30s`

---

## 🎯 Mejores Prácticas

### 1. **Usa Carpetas**
Organiza tus tags en carpetas:
- 📁 Analytics (GA4, Hotjar)
- 📁 Marketing (Facebook, TikTok, Google Ads)
- 📁 Custom Events

### 2. **Nombra Consistentemente**
```
[Tipo] - [Plataforma] - [Evento]

Ejemplos:
✅ Tag - Facebook - Purchase
✅ Trigger - Scroll - 50%
✅ Variable - DLV - Order Value
```

### 3. **Usa Vista Previa**
Antes de publicar, SIEMPRE usa Vista Previa para probar

### 4. **Documenta Versiones**
Al publicar, escribe qué cambios hiciste:
```
v1.0 - Setup inicial
v1.1 - Agregado TikTok Pixel
v1.2 - Fix en evento Purchase
```

### 5. **No Elimines, Pausa**
Si un tag no funciona, no lo elimines, solo pausalo

---

## 🔧 Troubleshooting

### GTM no aparece en Tag Assistant

**Causa**: ID incorrecto o código mal copiado

**Solución**:
1. Verificar `GTM-XXXXXX` en `index.html`
2. Limpiar caché (Ctrl + Shift + Del)
3. Verificar que el código esté en `<head>` y `<body>`

### Los eventos no se disparan

**Causa**: Activador mal configurado

**Solución**:
1. Usar Vista Previa de GTM
2. Verificar que el evento se dispara en el dataLayer
3. Revisar condiciones del activador

### Pixel duplicado

**Causa**: Pixel está en HTML Y en GTM

**Solución**:
- Decidir: ¿HTML o GTM?
- Si GTM, eliminar de HTML
- Si HTML, eliminar de GTM

---

## 📈 Resultados Esperados

### Ventajas Inmediatas
- ⚡ Cambios instantáneos (sin deploy)
- 🔄 Rollback en 1 click si algo falla
- 📊 Vista centralizada de todos los scripts

### Largo Plazo
- 🎯 Agregar/quitar pixels sin programar
- 🧪 Testing A/B más fácil
- 📈 Mejor organización de analytics

---

## 🎓 Próximos Pasos

1. ✅ Crear cuenta GTM
2. ✅ Reemplazar `GTM-CASEPRO` con tu ID real
3. ✅ Verificar con Vista Previa
4. ✅ (Opcional) Migrar Facebook Pixel a GTM
5. ✅ Agregar TikTok Pixel si planeas ads en TikTok

---

## 📞 Recursos Útiles

- **Google Tag Manager**: https://tagmanager.google.com/
- **Documentación**: https://support.google.com/tagmanager
- **Tag Assistant**: https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk
- **Cursos gratis**: https://analytics.google.com/analytics/academy/

---

**¡Listo! Ahora tienes Google Tag Manager configurado y listo para gestionar todos tus pixels desde un solo lugar.** 🚀

**CASEPRO - Protección Profesional**
