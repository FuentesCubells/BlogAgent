import { Inject, Injectable } from '@nestjs/common';
import { LLM_CLIENT, LlmClient } from './llm-client.interface';
import { LlmMessage } from './llm.types';
import { AgentTool } from './tools/tool.interface';

/**
 * Bucle de herramientas (Tool Runner). Vive POR ENCIMA del puerto LlmClient,
 * así que es agnóstico al proveedor: funciona igual con Ollama, Groq o Claude.
 */
@Injectable()
export class LlmToolRunner {
  private readonly MAX_TURNS = 5;

  constructor(@Inject(LLM_CLIENT) private readonly llm: LlmClient) {}

  async run(userPrompt: string, tools: AgentTool[]): Promise<string> {
    const toolMap = new Map(tools.map((t) => [t.name, t]));
    // Lo que ve el modelo: metadatos sin la función execute
    const llmTools = tools.map(({ name, description, parameters }) => ({
      name,
      description,
      parameters,
    }));

    const messages: LlmMessage[] = [{ role: 'user', content: userPrompt }];

    // Tope de seguridad: NUNCA while(true) en un agente que corre solo por cron
    for (let turn = 0; turn < this.MAX_TURNS; turn++) {
      const result = await this.llm.complete(messages, llmTools);

      // El modelo no pidió tools → terminó, devolvemos su texto final
      if (result.toolCalls.length === 0) {
        return result.text;
      }

      // 1) Registramos el turno del assistant con las tools que pidió
      messages.push({
        role: 'assistant',
        content: result.text,
        toolCalls: result.toolCalls,
      });

      // 2) Ejecutamos cada tool y le devolvemos el resultado al modelo
      for (const call of result.toolCalls) {
        const tool = toolMap.get(call.name);
        const output = tool
          ? await this.safeExecute(tool, call.arguments)
          : `Error: la tool "${call.name}" no existe`;

        messages.push({
          role: 'tool',
          toolCallId: call.id,
          content: output,
        });
      }
    }

    throw new Error('Tool Runner: superado el máximo de turnos sin respuesta final');
  }

  /**
   * Ejecuta la tool capturando errores y devolviéndolos COMO TEXTO al modelo,
   * en vez de lanzar una excepción que mataría el bucle. El modelo suele
   * recuperarse ("esa tool falló, probaré otra cosa").
   */
  private async safeExecute(tool: AgentTool, args: Record<string, unknown>): Promise<string> {
    try {
      return await tool.execute(args);
    } catch (err) {
      return `Error ejecutando "${tool.name}": ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
