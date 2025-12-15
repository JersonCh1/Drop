const logger = require('../utils/logger');

// Middleware para manejar rutas no encontradas (404)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware global de manejo de errores
const errorHandler = (err, req, res, next) => {
  // Si la respuesta ya fue enviada, delegar al manejador por defecto
  if (res.headersSent) {
    return next(err);
  }

  // Determinar status code
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Log del error
  logger.logError(err, `${req.method} ${req.originalUrl}`);

  // Respuesta según el entorno
  const errorResponse = {
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details || null,
    }),
  };

  // Manejar tipos específicos de errores
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors || err.message,
    });
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'No autorizado - Token inválido o expirado',
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
    });
  }

  if (err.code === 11000) {
    // Error de duplicado en MongoDB/Prisma
    return res.status(409).json({
      success: false,
      message: 'Recurso duplicado',
    });
  }

  // Error de Prisma
  if (err.code?.startsWith('P')) {
    const prismaErrorMessages = {
      P2002: 'Este registro ya existe',
      P2025: 'Registro no encontrado',
      P2003: 'Error de relación en la base de datos',
      P2001: 'Registro requerido no encontrado',
    };

    return res.status(400).json({
      success: false,
      message: prismaErrorMessages[err.code] || 'Error de base de datos',
      ...(process.env.NODE_ENV === 'development' && { code: err.code }),
    });
  }

  // Errores de CORS
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Acceso bloqueado por CORS',
    });
  }

  // Error genérico
  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar errores asíncronos
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
};
