// backend/src/services/cloudinaryService.js
const cloudinary = require('cloudinary').v2;

class CloudinaryService {
  constructor() {
    this.isConfigured = false;
  }

  async initialize() {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME ||
          !process.env.CLOUDINARY_API_KEY ||
          !process.env.CLOUDINARY_API_SECRET) {
        console.log('⚠️  Cloudinary no configurado - variables de entorno faltantes');
        return;
      }

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      this.isConfigured = true;
      console.log('✅ Cloudinary inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Cloudinary:', error.message);
    }
  }

  async uploadImage(fileBuffer, options = {}) {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary no está configurado');
      }

      return new Promise((resolve, reject) => {
        const uploadOptions = {
          folder: options.folder || 'dropshipping-products',
          transformation: options.transformation || [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ],
          resource_type: 'auto'
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('❌ Error subiendo imagen a Cloudinary:', error);
              reject(error);
            } else {
              console.log('✅ Imagen subida a Cloudinary:', result.secure_url);
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format
              });
            }
          }
        );

        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      console.error('❌ Error en uploadImage:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files, options = {}) {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file.data, options));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('❌ Error subiendo múltiples imágenes:', error);
      throw error;
    }
  }

  async deleteImage(publicId) {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary no está configurado');
      }

      const result = await cloudinary.uploader.destroy(publicId);
      console.log('🗑️  Imagen eliminada de Cloudinary:', publicId);
      return result;
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      throw error;
    }
  }

  async getImageUrl(publicId, transformations = {}) {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary no está configurado');
      }

      return cloudinary.url(publicId, transformations);
    } catch (error) {
      console.error('❌ Error obteniendo URL de imagen:', error);
      throw error;
    }
  }

  getServiceInfo() {
    return {
      isConfigured: this.isConfigured,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'not configured'
    };
  }
}

module.exports = new CloudinaryService();
