import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,           // disponible en toda la app sin re-importar
      cache: true,              // evita re-leer process.env en cada inyección
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,      // muestra TODOS los errores de validación a la vez
      },
    }),
  ],
})
export class AppConfigModule {}
