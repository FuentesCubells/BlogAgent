import { Provider } from '@nestjs/common';
import { LLM_CLIENT, LlmClient } from './llm-client.interface';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { OpenAiCompatClient } from './adapters/openai-compat.client';

export const llmClientProvider: Provider = {
  provide: LLM_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): LlmClient => {
    const sdk = new OpenAI({
      apiKey: config.getOrThrow('LLM_API_KEY'),
      baseURL: config.getOrThrow('LLM_BASE_URL'),
    });

    return new OpenAiCompatClient(sdk, config.getOrThrow('LLM_MODEL'));
  },
};
