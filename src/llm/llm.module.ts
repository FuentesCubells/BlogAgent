import { Module } from '@nestjs/common';
import { llmClientProvider } from './llm.provider';
import { LLM_CLIENT } from './llm-client.interface';
import { LlmController } from './llm.controller';

@Module({
  providers: [llmClientProvider],
  exports: [LLM_CLIENT],
  controllers: [LlmController],
})
export class LlmModule {}
