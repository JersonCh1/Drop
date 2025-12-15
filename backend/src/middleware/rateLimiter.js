const rateLimit = require('express-rate-limit');

// Rate limiter estricto para login (5 intentos por 15 minutos)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login. Por favor, intenta nuevamente en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos de login. Por favor, intenta nuevamente en 15 minutos.'
    });
  }
});

// Rate limiter para registro (3 registros por hora)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: 'Demasiados registros desde esta IP. Por favor, intenta nuevamente en 1 hora.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiados registros desde esta IP. Por favor, intenta nuevamente en 1 hora.'
    });
  }
});

// Rate limiter para pagos (10 intentos por hora)
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: 'Demasiadas solicitudes de pago. Por favor, intenta nuevamente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes de pago. Por favor, intenta nuevamente más tarde.'
    });
  }
});

// Rate limiter general para API (100 requests por 15 minutos)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP. Por favor, intenta nuevamente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes desde esta IP. Por favor, intenta nuevamente más tarde.'
    });
  }
});

module.exports = {
  loginLimiter,
  registerLimiter,
  paymentLimiter,
  apiLimiter
};
