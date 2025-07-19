# 🛍️ Dropshipping iPhone Cases Store

Una tienda de dropshipping moderna para carcasas de iPhone construida con React y Node.js.

## 📋 Tabla de Contenidos

- [🚀 Demo](#-demo)
- [⚡ Características](#-características)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [📦 Instalación](#-instalación)
- [🔧 Configuración](#-configuración)
- [▶️ Uso](#️-uso)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🌐 Despliegue](#-despliegue)
- [🤝 Contribuir](#-contribuir)

## 🚀 Demo

**Backend API**: http://localhost:3001
**Frontend**: http://localhost:3000
**Health Check**: http://localhost:3001/health
**Test Database**: http://localhost:3001/api/test-db

## ⚡ Características

### ✅ Funcionalidades Implementadas
- 🛒 Carrito de compras funcional
- 📱 Selector de modelos iPhone (15, 14, 13)
- 🎨 Selector de colores (Negro, Azul, Rosa, Transparente)
- 💰 Cálculo automático de precios
- 📊 Panel lateral del carrito
- 📱 Diseño responsive
- 🗄️ Base de datos en la nube (Supabase)
- 🔌 API REST funcionando

### 🔄 Próximas Funcionalidades
- 💳 Sistema de pagos (Stripe)
- 📧 Checkout con formulario
- 👤 Autenticación de usuarios
- 📈 Panel de administración
- 📊 Analytics y reportes

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Node.js + Express
- **Base de Datos**: Supabase PostgreSQL
- **Autenticación**: JWT (próximamente)
- **Validación**: Joi
- **Documentación**: Swagger (próximamente)

### Frontend
- **Framework**: React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: React Hooks
- **Routing**: React Router (próximamente)
- **Formularios**: React Hook Form (próximamente)

### DevOps
- **Contenedores**: Docker (opcional)
- **CI/CD**: GitHub Actions (próximamente)
- **Hosting**: Vercel/Netlify ready

## 📦 Instalación

### Prerequisitos
- Node.js 16+ 
- npm 8+
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/dropshipping-iphone.git
cd dropshipping-iphone
```

### 2. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend
```bash
cd ../frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 🔧 Configuración

### 1. Configurar Variables de Entorno

**Backend (.env)**
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.xxx.supabase.co:5432/postgres
JWT_SECRET=tu-jwt-secret-muy-seguro
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```bash
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_tu_stripe_key
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un nuevo proyecto
3. Ve a Settings → Database
4. Copia la Connection String
5. Actualiza `DATABASE_URL` en backend/.env

### 3. Configurar Tailwind CSS

**tailwind.config.js**
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

## ▶️ Uso

### Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# o
node src/server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Producción

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
dropshipping-iphone/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores API
│   │   ├── middleware/      # Middlewares
│   │   ├── routes/          # Rutas API
│   │   ├── services/        # Lógica de negocio
│   │   └── server.js        # ✅ Servidor principal
│   ├── prisma/
│   │   └── schema.prisma    # ✅ Esquema base de datos
│   ├── package.json         # ✅ Dependencias backend
│   └── .env                 # ✅ Variables de entorno
├── frontend/
│   ├── public/
│   │   └── index.html       # ✅ HTML principal
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # APIs
│   │   ├── App.tsx          # ✅ Componente principal
│   │   ├── index.tsx        # ✅ Punto de entrada
│   │   └── index.css        # ✅ Estilos globales
│   ├── package.json         # ✅ Dependencias frontend
│   ├── tailwind.config.js   # ✅ Configuración Tailwind
│   └── .env                 # Variables de entorno
└── README.md                # ✅ Este archivo
```

## 🌐 Despliegue

### Vercel (Recomendado para Frontend)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar frontend
cd frontend
vercel

# Configurar variables de entorno en Vercel dashboard
```

### Railway (Recomendado para Backend)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Desplegar backend
cd backend
railway login
railway init
railway up
```

### Variables de Entorno en Producción

**Vercel:**
- `REACT_APP_API_URL=https://tu-backend.railway.app/api`

**Railway:**
- `DATABASE_URL=tu_supabase_url`
- `NODE_ENV=production`
- `FRONTEND_URL=https://tu-frontend.vercel.app`

## 🤝 Contribuir

### Guía de Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Roadmap

#### 🎯 Próximas Funcionalidades
- [ ] Sistema de pagos con Stripe
- [ ] Autenticación de usuarios
- [ ] Panel de administración
- [ ] Integración con proveedores
- [ ] Sistema de tracking
- [ ] Emails automáticos
- [ ] Analytics avanzados

#### 🐛 Bugs Conocidos
- [ ] Warnings de deprecación en desarrollo (no afectan funcionamiento)
- [ ] Tailwind warnings en VS Code (visual, no funcional)

## 📞 Soporte

Si tienes problemas:

1. **Revisa** que todos los archivos estén creados según la estructura
2. **Verifica** que las dependencias estén instaladas
3. **Confirma** que Supabase esté configurado correctamente
4. **Chequea** que ambos servidores (3000 y 3001) estén corriendo

### Comandos de Diagnóstico

```bash
# Verificar que el backend funciona
curl http://localhost:3001/health

# Verificar que la base de datos funciona
curl http://localhost:3001/api/test-db

# Verificar dependencias del frontend
cd frontend && npm ls

# Verificar dependencias del backend
cd backend && npm ls
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@ejemplo.com

---

⭐ ¡Dale una estrella al proyecto si te ha sido útil!

## 🔗 Enlaces Útiles

- [Documentación de React](https://reactjs.org/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Express](https://expressjs.com/)

---

**Estado del Proyecto**: 🟢 En desarrollo activo

**Versión**: 1.0.0

**Última actualización**: Julio 2025