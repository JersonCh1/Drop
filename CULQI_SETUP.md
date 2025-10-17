# Configuración de Culqi - Pasarela de Pagos para Perú

Culqi ha sido integrado exitosamente en tu aplicación como pasarela de pagos para Perú, permitiendo aceptar tarjetas de débito y crédito locales.

## ¿Qué es Culqi?

Culqi es la pasarela de pagos líder en Perú, similar a Stripe pero especializada en el mercado peruano. Acepta:

- 💳 Visa, Mastercard, Amex, Diners
- 🇵🇪 Tarjetas emitidas en Perú
- 💰 Procesamiento en Soles (PEN)
- ⚡ Confirmación instantánea

## Cómo obtener tus claves de Culqi

### 1. Crear cuenta en Culqi

1. Ve a [https://culqi.com](https://culqi.com)
2. Haz clic en "Crear cuenta gratis"
3. Completa el formulario de registro
4. Verifica tu email

### 2. Obtener claves de prueba (desarrollo)

1. Inicia sesión en [https://integ-panel.culqi.com](https://integ-panel.culqi.com)
2. Ve a **Configuración** → **API Keys**
3. Copia:
   - **Llave Pública** (comienza con `pk_test_...`)
   - **Llave Secreta** (comienza con `sk_test_...`)

### 3. Configurar claves en tu aplicación

#### Backend (.env)
```bash
# Backend: dropshipping-iphone/backend/.env
CULQI_SECRET_KEY=sk_test_tu_clave_secreta_aqui
CULQI_PUBLIC_KEY=pk_test_tu_clave_publica_aqui
```

#### Frontend (.env)
```bash
# Frontend: dropshipping-iphone/frontend/.env
REACT_APP_CULQI_PUBLIC_KEY=pk_test_tu_clave_publica_aqui
```

### 4. Reiniciar los servidores

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## Tarjetas de prueba

Para probar en el ambiente de desarrollo, usa estas tarjetas de prueba de Culqi:

### Transacciones exitosas:

| Número de tarjeta    | CVV | Fecha de expiración | Resultado |
|---------------------|-----|-------------------|-----------|
| 4111 1111 1111 1111 | 123 | 09/2030          | Exitoso   |
| 5111 1111 1111 1118 | 123 | 09/2030          | Exitoso   |

### Transacciones rechazadas (para testing):

| Número de tarjeta    | CVV | Fecha de expiración | Resultado |
|---------------------|-----|-------------------|-----------|
| 4222 2222 2222 2220 | 123 | 09/2030          | Rechazado |
| 4000 0000 0000 0002 | 123 | 09/2030          | Tarjeta robada |

## Pasar a producción

Cuando estés listo para ir a producción:

### 1. Validar tu negocio con Culqi

1. Ve al panel de Culqi
2. Completa el proceso de validación de tu negocio
3. Proporciona documentos requeridos (RUC, DNI, etc.)
4. Espera la aprobación de Culqi

### 2. Obtener claves de producción

1. Una vez aprobado, ve a **Configuración** → **API Keys**
2. Cambia al modo **PRODUCCIÓN**
3. Copia las nuevas claves de producción:
   - **Llave Pública** (comienza con `pk_live_...`)
   - **Llave Secreta** (comienza con `sk_live_...`)

### 3. Actualizar claves en producción

```bash
# En tu servidor de producción
CULQI_SECRET_KEY=sk_live_tu_clave_secreta_produccion
CULQI_PUBLIC_KEY=pk_live_tu_clave_publica_produccion
REACT_APP_CULQI_PUBLIC_KEY=pk_live_tu_clave_publica_produccion
```

## Comisiones de Culqi

- **Comisión por transacción:** ~3.99% + IGV
- **Sin costos de instalación**
- **Sin mensualidades**
- **Depósitos a tu cuenta bancaria en 24-48 horas**

## Flujo de pago en la aplicación

1. **Cliente completa el checkout**
2. **Selecciona "Culqi" como método de pago**
3. **Se abre el modal seguro de Culqi**
4. **Cliente ingresa datos de tarjeta**
5. **Culqi procesa el pago**
6. **Tu aplicación recibe confirmación**
7. **Orden se marca como pagada**

## Verificar que funciona

1. Inicia tu aplicación
2. Agrega productos al carrito
3. Ve al checkout
4. Deberías ver el botón de **Culqi** en color rojo/naranja
5. Selecciona Culqi y completa el formulario
6. Haz clic en "Pagar"
7. Se abrirá el modal de Culqi
8. Usa una tarjeta de prueba
9. Verifica que el pago se procese

## Troubleshooting

### Error: "Culqi no está configurado"

- ✅ Verifica que agregaste las claves en los archivos `.env`
- ✅ Reinicia el servidor backend
- ✅ Reinicia el servidor frontend

### Error: "Culqi SDK no está cargado"

- ✅ Verifica que el script de Culqi esté en `frontend/public/index.html`
- ✅ Limpia la caché del navegador
- ✅ Recarga la página (Ctrl+F5)

### El botón de Culqi no aparece

- ✅ Verifica `REACT_APP_CULQI_PUBLIC_KEY` en `frontend/.env`
- ✅ Verifica que la clave comience con `pk_test_` o `pk_live_`
- ✅ Reinicia el frontend

### Pago rechazado en producción

- ✅ Verifica que estés usando claves de producción
- ✅ Verifica que tu cuenta de Culqi esté validada
- ✅ Revisa el panel de Culqi para ver detalles del error

## Documentación oficial

- 📚 [Documentación de Culqi](https://docs.culqi.com)
- 🔧 [Guía de integración](https://docs.culqi.com/#introduccion)
- 💬 [Soporte de Culqi](https://culqi.com/soporte)
- 📧 Email: soporte@culqi.com
- 📱 WhatsApp: +51 980 555 555

## Características implementadas

✅ Checkout seguro con Culqi
✅ Procesamiento en PEN (Soles peruanos)
✅ Conversión automática USD → PEN
✅ Validación de tarjetas
✅ Manejo de errores
✅ Confirmación de pago
✅ Registro de órdenes
✅ UI moderna y responsive

## Archivos modificados/creados

```
backend/
  ├── src/routes/culqi.js                    (NUEVO - endpoints de Culqi)
  ├── src/server.js                          (modificado - registrar rutas)
  └── .env                                   (modificado - claves Culqi)

frontend/
  ├── src/hooks/useCulqi.ts                  (NUEVO - hook de Culqi)
  ├── src/components/checkout/Checkout.tsx   (modificado - integración Culqi)
  ├── public/index.html                      (modificado - script Culqi)
  └── .env                                   (modificado - clave pública)

package.json (backend)                        (modificado - culqi-node instalado)
```

## Siguiente paso: ¡Configura tus claves!

1. Crea tu cuenta en Culqi
2. Obtén tus claves de prueba
3. Agrégalas a los archivos `.env`
4. Reinicia los servidores
5. ¡Prueba tu primer pago!

---

**¿Necesitas ayuda?** Contacta a soporte de Culqi o revisa la documentación oficial.
