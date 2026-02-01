import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'nestjs-pino';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;

      const logData = {
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        contentLength,
        ip,
        userAgent,
      };

      if (statusCode >= 500) {
        this.logger.error({ ...logData, msg: 'HTTP Request Error' });
      } else if (statusCode >= 400) {
        this.logger.warn({ ...logData, msg: 'HTTP Request Warning' });
      } else {
        this.logger.log({ ...logData, msg: 'HTTP Request' });
      }
    });

    next();
  }
}
