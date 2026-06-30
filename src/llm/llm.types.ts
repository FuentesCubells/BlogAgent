export interface LLmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLmResult {
  text: string;
}
