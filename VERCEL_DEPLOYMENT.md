# 🚀 GUÍA DE DEPLOYMENT EN VERCEL

## 📋 Configuración del Frontend en Vercel

### 1. Importar Proyecto
- Ve a: https://vercel.com/new
- Selecciona el repositorio: `JersonCh1/Drop`
- Branch: `main`

### 2. Configuración del Build

**Root Directory:**
```
frontend
```

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
build
```

**Install Command:**
```bash
npm install
```

### 3. Variables de Entorno

Agregar estas variables en Vercel Dashboard > Settings > Environment Variables:

```bash
# Backend API URL (Railway)
REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api

# WhatsApp
REACT_APP_WHATSAPP_NUMBER=51917780708

# Izipay - BCP (MODO PRODUCCIÓN)
REACT_APP_IZIPAY_PUBLIC_KEY=81996279:publickey_oy0QZCy4XxB4CmV2zO3W9t79i7flvrikXOPHhDf5yqWlC

# App Info
REACT_APP_APP_NAME=iPhone Cases Store
REACT_APP_VERSION=2.0.0
```

### 4. Configuración Avanzada

En **Settings > General**:
- Node Version: `18.x` o `20.x`
- Framework Preset: `Create React App`

### 5. Deploy

1. Hacer push a main:
```bash
git add .
git commit -m "feat: Configurar deployment producción"
git push origin main
```

2. Vercel detectará el cambio y deployará automáticamente

### 6. Verificar Deployment

- URL Frontend: `https://[tu-proyecto].vercel.app`
- Verificar que cargue la tienda de carcasas iPhone
- Verificar que los productos se carguen desde Railway
- Verificar que el checkout de Izipay funcione

## ⚠️ IMPORTANTE

### Credenciales de Izipay en index.html

El archivo `frontend/public/index.html` tiene hardcodeado el public key:
```html
<script src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
        kr-public-key="81996279:publickey_oy0QZCy4XxB4CmV2zO3W9t79i7flvrikXOPHhDf5yqWlC"
        kr-post-url-success="/"
        kr-post-url-refused="/">
</script>
```

Esto está correcto y es el modo **PRODUCCIÓN**.

### CORS en Backend

Asegúrate que Railway tenga la URL de Vercel en la whitelist de CORS:
```javascript
// En backend/src/server.js
const allowedOrigins = [
  'https://[tu-proyecto].vercel.app',
  'https://drop-production-cd2b.up.railway.app'
];
```

## 🔍 Troubleshooting

### Error: "Failed to fetch products"
- Verificar que `REACT_APP_API_URL` apunte a Railway
- Verificar CORS en backend

### Error: "Izipay form not loading"
- Verificar que el public key sea de PRODUCCIÓN
- Verificar en consola del navegador si hay errores

### Build falla en Vercel
- Verificar que no haya errores TypeScript
- Revisar los logs de Vercel
- Verificar que todas las dependencias estén en package.json

## 📞 URLs Finales

- **Frontend:** `https://[tu-proyecto].vercel.app`
- **Backend:** `https://drop-production-cd2b.up.railway.app`
- **Admin:** `https://[tu-proyecto].vercel.app/admin`
- **API Docs:** `https://drop-production-cd2b.up.railway.app/health`
