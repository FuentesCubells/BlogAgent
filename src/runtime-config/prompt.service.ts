import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class PromptService implements OnModuleInit {
  private master!: string;

  onModuleInit() {
    // 'utf-8' es clave: sin encoding, readFileSync devuelve un Buffer, no un string.
    this.master = readFileSync(join(process.cwd(), 'prompts', 'master.md'), 'utf-8');
  }

  getMaster(): string {
    return this.master;
  }
}
