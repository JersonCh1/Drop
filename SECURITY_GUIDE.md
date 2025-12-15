# 🛡️ Guía de Seguridad y Mejores Prácticas

## 📌 Tabla de Contenidos
1. [Configuración Inicial Segura](#configuración-inicial-segura)
2. [Gestión de Credenciales](#gestión-de-credenciales)
3. [Desarrollo Seguro](#desarrollo-seguro)
4. [Deployment a Producción](#deployment-a-producción)
5. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
6. [Respuesta a Incidentes](#respuesta-a-incidentes)

---

## 🔧 Configuración Inicial Segura

### 1. Variables de Entorno

**❌ NUNCA HAGAS ESTO:**
```bash
# NO subas .env al repositorio
git add .env
git commit -m "Added config"
```

**✅ SIEMPRE HAZ ESTO:**
```bash
# 1. Copia el ejemplo
cp backend/.env.example backend/.env

# 2. Edita con tus credenciales REALES
nano backend/.env

# 3. Verifica que .env está en .gitignore
cat .gitignore | grep .env
```

### 2. Generar Contraseña Admin Segura

```bash
# Genera un hash bcrypt para la contraseña del admin
cd backend
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('TU_PASSWORD_SEGURO_AQUI', 10));"

# Copia el resultado a .env
# ADMIN_PASSWORD_HASH=$2a$10$...
```

**Requisitos de contraseña:**
- Mínimo 12 caracteres
- Incluir mayúsculas, minúsculas, números y símbolos
- Ejemplo: `MyS3cur3P@ssw0rd!2025`

### 3. JWT Secret Seguro

```bash
# Genera un secret aleatorio
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copia a .env
# JWT_SECRET=el_resultado_aqui
```

---

## 🔑 Gestión de Credenciales

### Dónde Guardar las Credenciales

| Entorno | Dónde | Cómo |
|---------|-------|------|
| **Local** | `backend/.env` | Archivo local (en .gitignore) |
| **Railway** | Variables de entorno | Panel > Variables tab |
| **Vercel** | Variables de entorno | Settings > Environment Variables |
| **Producción** | Secrets manager | AWS Secrets Manager, 1Password, etc. |

### Rotación de Credenciales

**Cada 90 días debes cambiar:**
1. `ADMIN_PASSWORD_HASH` (contraseña admin)
2. `JWT_SECRET` (fuerza cierre de sesión de todos)
3. Claves API de terceros (si es posible)

**Cada 30 días debes cambiar:**
1. Email App Passwords
2. Tokens temporales

### Auditoría de Accesos

```bash
# Ver últimos logins admin en logs
grep "admin_login" backend/logs/combined.log | tail -20

# Ver IPs que intentaron login
grep "admin_login_attempt" backend/logs/combined.log | grep -v "success"
```

---

## 💻 Desarrollo Seguro

### 1. Antes de Cada Commit

```bash
# Checklist de seguridad
✓ ¿Removí todos los console.log() con datos sensibles?
✓ ¿No hay credenciales hardcodeadas?
✓ ¿Los errores no exponen información del sistema?
✓ ¿Las validaciones están completas?
✓ ¿Usé logger en lugar de console.log?
```

### 2. Validación de Inputs

**❌ NO:**
```javascript
app.post('/api/payment', async (req, res) => {
  const { amount } = req.body;
  // Usar amount directamente sin validar
  await createPayment(amount);
});
```

**✅ SÍ:**
```javascript
const { validate, paymentSchema } = require('../validators/payment.validator');

app.post('/api/payment', validate(paymentSchema), async (req, res) => {
  const { amount } = req.body; // Ya validado por Joi
  await createPayment(amount);
});
```

### 3. Manejo de Errores

**❌ NO:**
```javascript
try {
  // ...
} catch (error) {
  res.status(500).json({ error: error.stack }); // Expone stack trace
}
```

**✅ SÍ:**
```javascript
try {
  // ...
} catch (error) {
  logger.logError(error, 'Payment processing');
  res.status(500).json({
    success: false,
    message: 'Error procesando el pago'
  });
}
```

### 4. Autenticación en Nuevas Rutas

```javascript
// SIEMPRE usa el middleware de autenticación
const { verifyAdminToken } = require('../middleware/auth');

router.get('/api/admin/sensitive-data',
  verifyAdminToken,  // ✅ Protegido
  async (req, res) => {
    // Solo accesible con token válido
  }
);
```

---

## 🚀 Deployment a Producción

### Pre-Deployment Checklist

```bash
# 1. Verifica las variables de entorno
echo "NODE_ENV=$NODE_ENV"  # Debe ser 'production'
echo "ADMIN_USERNAME configurado: $([ -n "$ADMIN_USERNAME" ] && echo "✓" || echo "✗")"
echo "ADMIN_PASSWORD_HASH configurado: $([ -n "$ADMIN_PASSWORD_HASH" ] && echo "✓" || echo "✗")"

# 2. Audita dependencias
npm audit

# 3. Verifica que .env NO está en git
git ls-files | grep ".env$"  # NO debe retornar nada

# 4. Test de conexión a BD
curl -X GET http://localhost:3001/api/test-db

# 5. Test de autenticación
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"tu_password"}'
```

### Configuración de Railway (Producción)

1. **Variables de Entorno Obligatorias:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...
JWT_SECRET=...
FRONTEND_URL=https://casepro.es
ALLOWED_ORIGINS=https://casepro.es,https://www.casepro.es
```

2. **Variables de Pasarelas de Pago:**
```bash
# Izipay (Producción)
IZIPAY_USERNAME=81996279
IZIPAY_PASSWORD=prodpassword_...
IZIPAY_PUBLIC_KEY=81996279:publickey_...
IZIPAY_HMACSHA256=...
IZIPAY_API_URL=https://api.micuentaweb.pe/api-payment
```

3. **Health Check:**
```bash
# Railway debe poder acceder a este endpoint
https://tu-backend.railway.app/health
```

### Post-Deployment Verification

```bash
# 1. Test de health
curl https://tu-backend.railway.app/health

# 2. Test de CORS (debe fallar desde origen no autorizado)
curl -H "Origin: https://evil.com" https://tu-backend.railway.app/api/orders

# 3. Test de rate limiting
for i in {1..10}; do
  curl -X POST https://tu-backend.railway.app/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"wrong","password":"wrong"}'
done
# El 6to intento debe retornar 429 (Too Many Requests)

# 4. Verificar logs
railway logs
```

---

## 📊 Monitoreo y Mantenimiento

### Logs a Revisar Diariamente

```bash
# Errores del día
tail -100 backend/logs/error.log

# Intentos de login fallidos
grep "admin_login_attempt" backend/logs/combined.log | grep -v "success" | tail -20

# Pagos del día
grep "Payment" backend/logs/combined.log | grep "$(date +%Y-%m-%d)"
```

### Métricas Importantes

| Métrica | Umbral | Acción |
|---------|--------|--------|
| Tasa de error de pagos | > 5% | Investigar inmediatamente |
| Intentos de login fallidos | > 10/hora | Revisar IPs y posible ataque |
| Tiempo de respuesta API | > 2s | Optimizar queries |
| Uso de CPU | > 80% | Escalar recursos |

### Backups

```bash
# Manual backup de PostgreSQL (Railway)
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restaurar backup
railway run psql $DATABASE_URL < backup_20251215.sql
```

**Configurar backups automáticos:**
1. En Railway: Settings > Backups > Enable
2. Frecuencia: Diaria
3. Retención: 7 días

---

## 🚨 Respuesta a Incidentes

### Si se Compromete una Credencial

**1. Credenciales de Admin Comprometidas:**
```bash
# 1. Genera nuevo hash inmediatamente
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('NUEVA_PASSWORD', 10));"

# 2. Actualiza en Railway
railway variables set ADMIN_PASSWORD_HASH="$2a$10$nuevo_hash"

# 3. Genera nuevo JWT secret (invalida todos los tokens)
railway variables set JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"

# 4. Reinicia el servicio
railway up
```

**2. API Key de Pago Comprometida:**
```bash
# 1. Desactiva la clave en el panel del proveedor
# 2. Genera nueva clave
# 3. Actualiza en Railway
railway variables set IZIPAY_PASSWORD="nueva_clave"
```

### Si Detectas un Ataque

**1. Identifica el Patrón:**
```bash
# IPs con más de 100 requests en la última hora
grep "$(date -u +%Y-%m-%d)" backend/logs/combined.log | \
  awk '{print $1}' | sort | uniq -c | sort -rn | head -10
```

**2. Bloquea la IP (si es necesario):**
```javascript
// Agregar a backend/src/server.js (temporalmente)
app.use((req, res, next) => {
  const blockedIPs = ['1.2.3.4', '5.6.7.8'];
  if (blockedIPs.includes(req.ip)) {
    logger.warn(`Blocked IP: ${req.ip}`);
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});
```

**3. Escala el Rate Limiting:**
```javascript
// Reducir temporalmente los límites
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // Reducido de 5 a 3
  message: 'Demasiados intentos de login'
});
```

---

## 🔍 Checklist de Seguridad Semanal

- [ ] Revisar logs de errores
- [ ] Verificar intentos de login fallidos
- [ ] Actualizar dependencias (`npm update`)
- [ ] Auditar dependencias (`npm audit`)
- [ ] Verificar backups automáticos
- [ ] Revisar métricas de performance
- [ ] Verificar certificados SSL (no expiren)

## 🔍 Checklist de Seguridad Mensual

- [ ] Rotar contraseñas de servicio
- [ ] Revisar lista de ALLOWED_ORIGINS
- [ ] Limpiar logs antiguos (> 30 días)
- [ ] Revisar usuarios con acceso al proyecto
- [ ] Actualizar documentación de seguridad
- [ ] Test de penetración básico

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Railway Security](https://docs.railway.app/reference/security)

---

**Última actualización**: 15 de Diciembre, 2025
**Próxima revisión**: 15 de Enero, 2026
