// backend/src/services/pagoefectivoService.js
const axios = require('axios');
const crypto = require('crypto');

/**
 * 💵 SERVICIO DE PAGOEFECTIVO - Pagos en efectivo en Perú
 *
 * Cliente recibe código CIP y paga en:
 * - Bancos (BCP, Interbank, BBVA, Scotiabank)
 * - Agentes (Western Union, Kasnet, FullCarga)
 * - Supermercados (Wong, Metro, Plaza Vea)
 * - Farmacias (Inkafarma, Mifarma)
 * - Bodegas (100,000+ puntos en todo Perú)
 *
 * Comisión: 2.89% + S/ 0.49 por transacción
 * Documentación: https://www.pagoefectivo.pe/
 */

class PagoEfectivoService {
  constructor() {
    this.accessKey = process.env.PAGOEFECTIVO_ACCESS_KEY || '';
    this.secretKey = process.env.PAGOEFECTIVO_SECRET_KEY || '';
    this.serviceCode = process.env.PAGOEFECTIVO_SERVICE_CODE || '';
    this.environment = process.env.PAGOEFECTIVO_ENVIRONMENT || 'test'; // 'test' o 'production'

    // URLs según ambiente
    this.baseURL = this.environment === 'production'
      ? 'https://pre-api.pagoefectivo.pe/v1'
      : 'https://pre-api.pagoefectivo.pe/v1'; // Sandbox

    this.isConfigured = !!(this.accessKey && this.secretKey && this.serviceCode);

    if (!this.isConfigured) {
      console.log('⚠️  PagoEfectivo no configurado - Variables faltantes:');
      console.log('   PAGOEFECTIVO_ACCESS_KEY, PAGOEFECTIVO_SECRET_KEY, PAGOEFECTIVO_SERVICE_CODE');
      console.log('   Para obtener credenciales: https://www.pagoefectivo.pe/');
    } else {
      console.log(`✅ PagoEfectivo configurado - Ambiente: ${this.environment}`);
      console.log(`📍 Service Code: ${this.serviceCode}`);
      console.log('💵 Puntos de pago: 100,000+ en todo Perú');
      console.log('💰 Comisión: 2.89% + S/ 0.49');
    }
  }

  /**
   * Genera firma de autenticación
   */
  generateSignature(data) {
    const dataString = JSON.stringify(data);
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(dataString);
    return hmac.digest('hex');
  }

  /**
   * Genera headers de autenticación
   */
  getAuthHeaders() {
    const timestamp = new Date().toISOString();
    const auth = Buffer.from(`${this.accessKey}:${this.secretKey}`).toString('base64');

    return {
      'Authorization': `Bearer ${auth}`,
      'Content-Type': 'application/json',
      'Date': timestamp
    };
  }

  /**
   * Crea una solicitud de pago (genera código CIP)
   * @param {object} data - Datos del pago
   */
  async createPaymentRequest(data) {
    try {
      if (!this.isConfigured) {
        throw new Error('PagoEfectivo no está configurado');
      }

      const {
        orderId,
        amount,
        currency = 'PEN',
        customerEmail,
        customerFirstName,
        customerLastName,
        customerPhone,
        description,
        expirationDate // Fecha de expiración del CIP (formato: YYYY-MM-DDTHH:mm:ss)
      } = data;

      // Calcular fecha de expiración (24 horas por defecto)
      const expiration = expirationDate || this.getDefaultExpiration();

      const payload = {
        currency: currency,
        amount: amount,
        transactionCode: orderId,
        dateExpiry: expiration,
        paymentConcept: description || `Orden ${orderId}`,
        additionalData: orderId,
        userEmail: customerEmail,
        userId: customerEmail,
        userName: `${customerFirstName} ${customerLastName}`.trim(),
        userPhone: customerPhone || '',
        serviceCode: this.serviceCode
      };

      console.log('📤 Creando solicitud PagoEfectivo:', orderId);

      const response = await axios.post(
        `${this.baseURL}/cips`,
        payload,
        {
          headers: this.getAuthHeaders()
        }
      );

      const result = response.data;

      console.log('✅ Código CIP generado:', result.cip);

      return {
        success: true,
        cipCode: result.cip,
        cipUrl: result.cipUrl || `https://www.pagoefectivo.pe/pago/${result.cip}`,
        transactionCode: result.transactionCode || orderId,
        amount: amount,
        currency: currency,
        expirationDate: expiration,
        paymentInstructions: this.getPaymentInstructions(result.cip)
      };

    } catch (error) {
      console.error('❌ Error creando CIP en PagoEfectivo:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.message || 'Error al generar código de pago',
        details: error.response?.data
      };
    }
  }

  /**
   * Obtiene fecha de expiración por defecto (24 horas)
   */
  getDefaultExpiration() {
    const now = new Date();
    now.setHours(now.getHours() + 24);
    return now.toISOString().split('.')[0]; // Formato: YYYY-MM-DDTHH:mm:ss
  }

  /**
   * Consulta el estado de un pago
   * @param {string} cipCode - Código CIP
   */
  async getPaymentStatus(cipCode) {
    try {
      const response = await axios.get(
        `${this.baseURL}/cips/${cipCode}`,
        {
          headers: this.getAuthHeaders()
        }
      );

      const result = response.data;

      return {
        success: true,
        cipCode: cipCode,
        status: result.status, // PENDING, PAID, EXPIRED, CANCELLED
        amount: result.amount,
        paidAmount: result.paidAmount || 0,
        paidDate: result.paidDate,
        expirationDate: result.dateExpiry,
        isPaid: result.status === 'PAID'
      };

    } catch (error) {
      console.error('❌ Error consultando CIP:', error.response?.data || error.message);

      return {
        success: false,
        error: 'Error al consultar estado de pago'
      };
    }
  }

  /**
   * Anula una solicitud de pago
   * @param {string} cipCode - Código CIP
   */
  async cancelPayment(cipCode) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/cips/${cipCode}`,
        {
          headers: this.getAuthHeaders()
        }
      );

      console.log('✅ CIP anulado:', cipCode);

      return {
        success: true,
        cipCode: cipCode,
        status: 'CANCELLED'
      };

    } catch (error) {
      console.error('❌ Error anulando CIP:', error.response?.data || error.message);

      return {
        success: false,
        error: 'Error al anular código de pago'
      };
    }
  }

  /**
   * Genera instrucciones de pago para el cliente
   */
  getPaymentInstructions(cipCode) {
    return {
      code: cipCode,
      title: 'Paga en efectivo con tu código CIP',
      instructions: [
        `Tu código de pago es: ${cipCode}`,
        'Puedes pagar en más de 100,000 puntos en todo Perú:',
        '• Bancos: BCP, Interbank, BBVA, Scotiabank',
        '• Agentes: Western Union, Kasnet, FullCarga',
        '• Supermercados: Wong, Metro, Plaza Vea',
        '• Farmacias: Inkafarma, Mifarma',
        '• Bodegas autorizadas'
      ],
      steps: [
        'Ve a cualquier punto de pago',
        'Indica que pagarás con PagoEfectivo',
        `Proporciona tu código: ${cipCode}`,
        'Paga el monto en efectivo',
        'Recibirás confirmación inmediata por email'
      ],
      paymentPoints: [
        {
          category: 'Bancos',
          options: ['BCP', 'Interbank', 'BBVA', 'Scotiabank', 'Banco de la Nación']
        },
        {
          category: 'Agentes',
          options: ['Western Union', 'Kasnet', 'FullCarga', 'MoneyGram']
        },
        {
          category: 'Retail',
          options: ['Wong', 'Metro', 'Plaza Vea', 'Inkafarma', 'Mifarma']
        }
      ]
    };
  }

  /**
   * Valida webhook de PagoEfectivo
   * @param {object} payload - Datos del webhook
   * @param {string} signature - Firma recibida
   */
  validateWebhook(payload, signature) {
    const calculatedSignature = this.generateSignature(payload);
    return calculatedSignature === signature;
  }

  /**
   * Procesa notificación de webhook
   */
  async processWebhook(data) {
    try {
      const {
        transactionCode,
        cipCode,
        amount,
        status,
        operationNumber,
        paymentDate
      } = data;

      console.log(`📨 Webhook PagoEfectivo recibido - CIP: ${cipCode}, Estado: ${status}`);

      if (status === 'PAID') {
        console.log(`✅ Pago confirmado - Orden: ${transactionCode}`);

        return {
          success: true,
          isPaid: true,
          orderId: transactionCode,
          cipCode: cipCode,
          amount: amount,
          operationNumber: operationNumber,
          paymentDate: paymentDate
        };
      }

      return {
        success: true,
        isPaid: false,
        status: status
      };

    } catch (error) {
      console.error('❌ Error procesando webhook PagoEfectivo:', error.message);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test de conexión
   */
  async testConnection() {
    try {
      // Intentar crear un CIP de prueba
      const testData = {
        orderId: `TEST-${Date.now()}`,
        amount: 1.00,
        currency: 'PEN',
        customerEmail: 'test@example.com',
        customerFirstName: 'Test',
        customerLastName: 'User',
        description: 'Test de conexión'
      };

      const result = await this.createPaymentRequest(testData);

      if (result.success) {
        // Anular el CIP de prueba
        await this.cancelPayment(result.cipCode);
        console.log('✅ Conexión con PagoEfectivo exitosa');
        return { success: true, message: 'Conexión exitosa' };
      } else {
        return { success: false, error: result.error };
      }

    } catch (error) {
      console.error('❌ Error conectando con PagoEfectivo:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Información del servicio
   */
  getServiceInfo() {
    return {
      service: 'PagoEfectivo',
      isConfigured: this.isConfigured,
      environment: this.environment,
      serviceCode: this.serviceCode,
      paymentPoints: '100,000+ en todo Perú',
      paymentMethods: ['Efectivo en bancos', 'Efectivo en agentes', 'Efectivo en retail'],
      commission: '2.89% + S/ 0.49',
      expirationTime: '24 horas (configurable)',
      website: 'https://www.pagoefectivo.pe',
      docs: 'https://www.pagoefectivo.pe/documentacion'
    };
  }
}

module.exports = new PagoEfectivoService();
