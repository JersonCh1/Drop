# 🧪 TEST DE PRODUCCIÓN

## ✅ Checklist de Verificación

Usa este checklist después de completar el deployment para verificar que todo funcione correctamente.

---

## 1️⃣ VERIFICAR BACKEND (Railway)

### Health Check
```bash
curl https://drop-production-cd2b.up.railway.app/health
```

**Esperado:**
```json
{
  "status": "OK",
  "service": "dropshipping-backend",
  "version": "2.0.0",
  "timestamp": "...",
  "uptime": ...,
  "environment": "production"
}
```

### Test de Productos
```bash
curl https://drop-production-cd2b.up.railway.app/api/products
```

**Esperado:**
```json
{
  "success": true,
  "data": [...productos...],
  "pagination": {...}
}
```

---

## 2️⃣ VERIFICAR FRONTEND (Vercel)

### A. Cargar la Página

1. Abre: https://drop-seven-pi.vercel.app
2. **Verificar:**
   - ✅ Título: "iPhone Cases Store - Carcasas de Alta Calidad"
   - ✅ No hay errores en consola (F12)
   - ✅ Productos se muestran (aunque sean solo 2 de prueba)

### B. Test de Consola del Navegador

Abre DevTools (F12) → Console → Ejecuta:

```javascript
// Test 1: Verificar variables de entorno
console.log('API URL:', process.env.REACT_APP_API_URL || 'No definida');
console.log('Izipay Key:', process.env.REACT_APP_IZIPAY_PUBLIC_KEY || 'No definida');

// Test 2: Fetch productos
fetch('https://drop-production-cd2b.up.railway.app/api/products')
  .then(r => r.json())
  .then(d => console.log('✅ Productos:', d.data?.length, 'productos cargados'))
  .catch(e => console.error('❌ Error:', e.message));

// Test 3: Verificar Izipay SDK
console.log('Izipay KR:', typeof KR !== 'undefined' ? '✅ Cargado' : '❌ No cargado');
```

**Esperado:**
```
API URL: https://drop-production-cd2b.up.railway.app/api
Izipay Key: 81996279:publickey_oy0QZCy4XxB4CmV2zO3W9t79i7flvrikXOPHhDf5yqWlC
✅ Productos: 2 productos cargados
Izipay KR: ✅ Cargado
```

---

## 3️⃣ VERIFICAR FLUJO DE COMPRA

### A. Agregar al Carrito

1. Click en un producto
2. Seleccionar variante (si tiene)
3. Click en "Agregar al carrito"
4. **Verificar:**
   - ✅ Icono del carrito muestra cantidad
   - ✅ Notification toast aparece

### B. Ir al Carrito

1. Click en el icono del carrito
2. **Verificar:**
   - ✅ Producto aparece en el carrito
   - ✅ Precio correcto
   - ✅ Botón "Proceder al pago" visible

### C. Checkout con Izipay

1. Click en "Proceder al pago"
2. Llenar formulario de envío
3. Click en "Continuar a pago"
4. **Verificar:**
   - ✅ Formulario de Izipay aparece
   - ✅ Se ven opciones: Tarjeta / Yape / Plin
   - ✅ No hay errores en consola

**⚠️ NO COMPLETAR EL PAGO** (a menos que quieras hacer una compra real)

---

## 4️⃣ VERIFICAR ADMIN PANEL

### A. Login

1. Ve a: https://drop-seven-pi.vercel.app/admin
2. Login:
   - Usuario: `admin`
   - Contraseña: `admin123`
3. **Verificar:**
   - ✅ Dashboard carga
   - ✅ Estadísticas aparecen

### B. Productos

1. Click en "Productos"
2. **Verificar:**
   - ✅ Lista de productos aparece
   - ✅ Botón "Importar desde CJ" visible

### C. Test de Importación CJ

1. Click en "Importar desde CJ"
2. Buscar: `iphone case`
3. **Verificar:**
   - ✅ Resultados aparecen (si no hay error de rate limit)
   - ✅ Botón "Importar" funcional

**Nota:** Si sale "Too Many Requests", es normal. Espera 5 minutos.

---

## 5️⃣ VERIFICAR CORS

### Test desde Consola

En https://drop-seven-pi.vercel.app, abre consola (F12) y ejecuta:

```javascript
fetch('https://drop-production-cd2b.up.railway.app/api/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(r => {
  console.log('✅ CORS Status:', r.status);
  return r.json();
})
.then(d => console.log('✅ Data:', d))
.catch(e => console.error('❌ CORS Error:', e));
```

**Esperado:**
```
✅ CORS Status: 200
✅ Data: { success: true, data: [...] }
```

**Si hay error:**
- Verificar que `FRONTEND_URL` en Railway sea: `https://drop-seven-pi.vercel.app`

---

## 6️⃣ VERIFICAR WHATSAPP WIDGET

1. En la página principal
2. **Verificar:**
   - ✅ Botón flotante de WhatsApp en esquina inferior derecha
   - ✅ Al hacer click, abre WhatsApp con el número: `51917780708`

---

## 7️⃣ VERIFICAR RESPONSIVE

### Mobile

1. Abre DevTools (F12)
2. Click en icono de móvil (Toggle Device Toolbar)
3. Selecciona iPhone 12 Pro
4. **Verificar:**
   - ✅ Layout se adapta
   - ✅ Menú hamburguesa funciona
   - ✅ Productos se ven bien

---

## 🐛 TROUBLESHOOTING

### Error: "Failed to fetch" en consola

**Causa:** CORS bloqueado o backend caído

**Solución:**
1. Verificar que Railway esté corriendo: https://drop-production-cd2b.up.railway.app/health
2. Verificar `FRONTEND_URL` en Railway: `https://drop-seven-pi.vercel.app`

### Izipay no aparece

**Causa:** Variable `REACT_APP_IZIPAY_PUBLIC_KEY` no configurada

**Solución:**
1. Verificar en Vercel > Variables
2. Redeploy si es necesario

### Productos no cargan

**Causa:** `REACT_APP_API_URL` incorrecta o backend caído

**Solución:**
1. Verificar variable en Vercel
2. Test backend: `curl https://drop-production-cd2b.up.railway.app/health`

### Error "Too Many Requests" en CJ

**Causa:** Rate limit de CJ (1 token cada 5 minutos)

**Solución:**
- Esperar 5 minutos entre búsquedas
- El token se cachea automáticamente

---

## ✅ CHECKLIST FINAL

- [ ] Backend health check pasa
- [ ] Frontend carga sin errores
- [ ] Productos se muestran
- [ ] Carrito funciona
- [ ] Checkout muestra Izipay
- [ ] Admin panel accesible
- [ ] Dashboard muestra stats
- [ ] WhatsApp widget funciona
- [ ] No hay errores CORS
- [ ] Responsive funciona

---

**Si todos los checks pasan: ¡Tu tienda está 100% funcional! 🎉**

Última actualización: 2025-11-14
