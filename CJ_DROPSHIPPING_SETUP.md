# CJ Dropshipping - Configuración de Automatización

## Integración Completada

La integración con CJ Dropshipping ya está implementada en el código. Cuando un pago es confirmado por Izipay (vía IPN), el sistema automáticamente crea una orden en CJ Dropshipping con los siguientes datos:

- ✅ Información del cliente (nombre, email, teléfono)
- ✅ Dirección de envío completa
- ✅ Productos y cantidades
- ✅ Número de orden

## Cómo Configurar CJ Dropshipping

### Paso 1: Crear Cuenta en CJ Dropshipping
1. Ve a https://cjdropshipping.com
2. Regístrate como vendedor/reseller
3. Completa el proceso de verificación
4. **Guarda tu email de registro** - lo necesitarás para la API

### Paso 2: Obtener API Key
1. Inicia sesión en tu cuenta de CJ
2. Ve a **Settings** > **API** o directamente a: https://cjdropshipping.com/api
3. Haz clic en el botón **"Generar"** (Generate)
4. Copia tu **API Key** (tiene formato: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

   **Importante**: La API Key es diferente a tu contraseña. No uses tu contraseña aquí.

### Paso 3: Configurar en tu Proyecto
1. Abre el archivo `.env` en la carpeta `backend`
2. Agrega tus credenciales:
   ```env
   CJ_API_URL=https://developers.cjdropshipping.com/api2.0/v1
   CJ_EMAIL=tu_email@ejemplo.com
   CJ_API_KEY=tu_api_key_de_32_caracteres
   ```
3. Reinicia el servidor backend

### Autenticación Automática
El sistema maneja la autenticación automáticamente usando el nuevo servicio `cjAuthService`:
- ✅ Obtiene Access Token al iniciar
- ✅ Refresca el token automáticamente cada 15 días
- ✅ Gestiona el Refresh Token (válido 180 días)
- ✅ Reobtiene tokens si expiran

## Flujo de Automatización

1. **Cliente hace el pago** → Izipay procesa la transacción
2. **Izipay confirma el pago** → Envía webhook IPN a tu servidor
3. **Tu servidor recibe IPN** → Actualiza la orden en tu BD
4. **Automatización CJ** → Crea orden en CJ Dropshipping automáticamente
5. **CJ procesa el envío** → Envía el producto al cliente
6. **CJ actualiza tracking** → Puedes consultar el estado vía API

## Código Implementado

El código de automatización está en:
- **Backend**: `backend/src/routes/izipay.js` (líneas 269-325)
- **IPN Webhook**: `/api/izipay/ipn`

```javascript
// Cuando Izipay confirma el pago:
if (orderStatus === 'PAID' && CJ_ACCESS_TOKEN) {
  // Se crea automáticamente la orden en CJ
  const cjOrderData = {
    orderNumber: orderId,
    shippingInfo: { /* datos del cliente */ },
    products: [ /* productos de la orden */ ]
  };

  // Llamada a la API de CJ
  await axios.post(
    `${CJ_API_URL}/shopping/order/createOrder`,
    cjOrderData,
    { headers: { 'CJ-Access-Token': CJ_ACCESS_TOKEN } }
  );
}
```

## Beneficios de la Automatización

✅ **Sin intervención manual**: Las órdenes se crean automáticamente en CJ
✅ **Reducción de errores**: No hay que copiar/pegar datos manualmente
✅ **Tiempo real**: La orden se procesa inmediatamente después del pago
✅ **Escalabilidad**: Puedes manejar cientos de órdenes sin esfuerzo adicional
✅ **Tracking automático**: CJ proporciona números de rastreo vía API

## API de CJ Dropshipping - Funciones Disponibles

- `POST /shopping/order/createOrder` - Crear nueva orden ✅ (Implementado)
- `GET /shopping/order/query` - Consultar estado de orden
- `GET /shopping/order/getOrderTrackInfo` - Obtener tracking
- `POST /shopping/order/confirmOrderFinish` - Confirmar recepción
- `GET /product/list` - Listar productos disponibles
- `GET /product/query` - Detalles de producto específico

## Próximos Pasos (Opcionales)

1. **Webhook de CJ a tu sistema**: Configura para recibir actualizaciones de tracking
2. **Sincronización de inventario**: Consulta disponibilidad de stock antes de vender
3. **Actualización de precios**: Sync automático de precios de CJ a tu tienda
4. **Tracking de envíos**: Muestra el tracking automáticamente a tus clientes

## Documentación Oficial

- CJ API Docs: https://developers.cjdropshipping.com/
- CJ Dashboard: https://cjdropshipping.com/user/index

## Estado Actual

- ✅ Código de integración implementado
- ⏸️ Esperando configuración del token CJ_ACCESS_TOKEN
- ✅ Listo para funcionar cuando agregues el token al `.env`
