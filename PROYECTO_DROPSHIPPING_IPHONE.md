# 📱 Proyecto: Tienda Dropshipping de Carcasas iPhone

## 🎯 Descripción General

Tienda e-commerce completa de dropshipping especializada en carcasas para iPhone, optimizada para el mercado peruano y latinoamericano. Sistema full-stack con automatización de pagos y envíos.

**URLs de Producción:**
- **Frontend:** https://flashfunded-frontend.vercel.app (Vercel)
- **Backend:** https://drop-production-cd2b.up.railway.app (Railway)
- **Repositorio:** https://github.com/JersonCh1/Drop.git

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **Estado Global:** React Context API
- **Notificaciones:** react-hot-toast
- **Iconos:** Heroicons
- **HTTP Client:** Axios
- **Internacionalización:** Context personalizado (ES/EN)

### Backend
- **Runtime:** Node.js + Express
- **Base de Datos:** PostgreSQL (Railway)
- **ORM:** Prisma
- **Autenticación:** JWT
- **CORS:** Configurado para Vercel
- **Variables de Entorno:** dotenv

### Servicios Externos
- **Pasarela de Pagos:** Izipay (BCP - Modo PRODUCCIÓN)
- **Dropshipping:** CJ Dropshipping API
- **Hosting Frontend:** Vercel
- **Hosting Backend:** Railway
- **Control de Versiones:** GitHub

---

## 📂 Estructura del Proyecto

```
dropshipping-iphone/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Esquema de base de datos
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js            # Autenticación JWT
│   │   │   ├── products-prisma.js # CRUD productos
│   │   │   ├── orders-prisma.js   # Gestión de pedidos
│   │   │   ├── izipay.js          # Integración Izipay
│   │   │   └── cjDropshipping.js  # Integración CJ
│   │   ├── services/
│   │   │   ├── cjAuthService.js   # Autenticación CJ API
│   │   │   └── cjDropshippingService.js
│   │   └── server.js              # Servidor Express
│   ├── package.json
│   └── .env (NO en GitHub)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── ProductsManager.tsx
│   │   │   │   ├── CJProductImporter.tsx
│   │   │   │   └── ImprovedAdminDashboard.tsx
│   │   │   ├── checkout/
│   │   │   │   └── Checkout.tsx
│   │   │   ├── home/
│   │   │   │   └── HeroBanner.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── marketing/
│   │   │   │   └── SocialProof.tsx
│   │   │   └── products/
│   │   │       ├── ProductCard.tsx
│   │   │       └── AdvancedFilters.tsx
│   │   ├── context/
│   │   │   ├── CartContext.tsx
│   │   │   └── I18nContext.tsx
│   │   ├── hooks/
│   │   │   └── useIzipay.ts
│   │   ├── pages/
│   │   │   ├── ProductsPage.tsx
│   │   │   └── ProductDetailPage.tsx
│   │   └── App.tsx
│   ├── package.json
│   └── .env (NO en GitHub)
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

**Variables requeridas en Railway:**
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

**Variables de entorno en Vercel:**
```bash
REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api
REACT_APP_WHATSAPP_NUMBER=51917780708
```

---

## 💳 Sistema de Pagos - Izipay (PRODUCCIÓN)

### Características
- ✅ **Modo:** PRODUCCIÓN (pagos reales)
- ✅ **Pasarela:** Izipay (BCP - Banco de Crédito del Perú)
- ✅ **Métodos aceptados:** Visa, MasterCard, American Express
- ✅ **Seguridad:** HMAC-SHA256 para firma de datos
- ✅ **SDK:** Embedded Payment Form (KR)
- ✅ **3D Secure:** Habilitado

### Flujo de Pago

1. **Cliente** selecciona productos y va al checkout
2. **Frontend** obtiene `formToken` desde backend
3. **Izipay** muestra formulario embebido con SDK KR
4. **Cliente** ingresa datos de tarjeta
5. **Izipay** procesa pago y retorna resultado
6. **Backend** verifica firma HMAC y crea pedido
7. **CJ Dropshipping** recibe orden automáticamente

### Endpoints

```javascript
POST /api/izipay/create-payment
POST /api/izipay/webhook
GET  /api/izipay/payment-status/:orderId
```

---

## 📦 Integración CJ Dropshipping

### Funcionalidades

- ✅ **Importación de productos:** Búsqueda y adición desde catálogo CJ
- ✅ **Sincronización de inventario:** Stock en tiempo real
- ✅ **Creación automática de órdenes:** Cuando se confirma pago
- ✅ **Tracking de envíos:** Número de rastreo automático
- ✅ **Gestión de proveedores:** Sistema multi-proveedor

### API Endpoints

```javascript
GET  /api/cj/search-products?query=iphone+case
GET  /api/cj/product/:productId
POST /api/cj/import-product
POST /api/cj/create-order
GET  /api/cj/order-status/:orderId
```

### Autenticación CJ

- Sistema de **token cache** con renovación automática
- Tokens válidos por 24 horas
- Refresh automático antes de expiración

---

## 🎨 Features del Frontend

### Componentes Clave

1. **HeroBanner** - Banner dinámico con producto destacado
2. **SocialProof** - Notificaciones de compras simuladas (cada 45s)
3. **ProductCard** - Tarjetas de producto con variantes
4. **Checkout** - Proceso de compra con Izipay integrado
5. **CJProductImporter** - Importador de productos desde CJ

### Características UX

- ✅ Diseño responsive (mobile-first)
- ✅ Modo oscuro/claro
- ✅ Animaciones fluidas con Tailwind
- ✅ Notificaciones toast
- ✅ Carrito persistente (localStorage)
- ✅ Internacionalización (ES/EN)
- ✅ SEO optimizado

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
  category    Category      @relation(fields: [categoryId], references: [id])
  categoryId  String
}

model ProductVariant {
  id            String  @id @default(cuid())
  name          String
  sku           String  @unique
  price         Float
  stockQuantity Int
  color         String?
  product       Product @relation(fields: [productId], references: [id])
  productId     String
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

- ✅ **JWT** para autenticación de usuarios
- ✅ **CORS** configurado para dominio específico
- ✅ **HMAC-SHA256** para verificación de webhooks Izipay
- ✅ **Variables de entorno** para credenciales sensibles
- ✅ **Sanitización de inputs** con validación
- ✅ **Rate limiting** en endpoints críticos
- ✅ **HTTPS** en producción (Railway + Vercel)

---

## 📈 Optimizaciones

### Performance

- ✅ **Code splitting** con React.lazy
- ✅ **Lazy loading** de imágenes
- ✅ **Memoization** de componentes pesados
- ✅ **Debouncing** en búsquedas
- ✅ **Caching** de tokens CJ
- ✅ **Compresión gzip** en Railway

### SEO

- ✅ Meta tags dinámicos
- ✅ Open Graph para redes sociales
- ✅ Sitemap generado
- ✅ URLs amigables (slugs)
- ✅ Schema.org markup para productos

---

## 🐛 Troubleshooting

### Error: "Type 'string' is not assignable to type 'number'"
**Causa:** CartContext esperaba `productId` como `number`
**Solución:** Cambiado a `string | number` para compatibilidad PostgreSQL/SQLite

### Error: Railway "empty key" en variables
**Causa:** Espacio o `=` extra al inicio de variable
**Solución:** Usar Raw Editor y pegar sin espacios extras

### Error: Izipay muestra tarjetas de prueba
**Causa:** Credenciales en modo TEST
**Solución:** Cambiar a credenciales de PRODUCCIÓN en Railway

### Error: CJ Dropshipping 401 Unauthorized
**Causa:** Token expirado o inválido
**Solución:** Verificar que `CJ_EMAIL` y `CJ_API_KEY` sean correctos

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

# Deploy a Railway (automático con git push)
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

## 👨‍💻 Desarrolladores

- **Jerson Churapacca**
- Email: echurapacci@gmail.com / jchurap@ulasalle.edu.pe
- GitHub: https://github.com/JersonCh1

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

## 🎯 Roadmap Futuro

- [ ] Panel de analíticas avanzadas
- [ ] Sistema de reseñas con moderación
- [ ] Programa de afiliados
- [ ] App móvil (React Native)
- [ ] Chatbot con IA para soporte
- [ ] Múltiples idiomas adicionales
- [ ] Sistema de cupones y descuentos
- [ ] Integración con más pasarelas (Yape, Plin)

---

**Última actualización:** 2025-11-03
