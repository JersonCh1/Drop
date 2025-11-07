# 📱 Proyecto: Tienda Dropshipping de Carcasas iPhone

## 🎯 Descripción General

Tienda e-commerce completa de dropshipping especializada en carcasas para iPhone, optimizada para el mercado peruano.

**URLs de Producción:**
- **Frontend:** https://flashfunded-frontend.vercel.app
- **Backend:** https://drop-production-cd2b.up.railway.app
- **Repositorio:** https://github.com/JersonCh1/Drop.git

---

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- TailwindCSS
- React Router v6
- React Context API
- Axios

### Backend
- Node.js + Express
- PostgreSQL (Railway)
- Prisma ORM
- JWT Authentication

### Servicios Externos
- **Izipay (BCP)** - Pagos con tarjetas, Yape y Plin
- **CJ Dropshipping** - Automatización de órdenes y envíos
- **Vercel** - Hosting Frontend
- **Railway** - Hosting Backend + Database

---

## 📂 Estructura del Proyecto

```
dropshipping-iphone/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products-prisma.js
│   │   │   ├── orders-prisma.js
│   │   │   ├── izipay.js
│   │   │   └── cjDropshipping.js
│   │   ├── services/
│   │   │   ├── cjAuthService.js
│   │   │   └── cjDropshippingService.js
│   │   └── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.tsx
│   └── .env
└── README.md
```

---

## 🔑 Variables de Entorno

### Backend (.env)

```bash
# Servidor
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://flashfunded-frontend.vercel.app
BACKEND_URL=https://drop-production-cd2b.up.railway.app

# Base de Datos PostgreSQL (Railway)
DATABASE_URL="postgresql://postgres:zwfHcUfTAZoQMZNbvuSDJiBFWYzesYkk@shinkansen.proxy.rlwy.net:47497/railway"

# JWT
JWT_SECRET=dropshipping-super-secret-key-2024

# Izipay (MODO PRODUCCIÓN - BCP Perú)
IZIPAY_USERNAME=81996279
IZIPAY_PASSWORD=prodpassword_alktHLRsDMrIJ4HojBlwhe0cxOxidi1mSjn2gqogCBGcd
IZIPAY_PUBLIC_KEY=81996279:publickey_oy0QZCy4XxB4CmV2zO3W9t79i7flvrikXOPHhDf5yqWlC
IZIPAY_HMACSHA256=8pV9oAPoL3JjU0uD6qeVGUlW4qXfSqLepGoeulLw1m6xt
IZIPAY_API_URL=https://api.micuentaweb.pe/api-payment

# CJ Dropshipping
CJ_API_URL=https://developers.cjdropshipping.com/api2.0/v1
CJ_EMAIL=echurapacci@gmail.com
CJ_API_KEY=9a5b7fe7079a4d699c81f6b818ae2405

# WhatsApp
WHATSAPP_NUMBER=51987654321
```

### Frontend (.env)

```bash
REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api
REACT_APP_WHATSAPP_NUMBER=51917780708
```

---

## 🚀 Deployment

### Railway (Backend)

**Configuración:**
- **Root Directory:** `/backend`
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npx prisma migrate deploy && npm start`
- **Branch:** `main`
- **Auto-deploy:** Habilitado

**Variables requeridas:**
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=<Railway PostgreSQL URL>
JWT_SECRET=dropshipping-super-secret-key-2024
FRONTEND_URL=https://flashfunded-frontend.vercel.app
BACKEND_URL=https://drop-production-cd2b.up.railway.app
IZIPAY_USERNAME=81996279
IZIPAY_PASSWORD=prodpassword_alktHLRsDMrIJ4HojBlwhe0cxOxidi1mSjn2gqogCBGcd
IZIPAY_PUBLIC_KEY=81996279:publickey_oy0QZCy4XxB4CmV2zO3W9t79i7flvrikXOPHhDf5yqWlC
IZIPAY_HMACSHA256=8pV9oAPoL3JjU0uD6qeVGUlW4qXfSqLepGoeulLw1m6xt
IZIPAY_API_URL=https://api.micuentaweb.pe/api-payment
CJ_EMAIL=echurapacci@gmail.com
CJ_API_KEY=9a5b7fe7079a4d699c81f6b818ae2405
CJ_API_URL=https://developers.cjdropshipping.com/api2.0/v1
```

### Vercel (Frontend)

**Configuración:**
- **Root Directory:** `/frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`
- **Branch:** `main`

**Variables de entorno:**
```bash
REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api
REACT_APP_WHATSAPP_NUMBER=51917780708
```

---

## 💳 Sistema de Pagos - Izipay

### Características
- ✅ **Modo:** PRODUCCIÓN (pagos reales)
- ✅ **Pasarela:** Izipay (BCP - Banco de Crédito del Perú)
- ✅ **Métodos:** Visa, MasterCard, American Express, Yape, Plin
- ✅ **Seguridad:** HMAC-SHA256
- ✅ **3D Secure:** Habilitado

### Flujo de Pago

1. Cliente selecciona productos y va al checkout
2. Frontend obtiene `formToken` desde backend
3. Izipay muestra formulario embebido
4. Cliente ingresa datos de tarjeta o elige Yape/Plin
5. Izipay procesa pago y retorna resultado
6. Backend verifica firma HMAC y crea pedido
7. CJ Dropshipping recibe orden automáticamente

### Endpoints

```javascript
POST /api/izipay/create-payment
POST /api/izipay/webhook
GET  /api/izipay/payment-status/:orderId
```

---

## 📦 Integración CJ Dropshipping

### Funcionalidades

- ✅ Importación de productos desde catálogo CJ
- ✅ Sincronización de inventario en tiempo real
- ✅ Creación automática de órdenes al confirmar pago
- ✅ Cálculo automático de costos de envío
- ✅ Tracking de envíos automático

### API Endpoints

```javascript
GET  /api/cj/search-products?query=iphone+case
GET  /api/cj/product/:productId
POST /api/cj/import-product
POST /api/cj/create-order
GET  /api/cj/order-status/:orderId
GET  /api/cj/calculate-shipping
```

### Autenticación CJ

- Sistema de **token cache** con renovación automática
- Tokens válidos por 24 horas
- Refresh automático antes de expiración

---

## 🎨 Features del Frontend

### Componentes Clave

1. **HeroBanner** - Banner dinámico con producto destacado
2. **ProductCard** - Tarjetas de producto con variantes
3. **Checkout** - Proceso de compra con Izipay integrado
4. **CJProductImporter** - Importador de productos desde CJ
5. **WishlistButton** - Sistema de favoritos
6. **CompareButton** - Comparador de productos
7. **WhatsAppWidget** - Chat flotante

### Características UX

- ✅ Diseño responsive (mobile-first)
- ✅ Dark mode / Light mode
- ✅ Multi-currency (USD/PEN)
- ✅ Carrito persistente (localStorage)
- ✅ Internacionalización (ES/EN)
- ✅ Lazy loading de imágenes
- ✅ PWA instalable

---

## 📊 Base de Datos (PostgreSQL)

### Modelos Principales

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      String   @default("customer")
  createdAt DateTime @default(now())
}

model Product {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  description String?
  basePrice   Float
  images      ProductImage[]
  variants    ProductVariant[]
  category    Category
}

model ProductVariant {
  id            String  @id @default(cuid())
  name          String
  sku           String  @unique
  price         Float
  stockQuantity Int
  color         String?
  product       Product
}

model Order {
  id              String   @id @default(cuid())
  orderNumber     String   @unique
  customerEmail   String
  totalAmount     Float
  paymentStatus   String
  shippingStatus  String
  izipayOrderId   String?
  cjOrderId       String?
  trackingNumber  String?
  createdAt       DateTime @default(now())
  items           OrderItem[]
}
```

---

## 🔐 Seguridad

### Implementaciones

- ✅ JWT para autenticación
- ✅ CORS configurado para dominios específicos
- ✅ HMAC-SHA256 para verificación de webhooks Izipay
- ✅ Variables de entorno para credenciales
- ✅ Sanitización de inputs
- ✅ HTTPS en producción

---

## 📝 Comandos Útiles

### Desarrollo Local

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm start

# Frontend
cd frontend
npm install
npm start
```

### Producción

```bash
# Build frontend
cd frontend
npm run build

# Deploy (automático con git push)
git add .
git commit -m "Descripción cambios"
git push origin main
```

### Base de Datos

```bash
# Generar Prisma Client
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio
```

---

## 🐛 Troubleshooting

### Error: "Type 'string' is not assignable to type 'number'"
**Solución:** CartContext usa `string | number` para compatibilidad PostgreSQL

### Error: Railway "empty key" en variables
**Solución:** Usar Raw Editor y pegar sin espacios extras

### Error: Izipay muestra tarjetas de prueba
**Solución:** Verificar credenciales de PRODUCCIÓN en Railway

### Error: CJ Dropshipping 401 Unauthorized
**Solución:** Verificar `CJ_EMAIL` y `CJ_API_KEY`

---

## 👨‍💻 Desarrollador

- **Jerson Churapacca**
- Email: echurapacci@gmail.com
- GitHub: https://github.com/JersonCh1

---

**Última actualización:** 2025-11-07
