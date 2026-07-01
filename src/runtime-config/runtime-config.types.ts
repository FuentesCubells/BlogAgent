/**
 * Tipamos SOLO lo que el agente consume ahora mismo (bloque `generation`).
 * El resto del agent.config.json (ciudades, blog, monitoring...) se irá tipando
 * cuando se use en fases posteriores. Por eso AgentConfig admite claves extra.
 */
export interface AgentConfig {
  generation: GenerationConfig;
  [key: string]: unknown;
}

export interface GenerationConfig {
  // El modelo lo posee el entorno (LLM_MODEL); aquí solo van los parámetros de generación.
  maxTokens: number;
  temperature: number;
}
