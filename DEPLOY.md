# 🚀 Guía de Deployment - Dropshipping Store

## 📋 Tabla de Contenidos
1. [Preparación Pre-Deploy](#preparación-pre-deploy)
2. [Deploy Backend (Railway)](#deploy-backend-railway)
3. [Deploy Frontend (Vercel)](#deploy-frontend-vercel)
4. [Configurar Pasarelas de Pago](#configurar-pasarelas-de-pago)
5. [Testing y Verificación](#testing-y-verificación)

---

## ✅ Preparación Pre-Deploy

### 1. Verificar cambios locales

Tu proyecto ya está configurado para producción con:
- ✅ PostgreSQL en schema.prisma
- ✅ CORS configurado para producción
- ✅ MercadoPago integrado
- ✅ Yape/Plin implementado
- ✅ Variables de entorno documentadas

### 2. Actualizar .env local para PostgreSQL

**Backend (.env):**
```env
# Temporal para desarrollo - Railway te dará una real
DATABASE_URL="postgresql://user:password@localhost:5432/dropshipping"
PORT=3001
NODE_ENV=development
JWT_SECRET=tu-clave-secreta-cambiala
FRONTEND_URL=http://localhost:3000
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-token
WHATSAPP_NUMBER=51987654321
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3001/api
```

---

## 🚂 Deploy Backend (Railway)

### Paso 1: Crear cuenta y proyecto

1. Ve a: https://railway.app
2. Sign up con GitHub
3. Click en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Autoriza Railway en GitHub
6. Selecciona tu repositorio: `dropshipping-iphone`

### Paso 2: Railway detecta automáticamente

Railway detectará:
- ✅ Node.js (package.json)
- ✅ Prisma (schema.prisma)
- ✅ Build command: `npm install`
- ✅ Start command: `npm start`

### Paso 3: Agregar PostgreSQL

1. En tu proyecto Railway, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway automáticamente:
   - Crea la base de datos
   - Genera el `DATABASE_URL`
   - Lo conecta a tu servicio

### Paso 4: Configurar variables de entorno

En Railway, ve a tu servicio → **"Variables"** → Agregar:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=genera-uno-seguro-aqui-32-caracteres-minimo
FRONTEND_URL=https://tu-proyecto.vercel.app
BACKEND_URL=https://tu-proyecto.railway.app
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx
WHATSAPP_NUMBER=51987654321

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=tu-cloud
CLOUDINARY_API_KEY=123456
CLOUDINARY_API_SECRET=secret
```

**IMPORTANTE:** Railway ya creó automáticamente `DATABASE_URL` cuando agregaste PostgreSQL. NO la sobrescribas.

### Paso 5: Deploy y Migrar Base de Datos

Railway automáticamente:
1. Hace deploy del código
2. Ejecuta `npm install`
3. Inicia el servidor

**Para migrar el schema de Prisma:**
```bash
# Railway ejecutará esto automáticamente si lo configuras
# O puedes hacerlo manualmente en Railway CLI
npx prisma migrate deploy
```

**Alternativa - Usar db push (más rápido):**
1. En Railway → Variables → Agregar un "Build Command" personalizado:
   ```
   npm install && npx prisma db push
   ```

### Paso 6: Verificar Deploy

Tu backend estará en: `https://tu-proyecto-production.up.railway.app`

Verifica:
- ✅ https://tu-proyecto.railway.app/health
- ✅ https://tu-proyecto.railway.app/api/products

### Paso 7: Seed la base de datos (opcional)

```bash
# Conectarte por Railway CLI
railway login
railway link
railway run node prisma/seed.js
```

O ejecuta seed manualmente desde Railway Shell.

---

## ▲ Deploy Frontend (Vercel)

### Paso 1: Preparar Frontend

1. Ve a: https://vercel.com
2. Sign up con GitHub
3. Click **"Add New..."** → **"Project"**
4. Import tu repositorio `dropshipping-iphone`

### Paso 2: Configurar Build

Vercel detecta React automáticamente. Configura:

**Framework Preset:** Create React App
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `build`

### Paso 3: Variables de Entorno

En Vercel → Settings → Environment Variables:

```env
REACT_APP_API_URL=https://tu-proyecto.railway.app/api
REACT_APP_WHATSAPP_NUMBER=51987654321
REACT_APP_APP_NAME=iPhone Cases Store
```

**IMPORTANTE:** Reemplaza `tu-proyecto.railway.app` con tu URL real de Railway.

### Paso 4: Deploy

1. Click **"Deploy"**
2. Espera 2-3 minutos
3. Tu frontend estará en: `https://tu-proyecto.vercel.app`

### Paso 5: Configurar Dominio (opcional)

En Vercel → Settings → Domains:
- Agregar dominio personalizado
- Seguir instrucciones de DNS

---

## 💳 Configurar Pasarelas de Pago

### Stripe (Visa/Mastercard Internacional)

1. Ve a: https://stripe.com
2. Crea una cuenta
3. Ve a: https://dashboard.stripe.com/apikeys
4. Copia tus claves de **TEST** (empiezan con `sk_test_` y `pk_test_`)
5. Agrégalas a Railway:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_PUBLISHABLE_KEY=pk_test_...`

**Para producción:**
- Completa verificación de identidad en Stripe
- Cambia a claves de **PRODUCCIÓN** (empiezan con `sk_live_` y `pk_live_`)

**Ventajas de Stripe:**
- Acepta Visa, Mastercard, American Express
- Procesamiento internacional
- Excelente UX y seguridad
- Dashboard completo con métricas

### MercadoPago (Tarjetas Locales Perú)

1. Ve a: https://www.mercadopago.com.pe/
2. Crea una cuenta Business
3. Ve a: https://www.mercadopago.com.pe/developers/panel/credentials
4. Copia tu `Access Token` de **TEST**
5. Agrégalo a Railway como `MERCADOPAGO_ACCESS_TOKEN`

**Para producción:**
- Activa tu cuenta MercadoPago (verifica identidad)
- Cambia a credenciales de **PRODUCCIÓN**

**Ventajas de MercadoPago:**
- Muy conocido en Perú y Latinoamérica
- Acepta tarjetas locales
- Wallet de MercadoPago

### Yape/Plin (Transferencias Instantáneas)

Actualiza en el frontend:
```typescript
// frontend/src/components/checkout/Checkout.tsx línea 49-50
const YAPE_NUMBER = '987654321'; // Tu número real
const YAPE_QR_IMAGE = 'URL-de-tu-QR'; // Sube tu QR a Cloudinary
```

**Ventajas de Yape/Plin:**
- MÁS USADO en Perú
- Transferencias instantáneas gratuitas
- Sin comisiones
- Confirmación por WhatsApp

### ¿Cuál elegir?

**Stack Recomendado:**
1. **Stripe** - Para tarjetas internacionales y mejor UX
2. **MercadoPago** - Backup para clientes locales que prefieren MercadoPago
3. **Yape/Plin** - Obligatorio en Perú (el más usado)
4. **WhatsApp** - Coordinación manual

---

## 🧪 Testing y Verificación

### Backend

```bash
# Health check
curl https://tu-proyecto.railway.app/health

# Productos
curl https://tu-proyecto.railway.app/api/products

# Admin login
curl -X POST https://tu-proyecto.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Frontend

1. Abre: https://tu-proyecto.vercel.app
2. Verifica:
   - ✅ Productos cargan
   - ✅ Puedes agregar al carrito
   - ✅ Checkout funciona
   - ✅ Se crea orden
   - ✅ Admin login funciona

### Orden de Prueba

1. Agrega producto al carrito
2. Ve al checkout
3. Llena formulario
4. Selecciona método de pago:
   - **Yape/Plin:** Ver instrucciones
   - **MercadoPago:** Serás redirigido (usa tarjetas de test)
   - **WhatsApp:** Ver link de WhatsApp

**Tarjetas de prueba Stripe:**
- Visa: 4242 4242 4242 4242
- Cualquier CVV y fecha futura
- Cualquier código postal

**Tarjetas de prueba MercadoPago:**
- Visa: 4509 9535 6623 3704
- CVV: 123
- Fecha: 11/25
- Nombre: APRO (para aprobar)

---

## 🔄 Actualizar después del Deploy

### Backend
```bash
# Haz cambios localmente
git add .
git commit -m "Update backend"
git push

# Railway hace re-deploy automático
```

### Frontend
```bash
# Haz cambios localmente
git add .
git commit -m "Update frontend"
git push

# Vercel hace re-deploy automático
```

### Migraciones de Base de Datos
```bash
# Local: crear migración
cd backend
npx prisma migrate dev --name nombre_migracion

# Push a Git
git add .
git commit -m "Add migration"
git push

# Railway: aplicar migración
railway run npx prisma migrate deploy
```

---

## 🆘 Troubleshooting

### Error: CORS en producción

Verifica en `backend/server-simple.js` que `FRONTEND_URL` esté en `allowedOrigins`.

### Error: No se conecta a la base de datos

1. Verifica que `DATABASE_URL` existe en Railway
2. Verifica que Prisma Client fue regenerado: `npx prisma generate`

### Error: 500 en API

1. Ve a Railway → Tu servicio → **Logs**
2. Busca el error exacto
3. Verifica que todas las variables de entorno están configuradas

### Frontend no se conecta al backend

1. Verifica `REACT_APP_API_URL` en Vercel
2. Debe ser: `https://tu-proyecto.railway.app/api` (con /api al final)
3. Re-deploya el frontend después de cambiar variables

---

## 📊 Monitoreo

### Railway (Backend)
- Logs: Railway → Tu servicio → Logs
- Métricas: Railway → Tu servicio → Metrics
- Database: Railway → PostgreSQL → Metrics

### Vercel (Frontend)
- Analytics: Vercel → Tu proyecto → Analytics
- Logs: Vercel → Tu proyecto → Deployments → View Function Logs

---

## 💰 Costos

### Plan Gratuito
- **Railway:** $5 de créditos/mes gratis
- **Vercel:** Ilimitado para hobby
- **Total:** $0/mes (suficiente para empezar)

### Plan Escalado
- **Railway Pro:** $20/mes (para más recursos)
- **Vercel Pro:** $20/mes (solo si necesitas)
- **Total:** $20-40/mes

---

## 🎉 ¡Felicidades!

Tu tienda está en producción. Ahora:

1. ✅ Configura MercadoPago en modo producción
2. ✅ Agrega productos reales
3. ✅ Configura tu dominio personalizado
4. ✅ Activa emails transaccionales
5. ✅ ¡Haz tu primera venta!

---

## 📚 Links Útiles

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- MercadoPago Perú: https://www.mercadopago.com.pe/developers/es/docs
- Guía completa del proyecto: `GUIA_COMPLETA_PERU.md`

---

**¿Necesitas ayuda?** Revisa los logs de Railway/Vercel primero. El 90% de errores se resuelven verificando variables de entorno.
