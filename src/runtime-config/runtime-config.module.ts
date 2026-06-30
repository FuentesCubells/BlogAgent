import { Global, Module } from '@nestjs/common';
import { RuntimeConfigService } from './runtime-config.service';
import { PromptService } from './prompt.service';

// @Global: config y prompt los necesitarán varios módulos (agent, scheduler, tasks).
// Así no hay que re-importar este módulo en cada uno.
@Global()
@Module({
  providers: [RuntimeConfigService, PromptService],
  exports: [RuntimeConfigService, PromptService],
})
export class RuntimeConfigModule {}
