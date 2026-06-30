import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AgentConfig, GenerationConfig } from './runtime-config.types';
import { agentConfigSchema } from './runtime-config.validation';

@Injectable()
export class RuntimeConfigService implements OnModuleInit {
  private config!: AgentConfig;

  onModuleInit() {
    this.config = this.load();
  }

  private load(): AgentConfig {
    const path = join(process.cwd(), 'config', 'agent.config.json');
    const raw = JSON.parse(readFileSync(path, 'utf-8'));
    const { error, value } = agentConfigSchema.validate(raw);
    if (error) {
      throw new Error(`Config inválida (agent.config.json): ${error.message}`);
    }
    return value as AgentConfig;
  }

  get(): AgentConfig {
    return this.config;
  }

  /** Atajo a los parámetros de generación, que es lo que más se consulta. */
  generation(): GenerationConfig {
    return this.config.generation;
  }

  /** Recargar desde disco sin reiniciar el proceso (config editable en el VPS). */
  reload(): void {
    this.config = this.load();
  }
}
