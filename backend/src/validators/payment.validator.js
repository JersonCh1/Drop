const Joi = require('joi');

// Schema para validar el request de FormToken de Izipay
const izipayFormTokenSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .required()
    .min(1)
    .max(1000000) // Máximo 1M PEN
    .messages({
      'number.base': 'El monto debe ser un número',
      'number.positive': 'El monto debe ser positivo',
      'number.min': 'El monto mínimo es 1 PEN',
      'number.max': 'El monto máximo es 1,000,000 PEN',
      'any.required': 'El monto es requerido'
    }),

  currency: Joi.string()
    .valid('PEN', 'USD')
    .default('PEN')
    .messages({
      'any.only': 'La moneda debe ser PEN o USD'
    }),

  orderId: Joi.string()
    .required()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'El ID de orden es requerido',
      'string.max': 'El ID de orden es demasiado largo',
      'any.required': 'El ID de orden es requerido'
    }),

  email: Joi.string()
    .email()
    .required()
    .max(255)
    .messages({
      'string.email': 'El email no es válido',
      'any.required': 'El email es requerido',
      'string.max': 'El email es demasiado largo'
    }),

  firstName: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .optional()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre es demasiado largo',
      'string.pattern.base': 'El nombre solo puede contener letras'
    }),

  lastName: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .optional()
    .messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido es demasiado largo',
      'string.pattern.base': 'El apellido solo puede contener letras'
    }),

  phoneNumber: Joi.string()
    .pattern(/^[0-9+\s()-]{7,20}$/)
    .optional()
    .messages({
      'string.pattern.base': 'El número de teléfono no es válido'
    }),

  identityType: Joi.string()
    .valid('DNI', 'CE', 'RUC', 'PASSPORT')
    .default('DNI')
    .messages({
      'any.only': 'El tipo de documento debe ser DNI, CE, RUC o PASSPORT'
    }),

  identityCode: Joi.string()
    .min(7)
    .max(20)
    .pattern(/^[0-9A-Z-]+$/)
    .optional()
    .messages({
      'string.min': 'El documento debe tener al menos 7 caracteres',
      'string.max': 'El documento es demasiado largo',
      'string.pattern.base': 'El documento solo puede contener números, letras y guiones'
    }),

  address: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'La dirección es demasiado larga'
    }),

  country: Joi.string()
    .length(2)
    .uppercase()
    .default('PE')
    .messages({
      'string.length': 'El código de país debe tener 2 caracteres'
    }),

  city: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'El nombre de la ciudad es demasiado largo'
    }),

  state: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'El nombre del estado es demasiado largo'
    }),

  zipCode: Joi.string()
    .max(20)
    .optional()
    .messages({
      'string.max': 'El código postal es demasiado largo'
    }),

  payMethod: Joi.string()
    .valid('CARD', 'YAPE_CODE', 'PLIN', null)
    .optional()
    .allow(null)
    .messages({
      'any.only': 'El método de pago debe ser CARD, YAPE_CODE o PLIN'
    })
});

// Schema para validar webhook de Izipay
const izipayWebhookSchema = Joi.object({
  'kr-hash': Joi.string().required(),
  'kr-hash-algorithm': Joi.string().required(),
  'kr-answer': Joi.string().required(),
}).unknown(true); // Permitir otros campos

// Middleware para validar request con Joi
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retornar todos los errores, no solo el primero
      stripUnknown: false, // No remover campos desconocidos (por ahora)
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }

    // Reemplazar req.body con los valores validados y sanitizados
    req.body = value;
    next();
  };
};

module.exports = {
  izipayFormTokenSchema,
  izipayWebhookSchema,
  validate,
  // Exportar middleware directo
  validateIzipayFormToken: validate(izipayFormTokenSchema),
  validateIzipayWebhook: validate(izipayWebhookSchema),
};
