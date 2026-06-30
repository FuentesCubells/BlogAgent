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
  model: string;
  maxTokens: number;
  temperature: number;
}
