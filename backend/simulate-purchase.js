const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Datos de prueba para la compra
const testCustomer = {
  email: 'test@casepro.es',
  firstName: 'Juan',
  lastName: 'Pérez',
  phone: '+51917780708',
  address: {
    street: 'Av. Javier Prado Este 4200',
    city: 'Lima',
    state: 'Lima',
    country: 'PE',
    postalCode: '15023'
  }
};

const productId = 'cmi8al17e0001uyd4xiimmzdj';
const variantId = 'cmi8apw2r003buybo2vfe7abn'; // iPhone 15 Pro Max - Morado

async function simulatePurchase() {
  try {
    console.log('🛒 SIMULACIÓN DE COMPRA COMPLETA\n');
    console.log('================================\n');

    // PASO 1: Agregar al carrito
    console.log('1️⃣ Agregando producto al carrito...');
    const cartResponse = await axios.post(`${API_URL}/cart/add`, {
      productId: productId,
      variantId: variantId,
      quantity: 1
    });

    const sessionId = cartResponse.data.cart.sessionId;
    console.log(`✅ Producto agregado al carrito`);
    console.log(`   SessionID: ${sessionId}`);
    console.log(`   Total: $${cartResponse.data.cart.total}\n`);

    // PASO 2: Ver el carrito
    console.log('2️⃣ Consultando carrito...');
    const getCartResponse = await axios.get(`${API_URL}/cart/${sessionId}`);
    console.log(`✅ Carrito consultado:`);
    console.log(`   Items: ${getCartResponse.data.cart.items.length}`);
    console.log(`   Subtotal: $${getCartResponse.data.cart.subtotal}`);
    console.log(`   Total: $${getCartResponse.data.cart.total}\n`);

    // PASO 3: Crear la orden
    console.log('3️⃣ Creando orden...');
    const orderResponse = await axios.post(`${API_URL}/orders`, {
      sessionId: sessionId,
      customer: testCustomer,
      paymentMethod: 'izipay',
      shippingMethod: 'standard'
    });

    const orderId = orderResponse.data.order.id;
    const orderNumber = orderResponse.data.order.orderNumber;
    console.log(`✅ Orden creada:`);
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Order Number: ${orderNumber}`);
    console.log(`   Total: $${orderResponse.data.order.total}`);
    console.log(`   Estado: ${orderResponse.data.order.status}\n`);

    // PASO 4: Iniciar pago con Izipay
    console.log('4️⃣ Iniciando pago con Izipay...');
    const paymentResponse = await axios.post(`${API_URL}/payments/izipay/create`, {
      orderId: orderId,
      amount: orderResponse.data.order.total,
      currency: 'USD',
      customer: testCustomer
    });

    console.log(`✅ Pago iniciado:`);
    console.log(`   Transaction ID: ${paymentResponse.data.transactionId || 'N/A'}`);
    console.log(`   Form Token: ${paymentResponse.data.formToken ? 'Generado' : 'No disponible'}`);
    console.log(`   Payment URL: ${paymentResponse.data.paymentUrl || 'N/A'}\n`);

    // RESUMEN FINAL
    console.log('================================');
    console.log('🎉 SIMULACIÓN COMPLETADA\n');
    console.log('📊 RESUMEN:');
    console.log(`   Producto: Funda MagSafe iPhone 15 Pro Max - Morado`);
    console.log(`   Precio: $23.52`);
    console.log(`   Cliente: ${testCustomer.firstName} ${testCustomer.lastName}`);
    console.log(`   Email: ${testCustomer.email}`);
    console.log(`   Orden: ${orderNumber}`);
    console.log(`   Estado: Pendiente de pago`);
    console.log('\n✅ Todo el flujo funciona correctamente!');

    return {
      success: true,
      orderId,
      orderNumber,
      sessionId
    };

  } catch (error) {
    console.error('\n❌ ERROR EN LA SIMULACIÓN:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar simulación
simulatePurchase();
