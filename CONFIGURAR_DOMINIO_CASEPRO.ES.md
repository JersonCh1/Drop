# 🌐 CONFIGURAR DOMINIO CASEPRO.ES

## 📋 Información de Tu Configuración

**Dominio**: casepro.es (Hostinger)
**Frontend**: Vercel (flashfunded-frontend.vercel.app)
**Backend**: Railway (drop-production-cd2b.up.railway.app)

---

## ⚡ CONFIGURACIÓN RÁPIDA (3 PASOS)

### PASO 1: CONFIGURAR DNS EN HOSTINGER (10 min)

#### 1.1 Acceder a Panel de Hostinger

1. Ve a: https://hpanel.hostinger.com
2. Inicia sesión con tu cuenta
3. En el menú lateral, click en **"Dominios"**
4. Selecciona **casepro.es**
5. Click en **"DNS / Nameservers"**

#### 1.2 Configurar Registros DNS

**IMPORTANTE**: Elimina TODOS los registros A y CNAME existentes para @ y www antes de continuar.

**Agrega estos registros:**

##### Registro 1: A Record (Dominio raíz)
```
Tipo: A
Nombre: @ (o dejar vacío, o "casepro.es")
Apunta a: 76.76.21.21
TTL: 3600 (automático)
```

##### Registro 2: CNAME (www)
```
Tipo: CNAME
Nombre: www
Apunta a: cname.vercel-dns.com
TTL: 3600 (automático)
```

**Tabla de DNS final debe verse así:**

```
┌──────────────────────────────────────────────┐
│ Tipo    Nombre    Apunta a                   │
├──────────────────────────────────────────────┤
│ A       @         76.76.21.21                │
│ CNAME   www       cname.vercel-dns.com       │
└──────────────────────────────────────────────┘
```

#### 1.3 Guardar Cambios

- Click en **"Guardar"** o **"Save"**
- Espera confirmación
- ✅ DNS configurado en Hostinger

---

### PASO 2: AGREGAR DOMINIO EN VERCEL (5 min)

#### 2.1 Acceder a Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Inicia sesión
3. Busca y selecciona tu proyecto: **"flashfunded-frontend"**
4. Click en **"Settings"** (en la barra superior)
5. En el menú lateral, click en **"Domains"**

#### 2.2 Agregar casepro.es

1. En el campo "Domain", escribe: `casepro.es`
2. Click en **"Add"**
3. Vercel te mostrará instrucciones de DNS
4. Como ya configuraste DNS en Hostinger, solo espera

#### 2.3 Agregar www.casepro.es

1. Click en **"Add Domain"** nuevamente
2. Escribe: `www.casepro.es`
3. Click en **"Add"**
4. Vercel te preguntará si quieres redirigir:
   - Opción A: `www.casepro.es` → `casepro.es` ✅ (Recomendado)
   - Opción B: `casepro.es` → `www.casepro.es`
5. Selecciona Opción A (sin www)

#### 2.4 Verificar Configuración

En la sección Domains, deberías ver:

```
✅ casepro.es (Production)
✅ www.casepro.es → casepro.es
⚠️  flashfunded-frontend.vercel.app (mantener o eliminar)
```

---

### PASO 3: ACTUALIZAR VARIABLES DE ENTORNO (5 min)

#### 3.1 En Vercel (Frontend)

1. En el proyecto de Vercel: **Settings → Environment Variables**
2. Busca o agrega estas variables:

```env
REACT_APP_STORE_URL=https://casepro.es
REACT_APP_STORE_NAME=CASEPRO España
REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api
```

3. **IMPORTANTE**: Aplica a "Production", "Preview", y "Development"
4. Click **"Save"**

#### 3.2 En Railway (Backend)

1. Ve a: https://railway.app
2. Selecciona tu proyecto backend
3. Click en **"Variables"**
4. Agrega o actualiza:

```env
FRONTEND_URL=https://casepro.es
ALLOWED_ORIGINS=https://casepro.es,https://www.casepro.es
```

5. Click **"Deploy"** para aplicar cambios

#### 3.3 Redeploy

Después de cambiar variables:

**En Vercel:**
- Ve a "Deployments"
- Click en los 3 puntos (...) del último deploy
- Click "Redeploy"

**En Railway:**
- Automáticamente se redesplega al guardar variables

---

## ⏱️ TIEMPO DE PROPAGACIÓN

### DNS Propagation
- **Mínimo**: 10-30 minutos
- **Normal**: 2-4 horas
- **Máximo**: 24-48 horas

### SSL Certificate (HTTPS)
- Vercel genera automáticamente
- Listo en 1-5 minutos después de verificar DNS

---

## ✅ VERIFICACIÓN

### 1. Verificar DNS Propagado

Ve a: https://dnschecker.org
- Escribe: `casepro.es`
- Tipo: `A`
- Click "Search"
- **Debe mostrar**: 76.76.21.21 en varios países ✅

También verifica:
- Escribe: `www.casepro.es`
- Tipo: `CNAME`
- **Debe mostrar**: cname.vercel-dns.com ✅

### 2. Probar el Sitio

Después de la propagación:

1. **Abre navegador en modo incógnito**
2. Ve a: `https://casepro.es`
3. **Debe cargar**: Tu tienda CASEPRO PERÚ ✅
4. Ve a: `https://www.casepro.es`
5. **Debe redirigir**: A casepro.es ✅

### 3. Verificar HTTPS

- Busca el candado 🔒 en la barra de direcciones
- Click en el candado
- **Debe decir**: "Conexión segura" ✅

### 4. Probar Funcionalidad

- ✅ Ver productos
- ✅ Agregar al carrito
- ✅ Checkout funciona
- ✅ Rastrear orden
- ✅ Admin panel accesible

---

## 🔧 TROUBLESHOOTING

### Problema 1: "Domain Not Found" en Vercel

**Solución**:
- Espera 30 minutos más
- Verifica DNS en dnschecker.org
- En Vercel, click "Refresh" en la sección Domains

### Problema 2: "SSL Error" o "Not Secure"

**Solución**:
- Espera 5 minutos más
- Vercel genera SSL automáticamente
- Borra caché del navegador (Ctrl + Shift + Del)

### Problema 3: DNS no propaga

**Solución**:
1. Ve a Hostinger → DNS
2. Verifica que los registros estén exactos:
   - A: @ → 76.76.21.21
   - CNAME: www → cname.vercel-dns.com
3. Elimina registros duplicados
4. Guarda y espera 1 hora

### Problema 4: Sitio carga pero API falla

**Solución**:
- Verifica REACT_APP_API_URL en Vercel
- Debe ser: https://drop-production-cd2b.up.railway.app/api
- Verifica CORS en Railway (ALLOWED_ORIGINS)
- Redeploy en Vercel

### Problema 5: "Too Many Redirects"

**Solución**:
- En Vercel Domains, verifica que solo UNO sea "Production"
- El otro debe ser redirect
- Elimina reglas de redirect conflictivas en Hostinger

---

## 📊 CHECKLIST COMPLETO

### En Hostinger ✅
- [ ] DNS A Record: @ → 76.76.21.21
- [ ] DNS CNAME: www → cname.vercel-dns.com
- [ ] Guardado y activo
- [ ] Sin registros duplicados

### En Vercel ✅
- [ ] Dominio casepro.es agregado
- [ ] Dominio www.casepro.es agregado (redirect)
- [ ] Variables de entorno actualizadas
- [ ] Redeployado después de cambios
- [ ] SSL activo (candado verde)

### En Railway ✅
- [ ] FRONTEND_URL actualizado a casepro.es
- [ ] ALLOWED_ORIGINS incluye casepro.es
- [ ] Redeployado

### Verificación Final ✅
- [ ] https://casepro.es carga ✅
- [ ] https://www.casepro.es redirige a casepro.es ✅
- [ ] SSL activo (HTTPS) ✅
- [ ] dnschecker.org muestra DNS correcto ✅
- [ ] Funcionalidad completa (productos, cart, checkout) ✅

---

## 🎯 CONFIGURACIÓN AVANZADA (OPCIONAL)

### Email Profesional

Si quieres email @casepro.es:

1. En Hostinger, ve a **"Emails"**
2. Click **"Crear Email"**
3. Crea: `info@casepro.es`, `ventas@casepro.es`
4. Costo: Incluido o S/ 5-10/mes

### Google Search Console

1. Ve a: https://search.google.com/search-console
2. Agregar propiedad: `casepro.es`
3. Verificar con DNS TXT o HTML
4. Enviar sitemap: `https://casepro.es/sitemap.xml`

### Google Analytics

1. Crea propiedad para casepro.es
2. Copia Tracking ID
3. En Vercel, agrega:
   ```env
   REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
   ```
4. Redeploy

---

## 📞 SOPORTE

### Hostinger Support
- Chat: https://hpanel.hostinger.com
- Email: support@hostinger.com
- 24/7 en español

### Vercel Support
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Twitter: @vercel

### Railway Support
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

---

## 🚀 PRÓXIMOS PASOS

Después de configurar el dominio:

1. **Actualizar Redes Sociales**
   - Instagram bio: casepro.es
   - Facebook link: casepro.es
   - WhatsApp catálogo: casepro.es

2. **Google My Business**
   - Crear perfil con casepro.es
   - Aparecer en Google Maps

3. **Marketing**
   - Leer `PLAN_DE_ACCION_HOY.md`
   - Crear primeros posts
   - Lanzar primera campaña

---

## ⚡ RESUMEN EXPRESS

```bash
# HOSTINGER DNS
A     @    → 76.76.21.21
CNAME www  → cname.vercel-dns.com

# VERCEL DOMAINS
casepro.es (Production)
www.casepro.es → casepro.es

# VARIABLES VERCEL
REACT_APP_STORE_URL=https://casepro.es
REACT_APP_API_URL=https://drop-production-cd2b.up.railway.app/api

# ESPERAR
2-4 horas para DNS propagación
```

---

## 🎉 ¡LISTO!

Una vez que el dominio esté activo:

✅ Tu tienda estará en **https://casepro.es**
✅ SSL automático (HTTPS seguro)
✅ Funcionalidad completa
✅ Listo para marketing y ventas

**¡Tu tienda CASEPRO España está lista para vender! 🚀**

---

*Última actualización: 2025*
*CASEPRO España - Protección Profesional*
