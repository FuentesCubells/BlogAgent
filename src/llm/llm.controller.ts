import { Controller, Get, Inject, Query } from '@nestjs/common';
import { LLM_CLIENT, LlmClient } from './llm-client.interface';
import { LlmToolRunner } from './llm-tool-runner';
import { getCurrentTimeTool } from './tools/get-current-time.tool';

// Controller temporal de verificación — a borrar cuando el AgentService tome el relevo.
@Controller('llm')
export class LlmController {
  constructor(
    @Inject(LLM_CLIENT) private readonly llm: LlmClient,
    private readonly toolRunner: LlmToolRunner,
  ) {}

  @Get('ping')
  ping() {
    return this.llm.complete([
      { role: 'user', content: 'Responde solo: pong' },
    ]);
  }

  @Get('agent')
  async agent(@Query('q') q?: string) {
    const answer = await this.toolRunner.run(
      q ?? '¿Qué hora es exactamente? Usa la herramienta disponible.',
      [getCurrentTimeTool],
    );
    return { answer };
  }
}
