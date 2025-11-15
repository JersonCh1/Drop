# 👥 GUÍA DEL PANEL DE ADMINISTRACIÓN

## 🎉 Nuevas Funcionalidades Agregadas

### 1. 🗑️ Eliminar Órdenes

Ahora puedes eliminar órdenes directamente desde el panel admin.

**Cómo usar:**
1. Ve a: https://drop-seven-pi.vercel.app/admin
2. Login con `admin` / `admin123`
3. Click en la tab **"Órdenes"**
4. En la tabla de órdenes, verás un botón **"🗑️ Eliminar"** en cada fila
5. Click en el botón → Confirma la eliminación
6. ✅ La orden se eliminará de la base de datos

**Endpoint Backend:**
```
DELETE /api/orders/:id
Headers: Authorization: Bearer {admin-token}
```

---

### 2. 👥 Gestión Completa de Usuarios

Nueva tab "Usuarios" en el admin panel para gestionar todos los usuarios registrados.

**Funcionalidades:**

#### Ver Todos los Usuarios
- Lista completa de usuarios con:
  - Nombre completo
  - Email
  - Teléfono
  - Rol (ADMIN/CUSTOMER)
  - Estado (Activo/Inactivo)
  - Fecha de registro

#### Buscar Usuarios
- Buscar por nombre o email
- Filtrar por rol (ADMIN/CUSTOMER)
- Búsqueda en tiempo real

#### Editar Usuario
1. Click en **"✏️ Editar"**
2. Modal con formulario para editar:
   - Nombre
   - Apellido
   - Email
   - Teléfono
   - Rol (ADMIN/CUSTOMER)
   - Estado (Activo/Inactivo)
3. **Guardar Cambios**

#### Eliminar Usuario
1. Click en **"🗑️ Eliminar"**
2. Confirmar eliminación
3. ✅ Usuario eliminado de la base de datos

**Protección:** No puedes eliminar tu propia cuenta de admin.

#### Resetear Contraseña
1. Click en **"🔑 Reset"**
2. Ingresa nueva contraseña (mínimo 6 caracteres)
3. ✅ Contraseña actualizada

---

## 📍 Ubicación en el Panel

```
Panel Admin
├── 📊 Analytics (Dashboard)
├── 📦 Órdenes ← 🗑️ Eliminar órdenes aquí
├── 🏷️ Productos
├── 📥 Importar
└── 👥 Usuarios ← ✨ NUEVA TAB
```

---

## 🔐 Endpoints del Backend

### Órdenes

```javascript
// Eliminar orden
DELETE /api/orders/:id
Headers: { Authorization: 'Bearer {admin-token}' }
```

### Usuarios

```javascript
// Listar todos los usuarios
GET /api/auth/admin/users
Query: ?search=texto&role=ADMIN|CUSTOMER&page=1&limit=50
Headers: { Authorization: 'Bearer {admin-token}' }

// Ver detalles de un usuario
GET /api/auth/admin/users/:id
Headers: { Authorization: 'Bearer {admin-token}' }

// Editar usuario
PATCH /api/auth/admin/users/:id
Headers: { Authorization: 'Bearer {admin-token}' }
Body: {
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  role: 'ADMIN' | 'CUSTOMER',
  isActive: boolean
}

// Eliminar usuario
DELETE /api/auth/admin/users/:id
Headers: { Authorization: 'Bearer {admin-token}' }

// Resetear contraseña
POST /api/auth/admin/users/:id/reset-password
Headers: { Authorization: 'Bearer {admin-token}' }
Body: { newPassword: string }
```

---

## 💡 Casos de Uso

### Limpiar Órdenes de Prueba

Si tienes órdenes de prueba que quieres eliminar:

1. Ve a Admin → **Órdenes**
2. Identifica las órdenes de prueba
3. Click en **"🗑️ Eliminar"** en cada una
4. Confirma
5. ✅ Base de datos limpia

### Ver Todos los Usuarios Registrados

1. Ve a Admin → **Usuarios**
2. Verás la lista completa de usuarios
3. Puedes filtrar por:
   - **Rol:** Administradores o Clientes
   - **Búsqueda:** Por nombre o email

### Cambiar Rol de Usuario (Customer → Admin)

1. Admin → **Usuarios**
2. Busca el usuario
3. Click en **"✏️ Editar"**
4. Cambia el **Rol** de "CUSTOMER" a "ADMIN"
5. **Guardar Cambios**
6. ✅ El usuario ahora es administrador

### Desactivar un Usuario Sin Eliminarlo

1. Admin → **Usuarios**
2. Click en **"✏️ Editar"**
3. Desmarcar checkbox **"Usuario activo"**
4. **Guardar Cambios**
5. ✅ Usuario desactivado (no puede login)

### Resetear Contraseña de Cliente

Si un cliente olvidó su contraseña:

1. Admin → **Usuarios**
2. Buscar el cliente
3. Click en **"🔑 Reset"**
4. Ingresar nueva contraseña
5. ✅ Enviar la nueva contraseña al cliente

---

## 🎨 Interfaz de Usuario

### Vista de Órdenes
```
┌────────────────────────────────────────────────────┐
│ Orden        │ Cliente  │ Email  │ Total │ Acciones│
├────────────────────────────────────────────────────┤
│ ORD-12345    │ Juan P.  │ j@.com │ $45.99│ Ver     │
│              │          │        │       │ 🗑️ Eliminar│
└────────────────────────────────────────────────────┘
```

### Vista de Usuarios
```
┌──────────────────────────────────────────────────────────────┐
│ Usuario    │ Email    │ Rol     │ Estado │ Acciones         │
├──────────────────────────────────────────────────────────────┤
│ Admin User │ admin@.. │ ADMIN   │ Activo │ ✏️ &#55357;&#56593; 🗑️           │
│ Juan Pérez │ juan@..  │ CUSTOMER│ Activo │ ✏️ 🔑 🗑️           │
└──────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Consideraciones de Seguridad

1. **Solo usuarios ADMIN** pueden acceder a estas funcionalidades
2. **Validación de token JWT** en cada request
3. **No puedes eliminar tu propia cuenta** de admin
4. **Confirmación obligatoria** antes de eliminar
5. **Logs en backend** de todas las acciones

---

## 🧪 Testing

### Test de Eliminar Orden

```javascript
// Desde la consola del navegador
fetch('https://drop-production-cd2b.up.railway.app/api/orders/{orderId}', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer {tu-token-admin}'
  }
})
.then(r => r.json())
.then(d => console.log(d));
```

### Test de Listar Usuarios

```javascript
fetch('https://drop-production-cd2b.up.railway.app/api/auth/admin/users', {
  headers: {
    'Authorization': 'Bearer {tu-token-admin}'
  }
})
.then(r => r.json())
.then(d => console.log('Usuarios:', d.data));
```

---

## 📊 Respuestas de la API

### Eliminar Orden (Éxito)
```json
{
  "success": true,
  "message": "Orden eliminada correctamente",
  "deletedOrder": {
    "id": "cm3xxx",
    "orderNumber": "ORD-12345",
    "total": 45.99
  }
}
```

### Listar Usuarios (Éxito)
```json
{
  "success": true,
  "data": [
    {
      "id": "cm3xxx",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "phone": "51987654321",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2025-11-14T...",
      "updatedAt": "2025-11-14T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 5,
    "pages": 1
  }
}
```

---

## 🚀 Deployment

Los cambios ya están desplegados en producción:

- ✅ Backend: https://drop-production-cd2b.up.railway.app
- ✅ Frontend: https://drop-seven-pi.vercel.app/admin

Para usar las nuevas funcionalidades, simplemente recarga el admin panel y verás la nueva tab "Usuarios" y los botones de eliminar en órdenes.

---

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que estés logueado como ADMIN
2. Revisa la consola del navegador (F12)
3. Verifica que el backend esté funcionando: https://drop-production-cd2b.up.railway.app/health

---

**Última actualización:** 2025-11-14
**Versión:** 2.1.0
