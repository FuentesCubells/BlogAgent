import { Controller, Get, Inject } from '@nestjs/common';
import { LLM_CLIENT, LlmClient } from './llm-client.interface';

@Controller('llm')
export class LlmController {
  constructor(
    @Inject(LLM_CLIENT)
    private readonly llm: LlmClient,
  ) {}

  @Get('ping')
  ping() {
    return this.llm.complete([
      {
        role: 'user',
        content: 'Responde solo: pong',
      },
    ]);
  }
}
