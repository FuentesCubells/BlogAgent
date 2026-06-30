import * as Joi from 'joi';

/**
 * Valida las variables de entorno al arranque.
 * Si falta alguna requerida o tiene tipo incorrecto, el proceso aborta con mensaje claro.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),

  // HTTPS — opcional; si está habilitado, los paths son obligatorios
  HTTPS_ENABLED: Joi.boolean().default(false),
  HTTPS_KEY_PATH: Joi.when('HTTPS_ENABLED', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  HTTPS_CERT_PATH: Joi.when('HTTPS_ENABLED', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),

  //LLM
  LLM_PROVIDER: Joi.string().required(),
  LLM_BASE_URL: Joi.string().required(),
  LLM_MODEL: Joi.string().required(),
  LLM_API_KEY: Joi.when('LLM_PROVIDER:', {
    is: Joi.string().equal('ollama'),
    then: Joi.string().optional(),
    otherwise: Joi.string().required(),
  }),

  // CORS
  CORS_ORIGINS: Joi.string().default('http://localhost:3001'),
});
