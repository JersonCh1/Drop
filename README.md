# 📱 iPhone Cases Store - E-commerce Dropshipping

> Plataforma e-commerce completa para venta de carcasas iPhone con panel de administración, múltiples métodos de pago y automatización de dropshipping.

[![Producción](https://img.shields.io/badge/Estado-Producción-success)](https://github.com/JersonCh1/Drop)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)

---

## 🚀 Quick Start

```bash
# Clonar repositorio
git clone https://github.com/JersonCh1/Drop.git
cd dropshipping-iphone

# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
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

## 📚 Documentación Completa

**→ Ver [`PROJECT_MASTER.md`](./PROJECT_MASTER.md) para documentación detallada**

Este archivo contiene:
- ✅ Stack tecnológico completo
- ✅ Todas las funcionalidades implementadas
- ✅ Estructura del proyecto
- ✅ Variables de entorno necesarias
- ✅ API endpoints completos
- ✅ Guías de despliegue
- ✅ Credenciales y configuraciones

---

## ✨ Características Principales

### 🛍️ E-commerce
- Catálogo de productos con filtros y búsqueda
- Sistema de reviews y ratings
- Carrito persistente y checkout multi-paso
- Tracking de órdenes en tiempo real
- Sistema de cupones y descuentos
- Programa de referidos

### 💳 Pagos (7 métodos)
- **Stripe** - Tarjetas internacionales
- **Culqi** - Principal para Perú
- **Niubiz** - Visa/Mastercard Perú
- **MercadoPago** - América Latina
- **Yape/Plin** - Billeteras digitales
- **PagoEfectivo** - Efectivo en agencias
- **SafetyPay** - Transferencias bancarias

### 📊 Admin Panel
- Dashboard con analytics en tiempo real
- Gestión completa de productos y órdenes
- Email marketing automatizado
- Integración con CJ Dropshipping
- Sistema de moderación de reviews

### 📈 Marketing & SEO
- Email marketing automatizado
- Newsletter popup y social proof
- Tracking pixels (Facebook, TikTok)
- Google Analytics integrado
- SEO optimizado (meta tags, sitemap, robots.txt)
- Sistema de referidos

### 🌐 Multi-idioma & PWA
- Español e Inglés
- Progressive Web App
- Instalable en móviles
- Modo offline

---

## 🏗️ Stack Tecnológico

**Frontend:** React 18 + TypeScript + TailwindCSS + React Query
**Backend:** Node.js + Express + Prisma ORM
**Database:** PostgreSQL (Producción) / SQLite (Desarrollo)
**Despliegue:** Vercel (Frontend) + Railway (Backend)
**Pagos:** Stripe, Culqi, Niubiz, MercadoPago, etc.
**Dropshipping:** CJ Dropshipping API

---

## 📦 Estructura

```
dropshipping-iphone/
├── backend/          # API + Base de datos
│   ├── prisma/       # Schema y migrations
│   ├── src/
│   │   ├── routes/   # Endpoints REST
│   │   ├── services/ # Lógica de negocio
│   │   └── server.js # Servidor Express
│   └── .env
│
├── frontend/         # React App
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas principales
│   │   ├── context/     # State management
│   │   └── services/    # API clients
│   └── .env
│
├── PROJECT_MASTER.md    # 📚 Documentación completa
└── README.md           # Este archivo
```

---

## 🔐 Variables de Entorno

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
PORT=3001
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_...
CULQI_SECRET_KEY=sk_...
# Ver PROJECT_MASTER.md para lista completa
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_...
REACT_APP_META_PIXEL_ID=123456789
REACT_APP_TIKTOK_PIXEL_ID=ABC123
# Ver PROJECT_MASTER.md para lista completa
```

---

## 🚀 Despliegue

El proyecto usa **CI/CD automático**:

1. **Push to GitHub** → Auto-deploy en Vercel + Railway
2. **Frontend:** https://tu-dominio.vercel.app
3. **Backend:** https://tu-backend.railway.app

Ver [`PROJECT_MASTER.md`](./PROJECT_MASTER.md) para guía detallada de despliegue.

---

## 🎯 Roadmap

- [x] E-commerce core completo
- [x] 7 métodos de pago integrados
- [x] Panel de administración
- [x] CJ Dropshipping automatizado
- [x] Email marketing
- [x] SEO optimizado
- [x] Multi-idioma (ES/EN)
- [x] PWA
- [ ] Chat en vivo
- [ ] Sistema de wishlist
- [ ] Notificaciones push

---

## 📞 Soporte

**Desarrollador:** Jerson
**GitHub:** https://github.com/JersonCh1/Drop
**Email:** jchurapfulasalle.edu.pe

---

## 📄 Licencia

MIT License - Ver LICENSE para más detalles.

---

**⭐ Si te gusta el proyecto, dale una estrella en GitHub!**
