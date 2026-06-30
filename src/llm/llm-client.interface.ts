import { LlmMessage, LlmResult, LlmTool } from './llm.types';

export const LLM_CLIENT = Symbol('LLM_CLIENT');

export interface LlmClient {
  complete(messages: LlmMessage[], tools?: LlmTool[], options?: LlmOptions): Promise<LlmResult>;
}

export interface LlmOptions {
  temperature?: number;
  maxTokens?: number;
}
