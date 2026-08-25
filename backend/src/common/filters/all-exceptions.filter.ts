import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtre global : garantit une forme de réponse d'erreur cohérente sur toute
 * l'API ({ statusCode, message, error, path, timestamp }) et journalise les
 * erreurs inattendues (non-HttpException) avec leur pile d'appel côté serveur
 * uniquement — jamais renvoyée au client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload =
        typeof body === 'string'
          ? { message: body }
          : (body as Record<string, unknown>);

      response.status(status).json({
        statusCode: status,
        error: HttpStatus[status] ?? 'Error',
        ...payload,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    this.logger.error(`Erreur non gérée sur ${request.method} ${request.url}`, (exception as Error)?.stack);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Une erreur inattendue est survenue.',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
