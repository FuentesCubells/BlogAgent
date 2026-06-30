import { LLmMessage, LLmResult } from './llm.types';

export const LLM_CLIENT = Symbol('LLM_CLIENT');
export interface LlmClient {
  complete(messages: LLmMessage[]): Promise<LLmResult>;
}
