import * as Joi from 'joi';

/**
 * Valida solo el bloque `generation`, que es lo que el agente usa hoy.
 * `.unknown(true)` deja pasar el resto del JSON sin romper, para tiparlo/validarlo
 * de forma incremental en fases posteriores.
 */
export const agentConfigSchema = Joi.object({
  generation: Joi.object({
    model: Joi.string().required(),
    maxTokens: Joi.number().integer().positive().required(),
    temperature: Joi.number().min(0).max(2).required(),
  }).required(),
}).unknown(true);
