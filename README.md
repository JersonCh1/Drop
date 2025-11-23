# 🛡️ CASEPRO - Tienda de Carcasas iPhone

> E-commerce completo con panel admin, pagos automatizados y dropshipping integrado.

[![Producción](https://img.shields.io/badge/Estado-Producción-success)](https://casepro.es)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)

## 🚀 URLs en Producción

- **🌐 Sitio Web:** https://casepro.es (en configuración)
- **Frontend Temp:** https://flashfunded-frontend.vercel.app
- **Backend API:** https://drop-production-cd2b.up.railway.app
- **Repositorio:** https://github.com/JersonCh1/Drop

## 📋 Documentación Importante

### Marketing y Ventas
- **[📊 Marketing Tracking Completo](MARKETING_TRACKING_COMPLETO.md)** - Sistema completo de tracking (Facebook Pixel + GTM)
- **[🎯 Facebook Pixel Setup](FACEBOOK_PIXEL_SETUP.md)** - Guía detallada de configuración de Facebook Pixel
- **[🏷️ Google Tag Manager](GOOGLE_TAG_MANAGER_SETUP.md)** - Guía de configuración de GTM
- **[🚀 Branding y Marketing](BRANDING_Y_MARKETING.md)** - Guía completa de identidad de marca
- **[📋 Plan de Acción HOY](PLAN_DE_ACCION_HOY.md)** - Checklist para empezar a vender

### Técnica
- **[🌐 Configurar Dominio](CONFIGURAR_DOMINIO_CASEPRO.ES.md)** - Guía de configuración DNS

---

## 🎯 Quick Start

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

**Acceso Admin:**
- URL: http://localhost:3000/admin
- Usuario: `admin`
- Contraseña: `admin123`

---

## ✨ Características

### 🛍️ E-commerce
- ✅ Catálogo de productos con filtros
- ✅ Carrito persistente y checkout
- ✅ Sistema de reviews (5 estrellas)
- ✅ Tracking de órdenes
- ✅ Cupones y descuentos
- ✅ Wishlist/Favoritos
- ✅ Comparador de productos
- ✅ Dark mode

### 💳 Pagos
- ✅ **Izipay (BCP)** - Tarjetas + Yape + Plin *(Principal)*
- ✅ WhatsApp para consultas

### 📦 Dropshipping
- ✅ **CJ Dropshipping** - Automatización completa
- ✅ Cálculo automático de envío
- ✅ Creación automática de órdenes
- ✅ Tracking automático

### ⚙️ Admin Panel
- ✅ Dashboard con estadísticas
- ✅ Gestión de productos y órdenes
- ✅ Importador de productos CJ
- ✅ Analytics integrado

### 🌐 Otros
- ✅ Multi-idioma (ES/EN)
- ✅ Multi-currency (USD/PEN)
- ✅ SEO optimizado
- ✅ PWA (instalable)
- ✅ Sistema de lealtad/puntos

---

## 🏗️ Stack Tecnológico

**Frontend:** React 18 + TypeScript + TailwindCSS
**Backend:** Node.js + Express + Prisma ORM
**Database:** PostgreSQL (Railway)
**Hosting:** Vercel + Railway
**Pagos:** Izipay (BCP)
**Dropshipping:** CJ Dropshipping API

---

## 📂 Estructura

```
dropshipping-iphone/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Lógica de negocio
│   │   └── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── context/        # State management
│   │   └── services/       # API clients
│   └── .env
│
└── README.md               # Este archivo
```

---

## 🔐 Variables de Entorno

### Backend (.env)
```env
# Base de datos
DATABASE_URL="postgresql://..."

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://flashfunded-frontend.vercel.app
BACKEND_URL=https://drop-production-cd2b.up.railway.app

# JWT
JWT_SECRET=dropshipping-super-secret-key-2024

# Izipay (BCP - Pagos)
IZIPAY_USERNAME=81996279
IZIPAY_PASSWORD=prodpassword_...
IZIPAY_PUBLIC_KEY=81996279:publickey_...
IZIPAY_HMACSHA256=8pV9oAPoL3JjU0uD6qeVGUlW4qXfSqLepGoeulLw1m6xt
IZIPAY_API_URL=https://api.micuentaweb.pe/api-payment

# CJ Dropshipping
CJ_EMAIL=echurapacci@gmail.com
CJ_API_KEY=9a5b7fe7079a4d699c81f6b818ae2405
CJ_API_URL=https://developers.cjdropshipping.com/api2.0/v1

# WhatsApp
WHATSAPP_NUMBER=51987654321
```

### Frontend (.env)
```env
# API Backend
REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api

# WhatsApp
REACT_APP_WHATSAPP_NUMBER=51917780708
```

Ver `.env.example` en cada carpeta para referencia completa.

---

## 🚀 Despliegue

El proyecto usa **CI/CD automático**:

**Push to GitHub** → Auto-deploy en:
- ✅ Vercel (Frontend)
- ✅ Railway (Backend + PostgreSQL)

### Railway (Backend)
- Root Directory: `/backend`
- Build: `npm install && npx prisma generate`
- Start: `npx prisma migrate deploy && npm start`

### Vercel (Frontend)
- Root Directory: `/frontend`
- Build: `npm run build`
- Output: `build`

---

## 📋 Comandos Útiles

```bash
# Backend - Prisma
npx prisma studio          # Abrir BD en navegador
npx prisma generate        # Generar cliente
npx prisma db push         # Aplicar cambios

# Frontend - Build
npm run build             # Build para producción
npm start                 # Dev server
```

---

## 📊 Estado del Proyecto

**Versión:** 2.0
**Estado:** ✅ Producción
**Última actualización:** 2025-11-07

### Funcionalidades Completas
- [x] E-commerce completo
- [x] Pagos con Izipay (BCP)
- [x] Dropshipping automatizado (CJ)
- [x] Panel de administración
- [x] Dark mode y multi-currency
- [x] Sistema de wishlist y comparador
- [x] Sistema de puntos/lealtad
- [x] PWA instalable

---

## 👨‍💻 Desarrollador

**Jerson Churapacca**
- GitHub: [@JersonCh1](https://github.com/JersonCh1)
- Email: echurapacci@gmail.com

---

## 📄 Documentación

Ver [`PROYECTO_DROPSHIPPING_IPHONE.md`](./PROYECTO_DROPSHIPPING_IPHONE.md) para información detallada sobre:
- Configuración de Izipay
- Integración CJ Dropshipping
- Variables de entorno completas
- Troubleshooting

---

**⭐ Si te gusta el proyecto, dale una estrella en GitHub!**
