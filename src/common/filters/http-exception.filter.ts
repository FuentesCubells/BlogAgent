import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

/**
 * Captura todas las excepciones HTTP y las devuelve con un formato consistente.
 * Registra en log las excepciones 5xx (errores del servidor, no del cliente).
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as { message: string | string[] }).message
        : exception.message;

    const body: ErrorResponse = {
      statusCode: status,
      message,
      error: HttpStatus[status] ?? 'Unknown',
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    // Solo logueamos errores del servidor (5xx), no errores del cliente (4xx)
    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception.stack);
    }

    response.status(status).json(body);
  }
}
