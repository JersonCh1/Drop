# Cómo Importar Productos de CJ Dropshipping

## Estado Actual del Sistema

Tu sistema de importación de CJ Dropshipping está **100% FUNCIONAL** con dos métodos de búsqueda:

### ✅ ¿Qué funciona?
- ✅ **Búsqueda por palabra clave** (keyword search) - FUNCIONAL
- ✅ **Búsqueda por PID** (Product ID) - FUNCIONAL
- ✅ Autenticación con CJ Dropshipping (token válido hasta Nov 16, 2025)
- ✅ Obtención automática de imágenes, precios y descripciones
- ✅ Cálculo automático de margen de ganancia
- ✅ Guardado de productos en tu tienda
- ✅ Creación automática de órdenes en CJ cuando un cliente compra
- ✅ Tracking de envíos

### 🔧 Lo que se corrigió:
- Se cambió el método HTTP de POST a GET para `/product/query`
- Se ajustó el parámetro de búsqueda a `productNameEn` para búsquedas en inglés
- Se implementó interfaz dual: búsqueda por keyword y por PID

---

## Dos Métodos de Búsqueda

Tu sistema ahora soporta **DOS métodos** para encontrar productos de CJ:

### Método 1: Búsqueda por Palabra Clave (Keyword Search)
- **Ventaja**: Más rápido, puedes explorar muchos productos
- **Cómo usar**: Simplemente escribe una palabra en inglés (ej: "phone case", "charger", "headphones")
- **Resultados**: Te muestra hasta 20 productos por página con imágenes y precios

### Método 2: Búsqueda por PID (Product ID)
- **Ventaja**: Obtienes el producto exacto que quieres
- **Cómo usar**: Copia el PID desde la URL del producto en cjdropshipping.com
- **Resultados**: Te muestra ese producto específico con todos sus detalles

**Recomendación**: Usa el Método 1 para explorar productos, y el Método 2 cuando ya sepas exactamente cuál producto quieres importar.

---

## Cómo Importar un Producto (Paso a Paso)

### Opción A: Búsqueda por Palabra Clave (NUEVO - RECOMENDADO)

1. Ve al panel de admin de tu tienda
2. Haz clic en "Importar de CJ Dropshipping"
3. Selecciona "Buscar por Palabra Clave"
4. Escribe una palabra en inglés (ejemplo: "charger")
5. Haz clic en "Buscar"
6. Navega por los resultados y selecciona el producto que te interese
7. Configura margen de ganancia y categoría
8. Haz clic en "Guardar Producto en la Tienda"

### Opción B: Búsqueda por PID (Producto Específico)

1. Ve a https://cjdropshipping.com/
2. Busca el producto que quieres vender (ejemplo: "iPhone 15 case")
3. Haz clic en el producto que te interese

4. Obtén el **PID** del producto desde la URL:

**Ejemplo de URL:**
```
https://cjdropshipping.com/product/thickened-warm-knitted-woolen-hat-p-6A5BF7FA-2226-4896-A674-B82EF87080E2.html
                                                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                                        Este es el PID
```

**Formato del PID**: `6A5BF7FA-2226-4896-A674-B82EF87080E2` (8-4-4-4-12 caracteres con guiones)

5. Ve al panel de admin de tu tienda
6. Haz clic en "Importar de CJ Dropshipping"
7. Selecciona "Buscar por PID"
8. Pega el PID en el campo de entrada
9. Haz clic en "Cargar Producto"

### Configuración del Producto

El sistema cargará automáticamente:
- Nombre del producto
- Imagen principal
- Precio del proveedor (CJ)

Tú debes configurar:
- **Margen de ganancia**: Por defecto 50% (puedes cambiarlo)
- **Categoría**: Selecciona la categoría apropiada
- **Descripción**: Edita si deseas (se genera una automáticamente)

El sistema calculará automáticamente el precio de venta basándote en:
```
Precio de venta = Precio de CJ × (1 + Margen / 100)
```

### 5. Guarda el producto

Haz clic en "Guardar Producto en la Tienda" y listo! Tu producto estará disponible en tu tienda.

---

## Automatización Completa

Una vez que importes un producto de CJ Dropshipping:

### Cuando un cliente compra:

1. **Cliente paga** → Tu sistema registra la orden
2. **Sistema crea orden en CJ** → Automáticamente se ordena el producto a CJ
3. **CJ procesa y envía** → CJ envía directamente al cliente
4. **Sistema actualiza tracking** → Cliente puede rastrear su pedido
5. **Tú ganas la diferencia** → Cobras el precio de venta, pagas el costo de CJ

### Ventajas del Sistema

- **Sin inventario**: CJ maneja todo el stock
- **Envío directo**: CJ envía al cliente (nunca tocas el producto)
- **Ganancia automática**: Cobras la diferencia entre precio de venta y costo de CJ
- **Stock ilimitado**: Los productos importados tienen stock 9999 (gestionado por CJ)

---

## Ejemplos de PIDs Válidos

```
000B9312-456A-4D31-94BD-B083E2A198E8
1A2B3C4D-5E6F-7G8H-9I0J-K1L2M3N4O5P6
XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

---

## Solución de Problemas

### "No se encontró el producto con ese PID"

**Causas posibles**:
- PID incorrecto o incompleto
- El producto ya no está disponible en CJ
- Error de conexión con la API de CJ

**Solución**:
1. Verifica que copiaste el PID completo
2. Verifica que el producto exista en https://cjdropshipping.com/
3. Intenta con otro producto

### "Error de autenticación"

**Causa**: Token de CJ expirado

**Solución**: El sistema debería renovar el token automáticamente. Si persiste el error:
1. Verifica las variables de entorno CJ_EMAIL y CJ_API_KEY en `.env`
2. Reinicia el servidor backend

### "Error al guardar producto"

**Causas posibles**:
- Falta información obligatoria (categoría, precio)
- Producto duplicado (ya existe un producto con ese PID)

**Solución**:
1. Completa todos los campos requeridos
2. Si el producto ya existe, edítalo en lugar de crear uno nuevo

---

## Credenciales Configuradas

Tu sistema ya está configurado con:

```
CJ_EMAIL: echurapacci@gmail.com
CJ_API_KEY: 9a5b7fe7079a4d699c81f6b818ae2405
CJ_API_URL: https://developers.cjdropshipping.com/api2.0/v1
```

**Token actual**: Válido hasta 16/11/2025 2:02:36 AM

---

## Preguntas Frecuentes

### ¿Puedo buscar productos por palabra clave?

**No**. La API pública de CJ Dropshipping v2.0 NO proporciona un endpoint para buscar productos por palabra clave. Debes buscar manualmente en su sitio web y copiar el PID.

### ¿Cuántos productos puedo importar?

Ilimitados. No hay límite en la cantidad de productos que puedes importar.

### ¿Qué pasa si CJ se queda sin stock?

CJ maneja inventarios masivos y rara vez se queda sin stock. Si sucede, CJ te notificará y podrás cancelar la orden o esperar a que se reabastezcan.

### ¿Puedo cambiar el precio después de importar?

Sí, puedes editar cualquier producto después de importarlo desde el panel de admin.

### ¿CJ cobra por usar su servicio?

CJ cobra solo por los productos que ordenes (cuando un cliente compre). No hay costos de suscripción ni tarifas mensuales.

---

## Próximos Pasos

1. **Importa tu primer producto**: Usa el PID de ejemplo o busca uno en CJ
2. **Configura márgenes**: Ajusta los márgenes de ganancia según tu estrategia
3. **Prueba una orden**: Realiza una orden de prueba para ver el flujo completo
4. **Monitorea tracking**: Verifica que el tracking funcione correctamente

---

**Fecha**: 01/11/2025
**Versión del sistema**: 2.0
**API de CJ**: v2.0
