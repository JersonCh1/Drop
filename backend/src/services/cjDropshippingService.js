// backend/src/services/cjDropshippingService.js
const axios = require('axios');
const crypto = require('crypto');

/**
 * 🚀 SERVICIO DE CJ DROPSHIPPING - Integración completa con la API
 *
 * Funcionalidades:
 * - Búsqueda de productos
 * - Obtener detalles de productos
 * - Calcular costos de envío
 * - Crear órdenes automáticamente
 * - Rastrear órdenes
 * - Consultar inventario
 *
 * Documentación: https://developers.cjdropshipping.com/
 */

class CJDropshippingService {
  constructor() {
    // Credenciales de CJ Dropshipping (obtener desde https://cjdropshipping.com/user/)
    this.email = process.env.CJ_EMAIL || '';
    this.apiKey = process.env.CJ_API_KEY || '';

    // URL base de la API
    this.baseURL = 'https://developers.cjdropshipping.com/api2.0/v1';

    // Token de acceso (se renueva automáticamente)
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;

    this.isConfigured = !!(this.email && this.apiKey);

    if (!this.isConfigured) {
      console.log('⚠️  CJ Dropshipping no configurado - Variables faltantes:');
      console.log('   CJ_EMAIL, CJ_API_KEY');
      console.log('   Para usar CJ, regístrate en: https://www.cjdropshipping.com/');
    } else {
      console.log('✅ CJ Dropshipping configurado');
    }
  }

  /**
   * Obtener token de acceso
   */
  async getAccessToken() {
    // Si el token es válido, retornarlo
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${this.baseURL}/authentication/getAccessToken`, {
        email: this.email,
        apiKey: this.apiKey
      });

      if (response.data.code === 200 && response.data.data && response.data.result) {
        this.accessToken = response.data.data.accessToken;
        this.refreshToken = response.data.data.refreshToken;
        // Token válido según la respuesta (usualmente 15 días)
        this.tokenExpiry = new Date(response.data.data.accessTokenExpiryDate).getTime();

        console.log('✅ Token de CJ Dropshipping obtenido');
        console.log(`📅 Token expira: ${new Date(this.tokenExpiry).toLocaleString()}`);
        return this.accessToken;
      } else {
        throw new Error(response.data.message || 'Error obteniendo token');
      }
    } catch (error) {
      console.error('❌ Error obteniendo token de CJ:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Realizar petición autenticada a la API
   */
  async apiRequest(endpoint, data = {}, method = 'POST') {
    if (!this.isConfigured) {
      throw new Error('CJ Dropshipping no está configurado');
    }

    try {
      const token = await this.getAccessToken();

      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'CJ-Access-Token': token
        }
      };

      if (method === 'POST') {
        config.data = data;
      } else {
        config.params = data;
      }

      const response = await axios(config);

      if (response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error en API de CJ');
      }
    } catch (error) {
      console.error(`❌ Error en ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 🔍 Buscar productos en CJ Dropshipping
   */
  async searchProducts(query, options = {}) {
    const {
      pageNum = 1,
      pageSize = 20,
      categoryId = null,
      priceMin = null,
      priceMax = null,
      sortBy = 'sales', // sales, price_asc, price_desc
      country = 'US' // País del almacén
    } = options;

    try {
      const searchParams = {
        productNameEn: query,
        pageNum,
        pageSize
      };

      if (categoryId) searchParams.categoryId = categoryId;
      if (priceMin) searchParams.startPrice = priceMin;
      if (priceMax) searchParams.endPrice = priceMax;
      if (country) searchParams.warehouseCountryEn = country;

      const result = await this.apiRequest('/product/list', searchParams, 'GET');

      return {
        success: true,
        products: result.list || [],
        total: result.total || 0,
        pages: Math.ceil((result.total || 0) / pageSize)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        products: [],
        total: 0
      };
    }
  }

  /**
   * 📦 Obtener detalles completos de un producto
   */
  async getProductDetails(productId) {
    try {
      const result = await this.apiRequest('/product/query', {
        pid: productId
      }, 'GET');

      if (!result) {
        throw new Error('Producto no encontrado');
      }

      // Traducir nombre y descripción al español
      const translatedName = await this.translateToSpanish(result.productNameEn);

      // Limpiar descripción HTML de CJ
      let cleanDescription = result.description || '';
      if (cleanDescription) {
        cleanDescription = cleanDescription
          // Remover script y style
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<style[^>]*>.*?<\/style>/gi, '')
          // Remover imágenes
          .replace(/<img[^>]*>/gi, '')
          .replace(/https?:\/\/[^\s<>"]+?\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s<>"]*)?/gi, '')
          // Convertir tags HTML a texto
          .replace(/<div[^>]*>/gi, '\n')
          .replace(/<\/div>/gi, '\n')
          .replace(/<p[^>]*>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<li[^>]*>/gi, '\n• ')
          .replace(/<\/li>/gi, '')
          .replace(/<ul[^>]*>/gi, '\n')
          .replace(/<\/ul>/gi, '\n')
          .replace(/<ol[^>]*>/gi, '\n')
          .replace(/<\/ol>/gi, '\n')
          .replace(/<h[1-6][^>]*>/gi, '\n\n')
          .replace(/<\/h[1-6]>/gi, '\n')
          .replace(/<strong[^>]*>/gi, '')
          .replace(/<\/strong>/gi, '')
          .replace(/<b[^>]*>/gi, '')
          .replace(/<\/b>/gi, '')
          .replace(/<em[^>]*>/gi, '')
          .replace(/<\/em>/gi, '')
          .replace(/<i[^>]*>/gi, '')
          .replace(/<\/i>/gi, '')
          .replace(/<font[^>]*>/gi, '')
          .replace(/<\/font>/gi, '')
          // Remover cualquier otro tag
          .replace(/<[^>]+>/g, '')
          // Limpiar entidades HTML
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          // Limpiar espacios
          .replace(/\t/g, '')
          .replace(/  +/g, ' ')
          // Filtrar líneas
          .split('\n')
          .map(line => line.trim())
          .filter(line => {
            if (line.length === 0) return false;
            if (/^https?:\/\//i.test(line)) return false;
            if (line.length < 3) return false;
            if (/^[^a-zA-Z0-9]+$/.test(line)) return false;
            return true;
          })
          .join('\n')
          .trim();

        // Si quedó vacío, usar nombre del producto
        if (!cleanDescription || cleanDescription.length < 10) {
          cleanDescription = `${result.productNameEn}\n\nProducto importado desde CJ Dropshipping con envío directo.`;
        }
      }

      // Traducir descripción al español
      const translatedDescription = await this.translateToSpanish(cleanDescription);

      return {
        success: true,
        product: {
          id: result.pid,
          name: translatedName || result.productNameEn,
          nameEn: result.productNameEn, // Mantener nombre original
          description: translatedDescription || cleanDescription,
          descriptionEn: cleanDescription, // Mantener descripción original
          price: parseFloat(result.sellPrice),
          originalPrice: parseFloat(result.originalPrice),
          images: result.productImage || [],
          variants: result.variants || [],
          categoryId: result.categoryId,
          categoryName: result.categoryName,
          weight: result.packWeight,
          shippingTime: result.shippingTime,
          stock: result.sellStatus === 1 ? result.variantList?.[0]?.variantSellPrice : 0,
          specifications: result.productSku || []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 💰 Calcular costos de envío (con tarifas promocionales si están disponibles)
   */
  async calculateShipping(products, destinationCountry = 'PE', shippingAddress = {}) {
    try {
      // Preparar productos para el cálculo
      const items = products.map(p => ({
        vid: p.variantId || '',
        quantity: p.quantity
      }));

      // Usar el endpoint avanzado que incluye descuentos
      const payload = {
        startCountryCode: 'CN', // CJ envía desde China
        endCountryCode: destinationCountry,
        products: items
      };

      // Agregar dirección de envío si está disponible (mejora precisión)
      if (shippingAddress.zipCode) {
        payload.zipCode = shippingAddress.zipCode;
      }
      if (shippingAddress.houseNumber) {
        payload.houseNumber = shippingAddress.houseNumber;
      }

      const result = await this.apiRequest('/logistic/freightCalculateTip', payload);

      // Procesar opciones de envío con descuentos
      const shippingOptions = (result.list || []).map(option => {
        const hasDiscount = option.discountFreight && parseFloat(option.discountFreight) < parseFloat(option.freight);

        return {
          carrier: option.logisticName,
          logisticId: option.logisticId,
          cost: hasDiscount ? parseFloat(option.discountFreight) : parseFloat(option.freight),
          originalCost: parseFloat(option.freight),
          discount: hasDiscount ? parseFloat(option.freight) - parseFloat(option.discountFreight) : 0,
          deliveryTime: option.logisticAging,
          deliveryTimeMin: option.logisticAging?.split('-')[0] || null,
          deliveryTimeMax: option.logisticAging?.split('-')[1] || null,
          channel: option.channelName || option.logisticName,
          isPromotional: hasDiscount
        };
      });

      // Ordenar por precio (más barato primero)
      shippingOptions.sort((a, b) => a.cost - b.cost);

      return {
        success: true,
        options: shippingOptions,
        cheapestOption: shippingOptions[0] || null
      };
    } catch (error) {
      console.error('❌ Error calculando envío:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message,
        options: []
      };
    }
  }

  /**
   * 🛒 Crear orden en CJ Dropshipping
   */
  async createOrder(orderData) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPostalCode,
      shippingCountry,
      products, // [{ productId, variantId, quantity, price }]
      logisticId = null,
      orderNumber // Nuestro número de orden interno
    } = orderData;

    try {
      // Preparar productos para CJ
      const orderProducts = products.map(p => ({
        productId: p.productId,
        variantId: p.variantId || '',
        productNum: p.quantity
      }));

      // Crear la orden
      const orderPayload = {
        orderNumber: orderNumber, // Nuestro número de orden
        shippingMethod: logisticId || 'CJ_Packet_Ordinary', // Método de envío
        shippingCountryCode: shippingCountry || 'PE',
        shippingProvince: shippingState,
        shippingCity: shippingCity,
        shippingAddress: shippingAddress,
        shippingZip: shippingPostalCode,
        shippingCustomerName: customerName,
        shippingPhone: customerPhone,
        remark: `Order from ${orderNumber}`,
        products: orderProducts
      };

      const result = await this.apiRequest('/shopping/order/createOrder', orderPayload);

      console.log(`✅ Orden creada en CJ: ${result.orderId}`);

      return {
        success: true,
        cjOrderId: result.orderId,
        cjOrderNumber: result.orderNumber,
        totalAmount: result.totalAmount,
        message: 'Orden creada exitosamente en CJ Dropshipping'
      };
    } catch (error) {
      console.error('❌ Error creando orden en CJ:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 📊 Consultar estado de una orden
   */
  async getOrderStatus(cjOrderId) {
    try {
      const result = await this.apiRequest('/shopping/order/getOrderDetail', {
        orderId: cjOrderId
      });

      const statusMap = {
        'WAIT_PAY': 'PENDING', // Esperando pago
        'PAID': 'CONFIRMED', // Pagado
        'PROCESSING': 'PROCESSING', // En proceso
        'SHIPPED': 'SHIPPED', // Enviado
        'DELIVERED': 'DELIVERED', // Entregado
        'CANCELLED': 'CANCELLED' // Cancelado
      };

      return {
        success: true,
        order: {
          cjOrderId: result.orderId,
          cjOrderNumber: result.orderNumber,
          status: statusMap[result.orderStatus] || 'PENDING',
          trackingNumber: result.logisticTrackNumber,
          trackingUrl: result.logisticLink,
          carrier: result.logisticName,
          totalAmount: result.totalAmount,
          products: result.orderProducts || [],
          createdAt: result.createTime,
          updatedAt: result.updateTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🚚 Obtener tracking de una orden
   */
  async getOrderTracking(cjOrderId) {
    try {
      const result = await this.apiRequest('/logistic/trackQuery', {
        orderId: cjOrderId
      });

      const trackingEvents = (result.trackDetails || []).map(event => ({
        date: event.trackTime,
        status: event.trackContent,
        location: event.trackLocation || 'Unknown'
      }));

      return {
        success: true,
        trackingNumber: result.trackNumber,
        carrier: result.logisticName,
        status: result.logisticStatus,
        currentLocation: result.trackLocation,
        events: trackingEvents
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 💳 Confirmar pago de una orden (para que CJ la procese)
   */
  async confirmOrderPayment(cjOrderId) {
    try {
      await this.apiRequest('/shopping/order/confirmPay', {
        orderId: cjOrderId
      });

      console.log(`✅ Pago confirmado en CJ para orden: ${cjOrderId}`);

      return {
        success: true,
        message: 'Pago confirmado en CJ Dropshipping'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 📋 Obtener lista de todas las órdenes
   */
  async getOrders(options = {}) {
    const {
      pageNum = 1,
      pageSize = 20,
      startDate = null,
      endDate = null,
      status = null
    } = options;

    try {
      const params = {
        pageNum,
        pageSize
      };

      if (startDate) params.startCreateTime = startDate;
      if (endDate) params.endCreateTime = endDate;
      if (status) params.orderStatus = status;

      const result = await this.apiRequest('/shopping/order/getOrderList', params);

      return {
        success: true,
        orders: result.list || [],
        total: result.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        orders: [],
        total: 0
      };
    }
  }

  /**
   * 📦 Consultar inventario de un producto
   */
  async checkStock(productId, variantId = null) {
    try {
      const result = await this.apiRequest('/product/variant/query', {
        pid: productId,
        vid: variantId
      }, 'GET');

      return {
        success: true,
        inStock: result.variantSellStatus === 1,
        quantity: result.variantQuantity || 0,
        price: parseFloat(result.variantSellPrice),
        sku: result.variantSku
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        inStock: false
      };
    }
  }

  /**
   * 🔗 Sincronizar producto de CJ a nuestra base de datos
   */
  async syncProduct(productId) {
    try {
      const productDetails = await this.getProductDetails(productId);

      if (!productDetails.success) {
        throw new Error(productDetails.error);
      }

      const product = productDetails.product;

      // Retornar datos del producto listos para guardar en nuestra BD
      return {
        success: true,
        productData: {
          name: product.name,
          description: product.description,
          price: product.price,
          compareAtPrice: product.originalPrice,
          images: product.images,
          cjProductId: product.id,
          supplier: 'CJ_DROPSHIPPING',
          supplierUrl: `https://www.cjdropshipping.com/product/${product.id}.html`,
          inStock: product.stock > 0,
          weight: product.weight
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🌐 Traducir texto del inglés al español usando Google Translate (gratuito)
   */
  async translateToSpanish(text) {
    if (!text || text.trim().length === 0) {
      return text;
    }

    try {
      // Usar la API gratuita de Google Translate
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;

      const response = await axios.get(url);

      // La respuesta es un array complejo, extraer solo el texto traducido
      if (response.data && response.data[0]) {
        const translated = response.data[0]
          .map(item => item[0])
          .filter(item => item)
          .join('');

        return translated || text;
      }

      return text;
    } catch (error) {
      console.error('⚠️  Error traduciendo texto:', error.message);
      // Si falla la traducción, retornar el texto original
      return text;
    }
  }

  /**
   * ℹ️ Información del servicio
   */
  getServiceInfo() {
    return {
      service: 'CJ Dropshipping API v2.0',
      isConfigured: this.isConfigured,
      features: [
        'Búsqueda de productos',
        'Detalles de productos',
        'Cálculo de envío',
        'Creación automática de órdenes',
        'Tracking de órdenes',
        'Consulta de inventario',
        'Sincronización de productos',
        'Traducción automática al español'
      ],
      apiUrl: this.baseURL,
      docs: 'https://developers.cjdropshipping.com/'
    };
  }
}

module.exports = new CJDropshippingService();
