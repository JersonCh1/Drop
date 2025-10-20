# 📱 iPhone Cases Store - Documentación Maestra

> **IMPORTANTE:** Lee este archivo al inicio de cada conversación para entender el estado completo del proyecto.

---

## 📊 ESTADO ACTUAL DEL PROYECTO

**Versión:** 2.0 (Octubre 2025)
**Estado:** ✅ Producción - Completamente funcional
**Despliegue:**
- **Frontend:** Vercel (Auto-deploy desde GitHub)
- **Backend:** Railway (Auto-deploy desde GitHub)
- **Base de Datos:** Railway PostgreSQL

---

## 🏗️ STACK TECNOLÓGICO

### Frontend
- **React 18** + TypeScript
- **React Router v6** - Navegación con rutas protegidas
- **TailwindCSS** - Estilos y diseño responsivo
- **React Query** - Cache y state management de servidor
- **React Hot Toast** - Notificaciones
- **React Helmet Async** - SEO dinámico
- **Axios** - HTTP client
- **Context API** - State management global (Cart, Auth, i18n)

### Backend
- **Node.js** + Express.js
- **Prisma ORM** - Database abstraction
- **PostgreSQL** (Producción - Railway)
- **SQLite** (Desarrollo local)
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Nodemailer** - Email service
- **Express File Upload** - Manejo de archivos
- **Helmet** - Security headers
- **Morgan** - HTTP logging

### Integraciones de Pago
- ✅ **Stripe** - Tarjetas internacionales
- ✅ **Culqi** - Tarjetas Perú (principal)
- ✅ **Niubiz** - Visa/Mastercard Perú
- ✅ **MercadoPago** - América Latina
- ✅ **Yape/Plin** - Billeteras digitales Perú
- ✅ **PagoEfectivo** - Efectivo en agentes
- ✅ **SafetyPay** - Transferencias bancarias

### Marketing & Analytics
- ✅ **Google Analytics** - Tracking de usuarios
- ✅ **Facebook Pixel** - Conversiones Facebook/Instagram
- ✅ **TikTok Pixel** - Conversiones TikTok Ads
- ✅ **WhatsApp Business API** - Soporte al cliente

### Dropshipping
- ✅ **CJ Dropshipping API** - Automatización de órdenes
- Sincronización automática de productos
- Fulfillment automático

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### 🛍️ E-commerce (Cliente)

#### Catálogo y Productos
- ✅ Listado de productos con filtros y búsqueda
- ✅ Detalle de producto con galería de imágenes
- ✅ Variantes de producto (colores, modelos de iPhone)
- ✅ Sistema de reviews y ratings (5 estrellas)
- ✅ Upsell y Cross-sell automático
- ✅ Indicadores de urgencia (stock limitado, viendo ahora)
- ✅ Productos destacados en homepage

#### Carrito y Checkout
- ✅ Carrito persistente (localStorage)
- ✅ Sidebar de carrito deslizable
- ✅ Checkout multi-paso con validación
- ✅ Múltiples métodos de pago
- ✅ Cálculo automático de envío
- ✅ Tracking de conversiones (pixels)

#### Usuario
- ✅ Registro y login de clientes
- ✅ Perfil de usuario editable
- ✅ Historial de órdenes
- ✅ Seguimiento de pedidos (tracking page)
- ✅ Sistema de referidos con códigos únicos

#### Marketing
- ✅ Newsletter popup (exit-intent + time delay)
- ✅ Social proof notifications (compras recientes)
- ✅ Cupones y descuentos
- ✅ Programa de referidos con recompensas
- ✅ Email marketing automatizado

#### Páginas Informativas
- ✅ FAQ (Preguntas frecuentes)
- ✅ Contact (Formulario + WhatsApp)
- ✅ About Us (Sobre nosotros)
- ✅ Privacy Policy
- ✅ Terms & Conditions
- ✅ Returns Policy
- ✅ Cookies Policy

#### SEO
- ✅ Meta tags dinámicos por página
- ✅ Open Graph tags (Facebook, Instagram)
- ✅ Twitter Cards
- ✅ Structured Data (JSON-LD)
- ✅ Sitemap XML dinámico (`/api/sitemap.xml`)
- ✅ robots.txt optimizado
- ✅ URLs amigables (slugs)

#### Internacionalización
- ✅ Multi-idioma (Español/Inglés)
- ✅ Selector de idioma en header
- ✅ Traducciones completas
- ✅ Detección automática de idioma

#### PWA
- ✅ Manifest.json configurado
- ✅ Service Worker para offline
- ✅ Instalable en móviles
- ✅ App-like experience

### ⚙️ Panel de Administración

#### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Gráficas de ventas (Chart.js)
- ✅ Top productos más vendidos
- ✅ Métricas de conversión
- ✅ Analytics integrado

#### Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Upload múltiple de imágenes
- ✅ Gestión de variantes (colores, tallas)
- ✅ Control de stock por variante
- ✅ Productos destacados
- ✅ Categorías y tags

#### Gestión de Órdenes
- ✅ Listado con filtros y búsqueda
- ✅ Detalle completo de orden
- ✅ Actualización de estado
- ✅ Generación de tracking
- ✅ Contacto directo por WhatsApp
- ✅ Notificaciones automáticas por email

#### CJ Dropshipping
- ✅ Importación automática de productos
- ✅ Sincronización de stock
- ✅ Creación automática de órdenes
- ✅ Tracking automático
- ✅ Dashboard de proveedores

#### Email Marketing
- ✅ Confirmación de orden automática
- ✅ Notificación de envío
- ✅ Carrito abandonado
- ✅ Newsletters
- ✅ Promociones masivas

#### Otros
- ✅ Gestión de cupones
- ✅ Sistema de referidos
- ✅ Moderación de reviews
- ✅ Configuración de webhooks

---

## 📁 ESTRUCTURA DEL PROYECTO

```
dropshipping-iphone/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Schema de base de datos
│   │   ├── seed.js                # Datos iniciales
│   │   └── dev.db                 # SQLite (desarrollo)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── analytics.js       # Analytics y métricas
│   │   │   ├── auth.js           # Autenticación usuarios
│   │   │   ├── categories.js     # Categorías
│   │   │   ├── cjDropshipping.js # CJ API
│   │   │   ├── coupons.js        # Cupones/descuentos
│   │   │   ├── culqi.js          # Culqi payment
│   │   │   ├── email.js          # Email marketing
│   │   │   ├── mercadopago.js    # MercadoPago
│   │   │   ├── niubiz.js         # Niubiz/Visa
│   │   │   ├── orders.js         # Órdenes (Prisma)
│   │   │   ├── pagoefectivo.js   # PagoEfectivo
│   │   │   ├── products.js       # Productos (Prisma)
│   │   │   ├── referrals.js      # Sistema referidos
│   │   │   ├── reviews.js        # Reviews/ratings
│   │   │   ├── safetypay.js      # SafetyPay
│   │   │   ├── sitemap.js        # Sitemap SEO
│   │   │   ├── stripe.js         # Stripe payment
│   │   │   ├── suppliers.js      # Proveedores
│   │   │   ├── tracking.js       # Tracking órdenes
│   │   │   ├── webhooks.js       # Payment webhooks
│   │   │   └── whatsapp.js       # WhatsApp API
│   │   ├── services/
│   │   │   ├── analyticsService.js   # Google Analytics
│   │   │   ├── cloudinaryService.js  # Imágenes (no usado)
│   │   │   ├── emailService.js       # Nodemailer
│   │   │   ├── notificationService.js
│   │   │   └── stripeService.js
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT verification
│   │   ├── utils/
│   │   │   └── database.js       # DB helpers
│   │   └── server.js             # ⭐ Servidor principal
│   ├── .env                      # Variables de entorno
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── robots.txt            # SEO robots
│   │   ├── manifest.json         # PWA manifest
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # Panel admin completo
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── OrdersTable.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   └── ...
│   │   │   ├── cart/
│   │   │   │   ├── CartSidebar.tsx
│   │   │   │   └── CartItem.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── Checkout.tsx
│   │   │   │   ├── CulqiCheckout.tsx
│   │   │   │   ├── StripeCheckout.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── marketing/
│   │   │   │   ├── NewsletterPopup.tsx
│   │   │   │   └── SocialProof.tsx
│   │   │   ├── products/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductReviews.tsx
│   │   │   │   ├── UpsellCrossSell.tsx
│   │   │   │   └── UrgencyIndicators.tsx
│   │   │   ├── SEO/
│   │   │   │   └── SEOHead.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── CartContext.tsx
│   │   │   └── I18nContext.tsx
│   │   ├── pages/
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── TrackingPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   ├── FAQPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── PrivacyPage.tsx
│   │   │   ├── TermsPage.tsx
│   │   │   ├── ReturnsPage.tsx
│   │   │   ├── CookiesPage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── MyOrdersPage.tsx
│   │   ├── services/
│   │   │   ├── productService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── analyticsService.ts
│   │   │   └── ...
│   │   ├── utils/
│   │   │   └── trackingPixels.ts
│   │   ├── i18n/
│   │   │   ├── en.json
│   │   │   └── es.json
│   │   ├── App.tsx               # ⭐ App principal
│   │   └── index.tsx
│   ├── .env                      # Variables de entorno
│   └── package.json
│
└── PROJECT_MASTER.md             # ⭐ Este archivo
```

---

## 🔐 CREDENCIALES Y ACCESOS

### Admin Panel
- **URL Producción:** https://tu-dominio.vercel.app/admin
- **URL Local:** http://localhost:3000/admin
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### Base de Datos (Railway)
- **Provider:** PostgreSQL
- **URL:** En variable `DATABASE_URL` (Railway)

### Despliegue
- **Frontend (Vercel):** Auto-deploy desde GitHub (branch `main`)
- **Backend (Railway):** Auto-deploy desde GitHub (branch `main`)

---

## 🌐 VARIABLES DE ENTORNO

### Backend (.env)
```env
# Base de Datos
DATABASE_URL="postgresql://..."  # Railway PostgreSQL

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.vercel.app

# JWT
JWT_SECRET=dropshipping-super-secret-key-2024

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
SUPPORT_EMAIL=soporte@tudominio.com
ADMIN_EMAIL=admin@tudominio.com

# Pagos - Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pagos - Culqi (Principal para Perú)
CULQI_SECRET_KEY=sk_test_...
CULQI_PUBLIC_KEY=pk_test_...

# Pagos - Niubiz
NIUBIZ_MERCHANT_ID=...
NIUBIZ_ACCESS_KEY=...
NIUBIZ_SECRET_KEY=...

# Pagos - MercadoPago
MERCADOPAGO_ACCESS_TOKEN=...

# Pagos - PagoEfectivo
PAGOEFECTIVO_ACCESS_KEY=...
PAGOEFECTIVO_SECRET_KEY=...

# Pagos - SafetyPay
SAFETYPAY_API_KEY=...
SAFETYPAY_SIGNATURE_KEY=...

# CJ Dropshipping
CJ_EMAIL=tu-email@cjdropshipping.com
CJ_PASSWORD=tu-password

# WhatsApp Business
WHATSAPP_PHONE_ID=...
WHATSAPP_TOKEN=...

# Analytics
GOOGLE_ANALYTICS_ID=GA-...
```

### Frontend (.env)
```env
# API
REACT_APP_API_URL=https://tu-backend.railway.app/api

# Pagos
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_CULQI_PUBLIC_KEY=pk_test_...

# Tracking Pixels
REACT_APP_META_PIXEL_ID=123456789
REACT_APP_TIKTOK_PIXEL_ID=ABC123XYZ

# Analytics
REACT_APP_GA_ID=GA-...

# Otros
REACT_APP_WHATSAPP_NUMBER=51999999999
```

---

## 🔌 API ENDPOINTS PRINCIPALES

### Productos
```
GET    /api/products              # Listar productos
GET    /api/products/:slug        # Detalle producto
GET    /api/products/featured     # Productos destacados
POST   /api/products              # Crear (ADMIN)
PUT    /api/products/:id          # Actualizar (ADMIN)
DELETE /api/products/:id          # Eliminar (ADMIN)
POST   /api/products/:id/images   # Agregar imagen (ADMIN)
```

### Órdenes
```
GET    /api/orders                # Listar (ADMIN)
GET    /api/orders/:orderNumber   # Tracking público
POST   /api/orders                # Crear orden
PATCH  /api/orders/:id/status     # Actualizar estado (ADMIN)
```

### Autenticación
```
POST   /api/auth/register         # Registro usuario
POST   /api/auth/login            # Login usuario
POST   /api/admin/login           # Login admin
GET    /api/admin/verify          # Verificar token admin
```

### Pagos
```
POST   /api/stripe/create-payment-intent
POST   /api/culqi/create-charge
POST   /api/niubiz/generate-session
POST   /api/mercadopago/create-preference
```

### Marketing
```
POST   /api/email/welcome         # Email bienvenida
POST   /api/email/contact         # Formulario contacto
POST   /api/email/order-confirmation
POST   /api/email/abandoned-cart
GET    /api/reviews               # Listar reviews
POST   /api/reviews               # Crear review
```

### SEO
```
GET    /api/sitemap.xml           # Sitemap dinámico
GET    /api/sitemap-info          # Info del sitemap
```

### Analytics
```
POST   /api/analytics/track       # Track event
GET    /api/analytics/dashboard   # Dashboard data (ADMIN)
```

### CJ Dropshipping
```
GET    /api/cj/products           # Listar productos CJ
POST   /api/cj/import-product     # Importar producto
POST   /api/cj/create-order       # Crear orden en CJ
```

---

## 🗄️ MODELOS DE BASE DE DATOS (Prisma)

### User
- id, email, password (hash), firstName, lastName
- role: CUSTOMER | ADMIN
- isActive, emailVerified
- Relaciones: orders, reviews, referrals

### Product
- id, name, slug, description, basePrice
- brand, model, compatibility
- stockCount, isFeatured, isActive, inStock
- Relaciones: images, variants, reviews, categories

### ProductImage
- id, productId, url, altText, position, isMain

### ProductVariant
- id, productId, name, color, size, price, sku, stockQuantity

### Order
- id, orderNumber, status
- customerInfo (nombre, email, teléfono)
- shippingAddress (dirección completa)
- items (JSON), subtotal, shipping, tax, total
- paymentMethod, paymentStatus
- trackingNumber, notes

### Review
- id, productId, userId
- rating (1-5), title, comment
- isVerified, isApproved

### Coupon
- id, code, type (PERCENTAGE | FIXED)
- value, minPurchase, maxDiscount
- validFrom, validUntil, usageLimit

### Referral
- id, userId, referralCode
- totalEarnings, redeemed

---

## 🚀 COMANDOS ÚTILES

### Desarrollo Local
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
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

# El despliegue es automático via GitHub push
git add .
git commit -m "feat: ..."
git push
```

### Base de Datos
```bash
# Generar Prisma Client
npx prisma generate

# Push schema a DB
npx prisma db push

# Ver DB en navegador
npx prisma studio

# Reset DB (¡CUIDADO!)
npx prisma db push --force-reset
node prisma/seed.js
```

### Debugging
```bash
# Matar puerto 3001
npx kill-port 3001

# Matar puerto 3000
npx kill-port 3000

# Ver logs Railway
railway logs
```

---

## ✅ FEATURES COMPLETADAS

### ✅ E-commerce Core
- [x] Catálogo de productos
- [x] Detalle de producto
- [x] Carrito de compras
- [x] Checkout multi-paso
- [x] Tracking de órdenes
- [x] Sistema de reviews
- [x] Cupones y descuentos

### ✅ Pagos
- [x] Stripe (tarjetas internacionales)
- [x] Culqi (Perú)
- [x] Niubiz (Perú)
- [x] MercadoPago (LATAM)
- [x] Yape/Plin (Perú)
- [x] PagoEfectivo (Perú)
- [x] SafetyPay (Perú)

### ✅ Marketing
- [x] Email marketing automatizado
- [x] Newsletter popup
- [x] Social proof notifications
- [x] Sistema de referidos
- [x] Tracking pixels (FB, TikTok)
- [x] Google Analytics

### ✅ Admin
- [x] Dashboard con métricas
- [x] Gestión de productos
- [x] Gestión de órdenes
- [x] Analytics
- [x] Email marketing
- [x] Moderación de reviews

### ✅ Dropshipping
- [x] Integración CJ Dropshipping
- [x] Sincronización automática
- [x] Fulfillment automático

### ✅ SEO & Contenido
- [x] Meta tags dinámicos
- [x] Sitemap XML
- [x] robots.txt
- [x] FAQ page
- [x] Contact page
- [x] About Us
- [x] Páginas legales (4)
- [x] Multi-idioma (ES/EN)

### ✅ PWA
- [x] Manifest configurado
- [x] Service Worker
- [x] Instalable en móviles

---

## 🎯 PRÓXIMOS PASOS / TODO

### Mejoras Sugeridas
- [ ] Implementar chat en vivo (WhatsApp widget)
- [ ] Sistema de wishlist/favoritos
- [ ] Comparador de productos
- [ ] Búsqueda avanzada con filtros
- [ ] Reseñas con fotos
- [ ] Programa de lealtad/puntos
- [ ] Notificaciones push (PWA)
- [ ] Dark mode
- [ ] Multi-currency (USD, PEN)
- [ ] Calculadora de envío internacional

### Optimizaciones
- [ ] Lazy loading de imágenes
- [ ] Code splitting avanzado
- [ ] CDN para assets
- [ ] Compresión de imágenes
- [ ] Cache strategies mejoradas

### Analytics
- [ ] Heatmaps (Hotjar)
- [ ] A/B testing
- [ ] Funnel de conversión detallado
- [ ] Reportes automáticos por email

---

## 🐛 PROBLEMAS CONOCIDOS

### Ninguno crítico actualmente

**Notas:**
- Todos los errores de TypeScript resueltos
- Tracking pixels funcionando correctamente
- Pagos testeados y funcionales
- Emails configurados y enviándose

---

## 📝 NOTAS IMPORTANTES

1. **Database:** En producción usa PostgreSQL de Railway. En local usa SQLite.

2. **Pagos:** Culqi es el método principal para Perú. Stripe para internacional.

3. **Emails:** Configurados con Nodemailer (Gmail). Cambiar a SendGrid/AWS SES para producción masiva.

4. **Tracking Pixels:** Funcionan en producción. Configurar IDs en variables de entorno.

5. **CJ Dropshipping:** Credenciales en backend .env. Auto-sincronización cada hora.

6. **SEO:** Sitemap accesible en `/api/sitemap.xml`. robots.txt en `/robots.txt`.

7. **CI/CD:** Despliegue automático en cada push a main (Vercel + Railway).

8. **Backups:** Railway hace backups automáticos de la BD PostgreSQL.

---

## 🎓 LECCIONES APRENDIDAS

1. Siempre usar Prisma Client después de cambios en schema
2. Validar tipos de TypeScript antes de build
3. Testear pagos en sandbox antes de producción
4. Mantener variables de entorno sincronizadas
5. Documentar decisiones importantes

---

## 📞 SOPORTE

**Desarrollador:** Jerson
**GitHub:** https://github.com/JersonCh1/Drop
**Email:** jchurapfulasalle.edu.pe

---

**Última actualización:** Octubre 20, 2025
**Versión del proyecto:** 2.0
**Build:** #8afd62f
