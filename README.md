# 🛡️ CASEPRO - Dropshipping de Carcasas iPhone

> E-commerce completo con automatización de dropshipping, pagos peruanos y panel admin.

[![Producción](https://img.shields.io/badge/Estado-Producción-success)](https://casepro.es)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)

---

## 🚀 URLs en Producción

- **🌐 Sitio Principal:** https://casepro.es
- **Backend API:** https://drop-production-cd2b.up.railway.app
- **Repositorio:** https://github.com/JersonCh1/Drop

---

## 📋 Tabla de Contenidos

- [🎯 Quick Start](#-quick-start)
- [✨ Características](#-características)
- [🏗️ Stack Tecnológico](#️-stack-tecnológico)
- [🔐 Configuración](#-configuración)
- [📦 Dropshipping con DSers](#-dropshipping-con-dsers)
- [💳 Pagos con Izipay](#-pagos-con-izipay)
- [🚀 Despliegue](#-despliegue)
- [📊 Marketing](#-marketing)
- [🛠️ Comandos Útiles](#️-comandos-útiles)

---

## 🎯 Quick Start

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/JersonCh1/Drop.git
cd dropshipping-iphone

# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm start

# Frontend (nueva terminal)
cd frontend
npm install
npm start
```

### Acceso Admin

- **URL:** http://localhost:3000/admin
- **Usuario:** `admin`
- **Contraseña:** `admin123`

---

## ✨ Características

### 🛍️ E-commerce Completo

- ✅ Catálogo de productos con filtros avanzados
- ✅ Carrito persistente (localStorage)
- ✅ Checkout multi-paso
- ✅ Sistema de reviews naturales (clientes peruanos)
- ✅ Tracking de órdenes en tiempo real
- ✅ Cupones y descuentos
- ✅ Wishlist/Favoritos
- ✅ Comparador de productos
- ✅ Dark mode
- ✅ Multi-idioma (ES/EN)
- ✅ Multi-currency (PEN/USD)

### 💳 Pasarela de Pagos

- ✅ **Izipay (BCP)** - Visa, Mastercard, Yape, Plin
- ✅ Modo producción activado
- ✅ Verificación 3D Secure
- ✅ Webhooks para estados de pago

### 📦 Dropshipping Automatizado

- ✅ **DSers** integrado (procesamiento semi-automático)
- ✅ **AliExpress** scraping con Puppeteer
- ✅ Importación masiva de productos
- ✅ Sincronización de variantes y colores
- ✅ Cálculo automático de envío
- ✅ Tracking automático
- ✅ **Envío GRATIS** para Perú

### ⚙️ Panel de Administración

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de productos y órdenes
- ✅ Panel DSers para órdenes automáticas
- ✅ Importador de productos (AliExpress)
- ✅ Analytics integrado
- ✅ Gestión de cupones y descuentos

### 🌐 SEO y Performance

- ✅ SEO optimizado
- ✅ PWA (instalable)
- ✅ Meta tags dinámicos
- ✅ Sitemap automático
- ✅ Lazy loading de imágenes

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + TypeScript + TailwindCSS |
| **Backend** | Node.js + Express + Prisma ORM |
| **Base de Datos** | PostgreSQL (Railway) |
| **Hosting** | Vercel (Frontend) + Railway (Backend) |
| **Pagos** | Izipay (BCP) |
| **Dropshipping** | DSers + AliExpress Scraping |
| **Email** | Nodemailer |

---

## 🔐 Configuración

### Variables de Entorno - Backend

Crear archivo `backend/.env`:

```env
# Base de datos PostgreSQL (Railway)
DATABASE_URL="postgresql://postgres:zwfHcUfTAZoQMZNbvuSDJiBFWYzesYkk@shinkansen.proxy.rlwy.net:47497/railway"

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://www.casepro.es
BACKEND_URL=https://drop-production-cd2b.up.railway.app

# JWT
JWT_SECRET=dropshipping-super-secret-key-2024

# Izipay (BCP - PRODUCCIÓN)
IZIPAY_USERNAME=81996279
IZIPAY_PASSWORD=prodpassword_...
IZIPAY_PUBLIC_KEY=81996279:publickey_...
IZIPAY_HMACSHA256=8pV9oAPoL3JjU0uD6qeVGUlW4qXfSqLepGoeulLw1m6xt
IZIPAY_API_URL=https://api.micuentaweb.pe/api-payment

# CJ Dropshipping (opcional - no usado actualmente)
CJ_EMAIL=echurapacci@gmail.com
CJ_API_KEY=9a5b7fe7079a4d699c81f6b818ae2405
CJ_API_URL=https://developers.cjdropshipping.com/api2.0/v1

# DSers Notification (Email)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_TO=echurapacci@gmail.com

# WhatsApp
WHATSAPP_NUMBER=51987654321
```

### Variables de Entorno - Frontend

Crear archivo `frontend/.env`:

```env
# API Backend
REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api

# WhatsApp
REACT_APP_WHATSAPP_NUMBER=51917780708
```

---

## 📦 Dropshipping con DSers

### ¿Qué es DSers?

DSers es la plataforma líder para automatizar dropshipping desde AliExpress. El proyecto está configurado para procesamiento semi-automático de órdenes.

### Flujo de Trabajo

```
1. Cliente compra en casepro.es
   ↓
2. Backend crea orden en PostgreSQL
   ↓
3. Sistema notifica por email automáticamente
   ↓
4. Admin accede a /admin/dsers
   ↓
5. Descarga CSV con órdenes pendientes
   ↓
6. Importa CSV en DSers
   ↓
7. DSers procesa automáticamente con AliExpress
   ↓
8. Cliente recibe tracking
```

### Panel DSers

**URL:** http://localhost:3000/admin/dsers (local) o https://casepro.es/admin/dsers (producción)

**Características:**
- Ver órdenes pendientes
- Descargar CSV para importar en DSers
- Estado de órdenes (pending, processing, completed)
- Notificaciones automáticas por email

### Formato CSV para DSers

El sistema exporta CSV con el siguiente formato:

```csv
Order Number,Customer Email,Product Name,Variant,Quantity,Total,Shipping Country,Shipping Address,Customer Name,Customer Phone
ORD-1234,cliente@email.com,Funda MagSafe,Negro - iPhone 14,2,90.00,PE,"Av. Lima 123, Lima",Juan Pérez,987654321
```

### Integración con AliExpress

El sistema también puede importar productos directamente desde AliExpress usando scraping:

**Endpoint:** `POST /api/aliexpress/scrape`

```json
{
  "url": "https://www.aliexpress.com/item/..."
}
```

**Características:**
- Extrae título, precio, imágenes
- Detecta todas las variantes (colores, modelos)
- Traduce automáticamente colores numéricos a español
- Mapea productos a modelos de iPhone

---

## 💳 Pagos con Izipay

### Configuración Actual

- **Modo:** PRODUCCIÓN ✅
- **Métodos:** Visa, Mastercard, Yape, Plin
- **Banco:** BCP (Banco de Crédito del Perú)
- **Verificación:** 3D Secure habilitado
- **Moneda:** PEN (Soles peruanos)

### Endpoints de Pago

**Crear pago:**
```
POST /api/izipay/create-payment
```

**Verificar pago:**
```
GET /api/izipay/verify-payment/:orderId
```

**Webhook:**
```
POST /api/izipay/webhook
```

### Flujo de Pago

```
1. Cliente llena checkout
   ↓
2. Frontend llama /api/izipay/create-payment
   ↓
3. Backend genera formToken de Izipay
   ↓
4. Cliente ingresa datos de tarjeta (iframe seguro)
   ↓
5. Izipay procesa 3D Secure
   ↓
6. Webhook notifica resultado
   ↓
7. Orden se marca como PAID/FAILED
```

### Credenciales

Las credenciales están en modo **PRODUCCIÓN**. Para pruebas locales, usar tarjetas de prueba de Izipay:

- **Visa:** 4970 1000 0000 0003
- **CVV:** 123
- **Fecha:** Cualquier fecha futura

---

## 🚀 Despliegue

El proyecto usa **CI/CD automático** con GitHub:

### Railway (Backend + PostgreSQL)

**Configuración:**
- Root Directory: `/backend`
- Build Command: `npm install && npx prisma generate`
- Start Command: `npx prisma migrate deploy && npm start`
- Port: 3001

**Variables de entorno:** Configurar todas las del `.env` en Railway

### Vercel (Frontend)

**Configuración:**
- Root Directory: `/frontend`
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`

**Variables de entorno:** Configurar `REACT_APP_API_URL` y `REACT_APP_WHATSAPP_NUMBER`

### Dominio

**Dominio:** casepro.es

**DNS (Namecheap):**
```
Type    Host    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

---

## 📊 Marketing

Ver guía completa en: **[ESTRATEGIA_MARKETING_COMPLETA.md](./ESTRATEGIA_MARKETING_COMPLETA.md)**

### Resumen Estrategia

**Objetivo:** 10-15 ventas en los primeros 7 días

**Canales principales:**
1. **Facebook/Instagram Ads** - S/300 (S/40/día x 7 días)
2. **Instagram Orgánico** - GRATIS
3. **WhatsApp Marketing** - GRATIS

**Precio de Lanzamiento:**
- Funda MagSafe: S/45 (antes S/80)
- **Envío GRATIS** a todo Perú
- Urgencia: "Solo por tiempo limitado"

**ROI Esperado:**
- Inversión: S/300
- Ventas esperadas: 10-15
- Ingresos: S/450-675
- Ganancia: S/150-375 (50-125% ROI)

**Copy de AD listo para usar:**
```
🧲 ¿Tu iPhone se cae todo el tiempo?

La Funda MagSafe CASEPRO tiene imanes ultra fuertes que:
✅ Se adhieren perfecto a cargadores MagSafe
✅ Protegen de caídas con bordes elevados
✅ NO interfieren con la carga inalámbrica

🎁 OFERTA DE LANZAMIENTO:
Solo S/45 (antes S/80)
🚚 Envío GRATIS a todo Perú

➡️ Compra ahora en casepro.es
```

---

## 🛠️ Comandos Útiles

### Backend (Prisma)

```bash
# Abrir base de datos en navegador
npx prisma studio

# Generar cliente Prisma
npx prisma generate

# Aplicar cambios al schema
npx prisma db push

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Ver datos en producción
DATABASE_URL="postgresql://..." npx prisma studio
```

### Frontend

```bash
# Desarrollo
npm start

# Build para producción
npm run build

# Servir build localmente
npx serve -s build
```

### Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Git Deploy

```bash
# Commit y push automático
git add .
git commit -m "feat: Nueva funcionalidad"
git push origin main

# Railway y Vercel deployarán automáticamente
```

---

## 📂 Estructura del Proyecto

```
dropshipping-iphone/
│
├── backend/                          # Node.js + Express API
│   ├── prisma/
│   │   └── schema.prisma            # Modelo de base de datos
│   ├── src/
│   │   ├── routes/                  # API endpoints
│   │   │   ├── auth.js              # Login/registro
│   │   │   ├── products.js          # CRUD productos
│   │   │   ├── orders.js            # Órdenes (incluye DSers)
│   │   │   ├── izipay.js            # Pagos Izipay
│   │   │   ├── shipping.js          # Cálculo de envío
│   │   │   ├── dsers.js             # Panel DSers
│   │   │   └── aliexpress.js        # Scraping AliExpress
│   │   ├── services/
│   │   │   ├── shippingCalculator.js
│   │   │   ├── dsersOrderService.js
│   │   │   └── dsersNotificationService.js
│   │   └── server.js                # Servidor Express
│   └── .env                         # Variables de entorno
│
├── frontend/                         # React 18 + TypeScript
│   ├── src/
│   │   ├── components/              # Componentes React
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── Cart.tsx
│   │   │   └── admin/               # Componentes admin
│   │   ├── pages/                   # Páginas
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── ProductsManagement.tsx
│   │   │       └── DSersOrdersPage.tsx
│   │   ├── context/                 # State management
│   │   │   ├── AuthContext.tsx
│   │   │   └── CartContext.tsx
│   │   ├── services/                # API clients
│   │   │   └── api.ts
│   │   └── App.tsx                  # Router principal
│   └── .env                         # Variables de entorno
│
├── ESTRATEGIA_MARKETING_COMPLETA.md # Guía de marketing
└── README.md                        # Este archivo
```

---

## 🔧 Scripts de Mantenimiento

### Activar todas las variantes en producción

```javascript
// backend/fix-production-variants.js (ejecutar una vez)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres:zwfHcUfTAZoQMZNbvuSDJiBFWYzesYkk@shinkansen.proxy.rlwy.net:47497/railway"
});

async function fixVariants() {
  // Activar todas las variantes
  await prisma.productVariant.updateMany({
    where: { isActive: false },
    data: { isActive: true }
  });

  // Set stock ilimitado (dropshipping)
  await prisma.productVariant.updateMany({
    where: { stockQuantity: 0 },
    data: { stockQuantity: 999 }
  });

  console.log('✅ Variantes actualizadas');
}

fixVariants();
```

### Agregar reviews naturales a productos

```bash
# Solo ejecutar una vez - ya está hecho
cd backend
node reviews-naturales.js
```

---

## 📊 API Endpoints Principales

### Autenticación

```
POST   /api/auth/login              # Login admin
POST   /api/auth/register           # Registro usuarios
```

### Productos

```
GET    /api/products                # Listar productos
GET    /api/products/:id            # Detalle producto
POST   /api/products                # Crear producto (admin)
PUT    /api/products/:id            # Actualizar producto (admin)
DELETE /api/products/:id            # Eliminar producto (admin)
```

### Órdenes

```
POST   /api/orders                  # Crear orden
GET    /api/orders/:id              # Detalle orden
GET    /api/orders                  # Listar órdenes (admin)
PUT    /api/orders/:id/status       # Actualizar estado (admin)
```

### Pagos (Izipay)

```
POST   /api/izipay/create-payment   # Crear pago
GET    /api/izipay/verify-payment/:orderId
POST   /api/izipay/webhook          # Webhook Izipay
```

### DSers

```
GET    /api/dsers/orders            # Listar órdenes para DSers
GET    /api/dsers/csv               # Descargar CSV para DSers
POST   /api/dsers/process/:orderId  # Marcar orden como procesada
```

### AliExpress Scraping

```
POST   /api/aliexpress/scrape       # Importar producto
GET    /api/aliexpress/search       # Buscar productos
```

### Envío

```
POST   /api/shipping/calculate      # Calcular costo de envío
GET    /api/shipping/countries      # Países soportados
```

---

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Verificar node_modules
cd backend
rm -rf node_modules package-lock.json
npm install

# Regenerar Prisma
npx prisma generate
```

### Frontend no conecta al backend

```bash
# Verificar .env
cat frontend/.env

# Debe tener:
# REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api
```

### Errores de Prisma en producción

```bash
# Conectar a Railway y aplicar migraciones
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Variantes sin stock

```bash
# Ejecutar script de fix (ver arriba)
DATABASE_URL="postgresql://..." node fix-production-variants.js
```

### Colores mostrando números

Ya está solucionado. El sistema mapea automáticamente:
- "1" → "Negro"
- "2" → "Transparente"
- "-1" → "Transparente Mate"
- etc.

---

## 📈 Estado del Proyecto

**Versión:** 3.0
**Estado:** ✅ PRODUCCIÓN
**Última actualización:** 2025-12-05

### ✅ Completado

- [x] E-commerce completo
- [x] Pagos Izipay (producción)
- [x] Dropshipping DSers integrado
- [x] Panel admin completo
- [x] Importador AliExpress
- [x] Reviews naturales
- [x] Envío gratis Perú
- [x] Fix variantes producción
- [x] Fix colores español
- [x] Redirects 404
- [x] Dark mode
- [x] Multi-currency

### 🚀 Próximos pasos sugeridos

- [ ] Implementar Facebook Pixel para remarketing
- [ ] Agregar Google Analytics 4
- [ ] Sistema de afiliados
- [ ] Blog para SEO
- [ ] Chat en vivo (Tawk.to)

---

## 👨‍💻 Desarrollador

**Jerson Churapacca**
- GitHub: [@JersonCh1](https://github.com/JersonCh1)
- Email: echurapacci@gmail.com

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

**⭐ ¿Listo para vender? Lee la [guía de marketing](./ESTRATEGIA_MARKETING_COMPLETA.md) y empieza hoy!**
