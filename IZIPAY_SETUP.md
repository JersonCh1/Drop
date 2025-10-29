# 🔐 Configuración de Izipay - Guía Completa

Esta guía te ayudará a configurar Izipay (BCP) como tu pasarela de pagos principal para aceptar:
- ✅ **Tarjetas** (Visa, Mastercard, Amex, Diners)
- ✅ **Yape** (pago instantáneo con código OTP)
- ✅ **Plin** (todos los bancos del Perú)
- ✅ **Apple Pay** (opcional)

---

## 📋 Requisitos Previos

### 1. Datos que ya tienes:
- **RUC/DNI:** 20607415804
- **Código de comercio:** 005884266
- **Usuario Back Office (opción 1):** 5884266
- **Contraseña temporal (opción 1):** 8XDAEFBf
- **Usuario Back Office (opción 2):** 20607415804
- **Contraseña temporal (opción 2):** A45LFxSQ

### 2. Datos que necesitas obtener:
- ❓ **Código de seguridad** (para ingresar al Back Office)
- ⚠️ **PASSWORD** (Test/Production Key)
- ⚠️ **PUBLIC_KEY** (Test/Production Public Key)
- ⚠️ **HMACSHA256** (Test/Production HMAC-SHA-256 Key)

---

## 🔑 PASO 1: Obtener el Código de Seguridad

El código de seguridad se encuentra en uno de los correos que recibiste de Izipay:

### Dónde buscar:
1. **Correo "identificadores de conexión"**
   - Remitente: `buzon no_reply@micuentaweb.pe` o `noreply@micuentaweb.pe`
   - Busca en la carpeta de spam/promociones también

2. **Correo de bienvenida**
   - Asunto: "Conecta tu tienda y empieza a recibir pagos hoy mismo"
   - Puede estar en un PDF adjunto

### Si no lo encuentras:
Llama al soporte de Izipay:
- **Teléfono:** (01) 213-0808
- **Horario:** Lunes a Viernes, 9:00 AM - 6:00 PM

---

## 🔐 PASO 2: Ingresar al Back Office de Izipay

1. Ve a: **https://secure.micuentaweb.pe/vads-merchant/**

2. Ingresa tus credenciales:
   - **Usuario:** Prueba con `20607415804` o `5884266`
   - **Contraseña:** Prueba con `A45LFxSQ` o `8XDAEFBf`
   - **Código de seguridad:** El que obtuviste en el paso 1

3. Si te pide cambiar la contraseña, cámbiala y guárdala en un lugar seguro.

---

## 🔑 PASO 3: Obtener las Claves API

Una vez dentro del Back Office:

### Opción A: Menú Configuración
1. Ve a **Configuración** → **Tienda** → **Claves API**
2. Busca la sección **"Claves para TEST"** o **"Claves para PRODUCCIÓN"**

### Opción B: Menú Settings
1. Ve a **Settings** → **Shop** → **REST API keys**
2. Encontrarás las claves de TEST y PRODUCTION

### Claves que debes copiar:
```
USERNAME (Store Identifier):     005884266 ✅ (ya lo tienes)
PASSWORD (Test Key):              _________________ ⚠️
PASSWORD (Production Key):        _________________ ⚠️
PUBLIC_KEY (Test):                _________________ ⚠️
PUBLIC_KEY (Production):          _________________ ⚠️
HMACSHA256 (Test):                _________________ ⚠️
HMACSHA256 (Production):          _________________ ⚠️
```

**IMPORTANTE:**
- Usa las claves de **TEST** mientras desarrollas y pruebas
- Cambia a las claves de **PRODUCTION** cuando estés listo para vender

---

## ⚙️ PASO 4: Configurar las Variables de Entorno

Abre el archivo `backend/.env` y actualiza estas líneas:

```env
# Izipay - Pasarela de pagos BCP (Banco de Crédito del Perú)
IZIPAY_USERNAME=005884266
IZIPAY_PASSWORD=TU_PASSWORD_AQUI          # ⚠️ Pega el Password Test aquí
IZIPAY_PUBLIC_KEY=TU_PUBLIC_KEY_AQUI      # ⚠️ Pega el Public Key Test aquí
IZIPAY_HMACSHA256=TU_HMAC_KEY_AQUI        # ⚠️ Pega el HMAC Key Test aquí
IZIPAY_API_URL=https://api.micuentaweb.pe/api-payment

# CJ Dropshipping - Automatización de envíos (OPCIONAL)
CJ_API_URL=https://developers.cjdropshipping.com/api2.0/v1
CJ_ACCESS_TOKEN=                           # Opcional: para automatización completa
```

---

## 🌐 PASO 5: Configurar el Public Key en el Frontend

Abre el archivo `frontend/public/index.html` y busca esta línea (aprox. línea 28):

```html
<script src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
        kr-public-key="YOUR_PUBLIC_KEY_HERE"    <!-- ⚠️ CAMBIAR ESTO -->
        kr-post-url-success="/"
        kr-post-url-refused="/">
</script>
```

Reemplaza `YOUR_PUBLIC_KEY_HERE` con tu **PUBLIC_KEY de TEST**:

```html
kr-public-key="TU_PUBLIC_KEY_TEST_AQUI"
```

---

## 🔔 PASO 6: Configurar el Webhook (IPN)

El webhook permite que Izipay notifique a tu sistema cuando un pago es confirmado.

### En el Back Office de Izipay:

1. Ve a **Configuración** → **Reglas de notificación**
   - O **Settings** → **Notification Rules**

2. Busca **"URL de notificación al final del pago"**
   - O **"Final Payment Notification URL"**

3. Ingresa la URL de tu servidor:
   ```
   https://tu-dominio.com/api/izipay/ipn
   ```

   **Para desarrollo local (testing):**
   - Opción 1: Usa ngrok: `https://tu-ngrok-url.ngrok.io/api/izipay/ipn`
   - Opción 2: Usa localhost.run
   - Opción 3: Prueba sin webhook primero, configúralo cuando deploys a producción

4. Guarda los cambios

---

## 🧪 PASO 7: Probar la Integración

### 1. Reiniciar el backend:
```bash
cd backend
npm start
```

### 2. Verificar que Izipay está configurado:
Visita: `http://localhost:3001/api/izipay/status`

Deberías ver:
```json
{
  "module": "Izipay Payment Gateway",
  "configured": true,
  "credentials": {
    "username": true,
    "password": true,
    "publicKey": true,
    "hmacKey": true
  },
  "cjAutomation": false,
  "apiUrl": "https://api.micuentaweb.pe/api-payment"
}
```

### 3. Rebuild del frontend:
```bash
cd frontend
npm run build
```

### 4. Iniciar el frontend:
```bash
npm start
```

### 5. Probar un pago de prueba:
1. Ve a tu tienda: `http://localhost:3000`
2. Agrega un producto al carrito
3. Ve al checkout
4. Selecciona un método de pago (Izipay, Yape o Plin)
5. Completa el formulario

---

## 💳 Tarjetas de Prueba (TEST Mode)

Cuando uses las claves de TEST, puedes usar estas tarjetas:

### Visa Éxito:
```
Número:     4970 1000 0000 0001
CVV:        123
Fecha:      12/25
Titular:    Juan Perez
```

### Mastercard Éxito:
```
Número:     5300 0000 0000 0003
CVV:        123
Fecha:      12/25
Titular:    Maria Lopez
```

### Visa Rechazo:
```
Número:     4970 1000 0000 0028
CVV:        123
Fecha:      12/25
Titular:    Test Rechazado
```

---

## 📱 Yape con Izipay

### Flujo del usuario:
1. Cliente selecciona "Yape" en el checkout
2. Se abre el formulario de Izipay
3. Cliente abre su app Yape
4. Va a **Menú** → **"Código de aprobación"**
5. Genera un código OTP
6. Ingresa el código en el formulario de Izipay
7. Pago confirmado instantáneamente

### Códigos de error Yape:
- **Y06:** Restricciones de Yape detectadas
- **Y07:** Excede el límite diario de compras online
- **Y08:** Cuenta temporalmente bloqueada
- **Y12/Y13:** Código OTP inválido o expirado

---

## 💸 Plin con Izipay

### Flujo del usuario:
1. Cliente selecciona "Plin" en el checkout
2. Se abre el formulario de Izipay
3. Cliente completa el pago con su cuenta Plin
4. Compatible con: Interbank, Scotiabank, BBVA, BCP y más
5. Pago confirmado instantáneamente

---

## 🚀 Automatización con CJ Dropshipping (OPCIONAL)

Si quieres que tus pedidos se envíen AUTOMÁTICAMENTE cuando se confirma un pago:

1. Crea una cuenta en CJ Dropshipping: https://cjdropshipping.com

2. Ve a **API Management** → **Generar Access Token**

3. Copia el token y agrégalo al `.env`:
   ```env
   CJ_ACCESS_TOKEN=tu_token_de_cj_aqui
   ```

4. Reinicia el backend

### ¿Cómo funciona?
1. Cliente paga con Izipay (tarjeta/Yape/Plin)
2. Izipay confirma el pago vía webhook
3. Backend recibe la confirmación
4. Backend crea AUTOMÁTICAMENTE la orden en CJ Dropshipping
5. CJ procesa y envía el producto al cliente
6. ¡Todo automático! 🎉

---

## 🔄 Cambiar de TEST a PRODUCCIÓN

Cuando estés listo para vender de verdad:

### 1. En el Back Office de Izipay:
   - Obtén las claves de **PRODUCTION** (no TEST)

### 2. En `backend/.env`:
   ```env
   IZIPAY_PASSWORD=PASSWORD_PRODUCTION_AQUI
   IZIPAY_PUBLIC_KEY=PUBLIC_KEY_PRODUCTION_AQUI
   IZIPAY_HMACSHA256=HMAC_PRODUCTION_AQUI
   ```

### 3. En `frontend/public/index.html`:
   ```html
   kr-public-key="PUBLIC_KEY_PRODUCTION_AQUI"
   ```

### 4. Rebuild y redeploy

---

## 🆘 Solución de Problemas

### Error: "Credenciales de Izipay no configuradas"
✅ Verifica que todas las variables estén en el `.env`
✅ Verifica que no haya espacios antes/después de los valores
✅ Reinicia el servidor backend

### Error: "SDK de Izipay no está cargado"
✅ Verifica que el script esté en `frontend/public/index.html`
✅ Verifica tu conexión a internet
✅ Abre la consola del navegador y busca errores

### Webhook no funciona (IPN no llega)
✅ Verifica la URL en el Back Office de Izipay
✅ Usa ngrok para desarrollo local
✅ Verifica que el endpoint `/api/izipay/ipn` esté funcionando

### Pago rechazado en TEST
✅ Verifica que uses tarjetas de prueba válidas
✅ Verifica que estés usando claves de TEST
✅ Revisa los logs del backend para más detalles

---

## 📞 Soporte

### Izipay:
- **Teléfono:** (01) 213-0808
- **Documentación:** https://developers.izipay.pe/
- **GitHub:** https://github.com/izipay-pe

### Tu Sistema:
- **Backend logs:** Revisa la consola donde corre el backend
- **Frontend logs:** Abre DevTools (F12) → Console

---

## ✅ Checklist de Configuración

Marca cada item cuando lo completes:

- [ ] Obtuve el código de seguridad
- [ ] Ingresé al Back Office de Izipay
- [ ] Copié el PASSWORD (Test)
- [ ] Copié el PUBLIC_KEY (Test)
- [ ] Copié el HMACSHA256 (Test)
- [ ] Actualicé el archivo `backend/.env`
- [ ] Actualicé el archivo `frontend/public/index.html`
- [ ] Configuré el webhook en el Back Office
- [ ] Reinicié el backend
- [ ] Rebuild del frontend
- [ ] Probé un pago de prueba con tarjeta
- [ ] Probé un pago con Yape (opcional)
- [ ] Probé un pago con Plin (opcional)
- [ ] Configuré CJ Dropshipping (opcional)

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu tienda estará lista para aceptar pagos con:
- 💳 Tarjetas (Visa, Mastercard, Amex, Diners)
- 📱 Yape (código OTP instantáneo)
- 💸 Plin (todos los bancos)

Y si configuraste CJ Dropshipping, ¡los envíos serán 100% automáticos! 🚀

---

**Última actualización:** 29 de Octubre, 2025
**Versión:** 1.0.0
