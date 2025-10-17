# Comparación de Pasarelas de Pago - Perú

Tu aplicación ahora soporta múltiples métodos de pago. Aquí está la comparación para que elijas el mejor para tu negocio en Perú.

## Resumen rápido

| Pasarela | Mejor para | Comisión | Moneda | Tarjetas |
|----------|-----------|----------|---------|----------|
| **Culqi** | 🇵🇪 Perú (local) | 3.99% + IGV | PEN (S/) | Perú |
| PayPal | 🌎 Internacional | 5.4% + $0.30 | USD | Mundial |
| Stripe | 🌎 Internacional | 3.6% + $0.30 | USD | Mundial |
| MercadoPago | 🇵🇪 Perú/LATAM | 4.99% + IGV | PEN/USD | Perú/LATAM |
| Yape/Plin | 🇵🇪 Solo Perú | 0% (manual) | PEN | - |

## 1. Culqi ⭐ (Recomendado para Perú)

### ✅ Ventajas
- **Procesamiento local en PEN:** No cobras en dólares, cobras en soles
- **Comisión más baja:** 3.99% + IGV
- **Tarjetas peruanas:** Acepta todas las tarjetas emitidas en Perú
- **Depósitos rápidos:** 24-48 horas a tu cuenta bancaria peruana
- **Checkout en español:** Familiar para clientes peruanos
- **Sin cuenta bancaria extranjera:** Todo en Perú

### ❌ Desventajas
- Solo acepta tarjetas emitidas en Perú
- No sirve para clientes internacionales
- Requiere RUC/DNI peruano para validación

### 💰 Costos
- Comisión: **3.99% + IGV** por transacción
- Sin costo de instalación
- Sin mensualidades
- Depósitos a cuenta bancaria peruana

### 🎯 Úsalo si:
- Tus clientes son principalmente peruanos
- Quieres procesar en soles (PEN)
- Quieres las comisiones más bajas
- Tienes RUC peruano

---

## 2. PayPal

### ✅ Ventajas
- **Reconocimiento mundial:** Clientes confían en PayPal
- **Fácil de usar:** No requiere tarjeta
- **Protección al comprador:** Reduce reclamos
- **Sin integración compleja:** Redirect simple

### ❌ Desventajas
- **Comisión alta:** 5.4% + $0.30 por transacción
- Requiere cuenta bancaria internacional para retirar
- Retiros pueden tardar días
- Límites de retiro

### 💰 Costos
- Comisión: **5.4% + $0.30 USD** por transacción
- Conversión de moneda: +2.5% si vendes en PEN
- Sin mensualidades

### 🎯 Úsalo si:
- Vendes internacionalmente
- Tus clientes prefieren PayPal
- No te importan las comisiones altas

---

## 3. Stripe

### ✅ Ventajas
- **Tecnología moderna:** Mejor API
- **Acepta tarjetas mundiales**
- **Checkout personalizable**
- **Buena documentación**

### ❌ Desventajas
- Requiere cuenta bancaria en USA/Europa
- Difícil activar cuenta desde Perú
- Comisión internacional puede ser alta
- No tan conocido en Perú

### 💰 Costos
- Comisión: **3.6% + $0.30 USD** por transacción
- Tarjetas internacionales: +1.5%

### 🎯 Úsalo si:
- Tienes cuenta bancaria en USA/Europa
- Vendes principalmente internacional
- Necesitas control total de la experiencia

---

## 4. MercadoPago

### ✅ Ventajas
- **Popular en LATAM**
- **Acepta múltiples métodos:** Tarjetas, efectivo, etc.
- **Proceso en PEN o USD**
- **Conocido en Perú**

### ❌ Desventajas
- Comisión más alta que Culqi
- Checkout menos personalizable
- A veces tiene problemas técnicos

### 💰 Costos
- Comisión: **4.99% + IGV** por transacción
- Sin mensualidades

### 🎯 Úsalo si:
- Quieres aceptar efectivo (PagoEfectivo)
- Vendes en varios países de LATAM
- Tus clientes ya usan MercadoPago

---

## 5. Yape / Plin

### ✅ Ventajas
- **Sin comisiones**
- **Pago instantáneo**
- **Muy popular en Perú**
- **Fácil para clientes**

### ❌ Desventajas
- **Manual:** Tienes que verificar cada pago
- Solo funciona en Perú
- Requiere coordinar por WhatsApp
- No es automático

### 💰 Costos
- **0% de comisión**
- Gratis

### 🎯 Úsalo si:
- Estás empezando
- Tienes pocos pedidos
- No te importa verificar manualmente
- Quieres evitar comisiones

---

## Recomendación según tu caso

### Caso 1: Emprendedor peruano vendiendo en Perú
```
✅ RECOMENDADO:
1. Culqi (automatizado, local, bajo costo)
2. Yape/Plin (sin costo, manual)
3. MercadoPago (backup)
```

### Caso 2: Vendiendo internacionalmente desde Perú
```
✅ RECOMENDADO:
1. PayPal (fácil de cobrar internacional)
2. Culqi (para clientes peruanos)
3. Yape/Plin (backup local)
```

### Caso 3: Tienes cuenta bancaria en USA
```
✅ RECOMENDADO:
1. Stripe (mejor tecnología)
2. Culqi (para Perú)
3. PayPal (backup internacional)
```

### Caso 4: Recién empiezas, bajo volumen
```
✅ RECOMENDADO:
1. Yape/Plin (gratis, manual)
2. Culqi cuando crezcas
3. MercadoPago (backup)
```

---

## Configuración en tu aplicación

Tu app ya tiene **TODOS** estos métodos integrados. Solo necesitas configurar las claves:

### ✅ Ya configurados:
- Yape/Plin (funciona sin configuración)
- Checkout UI (listo)

### ⚙️ Requieren claves API:
- **Culqi:** Ver `CULQI_SETUP.md`
- **PayPal:** Agregar claves en `.env`
- **Stripe:** Agregar claves en `.env`
- **MercadoPago:** Agregar claves en `.env`

---

## Mi recomendación personal

Si estás en Perú y vendes principalmente a peruanos:

```
🥇 Culqi (principal) - 3.99% + IGV
🥈 Yape/Plin (backup) - 0%, manual
🥉 MercadoPago (alternativa) - 4.99% + IGV
```

**¿Por qué?**
- Culqi tiene las comisiones más bajas
- Todo en PEN (soles), sin conversión
- Depósitos a tu banco peruano
- Yape/Plin para clientes que no tienen tarjeta
- MercadoPago por si Culqi falla

---

## Cómo habilitar cada método

### Culqi
```bash
# Ver archivo CULQI_SETUP.md
1. Registrarte en culqi.com
2. Obtener claves API
3. Agregar a .env
4. Reiniciar servidores
```

### PayPal
```bash
# Backend .env
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_SECRET=tu_secret

# Frontend .env
REACT_APP_PAYPAL_CLIENT_ID=tu_client_id
```

### Stripe
```bash
# Backend .env
STRIPE_SECRET_KEY=sk_test_...

# Frontend .env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### MercadoPago
```bash
# Backend .env
MERCADOPAGO_ACCESS_TOKEN=tu_token
```

### Yape/Plin
```bash
# Ya está configurado!
# Solo necesitas tu número de celular en:
REACT_APP_WHATSAPP_NUMBER=51999999999
```

---

## Próximos pasos

1. **Decide tu estrategia de pagos** según tu negocio
2. **Configura 1-2 pasarelas** (no todas a la vez)
3. **Prueba con tarjetas de prueba**
4. **Valida tu cuenta en la pasarela**
5. **Pasa a producción**

¿Dudas? Revisa `CULQI_SETUP.md` para configurar Culqi paso a paso.
