const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Definir niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colores para cada nivel
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Aplicar colores
winston.addColors(colors);

// Formato para desarrollo (legible, con colores)
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Formato para producción (JSON estructurado)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Decidir qué formato usar según el entorno
const logFormat = process.env.NODE_ENV === 'production' ? prodFormat : devFormat;

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
let useFileLogging = true;

try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  console.warn('⚠️ No se pudo crear directorio de logs, usando solo console');
  useFileLogging = false;
}

// Transports: dónde se guardan los logs
const transports = [];

// Intentar agregar file transports solo si el directorio se creó correctamente
if (useFileLogging) {
  try {
    transports.push(
      // Errores en archivo separado
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Todos los logs en archivo combined
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
  } catch (error) {
    console.warn('⚠️ Error creando file transports, usando solo console');
    useFileLogging = false;
  }
}

// Siempre agregar console transport (especialmente en producción si file logging falla)
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  })
);

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format: logFormat,
  transports,
  // No terminar el proceso en caso de error al escribir logs
  exitOnError: false,
});

// Stream para Morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Métodos de utilidad
logger.logRequest = (req) => {
  logger.http(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
};

logger.logError = (error, context = '') => {
  const errorMessage = context
    ? `${context} - ${error.message}`
    : error.message;

  logger.error(errorMessage, {
    stack: error.stack,
    context,
  });
};

logger.logPayment = (orderId, amount, status) => {
  logger.info(`Payment ${status} - Order: ${orderId}, Amount: ${amount}`, {
    orderId,
    amount,
    status,
    type: 'payment',
  });
};

logger.logAuth = (action, user, success) => {
  logger.info(`Auth ${action} - User: ${user}, Success: ${success}`, {
    action,
    user,
    success,
    type: 'auth',
  });
};

module.exports = logger;
