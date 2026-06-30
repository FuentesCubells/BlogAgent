import { Controller, Get, Inject, Query } from '@nestjs/common';
import { LLM_CLIENT, LlmClient } from './llm-client.interface';
import { LlmToolRunner } from './llm-tool-runner';
import { getCurrentTimeTool } from './tools/get-current-time.tool';
import { PromptService } from '../runtime-config/prompt.service';
import { RuntimeConfigService } from '../runtime-config/runtime-config.service';

// Controller temporal de verificación — a borrar cuando el AgentService tome el relevo.
@Controller('llm')
export class LlmController {
  constructor(
    @Inject(LLM_CLIENT) private readonly llm: LlmClient,
    private readonly toolRunner: LlmToolRunner,
    private readonly prompts: PromptService,
    private readonly config: RuntimeConfigService,
  ) {}

  @Get('ping')
  ping() {
    return this.llm.complete([{ role: 'user', content: 'Responde solo: pong' }]);
  }

  @Get('agent')
  async agent(@Query('q') q?: string) {
    const { temperature, maxTokens } = this.config.generation();

    const answer = await this.toolRunner.run(
      this.prompts.getMaster(),
      q ?? 'Escribe un artículo corto',
      [getCurrentTimeTool],
      { temperature, maxTokens },
    );
    return { answer };
  }
}
