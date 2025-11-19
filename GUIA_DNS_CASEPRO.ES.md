# 🌐 GUÍA COMPLETA: CONFIGURAR DNS PARA CASEPRO.ES

## 📌 INFORMACIÓN DE TU CONFIGURACIÓN

- **Dominio**: `casepro.es` (Hostinger)
- **Frontend**: Vercel → `flashfunded-frontend.vercel.app`
- **Backend**: Railway → `drop-production-cd2b.up.railway.app`
- **Objetivo**: Hacer que `casepro.es` apunte a tu tienda en Vercel

---

## ⚡ CONFIGURACIÓN EN 3 PASOS (20 MINUTOS)

### 🔵 PASO 1: CONFIGURAR DNS EN HOSTINGER

#### 1.1 Acceder al Panel de Hostinger

1. Ve a: https://hpanel.hostinger.com
2. Inicia sesión con tu cuenta
3. En el menú lateral izquierdo, haz click en **"Dominios"**
4. Selecciona tu dominio **`casepro.es`**
5. Haz click en **"DNS / Nameservers"** o **"Gestionar DNS"**

#### 1.2 Limpiar Registros Existentes

**⚠️ IMPORTANTE**: Antes de agregar nuevos registros, elimina:

- Todos los registros **A** que apunten a `@` o vacío
- Todos los registros **CNAME** que sean `www`

#### 1.3 Agregar Nuevos Registros DNS

**⚡ REGISTROS ACTUALIZADOS (Recomendados por Vercel 2025)**

**Registro 1: A Record (Dominio raíz)**

```
Tipo:       A
Nombre:     @ (o vacío, o "casepro.es")
Contenido:  216.198.79.1
TTL:        3600 (automático)
```

**Registro 2: CNAME (Subdomain www)**

```
Tipo:       CNAME
Nombre:     www
Contenido:  f627e1903ce284e0.vercel-dns-017.com.
TTL:        3600 (automático)
```

**Nota**: Los registros antiguos (`76.76.21.21` y `cname.vercel-dns.com`) siguen funcionando, pero Vercel recomienda usar los nuevos.

#### 1.4 Resultado Final

Tu tabla de DNS debe verse así:

```
┌────────────────────────────────────────────────────────────────┐
│ Tipo    │ Nombre  │ Apunta a                                   │
├────────────────────────────────────────────────────────────────┤
│ A       │ @       │ 216.198.79.1                               │
│ CNAME   │ www     │ f627e1903ce284e0.vercel-dns-017.com.       │
└────────────────────────────────────────────────────────────────┘
```

#### 1.5 Guardar

- Haz click en **"Guardar"** o **"Save"**
- Espera la confirmación
- ✅ DNS configurado en Hostinger

---

### 🟢 PASO 2: AGREGAR DOMINIO EN VERCEL

#### 2.1 Acceder a Vercel

1. Ve a: https://vercel.com/dashboard
2. Inicia sesión con tu cuenta
3. Busca y selecciona tu proyecto: **`flashfunded-frontend`**
4. Haz click en **"Settings"** (en la barra superior)
5. En el menú lateral, haz click en **"Domains"**

#### 2.2 Agregar casepro.es

1. En el campo **"Domain"**, escribe: `casepro.es`
2. Haz click en **"Add"**
3. Vercel mostrará instrucciones de DNS
4. Como ya configuraste DNS en Hostinger, solo espera

**Estado esperado**: Vercel mostrará algo como:
- ⏳ `casepro.es` - **Pending DNS verification**

#### 2.3 Agregar www.casepro.es

1. Haz click en **"Add Domain"** nuevamente
2. Escribe: `www.casepro.es`
3. Haz click en **"Add"**
4. Vercel preguntará sobre redirección:

**Opciones:**
- ✅ **Opción A (Recomendada)**: `www.casepro.es` → `casepro.es`
- ⭕ Opción B: `casepro.es` → `www.casepro.es`

5. Selecciona **Opción A** (redirigir www a dominio sin www)

#### 2.4 Verificar

En la sección **Domains**, deberías ver:

```
✅ casepro.es                    (Production)
✅ www.casepro.es                → casepro.es (Redirect)
✅ flashfunded-frontend.vercel.app (Previous deployment)
```

---

### 🟣 PASO 3: ACTUALIZAR VARIABLES DE ENTORNO

#### 3.1 Actualizar Variables en Vercel (Frontend)

1. En tu proyecto de Vercel, ve a: **Settings → Environment Variables**
2. Busca o **agrega** las siguientes variables:

**Variables a configurar:**

```env
REACT_APP_STORE_URL=https://casepro.es
REACT_APP_STORE_NAME=CASEPRO España
REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api
REACT_APP_WHATSAPP_NUMBER=51917780708
```

3. **IMPORTANTE**: Aplica a:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Haz click en **"Save"**

#### 3.2 Actualizar Variables en Railway (Backend)

1. Ve a: https://railway.app
2. Selecciona tu proyecto backend
3. Haz click en **"Variables"** o **"Environment Variables"**
4. Agrega o actualiza:

```env
NODE_ENV=production
FRONTEND_URL=https://casepro.es
ALLOWED_ORIGINS=https://casepro.es,https://www.casepro.es,https://flashfunded-frontend.vercel.app
BACKEND_URL=https://drop-production-cd2b.up.railway.app
```

5. Haz click en **"Save"** o **"Deploy"**

#### 3.3 Redeploy de Aplicaciones

**En Vercel:**

1. Ve a la pestaña **"Deployments"**
2. Busca el último deployment
3. Haz click en los **3 puntos** (...) al lado
4. Selecciona **"Redeploy"**
5. Confirma

**En Railway:**

- El redeploy es automático al guardar variables
- Espera 2-3 minutos para que complete

---

## ⏱️ TIEMPO DE PROPAGACIÓN DNS

### ¿Cuánto tarda?

- **Mínimo**: 10-30 minutos
- **Normal**: 2-4 horas
- **Máximo**: 24-48 horas

### SSL Certificate (HTTPS)

- Vercel genera automáticamente el certificado SSL
- Listo en **1-5 minutos** después de verificar DNS

---

## ✅ VERIFICACIÓN Y TESTING

### 1. Verificar Propagación de DNS

**Herramienta online:**

1. Ve a: https://dnschecker.org
2. Escribe: `casepro.es`
3. Selecciona tipo: **A**
4. Haz click en **"Search"**
5. **Debe mostrar**: `216.198.79.1` en varios países ✅

**Verificar también www:**

1. En la misma página, escribe: `www.casepro.es`
2. Selecciona tipo: **CNAME**
3. **Debe mostrar**: `f627e1903ce284e0.vercel-dns-017.com.` ✅

**Nota**: Si todavía ves los registros antiguos (`76.76.21.21` o `cname.vercel-dns.com`), también funcionan correctamente.

### 2. Probar el Sitio Web

**Después de la propagación DNS:**

1. Abre tu navegador **en modo incógnito** (Ctrl + Shift + N)
2. Ve a: `https://casepro.es`
3. ✅ **Debe cargar**: Tu tienda CASEPRO
4. Ve a: `https://www.casepro.es`
5. ✅ **Debe redirigir**: A `casepro.es`

### 3. Verificar HTTPS (Candado Verde)

1. En la barra de direcciones, busca el **candado** 🔒
2. Haz click en el candado
3. ✅ **Debe decir**: "Conexión segura"
4. ✅ **Certificado**: Válido y emitido por Vercel

### 4. Probar Funcionalidades

Verifica que todo funcione:

- ✅ Ver productos
- ✅ Agregar productos al carrito
- ✅ Proceso de checkout
- ✅ Rastrear órdenes
- ✅ Panel de administración (`/admin`)

---

## 🔧 TROUBLESHOOTING

### Problema 1: "Domain Not Found" en Vercel

**Causa**: DNS no ha propagado todavía

**Solución**:
1. Espera **30-60 minutos** más
2. Verifica DNS en https://dnschecker.org
3. En Vercel, haz click en **"Refresh"** en la sección Domains
4. Si después de 4 horas sigue igual, verifica registros DNS en Hostinger

### Problema 2: "SSL Error" o "Not Secure"

**Causa**: Certificado SSL en proceso o no generado

**Solución**:
1. Espera **5-10 minutos** más
2. Vercel genera SSL automáticamente
3. Borra caché del navegador:
   - Chrome: `Ctrl + Shift + Del` → Borrar todo
4. Intenta en modo incógnito
5. Si persiste, en Vercel → Settings → Domains → Click en "Renew Certificate"

### Problema 3: DNS No Propaga

**Causa**: Registros DNS incorrectos o duplicados

**Solución**:
1. Ve a Hostinger → DNS
2. Verifica que los registros estén **exactos**:
   - A: `@` → `216.198.79.1` (nuevo) o `76.76.21.21` (antiguo, también válido)
   - CNAME: `www` → `f627e1903ce284e0.vercel-dns-017.com.` (nuevo) o `cname.vercel-dns.com` (antiguo, también válido)
3. **Elimina** registros duplicados o conflictivos
4. Guarda y espera **1-2 horas**

### Problema 4: Sitio Carga Pero API Falla

**Causa**: Variables de entorno incorrectas o CORS

**Solución**:
1. Verifica `REACT_APP_API_URL` en Vercel:
   - Debe ser: `https://drop-production-cd2b.up.railway.app/api`
2. Verifica `ALLOWED_ORIGINS` en Railway:
   - Debe incluir: `https://casepro.es,https://www.casepro.es`
3. Redeploy en **ambos** servicios
4. Espera 2-3 minutos y prueba de nuevo

### Problema 5: "Too Many Redirects"

**Causa**: Configuración de redirección circular

**Solución**:
1. En Vercel → Domains:
   - Solo **UNO** debe ser "Production"
   - El otro debe ser "Redirect"
2. Elimina reglas de redirect conflictivas en Hostinger
3. Borra caché del navegador completamente

### Problema 6: Página 404 en Rutas

**Causa**: Configuración de rewrites en Vercel

**Solución**:
1. Verifica que `vercel.json` existe en `/frontend/`
2. Si no existe, créalo con este contenido:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

3. Commit y push a GitHub
4. Espera el redeploy automático

---

## 📊 CHECKLIST COMPLETO

### En Hostinger ✅

- [ ] Accedido al panel de DNS
- [ ] Eliminados registros A y CNAME antiguos
- [ ] Agregado A Record: `@` → `76.76.21.21`
- [ ] Agregado CNAME: `www` → `cname.vercel-dns.com`
- [ ] Guardado y sin registros duplicados
- [ ] Verificado en dnschecker.org

### En Vercel ✅

- [ ] Dominio `casepro.es` agregado
- [ ] Dominio `www.casepro.es` agregado (redirect a casepro.es)
- [ ] Variables de entorno actualizadas
- [ ] Aplicadas a Production, Preview y Development
- [ ] Redeployado después de cambios
- [ ] SSL activo (candado verde en navegador)

### En Railway ✅

- [ ] `FRONTEND_URL` = `https://casepro.es`
- [ ] `ALLOWED_ORIGINS` incluye `casepro.es` y `www.casepro.es`
- [ ] `BACKEND_URL` correcto
- [ ] Variables guardadas
- [ ] Redeployado (automático)

### Verificación Final ✅

- [ ] `https://casepro.es` carga correctamente
- [ ] `https://www.casepro.es` redirige a `casepro.es`
- [ ] SSL activo (HTTPS con candado verde)
- [ ] dnschecker.org muestra DNS correcto
- [ ] Productos se ven correctamente
- [ ] Carrito funciona
- [ ] Checkout funciona
- [ ] Panel admin accesible (`/admin`)

---

## 🎯 COMANDOS DE VERIFICACIÓN RÁPIDA

### Verificar DNS desde Terminal (Opcional)

**Windows:**

```bash
nslookup casepro.es
nslookup www.casepro.es
```

**Linux/Mac:**

```bash
dig casepro.es
dig www.casepro.es
```

**Resultado esperado:**

```
casepro.es → 216.198.79.1
www.casepro.es → f627e1903ce284e0.vercel-dns-017.com.
```

---

## 📞 SOPORTE

### Hostinger Support

- **Chat en vivo**: https://hpanel.hostinger.com
- **Email**: support@hostinger.com
- **Horario**: 24/7 en español
- **Documentación**: https://support.hostinger.com

### Vercel Support

- **Documentación**: https://vercel.com/docs
- **Discord**: https://vercel.com/discord
- **Twitter**: @vercel
- **Status**: https://vercel-status.com

### Railway Support

- **Documentación**: https://docs.railway.app
- **Discord**: https://discord.gg/railway
- **Twitter**: @Railway
- **Status**: https://status.railway.app

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DE CONFIGURAR

Una vez que tu dominio esté activo:

### 1. Actualizar Redes Sociales

- Instagram bio → `casepro.es`
- Facebook link → `casepro.es`
- WhatsApp catálogo → `casepro.es`
- TikTok bio → `casepro.es`

### 2. Google My Business

- Crear perfil con `casepro.es`
- Aparecer en Google Maps
- Conseguir primeras reviews

### 3. Google Search Console

1. Ve a: https://search.google.com/search-console
2. Agregar propiedad: `casepro.es`
3. Verificar con DNS TXT o archivo HTML
4. Enviar sitemap: `https://casepro.es/sitemap.xml`

### 4. Google Analytics

1. Crea propiedad para `casepro.es`
2. Ya está configurado en tu sitio (ID: `G-2SDNCXM179`)
3. Espera 24-48h para ver primeros datos

### 5. Marketing y Contenido

- Lee: `PLAN_DE_ACCION_HOY.md`
- Lee: `BRANDING_Y_MARKETING.md`
- Crear primeros posts en redes sociales
- Preparar primera campaña de ads

---

## ⚡ RESUMEN EXPRESS

```bash
# HOSTINGER DNS (Registros actualizados 2025)
A     @    → 216.198.79.1
CNAME www  → f627e1903ce284e0.vercel-dns-017.com.

# VERCEL DOMAINS
casepro.es              (Production)
www.casepro.es          → casepro.es (Redirect)

# VARIABLES VERCEL (Frontend)
REACT_APP_STORE_URL=https://casepro.es
REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api

# VARIABLES RAILWAY (Backend)
FRONTEND_URL=https://casepro.es
ALLOWED_ORIGINS=https://casepro.es,https://www.casepro.es

# ESPERAR
2-4 horas para DNS propagación completa
5 minutos para SSL automático de Vercel
```

---

## 🎉 ¡FELICITACIONES!

Una vez completado, tu tienda estará en:

✅ **https://casepro.es**
✅ SSL automático (HTTPS seguro)
✅ Funcionalidad completa
✅ Lista para marketing y ventas

**¡Tu tienda CASEPRO España está lista para conquistar el mercado! 🚀**

---

**Última actualización**: 2025-01-19
**CASEPRO España** - Protección Profesional
