import OpenAI from 'openai';
import { LlmClient, LlmOptions } from '../llm-client.interface';
import { LlmMessage, LlmResult, LlmTool } from '../llm.types';

/**
 * Adaptador para cualquier backend con API compatible con OpenAI
 * (Ollama, Groq, vLLM...). Traduce nuestros tipos neutros ↔ formato OpenAI.
 */
export class OpenAiCompatClient implements LlmClient {
  constructor(
    private readonly sdk: OpenAI,
    private readonly model: string,
  ) {}

  async complete(
    messages: LlmMessage[],
    tools?: LlmTool[],
    options?: LlmOptions,
  ): Promise<LlmResult> {
    const res = await this.sdk.chat.completions.create({
      model: this.model,
      messages: messages.map(toOpenAiMessage),
      tools: tools?.map(toOpenAiTool),
      temperature: options?.temperature,
      max_tokens: options?.maxTokens, // Ollama entiende max_tokens; max_completion_tokens lo ignora
    });

    const choice = res.choices[0];
    const message = choice?.message;

    return {
      text: message?.content ?? '',
      // tool_calls es una unión (function | custom); nos quedamos solo con las function
      toolCalls: (message?.tool_calls ?? [])
        .filter(
          (tc): tc is OpenAI.Chat.ChatCompletionMessageFunctionToolCall => tc.type === 'function',
        )
        .map((tc) => ({
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments || '{}'),
        })),
      stopReason: choice?.finish_reason ?? 'stop',
    };
  }
}

function toOpenAiTool(tool: LlmTool): OpenAI.Chat.ChatCompletionFunctionTool {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  };
}

function toOpenAiMessage(message: LlmMessage): OpenAI.Chat.ChatCompletionMessageParam {
  // Resultado de una tool que devolvemos al modelo
  if (message.role === 'tool') {
    return {
      role: 'tool',
      tool_call_id: message.toolCallId!,
      content: message.content,
    };
  }

  // Turno del assistant en el que pidió ejecutar tools: hay que reenviar tool_calls
  if (message.role === 'assistant' && message.toolCalls?.length) {
    return {
      role: 'assistant',
      content: message.content || null, // OpenAI permite null cuando hay tool_calls
      tool_calls: message.toolCalls.map((call) => ({
        id: call.id,
        type: 'function',
        function: {
          name: call.name,
          arguments: JSON.stringify(call.arguments), // de vuelta como string JSON
        },
      })),
    };
  }

  // system | user | assistant sin tools
  return {
    role: message.role,
    content: message.content,
  } as OpenAI.Chat.ChatCompletionMessageParam;
}
