import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class PromptService {
  // Cache por nombre: soporta varios prompts (city-page, blog, sector...).
  private readonly cache = new Map<string, string>();

  /**
   * Carga prompts/<name>.md (versionado en git). Lazy + cacheado.
   * 'utf-8' es clave: sin encoding, readFileSync devuelve un Buffer, no un string.
   */
  get(name: string): string {
    let prompt = this.cache.get(name);
    if (prompt === undefined) {
      prompt = readFileSync(join(process.cwd(), 'prompts', `${name}.md`), 'utf-8');
      this.cache.set(name, prompt);
    }
    return prompt;
  }
}
