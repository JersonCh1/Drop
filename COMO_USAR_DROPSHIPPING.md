# 🚀 Guía Completa: Sistema de Dropshipping

## 📋 Índice

1. [¿Qué es Dropshipping?](#qué-es-dropshipping)
2. [Cómo Funciona el Sistema](#cómo-funciona-el-sistema)
3. [Configuración Inicial](#configuración-inicial)
4. [Importar Productos](#importar-productos)
5. [Gestión de Proveedores](#gestión-de-proveedores)
6. [Flujo de Órdenes Automáticas](#flujo-de-órdenes-automáticas)
7. [API Endpoints](#api-endpoints)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## ¿Qué es Dropshipping?

**Dropshipping** es un modelo de negocio donde **NO manejas inventario**. Cuando un cliente compra en tu tienda:

1. **Cliente compra** en tu tienda online
2. **Tu tienda** envía la orden automáticamente al proveedor
3. **Proveedor** envía el producto directamente al cliente
4. **Tú ganas** la diferencia entre tu precio y el precio del proveedor

### Ventajas:
- ✅ **No necesitas inventario** - Sin costos de almacenamiento
- ✅ **Bajo riesgo** - Solo compras cuando vendes
- ✅ **Escalable** - Puedes vender miles de productos
- ✅ **Ubicación flexible** - Trabaja desde cualquier lugar

### Este Sistema Incluye:
- ✅ Importación automática desde AliExpress/CJ/Amazon
- ✅ Cálculo automático de precios y márgenes
- ✅ Creación automática de órdenes a proveedores
- ✅ Panel de administración completo
- ✅ Sincronización de stock y precios

---

## Cómo Funciona el Sistema

### Arquitectura del Sistema

```
┌─────────────────┐
│   TU CLIENTE    │
│  (Compra $30)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   TU TIENDA     │ ← Sistema Dropshipping
│ (Margen: 233%)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PROVEEDOR     │
│ (Costo: $9)     │
│  AliExpress/CJ  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   TU CLIENTE    │
│  (Recibe $30)   │
└─────────────────┘

GANANCIA: $21 por venta
```

### Flujo Completo

1. **Importas producto** desde AliExpress
   - URL: `https://aliexpress.com/item/123456`
   - Precio proveedor: $9
   - Margen: 233%
   - **Precio venta**: $29.99

2. **Cliente compra** en tu tienda
   - Ve el producto a $29.99
   - Completa checkout
   - Paga por WhatsApp/Yape/Stripe

3. **Sistema automático**:
   - Crea orden con el cliente
   - **Automáticamente** crea orden con el proveedor
   - Guarda información de tracking

4. **Tú recibes notificación**:
   - Email con datos de la orden
   - Panel admin muestra orden pendiente
   - Compras el producto en AliExpress ($9)
   - Pones dirección de tu cliente

5. **Proveedor envía**:
   - Directo a tu cliente
   - Tú actualizas tracking en el panel
   - Cliente recibe notificación

6. **¡Ganancias!**:
   - Cobraste: $29.99
   - Pagaste: $9.00
   - **Ganancia neta**: $20.99

---

## Configuración Inicial

### 1. Verificar Base de Datos

El sistema ya tiene todo configurado. Verifica que tienes:

```bash
cd backend
node prisma/seed.js
```

Esto crea:
- ✅ 3 proveedores (AliExpress, CJ Dropshipping, Alibaba)
- ✅ 4 categorías de productos
- ✅ 5 productos de ejemplo con info de dropshipping
- ✅ Usuario admin (admin@store.com / admin123)

### 2. Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 3. Acceder al Panel Admin

1. Abre: `http://localhost:3000`
2. Click en **"Admin"** en el header
3. Login:
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## Importar Productos

### Método 1: Desde el Panel Admin (Recomendado)

#### Paso 1: Ir a ProductImporter

1. Login en admin
2. Navega a **"Product Importer"** (si está en el dashboard)
3. O accede al componente desde tu código

#### Paso 2: Copiar URL del Producto

**AliExpress:**
```
https://www.aliexpress.com/item/1005005678901234.html
```

**CJ Dropshipping:**
```
https://www.cjdropshipping.com/product/123456
```

**Amazon:**
```
https://www.amazon.com/dp/B08N5WRWNW
```

#### Paso 3: Importar

1. **Pega la URL** en el campo "URL del Producto"
2. **Selecciona**:
   - Proveedor: AliExpress
   - Categoría: Carcasas iPhone
   - Margen: 200% (significa que cobrarás 3x el precio del proveedor)

3. Click **"Importar Producto"**

#### Paso 4: Revisar Datos

El sistema automáticamente extrae:
- ✅ Nombre del producto
- ✅ Descripción
- ✅ Precio del proveedor
- ✅ Imágenes (requiere revisión)
- ✅ Tiempo de envío

**Importante**:
- Edita la descripción para tu mercado
- Verifica el precio calculado
- Ajusta el margen si es necesario

#### Paso 5: Guardar

Click en **"Guardar Producto"** → ¡Listo! Ya está en tu catálogo.

### Método 2: API Directa

```bash
curl -X POST http://localhost:3001/api/suppliers/import-product \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.aliexpress.com/item/1005005678901234.html",
    "supplierId": "supplier_aliexpress",
    "categoryId": "cat_iphone_cases",
    "profitMargin": 200
  }'
```

---

## Gestión de Proveedores

### Ver Todos los Proveedores

```bash
GET /api/suppliers?active=true
Authorization: Bearer TOKEN
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "supplier_aliexpress",
      "name": "AliExpress",
      "slug": "aliexpress",
      "website": "https://www.aliexpress.com",
      "averageShippingDays": "15-30",
      "defaultShippingCost": 3.50,
      "rating": 4.5,
      "reliability": 85,
      "productsCount": 50,
      "ordersCount": 120
    }
  ]
}
```

### Crear Nuevo Proveedor

```bash
POST /api/suppliers
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Mi Proveedor Local",
  "slug": "proveedor-local",
  "description": "Proveedor local con envíos rápidos",
  "website": "https://miproveedor.com",
  "averageShippingDays": "5-10",
  "defaultShippingCost": 2.00,
  "defaultCommission": 0,
  "rating": 5.0,
  "reliability": 95
}
```

### Ver Productos de un Proveedor

```bash
GET /api/suppliers/supplier_aliexpress/products
Authorization: Bearer TOKEN
```

### Sincronizar Precios

```bash
POST /api/suppliers/sync-prices
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "supplierId": "supplier_aliexpress"
}
```

---

## Flujo de Órdenes Automáticas

### ¿Cómo Funciona?

Cuando un cliente crea una orden en tu tienda, el sistema **automáticamente**:

1. **Agrupa productos** por proveedor
2. **Crea órdenes separadas** para cada proveedor
3. **Calcula costos** (precio proveedor + envío)
4. **Intenta enviar automáticamente** si el proveedor tiene API
5. **Te notifica** para que hagas la compra manual

### Proceso Manual (Actual)

#### 1. Cliente Realiza Orden

Cliente compra en tu tienda → Orden `ORD-2025-001` creada

#### 2. Sistema Crea Orden con Proveedor

El sistema automáticamente crea:

```json
{
  "orderId": "ORD-2025-001",
  "supplierOrderId": null,
  "supplierId": "supplier_aliexpress",
  "status": "PENDING",
  "subtotal": 9.00,
  "shippingCost": 3.50,
  "total": 12.50,
  "items": [
    {
      "productName": "Carcasa Transparente iPhone 15",
      "quantity": 1,
      "supplierPrice": 9.00
    }
  ]
}
```

#### 3. Tú Recibes Notificación

**Email:**
```
Nueva Orden de Cliente: ORD-2025-001
Total cobrado: $29.99

ACCIÓN REQUERIDA:
1. Ve a AliExpress
2. Compra: Carcasa Transparente iPhone 15
3. Costo: $9.00 + $3.50 envío = $12.50
4. Dirección de envío:
   Juan Pérez
   Av. Principal 123
   Lima, 15001, Perú
   +51987654321
```

#### 4. Compras en AliExpress

1. Visita el link del producto guardado
2. Agregar al carrito
3. Checkout → **Poner dirección del CLIENTE**
4. Pagar $12.50
5. Copiar número de tracking

#### 5. Actualizas Tracking

**API:**
```bash
POST /api/suppliers/orders/SUPPLIER_ORDER_ID/tracking
Authorization: Bearer TOKEN

{
  "trackingNumber": "LY123456789CN",
  "carrier": "China Post",
  "trackingUrl": "https://track.aliexpress.com/LY123456789CN"
}
```

**O desde Panel Admin:**
- Encuentra la orden
- Click "Update Tracking"
- Pega número de tracking
- Automáticamente actualiza orden del cliente

#### 6. Cliente Recibe Notificación

```
¡Tu orden está en camino!

Número de tracking: LY123456789CN
Transportista: China Post
Tiempo estimado: 15-30 días

Rastrea tu paquete:
https://track.aliexpress.com/LY123456789CN
```

### Ver Órdenes Pendientes

```bash
GET /api/suppliers/orders/pending
Authorization: Bearer TOKEN
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "so_001",
      "supplier": {
        "name": "AliExpress",
        "website": "https://www.aliexpress.com"
      },
      "order": {
        "orderNumber": "ORD-2025-001",
        "customerEmail": "cliente@email.com",
        "shippingAddress": "Av. Principal 123, Lima"
      },
      "total": 12.50,
      "status": "PENDING",
      "items": [...]
    }
  ]
}
```

---

## API Endpoints

### Proveedores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/suppliers` | Listar proveedores |
| GET | `/api/suppliers/:id` | Ver proveedor específico |
| POST | `/api/suppliers` | Crear proveedor |
| PUT | `/api/suppliers/:id` | Actualizar proveedor |
| DELETE | `/api/suppliers/:id` | Desactivar proveedor |
| GET | `/api/suppliers/:id/products` | Productos del proveedor |
| GET | `/api/suppliers/:id/stats` | Estadísticas del proveedor |

### Importación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/suppliers/import-product` | Importar desde URL |
| POST | `/api/suppliers/sync-prices` | Sincronizar precios |

### Órdenes de Proveedores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/suppliers/orders/pending` | Órdenes pendientes |
| POST | `/api/suppliers/orders/:id/tracking` | Actualizar tracking |
| POST | `/api/suppliers/orders/:id/delivered` | Marcar como entregada |
| POST | `/api/suppliers/orders/:id/cancel` | Cancelar orden |
| POST | `/api/suppliers/orders/:id/sync` | Sincronizar estado |

---

## Preguntas Frecuentes

### ¿Cómo calculo el margen correcto?

**Fórmula:**
```
Precio Venta = Precio Proveedor × (1 + Margen/100)

Ejemplos:
- Margen 100% → Precio x2 (ej: $10 → $20)
- Margen 200% → Precio x3 (ej: $10 → $30)
- Margen 50% → Precio x1.5 (ej: $10 → $15)
```

**Recomendaciones para Perú:**
- Productos baratos ($5-15): **200-300%** margen
- Productos medios ($15-50): **150-200%** margen
- Productos caros ($50+): **100-150%** margen

### ¿Qué pasa si el precio del proveedor sube?

El sistema guarda `supplierPrice` y `profitMargin` por separado.

Puedes:
1. Sincronizar precios: `POST /api/suppliers/sync-prices`
2. El sistema recalcula automáticamente
3. Recibes notificación de cambios

### ¿Puedo automatizar completamente?

**Actualmente**: Semi-automático
- ✅ Importación de productos
- ✅ Creación de órdenes con proveedores
- ⏸️ Compra en proveedor (manual)
- ✅ Tracking y notificaciones

**Próximamente**: Integración con APIs
- AliExpress Dropshipping API
- CJ Dropshipping API
- Automatización 100%

### ¿Cómo manejo devoluciones?

1. Cliente pide devolución
2. Contactas al proveedor
3. Proveedor maneja devolución
4. Reembolsas al cliente
5. Cancelas orden: `POST /api/suppliers/orders/:id/cancel`

### ¿Qué proveedores recomiendas?

**Para Perú:**

1. **AliExpress**
   - ✅ Más productos
   - ✅ Precios bajos
   - ❌ Envío lento (15-30 días)
   - ✅ Mejor para: Accesorios baratos

2. **CJ Dropshipping**
   - ✅ Envío más rápido (10-20 días)
   - ✅ Mejor calidad
   - ❌ Precios más altos
   - ✅ Mejor para: Productos premium

3. **Alibaba**
   - ✅ Volumen alto
   - ✅ Precios mayoristas
   - ❌ MOQ (cantidad mínima)
   - ✅ Mejor para: Escalar negocio

### ¿Cómo agrego más proveedores?

```bash
POST /api/suppliers
Authorization: Bearer TOKEN

{
  "name": "Nuevo Proveedor",
  "slug": "nuevo-proveedor",
  "website": "https://...",
  "averageShippingDays": "10-15",
  "defaultShippingCost": 5.00,
  "rating": 4.0,
  "reliability": 90
}
```

### ¿Puedo usar mi proveedor local?

¡Sí! Agrega un proveedor con:
- `averageShippingDays`: "3-5"
- `defaultShippingCost`: 2.00
- `website`: "https://miproveedor.com"

---

## Resumen

### Lo que tienes:
✅ Sistema completo de dropshipping
✅ Importación desde AliExpress/CJ/Amazon
✅ Cálculo automático de precios
✅ Creación automática de órdenes a proveedores
✅ Panel de administración completo
✅ 3 proveedores pre-configurados
✅ 5 productos de ejemplo

### Próximos pasos:
1. ✅ **Importar productos reales** desde AliExpress
2. ✅ **Configurar márgenes** según tu mercado
3. ✅ **Hacer primera venta** de prueba
4. ✅ **Proceso manual** de compra en proveedor
5. ✅ **Escalar** agregando más productos
6. 🔄 **Automatizar** con APIs (futuro)

### Recursos:
- 📚 [AliExpress](https://www.aliexpress.com)
- 📚 [CJ Dropshipping](https://www.cjdropshipping.com)
- 📚 [Panel Admin](http://localhost:3000/admin)
- 📚 [API Docs](./README.md)

---

**¿Preguntas?** Revisa el código en:
- Backend: `backend/src/services/productImporter.js`
- Backend: `backend/src/services/supplierOrderService.js`
- Backend: `backend/src/routes/suppliers.js`
- Frontend: `frontend/src/components/admin/ProductImporter.tsx`

**¡Éxito con tu negocio de dropshipping!** 🚀
