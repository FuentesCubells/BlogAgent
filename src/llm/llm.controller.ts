import { Controller, Get, Inject, NotFoundException, Query } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LLM_CLIENT, LlmClient } from './llm-client.interface';
import { LlmMessage } from './llm.types';
import { LlmToolRunner } from './llm-tool-runner';
import { getCurrentTimeTool } from './tools/get-current-time.tool';
import { PromptService } from '../runtime-config/prompt.service';
import { RuntimeConfigService } from '../runtime-config/runtime-config.service';

interface KeywordTarget {
  location: string;
  priority: string;
  keyword: string;
}

// Controller temporal de verificación — a borrar cuando el AgentService tome el relevo.
@Controller('llm')
export class LlmController {
  constructor(
    @Inject(LLM_CLIENT) private readonly llm: LlmClient,
    private readonly toolRunner: LlmToolRunner,
    private readonly prompts: PromptService,
    private readonly config: RuntimeConfigService,
  ) {}

  @Get('ping')
  ping() {
    return this.llm.complete([{ role: 'user', content: 'Responde solo: pong' }]);
  }

  @Get('agent')
  async agent(@Query('q') q?: string) {
    const { temperature, maxTokens } = this.config.generation();

    const answer = await this.toolRunner.run(
      this.prompts.get('city-page'),
      q ?? 'Escribe un artículo corto',
      [getCurrentTimeTool],
      { temperature, maxTokens },
    );
    return { answer };
  }

  // Genera una página de ciudad: input compuesto desde los datos + few-shot + JSON.
  @Get('city-page')
  async cityPage(@Query('slug') slug = 'bizkaia') {
    const readJson = (rel: string) => JSON.parse(readFileSync(join(process.cwd(), rel), 'utf-8'));
    const { locations } = readJson('data/locations.json');
    const keywords = readJson('data/keywords.json');
    const example = readJson('examples/city-page.example.json');

    const loc = locations[slug];
    if (!loc) throw new NotFoundException(`Ciudad "${slug}" no existe en locations.json`);

    const targets: KeywordTarget[] = keywords.targets.filter(
      (t: KeywordTarget) => t.location === slug,
    );
    const primary = targets.find((t) => t.priority === 'primary');

    const input = {
      ciudad: loc.ciudad,
      provincia: loc.provincia,
      comunidad_autonoma: loc.comunidad_autonoma,
      geo_type: loc.geo_type,
      ciudad_principal: loc.ciudad_principal,
      sectores_locales: loc.sectores_locales,
      ciudades_cercanas: loc.ciudades_cercanas,
      keyword_principal: primary?.keyword ?? '',
      keywords_secundarias: targets.filter((t) => t.priority !== 'primary').map((t) => t.keyword),
      notas_locales: 'Producción en España. Entrega en 5–10 días laborables. Respuesta en 24h.',
    };

    const { temperature, maxTokens } = this.config.generation();
    const messages: LlmMessage[] = [
      { role: 'system', content: this.prompts.get('city-page') },
      { role: 'user', content: JSON.stringify(example.input, null, 2) },
      { role: 'assistant', content: JSON.stringify(example.output, null, 2) },
      { role: 'user', content: JSON.stringify(input, null, 2) },
    ];

    const result = await this.llm.complete(messages, undefined, { temperature, maxTokens });

    try {
      return { slug, parsed: JSON.parse(result.text) };
    } catch {
      return { slug, raw: result.text }; // si el modelo no devuelve JSON limpio, lo ves crudo
    }
  }
}
