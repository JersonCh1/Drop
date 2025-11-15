# ⚠️ CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

## 🚨 ACCIÓN REQUERIDA

Tu proyecto está desplegado en Vercel pero **FALTA configurar las variables de entorno**.

Sin estas variables, el frontend no podrá:
- ❌ Conectarse al backend (no cargará productos)
- ❌ Procesar pagos con Izipay
- ❌ Mostrar WhatsApp correctamente

---

## 📋 PASOS PARA CONFIGURAR

### 1. Ir a Configuración de Vercel

1. Ve a: https://vercel.com/jersonch9s-projects/drop/settings/environment-variables
2. O desde el Dashboard:
   - Ir a tu proyecto `drop`
   - Click en **Settings**
   - Click en **Environment Variables**

### 2. Agregar Variables de Entorno

Agregar **una por una** estas variables:

#### Variable 1: REACT_APP_API_URL
```
Name: REACT_APP_API_URL
Value: https://drop-production-cd2b.up.railway.app/api
Environment: Production, Preview, Development
```

#### Variable 2: REACT_APP_IZIPAY_PUBLIC_KEY
```
Name: REACT_APP_IZIPAY_PUBLIC_KEY
Value: 81996279:publickey_oy0QZCy4XxB4CmV2zO3W9t79i7flvrikXOPHhDf5yqWlC
Environment: Production, Preview, Development
```

#### Variable 3: REACT_APP_WHATSAPP_NUMBER
```
Name: REACT_APP_WHATSAPP_NUMBER
Value: 51917780708
Environment: Production, Preview, Development
```

#### Variable 4: REACT_APP_APP_NAME
```
Name: REACT_APP_APP_NAME
Value: iPhone Cases Store
Environment: Production, Preview, Development
```

#### Variable 5: REACT_APP_VERSION
```
Name: REACT_APP_VERSION
Value: 2.0.0
Environment: Production, Preview, Development
```

### 3. Redeploy el Proyecto

**IMPORTANTE:** Las variables de entorno solo aplican en el siguiente deploy.

Después de agregar todas las variables:

1. Ve a **Deployments**
2. En el último deployment (el actual), click en los 3 puntos `...`
3. Click en **Redeploy**
4. Confirmar redeploy

O simplemente hacer un commit vacío:
```bash
git commit --allow-empty -m "chore: trigger Vercel redeploy"
git push origin main
```

### 4. Verificar que Funcione

Una vez completado el redeploy, verifica:

1. **Frontend carga:** https://drop-seven-pi.vercel.app
2. **Productos cargan:** Deberías ver los 2 productos de prueba
3. **Consola sin errores:** Abre DevTools (F12) y verifica que no haya errores de conexión

---

## 🔍 VERIFICACIÓN

### Checklist Post-Configuración

- [ ] Variables de entorno agregadas en Vercel
- [ ] Redeploy completado
- [ ] Frontend carga correctamente
- [ ] Productos se muestran en la home
- [ ] Carrito funciona
- [ ] No hay errores en consola del navegador

### Errores Comunes

**Error: "Failed to fetch"**
- Verificar que `REACT_APP_API_URL` esté correcta
- Verificar CORS en backend (Railway debe incluir la URL de Vercel)

**Izipay no aparece**
- Verificar que `REACT_APP_IZIPAY_PUBLIC_KEY` esté correcta
- El script de Izipay ya está en index.html (✓)

---

## 📊 URLs Finales

Después de configurar todo:

- **Frontend:** https://drop-seven-pi.vercel.app
- **Backend:** https://drop-production-cd2b.up.railway.app
- **Admin:** https://drop-seven-pi.vercel.app/admin
- **Health Check:** https://drop-production-cd2b.up.railway.app/health

---

## 🎯 Siguiente Paso

Una vez configurado Vercel, el siguiente paso es:
👉 **Importar productos de carcasas iPhone desde CJ Dropshipping**

Ver guía en: `DEPLOYMENT_CHECKLIST.md`

---

**Última actualización:** 2025-11-14
