# ☁️ CONFIGURACIÓN DE CLOUDINARY

## 🎯 ¿Para qué sirve Cloudinary?

Cloudinary es un servicio de hosting de imágenes que:
- ✅ Almacena imágenes de productos
- ✅ Optimiza automáticamente las imágenes (compresión, formato)
- ✅ Provee URLs rápidas con CDN global
- ✅ Redimensiona imágenes on-the-fly
- ✅ Plan gratuito: 25GB almacenamiento + 25GB bandwidth/mes

## 📝 Pasos para Configurar

### 1. Crear Cuenta en Cloudinary

1. Ve a: https://cloudinary.com/users/register/free
2. Regístrate con email (GRATIS)
3. Verifica tu email

### 2. Obtener Credenciales

Después de login, ve al **Dashboard**: https://console.cloudinary.com/

Verás tus credenciales:
```
Cloud Name: dxxxxxxxxx
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWx
```

### 3. Configurar Backend (.env)

Agrega estas variables a `backend/.env`:

```env
# Cloudinary - Hosting de imágenes
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

**Ejemplo:**
```env
CLOUDINARY_CLOUD_NAME=drop-iphone-store
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWx
```

### 4. Configurar en Railway

1. Ve a tu proyecto en Railway: https://railway.app
2. Selecciona tu servicio de Backend
3. Ve a **Variables**
4. Agrega las 3 variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

5. Railway se reiniciará automáticamente

### 5. Verificar Funcionamiento

Reinicia el backend local:
```bash
cd backend
npm start
```

Deberías ver:
```
✅ Cloudinary configurado
📸 Cloud Name: tu_cloud_name
```

## 🧪 Test de Subida de Imagen

Puedes probar subir una imagen con este código:

```javascript
// Test en Node.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'tu_cloud_name',
  api_key: 'tu_api_key',
  api_secret: 'tu_api_secret'
});

// Subir desde URL
cloudinary.uploader.upload('https://ejemplo.com/imagen.jpg', {
  folder: 'products'
}).then(result => {
  console.log('✅ Imagen subida:', result.secure_url);
});
```

## 📁 Estructura de Carpetas en Cloudinary

El proyecto usa estas carpetas:
- `/products` - Imágenes de productos
- `/categories` - Imágenes de categorías
- `/banners` - Banners promocionales
- `/reviews` - Imágenes de reviews de clientes

## 🚀 URLs de Imágenes

Cloudinary genera URLs optimizadas:

**Original:**
```
https://res.cloudinary.com/tu_cloud_name/image/upload/v1234567890/products/iphone-case-1.jpg
```

**Optimizada (300x300, auto-format, auto-quality):**
```
https://res.cloudinary.com/tu_cloud_name/image/upload/c_fill,w_300,h_300,f_auto,q_auto/products/iphone-case-1.jpg
```

## 💡 Ventajas

1. **Gratis hasta 25GB** - Suficiente para cientos de productos
2. **CDN Global** - Imágenes rápidas en todo el mundo
3. **Optimización automática** - Reduce peso sin perder calidad
4. **Backup automático** - No pierdes imágenes
5. **Transformaciones** - Redimensiona al vuelo sin código

## ⚠️ Límites del Plan Gratuito

- ✅ 25GB almacenamiento
- ✅ 25GB bandwidth/mes
- ✅ 25,000 transformaciones/mes
- ✅ CDN incluido
- ❌ Sin marca de agua
- ❌ Sin soporte prioritario

Para una tienda pequeña/mediana esto es **MÁS que suficiente**.

## 🔗 Links Útiles

- Dashboard: https://console.cloudinary.com/
- Documentación: https://cloudinary.com/documentation
- Pricing: https://cloudinary.com/pricing
- Upload Widget: https://cloudinary.com/documentation/upload_widget

---

**Última actualización:** 2025-11-14
