# Guía Completa: Dropshipping en Perú 2025

## Tabla de Contenidos
1. [Pasarelas de Pago para Perú](#pasarelas-de-pago)
2. [Productos Más Rentables](#productos-rentables)
3. [Guía de Despliegue](#guía-de-despliegue)
4. [Estrategia de Negocio](#estrategia-de-negocio)

---

## 🔷 PASARELAS DE PAGO PARA PERÚ

### ✅ RECOMENDADAS (En orden de prioridad)

### 1. **Culqi** ⭐ MEJOR OPCIÓN LOCAL
**Por qué es la mejor:**
- Empresa peruana, soporte local en español
- Sistema antifraude con IA
- Integración simple con API REST
- Acepta todas las tarjetas peruanas

**Tarjetas aceptadas:**
- Visa, Mastercard
- CMR Falabella, Tarjeta Ripley
- Diners Club, American Express
- Cencosud, UnionPay
- Tarjeta oh!

**Costos:**
- Comisión: ~3.5% + IGV por transacción
- Sin costo de integración
- Sin mensualidad

**Integración:**
```bash
npm install culqi-node
```

**Documentación:**
https://www.culqi.com/docs/

---

### 2. **Niubiz** (Visa Net Perú)
**Características:**
- Adquiriente multimarca más grande de Perú
- Respaldo de Visa
- Tiempo de abono: 24-48 horas

**Tarjetas:**
- Visa, Mastercard, UnionPay
- American Express, Diners Club, Discover

**Costos:**
- Comisión: 3.5% - 4% por transacción
- Abono rápido en 24-48 horas

**Web:** https://www.niubiz.com.pe/

---

### 3. **Izipay** (Antes PayZen)
**Características:**
- Adquiriente multimarca
- Buena reputación en Perú
- Soporte técnico local

**Tarjetas:**
- Visa, Mastercard
- American Express, Diners Club

**Costos:**
- Comisión: ~3.5% por transacción
- Sin costos de setup

**Web:** https://www.izipay.pe/

---

### 4. **Openpay** (Grupo Credicorp)
**Características:**
- Parte de Credicorp (BCP, BBVA Continental)
- Soluciones omnicanal
- Ideal si tus clientes son de BBVA

**Costos:**
- Clientes BBVA: 3.49% + S/0
- Otros bancos: 3.79% + S/1 por transacción

**Web:** https://www.openpay.pe/

---

### 5. **MercadoPago** ⭐ OPCIÓN INTERNACIONAL
**Características:**
- Muy conocida en Latinoamérica
- Incluye wallet y códigos QR
- Dispositivos Point para pagos presenciales

**Ventajas:**
- Los usuarios confían en la marca
- Integración muy simple
- App móvil para gestionar ventas

**Costos:**
- Comisión: 3.49% por transacción
- Sin costos de integración

**Integración:**
```bash
npm install mercadopago
```

**Web:** https://www.mercadopago.com.pe/

---

### 6. **PayPal**
**Características:**
- Reconocimiento mundial
- Ideal para clientes internacionales
- Protección al comprador y vendedor

**Costos:**
- Comisión: 3.95% + tarifa fija
- Conversión de moneda: ~2.5%

**Limitaciones en Perú:**
- No todos los peruanos tienen cuenta PayPal
- Requiere cuenta bancaria o tarjeta internacional

---

### 7. **Stripe** (Ya disponible en Perú)
**Características:**
- Plataforma moderna, excelente documentación
- APIs muy bien diseñadas
- Dashboard intuitivo

**Ventajas:**
- Tu código ya está preparado para Stripe
- Soporte para suscripciones
- Webhooks robustos

**Costos:**
- Comisión: 3.6% + $0.30 USD por transacción
- Sin costos de setup

**Limitaciones:**
- Recién llegó a Perú (2024)
- Menos conocido localmente que Culqi o Niubiz

**Ya integrado en tu proyecto:**
- Backend: `src/routes/stripe.js`
- Frontend: `@stripe/stripe-js` y `@stripe/react-stripe-js`

---

### 📱 MÉTODOS DE PAGO ALTERNATIVOS (MUY IMPORTANTE EN PERÚ)

#### **Yape** 💚
- App de pagos del BCP
- MUY POPULAR en Perú
- Transferencias instantáneas gratuitas
- **Implementación:** Genera código QR con tu número Yape

#### **Plin** 💜
- App de pagos de Scotiabank, Interbank, BBVA
- Competidor de Yape
- También muy usado

#### **PagoEfectivo**
- Genera código de pago
- Cliente paga en agencia bancaria o agente
- Ideal para personas sin tarjeta
- Comisión: ~3%

#### **Contra Entrega (Cash on Delivery)**
- IMPORTANTE: 11.7% de peruanos prefiere este método
- Coordinar con courier (Olva, Shalom, 99 Minutos)
- Mayor riesgo pero más conversión

---

## 💰 ESTADÍSTICAS DE PREFERENCIAS DE PAGO EN PERÚ

Según la Cámara de Comercio de Lima (CCL):
- 30.6% - Tarjetas de crédito
- 24.6% - Tarjetas de débito
- 14.4% - PagoEfectivo en agencia
- 12.3% - PagoEfectivo online
- 11.7% - Contra entrega
- 6.4% - Otros (Yape, Plin, transferencias)

**CONCLUSIÓN:** Ofrece múltiples métodos de pago para maximizar conversión.

---

## 🏆 MI RECOMENDACIÓN PARA TU PROYECTO

### Stack de Pagos Ideal:

1. **Principal: Culqi** (tarjetas de crédito/débito)
   - Mejor integración local
   - Soporte en español
   - Acepta todas las tarjetas peruanas

2. **Secundario: MercadoPago**
   - Para clientes que prefieren wallets
   - Muy conocido en Perú

3. **Manual: Yape/Plin + WhatsApp**
   - Para mayoría de peruanos
   - Transferencia directa + confirmación por WhatsApp
   - Ya lo tienes implementado

4. **Opcional: PayPal**
   - Solo si vendes internacionalmente

### Flujo Recomendado en Checkout:

```
1. Seleccionar método de pago:
   [ ] Tarjeta de crédito/débito (Culqi)
   [ ] MercadoPago
   [ ] Yape/Plin (manual)
   [ ] Contra entrega

2. Si elige Yape/Plin:
   - Mostrar QR o número de celular
   - Cliente envía captura por WhatsApp
   - Confirmas y procesas orden

3. Si elige contra entrega:
   - Coordinar con courier
   - Confirmar por WhatsApp/SMS
```

---

## 📦 PRODUCTOS MÁS RENTABLES PARA DROPSHIPPING 2025

### 🔥 TOP CATEGORÍAS CON MAYORES MÁRGENES

#### 1. **Accesorios para iPhone/Smartphones** ⭐ TU NICHO ACTUAL
**Margen:** 50-80%
**Proyección mercado:** $1.5 trillones USD en 2025

**Productos estrella:**
- Carcasas (tu producto actual) ✅
- Protectores de pantalla
- Soportes magnéticos para auto
- Cargadores inalámbricos
- AirPods cases
- Anillos para dedos (ring holders)
- Cables de carga premium

**Por qué funciona:**
- Producto pequeño, fácil envío
- Alto margen de ganancia
- Compra impulsiva (bajo precio)
- Siempre se necesita reemplazar
- Nuevos modelos = nuevas ventas

**Estrategia de precios:**
- Costo: $2-5 USD
- Precio venta: $15-25 USD
- Margen: 70-80%

**Proveedores:**
- AliExpress
- CJDropshipping
- Spocket (USA/Europa)

---

#### 2. **Accesorios para Mascotas** 🐕
**Margen:** 60-75%
**Proyección:** Mercado en crecimiento constante

**Productos hot:**
- Collares LED
- Camas ortopédicas
- Comederos automáticos
- Juguetes interactivos
- Cepillos de auto-limpieza
- Arneses anti-tirones

**Por qué funciona:**
- Dueños gastan sin límite en mascotas
- Compra emocional
- Productos consumibles (recompra)

---

#### 3. **Fitness y Bienestar** 💪
**Margen:** 50-70%
**Proyección:** $7 trillones USD en 2025

**Productos ganadores:**
- Bandas de resistencia
- Yoga mats
- Botellas de agua inteligentes
- Masajeadores musculares
- Smartwatches fitness
- Rodillos de espuma

**Por qué funciona:**
- Tendencia post-pandemia
- Resolución de año nuevo (pico en enero)
- Productos livianos

---

#### 4. **Productos de Belleza y Skincare** 💄
**Margen:** 60-80%
**Proyección:** $716 billones USD en 2025

**Productos top:**
- Rodillos de jade
- LED face masks
- Limpiadores faciales sónicos
- Serums y cremas (marca propia)
- Herramientas de manicura

**Por qué funciona:**
- Alto ticket promedio
- Recompra frecuente
- Influencers promueven mucho

---

#### 5. **Accesorios para Auto** 🚗
**Margen:** 55-75%
**Mercado:** Muy grande y estable

**Productos rentables:**
- Organizadores de asientos
- Cargadores USB múltiples
- Soportes magnéticos para celular
- Purificadores de aire
- Cámaras dash cam
- Fundas para volante

**Por qué funciona:**
- Productos pequeños
- Mejoran experiencia diaria
- Compra impulsiva en semáforos (jk)

---

#### 6. **Home & Living** 🏠
**Margen:** 50-70%

**Productos estrella:**
- Luces LED inteligentes
- Organizadores de cocina
- Plantas artificiales
- Relojes de pared minimalistas
- Difusores de aroma
- Fundas de almohada estéticas

---

#### 7. **Productos Tech Baratos** 🎧
**Margen:** 60-80%

**Hot sellers:**
- Auriculares Bluetooth (tipo AirPods)
- Smartwatches (tipo Apple Watch)
- Speakers Bluetooth
- Power banks
- Cables USB-C
- Hubs USB

---

### 🎯 ESTRATEGIA DE SELECCIÓN DE PRODUCTOS

#### Criterios para elegir un producto ganador:

1. **Ligero y pequeño** ✅
   - Costo de envío bajo
   - Fácil almacenamiento

2. **Margen mínimo 50%** ✅
   - Costo máximo: $10 USD
   - Precio venta mínimo: $20 USD

3. **Resuelve un problema** ✅
   - No solo decorativo
   - Mejora vida del cliente

4. **Compra impulsiva** ✅
   - Precio accesible ($15-$40)
   - No requiere mucho análisis

5. **Visual atractivo** ✅
   - Se vende por foto/video
   - Funciona en Instagram/TikTok

6. **No frágil** ✅
   - Sobrevive envío internacional
   - Menos devoluciones

---

### 💡 PRODUCTOS ESPECÍFICOS CON MEJOR ROI 2025

#### **Top 10 Productos para Empezar:**

1. **Carcasas iPhone personalizadas** (TU PRODUCTO) ⭐
   - Costo: $3 | Venta: $25 | Margen: 733%

2. **Anillos magnéticos para celular**
   - Costo: $2 | Venta: $15 | Margen: 650%

3. **Soportes de auto magnéticos**
   - Costo: $4 | Venta: $25 | Margen: 525%

4. **Bandas de resistencia (set 5)**
   - Costo: $5 | Venta: $30 | Margen: 500%

5. **Cepillo de mascotas auto-limpieza**
   - Costo: $4 | Venta: $25 | Margen: 525%

6. **Luces LED para gaming/escritorio**
   - Costo: $8 | Venta: $40 | Margen: 400%

7. **Organizador de cables magnético**
   - Costo: $3 | Venta: $18 | Margen: 500%

8. **Botella de agua con marcador horario**
   - Costo: $6 | Venta: $30 | Margen: 400%

9. **Auriculares Bluetooth TWS**
   - Costo: $8 | Venta: $40 | Margen: 400%

10. **Power bank ultra delgado 10000mAh**
    - Costo: $10 | Venta: $45 | Margen: 350%

---

### 📊 ESTRATEGIA DE PRECIOS PARA PERÚ

**Precios en Soles (S/):**
- Productos impulso: S/ 50 - S/ 80 ($15-$25)
- Productos premium: S/ 100 - S/ 150 ($30-$45)
- Bundles/Combos: S/ 120 - S/ 200 ($35-$60)

**Tips de conversión:**
- Ofrecer envío gratis en pedidos > S/ 100
- Crear bundles (3x2, compra 2 lleva 3)
- Descuentos por tiempo limitado (FOMO)

---

### 🎯 NICHOS EMERGENTES 2025

1. **Productos sostenibles/eco-friendly**
   - Cepillos de bambú
   - Bolsas reutilizables
   - Productos biodegradables

2. **Smart Home básico**
   - Enchufes inteligentes
   - Focos WiFi
   - Sensores de movimiento

3. **Work from Home**
   - Soportes para laptop
   - Luces de anillo
   - Organizadores de escritorio

4. **Productos para gamers**
   - Mouse pads RGB
   - Auriculares gaming
   - Soportes para audífonos

---

## 🚀 GUÍA DE DESPLIEGUE

### Opciones de Hosting (Mejor a Menor)

---

### 1. **RAILWAY** ⭐ RECOMENDADO PARA TU PROYECTO

**Por qué Railway:**
- Setup en 5 minutos
- Detecta automáticamente Node.js + React
- Base de datos PostgreSQL incluida (gratis hasta 500MB)
- No necesitas configurar nada
- CI/CD automático con GitHub

**Precio:**
- Plan gratuito: $5 USD de créditos/mes
- Suficiente para empezar
- Escala automáticamente

**Pasos para deploy:**

#### Backend en Railway:

```bash
1. Ve a https://railway.app
2. Conecta tu GitHub
3. Click "New Project" > "Deploy from GitHub repo"
4. Selecciona tu repo "dropshipping-iphone"
5. Railway detecta automáticamente:
   - Node.js
   - package.json
   - Comando start

6. Agregar variables de entorno:
   - DATABASE_URL (Railway te da una PostgreSQL gratis)
   - JWT_SECRET=tu-secret-key
   - NODE_ENV=production
   - FRONTEND_URL=https://tu-dominio.vercel.app

7. Click "Deploy" ✅

Tu backend estará en:
https://tu-proyecto.railway.app
```

#### Frontend en Vercel (gratis):

```bash
1. Ve a https://vercel.com
2. Conecta GitHub
3. Import proyecto "dropshipping-iphone/frontend"
4. Variables de entorno:
   - REACT_APP_API_URL=https://tu-backend.railway.app/api

5. Deploy automático ✅

Tu frontend estará en:
https://tu-proyecto.vercel.app
```

---

### 2. **RENDER** (Alternativa gratuita)

**Ventajas:**
- Plan gratuito generoso
- PostgreSQL incluido
- Cron jobs gratis
- Background workers

**Limitación:**
- Apps gratis "duermen" después de 15 min inactivos
- Primera carga es lenta (~30 seg)

**Precio:**
- Gratis: Web service + PostgreSQL
- Paid: $7/mes (sin sleep)

**Deploy:**
```bash
1. Ve a https://render.com
2. New > Web Service
3. Conecta repo de GitHub
4. Build Command: npm install
5. Start Command: npm start
6. Variables de entorno

Deploy automático con cada push
```

---

### 3. **VERCEL** (Solo para Frontend + API routes ligeras)

**Ventajas:**
- Increíblemente rápido
- CDN global
- Preview deployments automáticos
- Dominio .vercel.app gratis

**Limitaciones para tu proyecto:**
- Serverless functions tienen timeout de 10s (plan free)
- No soporta procesos persistentes
- Base de datos tiene que estar externa

**Recomendación:**
- Frontend: Vercel ✅
- Backend: Railway o Render ✅

---

### 4. **HEROKU** (Ya no es gratis)

**Antes era #1, ahora:**
- $5/mes mínimo por dyno
- Base de datos desde $5/mes adicional
- Total: ~$10/mes mínimo

**Solo si:**
- Ya conoces Heroku
- Presupuesto disponible

---

### 📋 CHECKLIST ANTES DE DEPLOY

#### Backend:

```bash
# 1. Cambiar a PostgreSQL (Railway/Render lo proveen)
# En prisma/schema.prisma:
datasource db {
  provider = "postgresql"  // Cambiar de "sqlite"
  url      = env("DATABASE_URL")
}

# 2. Instalar pg
npm install pg

# 3. Regenerar Prisma Client
npx prisma generate

# 4. En producción, Railway ejecutará:
npx prisma migrate deploy
```

#### Frontend:

```bash
# 1. Actualizar .env con URL de producción
REACT_APP_API_URL=https://tu-backend.railway.app/api

# 2. Build local para probar
npm run build

# 3. Si funciona, commitear cambios
git add .
git commit -m "Configure production build"
git push

# 4. Vercel hará build automático
```

#### Variables de entorno críticas:

**Backend (.env):**
```env
DATABASE_URL=postgresql://...  # Railway te da esta
JWT_SECRET=clave-super-secreta-cambia-esto
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.vercel.app
PORT=3001

# Opcional (agregar cuando tengas las cuentas)
CULQI_SECRET_KEY=sk_test_...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
WHATSAPP_NUMBER=51987654321
```

**Frontend (.env.production):**
```env
REACT_APP_API_URL=https://tu-backend.railway.app/api
REACT_APP_APP_NAME=iPhone Cases Store
```

---

### 🔧 CONFIGURACIÓN CORS EN PRODUCCIÓN

En `backend/server-simple.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', // desarrollo
    'https://tu-dominio.vercel.app', // producción
    'https://tu-proyecto-preview.vercel.app' // preview branches
  ],
  credentials: true
}));
```

---

### 🎯 PLAN DE DEPLOY PASO A PASO

#### Día 1: Setup básico
1. ✅ Crear cuenta Railway (backend)
2. ✅ Crear cuenta Vercel (frontend)
3. ✅ Configurar base de datos PostgreSQL en Railway
4. ✅ Deploy backend
5. ✅ Deploy frontend

#### Día 2: Configuración
1. Conectar dominio personalizado (opcional)
2. Configurar variables de entorno
3. Probar flujo completo

#### Día 3: Pasarela de pago
1. Crear cuenta Culqi/MercadoPago
2. Obtener API keys
3. Integrar en backend
4. Probar transacciones de prueba

#### Día 4: Testing
1. Crear orden de prueba
2. Verificar emails
3. Probar en móvil
4. Optimizar performance

---

### 💰 COSTOS MENSUALES ESTIMADOS

**Opción Gratis (para empezar):**
- Railway: $0 (hasta $5 créditos)
- Vercel: $0 (hobby plan)
- Total: **$0/mes** ✅

**Opción Escalada (con tráfico):**
- Railway Pro: $20/mes
- Vercel Pro: $20/mes (si necesitas)
- Culqi: 3.5% por transacción
- Total: ~$20-40/mes

**Comparación:**
- Tu propio VPS: $5-10/mes + tiempo de setup
- Hostinger/similar: $10-20/mes
- AWS/GCP: $50-100/mes (overkill para empezar)

---

## 💼 ESTRATEGIA DE NEGOCIO

### Fase 1: Validación (Mes 1)
- Empezar con 5-10 productos (carcasas iPhone)
- Inversión inicial: $500 - $1000
- Meta: 30 ventas/mes
- Ganancia esperada: $500-800

### Fase 2: Crecimiento (Mes 2-3)
- Expandir a 20-30 productos
- Invertir en ads (Facebook $10/día)
- Meta: 100 ventas/mes
- Ganancia: $2000-3000

### Fase 3: Escalado (Mes 4-6)
- 50+ productos
- Equipo de soporte
- Warehouse local (opcional)
- Meta: 300+ ventas/mes
- Ganancia: $5000-8000

---

## ✅ PRÓXIMOS PASOS INMEDIATOS

1. **Hoy:**
   - ✅ Base de datos inicializada
   - ✅ Proyecto listo para funcionar
   - ✅ TypeScript corregido

2. **Esta semana:**
   - [ ] Deploy en Railway + Vercel
   - [ ] Crear cuenta Culqi o MercadoPago
   - [ ] Integrar pasarela de pago
   - [ ] Agregar productos reales

3. **Próxima semana:**
   - [ ] Primera venta de prueba
   - [ ] Configurar emails transaccionales
   - [ ] Crear contenido para redes sociales
   - [ ] Lanzar campaña en Facebook/Instagram

---

## 🎓 RECURSOS ADICIONALES

**Pasarelas de Pago:**
- Culqi Docs: https://docs.culqi.com/
- MercadoPago API: https://www.mercadopago.com.pe/developers/
- Niubiz Integration: https://www.niubiz.com.pe/developers/

**Productos:**
- AliExpress Dropshipping: https://www.aliexpress.com/dropshipper
- CJDropshipping: https://cjdropshipping.com/
- Oberlo (Shopify): https://www.oberlo.com/

**Marketing:**
- Facebook Ads Library: ver qué anuncian competidores
- Google Trends: validar demanda
- TikTok Creative Center: tendencias de productos

---

**¿Listo para lanzar? Tu tienda está a un deploy de distancia.** 🚀
