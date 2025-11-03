// backend/src/services/cjAuthService.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CJ_API_URL = process.env.CJ_API_URL || 'https://developers.cjdropshipping.com/api2.0/v1';
const CJ_EMAIL = process.env.CJ_EMAIL;
const CJ_API_KEY = process.env.CJ_API_KEY;
const TOKEN_CACHE_FILE = path.join(__dirname, '../../.cj_token_cache.json');

class CJAuthService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiryDate = null;
    this.refreshTokenExpiryDate = null;

    // Cargar token del caché al iniciar
    this.loadTokenFromCache();
  }

  /**
   * Cargar token desde archivo de caché
   */
  loadTokenFromCache() {
    try {
      if (fs.existsSync(TOKEN_CACHE_FILE)) {
        const cache = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf8'));
        this.accessToken = cache.accessToken;
        this.refreshToken = cache.refreshToken;
        this.tokenExpiryDate = cache.tokenExpiryDate ? new Date(cache.tokenExpiryDate) : null;
        this.refreshTokenExpiryDate = cache.refreshTokenExpiryDate ? new Date(cache.refreshTokenExpiryDate) : null;

        // Verificar si el token no ha expirado
        if (this.tokenExpiryDate && this.tokenExpiryDate > new Date()) {
          console.log('✅ Token de CJ cargado desde caché');
          console.log(`📅 Token expira: ${this.tokenExpiryDate.toLocaleString()}`);
        } else {
          console.log('⚠️  Token en caché expirado, se obtendrá uno nuevo');
          this.clearCache();
        }
      }
    } catch (error) {
      console.error('❌ Error cargando token de caché:', error.message);
    }
  }

  /**
   * Guardar token en archivo de caché
   */
  saveTokenToCache() {
    try {
      const cache = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        tokenExpiryDate: this.tokenExpiryDate,
        refreshTokenExpiryDate: this.refreshTokenExpiryDate
      };
      fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch (error) {
      console.error('❌ Error guardando token en caché:', error.message);
    }
  }

  /**
   * Limpiar caché de tokens
   */
  clearCache() {
    try {
      if (fs.existsSync(TOKEN_CACHE_FILE)) {
        fs.unlinkSync(TOKEN_CACHE_FILE);
      }
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiryDate = null;
      this.refreshTokenExpiryDate = null;
    } catch (error) {
      console.error('❌ Error limpiando caché:', error.message);
    }
  }

  /**
   * Obtener Access Token de CJ Dropshipping
   * Según documentación: https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken
   */
  async getAccessToken() {
    try {
      if (!CJ_EMAIL || !CJ_API_KEY) {
        throw new Error('CJ_EMAIL y CJ_API_KEY no están configurados en .env');
      }

      console.log('🔐 Obteniendo Access Token de CJ Dropshipping...');

      const response = await axios.post(
        `${CJ_API_URL}/authentication/getAccessToken`,
        {
          email: CJ_EMAIL,
          apiKey: CJ_API_KEY
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.result && response.data.code === 200) {
        this.accessToken = response.data.data.accessToken;
        this.refreshToken = response.data.data.refreshToken;
        this.tokenExpiryDate = new Date(response.data.data.accessTokenExpiryDate);
        this.refreshTokenExpiryDate = new Date(response.data.data.refreshTokenExpiryDate);

        // Guardar en caché
        this.saveTokenToCache();

        console.log('✅ Access Token obtenido exitosamente');
        console.log(`📅 Token expira: ${this.tokenExpiryDate.toLocaleString()}`);

        return this.accessToken;
      } else {
        throw new Error(response.data.message || 'Error obteniendo Access Token');
      }

    } catch (error) {
      console.error('❌ Error obteniendo Access Token de CJ:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Refrescar Access Token usando Refresh Token
   * Según documentación: https://developers.cjdropshipping.com/api2.0/v1/authentication/refreshAccessToken
   */
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No hay Refresh Token disponible. Debes obtener un nuevo Access Token.');
      }

      console.log('🔄 Refrescando Access Token de CJ Dropshipping...');

      const response = await axios.post(
        `${CJ_API_URL}/authentication/refreshAccessToken`,
        {
          refreshToken: this.refreshToken
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.result && response.data.code === 200) {
        this.accessToken = response.data.data.accessToken;
        this.refreshToken = response.data.data.refreshToken;
        this.tokenExpiryDate = new Date(response.data.data.accessTokenExpiryDate);
        this.refreshTokenExpiryDate = new Date(response.data.data.refreshTokenExpiryDate);

        // Guardar en caché
        this.saveTokenToCache();

        console.log('✅ Access Token refrescado exitosamente');
        console.log(`📅 Token expira: ${this.tokenExpiryDate.toLocaleString()}`);

        return this.accessToken;
      } else {
        throw new Error(response.data.message || 'Error refrescando Access Token');
      }

    } catch (error) {
      console.error('❌ Error refrescando Access Token:', error.response?.data || error.message);
      // Si falla el refresh, intentar obtener un nuevo token
      return await this.getAccessToken();
    }
  }

  /**
   * Obtener un Access Token válido (obtiene nuevo o refresca el existente)
   */
  async getValidAccessToken() {
    // Si no hay token, obtener uno nuevo
    if (!this.accessToken) {
      return await this.getAccessToken();
    }

    // Verificar si el token ha expirado o está por expirar (en las próximas 24 horas)
    // Cambio de 2 horas a 24 horas para evitar renovaciones innecesarias
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (this.tokenExpiryDate && this.tokenExpiryDate < oneDayFromNow) {
      console.log('⏰ Access Token expirado o por expirar (< 24h), refrescando...');
      return await this.refreshAccessToken();
    }

    // Token todavía válido, retornarlo directamente
    console.log(`✅ Usando token en caché (expira: ${this.tokenExpiryDate.toLocaleString()})`);
    return this.accessToken;
  }

  /**
   * Cerrar sesión en CJ Dropshipping
   */
  async logout() {
    try {
      if (!this.accessToken) {
        return true;
      }

      console.log('👋 Cerrando sesión en CJ Dropshipping...');

      const response = await axios.post(
        `${CJ_API_URL}/authentication/logout`,
        {},
        {
          headers: {
            'CJ-Access-Token': this.accessToken
          }
        }
      );

      if (response.data.result && response.data.code === 200) {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiryDate = null;
        this.refreshTokenExpiryDate = null;

        console.log('✅ Sesión cerrada exitosamente');
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Error cerrando sesión:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Verificar si está configurado
   */
  isConfigured() {
    return !!(CJ_EMAIL && CJ_API_KEY);
  }
}

// Exportar instancia singleton
const cjAuthService = new CJAuthService();
module.exports = cjAuthService;
