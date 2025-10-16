# 📱 Dropshipping iPhone Store

Plataforma e-commerce completa para venta de carcasas y accesorios de iPhone con panel de administración integrado.

## 🚀 Tecnologías

### Frontend
- **React 18** + TypeScript
- **React Router** - Navegación
- **TailwindCSS** - Estilos
- **Axios** - Peticiones HTTP
- **React Query** - Cache de datos
- **React Hot Toast** - Notificaciones
- **Stripe Elements** - Pagos (opcional)

### Backend
- **Node.js** + Express
- **Prisma ORM** - Base de datos
- **SQLite** - Base de datos (desarrollo)
- **bcryptjs** - Hash de contraseñas

## 📦 Instalación

### 1. Clonar e instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Configurar base de datos

```bash
cd backend
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 3. Variables de entorno

**Backend (.env):**
```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=tu_clave_stripe_opcional
```

### 4. Iniciar servidores

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🔐 Acceso Admin

- **URL:** http://localhost:3000
- **Usuario:** admin
- **Contraseña:** admin123

## ✨ Características

### Cliente
- ✅ Catálogo de productos con filtros
- ✅ Detalle de producto con variantes (colores)
- ✅ Carrito de compras persistente
- ✅ Checkout con información de envío
- ✅ Seguimiento de órdenes por número
- ✅ WhatsApp integrado para soporte
- ✅ Responsive design completo

### Admin Panel
- ✅ Dashboard con estadísticas
- ✅ Gestión de productos (CRUD completo)
- ✅ **Upload de imágenes con Unsplash**
- ✅ Gestión de órdenes
- ✅ Ver detalles completos del cliente
- ✅ Contacto directo por WhatsApp
- ✅ UI moderna con tabs

## 📁 Estructura del Proyecto

```
dropshipping-iphone/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Schema de base de datos
│   │   └── seed.js            # Datos de ejemplo
│   ├── src/
│   │   ├── routes/            # [No usado - TODO: limpiar]
│   │   ├── services/          # Servicios (email, analytics)
│   │   └── utils/
│   └── server-simple.js       # ⭐ Servidor principal
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/        # Panel admin
│   │   │   ├── cart/         # Carrito
│   │   │   ├── checkout/     # Checkout
│   │   │   ├── layout/       # Header/Footer
│   │   │   ├── products/     # Productos
│   │   │   └── tracking/     # Seguimiento
│   │   ├── context/          # Context API
│   │   ├── pages/            # Páginas principales
│   │   ├── services/         # API services
│   │   └── App.tsx           # ⭐ App principal
│   └── public/
└── README.md
```

## 🎨 Upload de Imágenes

El sistema soporta 2 métodos para agregar imágenes:

1. **URL Manual** - Pega cualquier URL de imagen (Imgur, Unsplash, etc)
2. **Unsplash Automático** - Genera imagen basada en el nombre del producto

### Ejemplo en Admin:
```
1. Click en "Crear Producto"
2. Llenar nombre y detalles
3. Scroll a "Imagen del Producto"
4. Option A: Pegar URL → Click "Vista Previa"
5. Option B: Click "Usar Unsplash Automático"
6. Guardar producto
```

## 🔧 API Endpoints

### Productos
```
GET    /api/products           # Listar productos
GET    /api/products/:slug     # Detalle de producto
POST   /api/products           # Crear producto (ADMIN)
PUT    /api/products/:id       # Actualizar producto (ADMIN)
DELETE /api/products/:id       # Desactivar producto (ADMIN)
POST   /api/products/:id/images # Agregar imagen (ADMIN)
DELETE /api/products/:productId/images/:imageId # Eliminar imagen (ADMIN)
```

### Órdenes
```
GET    /api/orders             # Listar órdenes (ADMIN)
GET    /api/orders/:orderNumber # Tracking público
POST   /api/orders             # Crear orden
PUT    /api/orders/:id/status  # Actualizar estado (ADMIN)
```

### Admin
```
POST   /api/admin/login        # Login admin
```

## 🗄️ Modelos de Datos

### Product
- name, slug, description
- basePrice, stockCount
- brand, model, compatibility
- isFeatured, isActive, inStock

### ProductImage
- url, altText, position
- isMain (imagen principal)

### ProductVariant
- name, color, size
- price, sku, stockQuantity

### Order
- orderNumber, status
- customerInfo (nombre, email, teléfono)
- shippingAddress (dirección completa)
- paymentInfo (método, estado)
- trackingNumber

## 🚀 Despliegue

### Producción
1. Cambiar DATABASE_URL a PostgreSQL/MySQL
2. Configurar variables de entorno
3. Build del frontend: `npm run build`
4. Servir con Nginx/Apache

### Recomendaciones
- Usar Railway/Vercel para backend
- Usar Vercel/Netlify para frontend
- Migrar a PostgreSQL en producción
- Configurar dominio personalizado
- Habilitar HTTPS

## 🐛 Solución de Problemas

### Error: EADDRINUSE Port 3001
```bash
# Matar proceso en puerto 3001
npx kill-port 3001
```

### Error: Prisma Client not generated
```bash
cd backend
npx prisma generate
```

### Error: Foreign key constraint
```bash
cd backend
npx prisma db push --force-reset
node prisma/seed.js
```

## 📈 Mejoras Futuras

- [ ] Sistema de cupones/descuentos
- [ ] Reviews y ratings de productos
- [ ] Múltiples imágenes por producto
- [ ] Integración completa con Stripe
- [ ] Notificaciones por email
- [ ] Panel de analytics avanzado
- [ ] Exportar órdenes a CSV/Excel
- [ ] Sistema de inventario con alertas
- [ ] Búsqueda avanzada con Elasticsearch

## 📄 Licencia

MIT

## 👨‍💻 Desarrollador

Proyecto desarrollado para dropshipping de accesorios iPhone.

---

**Última actualización:** Octubre 2025
