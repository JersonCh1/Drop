// Script para probar autenticación
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log('\n🔐 Probando autenticación...\n');

    // 1. Login
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@store.com',
      password: 'admin123'
    });

    console.log('✅ Login exitoso:');
    console.log('   Token:', loginResponse.data.token ? 'Recibido ✓' : 'NO RECIBIDO ✗');
    console.log('   Usuario:', JSON.stringify(loginResponse.data.user, null, 2));

    const token = loginResponse.data.token;

    // 2. Get Me
    console.log('\n2️⃣ Obteniendo datos del usuario...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ GetMe exitoso:');
    console.log('   Usuario:', JSON.stringify(meResponse.data.user, null, 2));

    console.log('\n✅ Todo funciona correctamente!');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

testAuth();
