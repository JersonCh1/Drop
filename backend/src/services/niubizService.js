// backend/src/services/niubizService.js
const axios = require('axios');
const crypto = require('crypto');

/**
 * 💳 SERVICIO DE NIUBIZ (VISANET) - Pasarela de pagos #1 en Perú
 *
 * Acepta: Visa, Mastercard, American Express, Diners Club
 * Comisión: 2.5% - 3.5% (mucho más barato que Culqi 4.7%)
 *
 * Documentación: https://desarrolladores.niubiz.com.pe/
 */

class NiubizService {
  constructor() {
    this.merchantId = process.env.NIUBIZ_MERCHANT_ID || '';
    this.apiKey = process.env.NIUBIZ_API_KEY || '';
    this.apiSecret = process.env.NIUBIZ_API_SECRET || '';
    this.environment = process.env.NIUBIZ_ENVIRONMENT || 'test'; // 'test' o 'production'

    // URLs según ambiente
    this.baseURL = this.environment === 'production'
      ? 'https://apiprod.vnforapps.com'
      : 'https://apisandbox.vnforapps.com';

    this.isConfigured = !!(this.merchantId && this.apiKey && this.apiSecret);

    if (!this.isConfigured) {
      console.log('⚠️  Niubiz no configurado - Variables faltantes:');
      console.log('   NIUBIZ_MERCHANT_ID, NIUBIZ_API_KEY, NIUBIZ_API_SECRET');
      console.log('   Para obtener credenciales: https://desarrolladores.niubiz.com.pe/');
    } else {
      console.log(`✅ Niubiz configurado - Ambiente: ${this.environment}`);
      console.log(`📍 Merchant ID: ${this.merchantId}`);
      console.log('💳 Acepta: Visa, Mastercard, Amex, Diners');
      console.log('💰 Comisión: 2.5-3.5% (vs Culqi 4.7%)');
    }
  }

  /**
   * Genera un token de acceso para la sesión
   */
  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');

      const response = await axios.post(
        `${this.baseURL}/api.security/v1/security`,
        {},
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo token de Niubiz:', error.message);
      throw new Error('Error al generar token de sesión');
    }
  }

  /**
   * Genera un token de sesión para el cliente
   * @param {number} amount - Monto en centavos (ej: 5000 = S/ 50.00)
   * @returns {object} Token de sesión
   */
  async createSessionToken(amount) {
    try {
      if (!this.isConfigured) {
        throw new Error('Niubiz no está configurado');
      }

      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseURL}/api.ecommerce/v2/ecommerce/token/session/${this.merchantId}`,
        {
          channel: 'web',
          amount: amount,
          antifraud: {
            clientIp: '0.0.0.0',
            merchantDefineData: {
              MDD4: 'ecommerce',
              MDD21: '0',
              MDD32: 'ecommerce',
              MDD75: 'Registrado',
              MDD77: '100'
            }
          }
        },
        {
          headers: {
            'Authorization': accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Token de sesión Niubiz generado');
      return {
        sessionKey: response.data.sessionKey,
        expirationTime: response.data.expirationTime
      };

    } catch (error) {
      console.error('❌ Error creando sesión de Niubiz:', error.response?.data || error.message);
      throw new Error('Error al crear sesión de pago');
    }
  }

  /**
   * Procesa una autorización de pago
   * @param {object} data - Datos del pago
   */
  async authorize(data) {
    try {
      const {
        transactionToken,
        amount,
        orderId,
        email,
        firstName,
        lastName
      } = data;

      const accessToken = await this.getAccessToken();

      const purchaseNumber = `ORD-${orderId}-${Date.now()}`;

      const payload = {
        channel: 'web',
        captureType: 'manual', // 'manual' o 'automatic'
        countable: true,
        order: {
          tokenId: transactionToken,
          purchaseNumber: purchaseNumber,
          amount: amount,
          currency: 'PEN',
          customerId: email
        }
      };

      const response = await axios.post(
        `${this.baseURL}/api.authorization/v3/authorization/ecommerce/${this.merchantId}`,
        payload,
        {
          headers: {
            'Authorization': accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;

      console.log('✅ Autorización Niubiz:', result.dataMap?.ACTION_DESCRIPTION);

      return {
        success: result.dataMap?.ACTION_CODE === '000',
        transactionId: result.dataMap?.TRANSACTION_ID,
        authorizationCode: result.dataMap?.AUTHORIZATION_CODE,
        actionCode: result.dataMap?.ACTION_CODE,
        actionDescription: result.dataMap?.ACTION_DESCRIPTION,
        purchaseNumber: purchaseNumber,
        amount: amount,
        currency: 'PEN',
        card: {
          brand: result.dataMap?.BRAND,
          last4: result.dataMap?.CARD?.slice(-4)
        }
      };

    } catch (error) {
      console.error('❌ Error en autorización Niubiz:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.dataMap?.ACTION_DESCRIPTION || 'Error procesando pago',
        actionCode: error.response?.data?.dataMap?.ACTION_CODE
      };
    }
  }

  /**
   * Captura un pago previamente autorizado
   * @param {string} transactionId - ID de la transacción
   * @param {number} amount - Monto a capturar
   */
  async capture(transactionId, amount) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.put(
        `${this.baseURL}/api.authorization/v3/authorization/ecommerce/${this.merchantId}/${transactionId}`,
        { amount },
        {
          headers: {
            'Authorization': accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Pago capturado en Niubiz:', transactionId);

      return {
        success: true,
        transactionId: transactionId,
        capturedAmount: amount
      };

    } catch (error) {
      console.error('❌ Error capturando pago Niubiz:', error.response?.data || error.message);

      return {
        success: false,
        error: 'Error al capturar pago'
      };
    }
  }

  /**
   * Anula una transacción
   * @param {string} transactionId - ID de la transacción
   */
  async void(transactionId) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.delete(
        `${this.baseURL}/api.authorization/v3/authorization/ecommerce/${this.merchantId}/${transactionId}`,
        {
          headers: {
            'Authorization': accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Transacción anulada en Niubiz:', transactionId);

      return {
        success: true,
        transactionId: transactionId
      };

    } catch (error) {
      console.error('❌ Error anulando transacción Niubiz:', error.response?.data || error.message);

      return {
        success: false,
        error: 'Error al anular transacción'
      };
    }
  }

  /**
   * Obtiene información de una transacción
   */
  async getTransaction(transactionId) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/api.authorization/v3/authorization/ecommerce/${this.merchantId}/${transactionId}`,
        {
          headers: {
            'Authorization': accessToken
          }
        }
      );

      return {
        success: true,
        transaction: response.data
      };

    } catch (error) {
      console.error('❌ Error consultando transacción Niubiz:', error.message);

      return {
        success: false,
        error: 'Error al consultar transacción'
      };
    }
  }

  /**
   * Validación de configuración
   */
  async testConnection() {
    try {
      const token = await this.getAccessToken();
      console.log('✅ Conexión con Niubiz exitosa');
      return { success: true, message: 'Conexión exitosa' };
    } catch (error) {
      console.error('❌ Error conectando con Niubiz:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Información del servicio
   */
  getServiceInfo() {
    return {
      service: 'Niubiz (Visanet)',
      isConfigured: this.isConfigured,
      environment: this.environment,
      merchantId: this.merchantId,
      acceptedCards: ['Visa', 'Mastercard', 'American Express', 'Diners Club'],
      commission: '2.5% - 3.5%',
      website: 'https://www.niubiz.com.pe',
      docs: 'https://desarrolladores.niubiz.com.pe/'
    };
  }
}

module.exports = new NiubizService();
