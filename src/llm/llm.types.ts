export interface LlmMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string; // role:'tool' → a qué llamada de tool responde
  toolCalls?: LlmToolCall[]; // role:'assistant' → lo que el modelo pidió ejecutar
}

export interface LlmResult {
  text: string;
  toolCalls: LlmToolCall[]; // vacío si el modelo no pidió ninguna tool
  stopReason: string; // 'stop' | 'tool_calls' | 'length' | ...
}

export interface LlmTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema de los argumentos
}

export interface LlmToolCall {
  id: string; // lo asigna el modelo; necesario para responderle
  name: string;
  arguments: Record<string, unknown>;
}
