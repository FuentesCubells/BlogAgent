import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppConfigModule } from './config/config.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    AppConfigModule, // Aquí irán los módulos de dominio: PricingModule, QuoteModule, etc.
  ],
  controllers: [HealthController],
  providers: [
    // Registros globales — aplican a TODOS los módulos sin necesidad de re-importar
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
