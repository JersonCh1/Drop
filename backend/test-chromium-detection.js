const { execSync } = require('child_process');

console.log('🔍 Probando detección de Chromium...\n');

// Simular variables de entorno de Railway
process.env.RAILWAY_ENVIRONMENT = 'production';

try {
  console.log('📍 Buscando Chromium en /nix/store...');

  // Este comando solo funciona en Railway/Linux
  if (process.platform === 'win32') {
    console.log('⚠️ Estás en Windows, este test solo funciona en Railway/Linux');
    console.log('✅ En Railway, el código buscará Chromium automáticamente');
    process.exit(0);
  }

  const chromiumPath = execSync('find /nix/store -name chromium -type f -executable 2>/dev/null | head -1')
    .toString()
    .trim();

  if (chromiumPath) {
    console.log(`✅ Chromium encontrado en: ${chromiumPath}`);
  } else {
    console.log('❌ Chromium NO encontrado');
    console.log('💡 Asegúrate de que nixpacks.toml tiene chromium en la lista de paquetes');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
