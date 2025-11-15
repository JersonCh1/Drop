# 🚂 ACTUALIZAR VARIABLES DE ENTORNO EN RAILWAY

## ⚠️ ACCIÓN REQUERIDA

Ahora que Vercel está desplegado en `https://drop-seven-pi.vercel.app`, necesitas actualizar la variable `FRONTEND_URL` en Railway para que el CORS funcione correctamente.

---

## 📋 PASOS PARA ACTUALIZAR

### 1. Ir a Railway Dashboard

1. Ve a: https://railway.app
2. Login con tu cuenta
3. Selecciona el proyecto del backend
4. Click en el servicio que tiene el backend

### 2. Actualizar Variable FRONTEND_URL

1. Click en la pestaña **Variables**
2. Buscar la variable: `FRONTEND_URL`
3. Cambiar el valor actual a:
   ```
   https://drop-seven-pi.vercel.app
   ```
4. Click en **Save** o presiona Enter

### 3. Railway se Reiniciará Automáticamente

Railway detectará el cambio y reiniciará el servicio automáticamente (toma ~1-2 minutos).

---

## 🔍 VARIABLES DE ENTORNO COMPLETAS EN RAILWAY

Asegúrate que Railway tenga TODAS estas variables configuradas:

### Servidor
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://drop-seven-pi.vercel.app
BACKEND_URL=https://drop-production-cd2b.up.railway.app
```

### Base de Datos
```env
DATABASE_URL=postgresql://postgres:zwfHcUfTAZoQMZNbvuSDJiBFWYzesYkk@shinkansen.proxy.rlwy.net:47497/railway
```

### JWT
```env
JWT_SECRET=dropshipping-super-secret-key-2024
```

### Izipay (BCP - PRODUCCIÓN)
```env
IZIPAY_USERNAME=81996279
IZIPAY_PASSWORD=prodpassword_alktHLRsDMrIJ4HojBlwhe0cxOxidi1mSjn2gqogCBGcd
IZIPAY_PUBLIC_KEY=81996279:publickey_oy0QZCy4XxB4CmV2zO3W9t79i7flvrikXOPHhDf5yqWlC
IZIPAY_HMACSHA256=8pV9oAPoL3JjU0uD6qeVGUlW4qXfSqLepGoeulLw1m6xt
IZIPAY_API_URL=https://api.micuentaweb.pe/api-payment
```

### CJ Dropshipping
```env
CJ_EMAIL=echurapacci@gmail.com
CJ_API_KEY=9a5b7fe7079a4d699c81f6b818ae2405
CJ_API_URL=https://developers.cjdropshipping.com/api2.0/v1
```

### WhatsApp
```env
WHATSAPP_NUMBER=51987654321
```

### Cloudinary (Opcional - Si ya lo configuraste)
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---

## ✅ VERIFICAR QUE FUNCIONE

Después de que Railway se reinicie:

1. **Health Check:**
   ```bash
   curl https://drop-production-cd2b.up.railway.app/health
   ```
   Debe retornar: `{"status":"OK",...}`

2. **Test CORS desde Vercel:**
   - Abre https://drop-seven-pi.vercel.app
   - Abre DevTools (F12) → Console
   - Ejecuta:
     ```javascript
     fetch('https://drop-production-cd2b.up.railway.app/api/products')
       .then(r => r.json())
       .then(d => console.log('✅ Productos:', d))
       .catch(e => console.error('❌ Error:', e))
     ```
   - Debe mostrar los productos sin errores de CORS

---

## 🎯 SIGUIENTE PASO

Una vez configurado Railway y Vercel:
👉 **Importar productos de carcasas iPhone desde el panel admin**

1. Ve a: https://drop-seven-pi.vercel.app/admin
2. Login: `admin` / `admin123`
3. Productos → Importar desde CJ
4. Buscar: `iphone 15 case`, `iphone 14 case`, etc.

---

**Última actualización:** 2025-11-14
