import { Module } from '@nestjs/common';
import { llmClientProvider } from './llm.provider';
import { LLM_CLIENT } from './llm-client.interface';
import { LlmController } from './llm.controller';
import { LlmToolRunner } from './llm-tool-runner';

@Module({
  providers: [llmClientProvider, LlmToolRunner],
  exports: [LLM_CLIENT, LlmToolRunner],
  controllers: [LlmController],
})
export class LlmModule {}
