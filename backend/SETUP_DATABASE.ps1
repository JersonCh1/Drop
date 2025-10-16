# Script para configurar la base de datos SQLite con Prisma
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Configurando Base de Datos SQLite" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Generar el cliente de Prisma
Write-Host "[1/3] Generando cliente de Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error generando cliente de Prisma" -ForegroundColor Red
    exit 1
}
Write-Host "Cliente de Prisma generado" -ForegroundColor Green
Write-Host ""

# 2. Ejecutar migraciones
Write-Host "[2/3] Ejecutando migraciones..." -ForegroundColor Yellow
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Migraciones fallidas, intentando crear la base de datos..." -ForegroundColor Yellow
    npx prisma db push --accept-data-loss
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error creando la base de datos" -ForegroundColor Red
        exit 1
    }
}
Write-Host "Migraciones completadas" -ForegroundColor Green
Write-Host ""

# 3. Seed (opcional)
Write-Host "[3/3] Poblando base de datos con datos de prueba..." -ForegroundColor Yellow
if (Test-Path "prisma/seed.js") {
    node prisma/seed.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Datos de prueba insertados" -ForegroundColor Green
    } else {
        Write-Host "Advertencia: Error insertando datos de prueba (opcional)" -ForegroundColor Yellow
    }
} else {
    Write-Host "No se encontro archivo seed.js, saltando..." -ForegroundColor Yellow
}
Write-Host ""

# Verificar que la base de datos se creo
if (Test-Path "dev.db") {
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "Base de datos creada exitosamente!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Archivo: dev.db" -ForegroundColor Cyan
    $fileSize = (Get-Item "dev.db").Length / 1KB
    Write-Host "Tamaño: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ahora puedes iniciar el servidor con:" -ForegroundColor White
    Write-Host "  npm start" -ForegroundColor Yellow
    Write-Host "o" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor Yellow
} else {
    Write-Host "Advertencia: No se encontró dev.db" -ForegroundColor Yellow
    Write-Host "Intenta ejecutar manualmente:" -ForegroundColor White
    Write-Host "  npx prisma db push" -ForegroundColor Yellow
}
