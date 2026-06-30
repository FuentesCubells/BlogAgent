import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  // ─── HTTPS (opcional) ───────────────────────────────────────────────────────
  // Si HTTPS_ENABLED=true, Node termina TLS directamente.
  // En producción se recomienda terminar en el proxy (nginx/Caddy) y dejar este flag en false.
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
  let httpsOptions: HttpsOptions | undefined;

  if (httpsEnabled) {
    const keyPath = process.env.HTTPS_KEY_PATH ?? '';
    const certPath = process.env.HTTPS_CERT_PATH ?? '';
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    logger.log('TLS habilitado en Node (modo directo)');
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });
  const config = app.get(ConfigService);

  // ─── Seguridad: Helmet ──────────────────────────────────────────────────────
  // Añade headers HTTP de seguridad: CSP, X-Frame-Options, HSTS, etc.
  app.use(helmet());

  // ─── CORS ───────────────────────────────────────────────────────────────────
  const rawOrigins = config.get<string>('CORS_ORIGINS', 'http://localhost:3001');
  const origins = rawOrigins.split(',').map((o) => o.trim());
  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ─── Validación global de DTOs ──────────────────────────────────────────────
  // whitelist: elimina propiedades no declaradas en el DTO
  // forbidNonWhitelisted: rechaza la request si llegan propiedades extra
  // transform: convierte automáticamente los tipos (string → number, etc.)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Prefijo global de API ──────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);

  const protocol = httpsEnabled ? 'https' : 'http';
  logger.log(`Servidor arrancado en ${protocol}://localhost:${port}/api`);
  logger.log(`Health check: ${protocol}://localhost:${port}/api/health`);
}

bootstrap();
