import OpenAI from 'openai';
import { LlmClient } from '../llm-client.interface';
import { LLmMessage, LLmResult } from '../llm.types';

export class OpenAiCompatClient implements LlmClient {
  constructor(
    private readonly sdk: OpenAI,
    private readonly model: string,
  ) {}

  async complete(messages: LLmMessage[]): Promise<LLmResult> {
    const res = await this.sdk.chat.completions.create({
      model: this.model,
      messages,
    });

    return { text: res.choices[0]?.message?.content ?? '' };
  }
}
