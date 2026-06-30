import { Controller, Get } from '@nestjs/common';

interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
}

/**
 * Liveness probe mínima.
 * GET /health → 200 { status: 'ok', timestamp, uptime }
 */
@Controller('health')
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}
